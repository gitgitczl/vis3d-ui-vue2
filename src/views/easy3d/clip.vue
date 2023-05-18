<template>
  <div>
    <div id="cesiumContainer"></div>
    <div id="geologyClipPlanDiv" v-if="geologyClipPlanIsShow">
      <table style="text-align: right;">
        <tr>
          <td colspan="2" style="text-align: left">
            <span style="font-size: 18px; font-weight: 600;">模型裁剪分析</span>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <div style="height: 4px;background-color: rgba(29,164,220,0.6);margin: 4px;"></div>
          </td>
        </tr>
        <tr>
          <td>裁剪类型：</td>
          <td>
            <el-radio v-model="modelType" label="0">外部裁剪</el-radio>
            <el-radio v-model="modelType" label="1">内部裁剪</el-radio>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <el-button size="mini" :disabled="isDrawGeologyClipPlan" @click="drawGeologyClipPlan">绘制裁剪范围</el-button>
            <el-button size="mini" @click="clearGeologyClipPlan">清除</el-button>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script>
import * as turf from '@turf/turf'
import * as Cesium from "cesium/Cesium";

let geologyClipPlanObj = null
let handlerGeologyClipPlan = null
let floatingPointList = []
let activeShapePoints = [];

let floatingPoint = undefined;
let activeShape = undefined;

let my3dtiles = undefined
let drawList = []
let inverseTransform = undefined

export default {
  name: "geologyClipPlan",
  data() {
    return {
      geologyClipPlanIsShow: false,
      isDrawGeologyClipPlan: false,
      modelType: '0', // 开挖深度
    };
  },
  mounted() {
    // 初始化地图
    initWebGLMap("cesiumContainer");
    this.openGeologyClipPlan();
  },
  methods: {
    openGeologyClipPlan() {
      this.geologyClipPlanIsShow = true;
      const pTileset = window.viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url: 'http://mapgl.com/data/model/qx-dyt/tileset.json',
          maximumScreenSpaceError: 1
        })
      );
      pTileset.readyPromise.then((palaceTileset) => {
        my3dtiles = palaceTileset
      })
      viewer.zoomTo(pTileset);

      window.TilesetsList = pTileset
    },

    handCloserGeologyClipPlan() {
      this.geologyClipPlanIsShow = false;
      this.clearGeologyClipPlan()
    },

    drawGeologyClipPlan() {
      this.clearGeologyClipPlan()
      this.isDrawGeologyClipPlan = true

      inverseTransform = this.getInverseTransform(my3dtiles)

      window.viewer._container.style.cursor = 'pointer';

      // 取消双击事件-追踪该位置
      window.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

      handlerGeologyClipPlan = new Cesium.ScreenSpaceEventHandler(window.viewer.scene.canvas);
      handlerGeologyClipPlan.setInputAction((event) => {

        // if (!my3dtiles.clippingPlanes || !my3dtiles.clippingPlanes._planes.length) {
        const pick = window.viewer.scene.pickPosition(event.position)
        const pickWGS = this.cart3ToWGS(pick)
        const pickModel = window.viewer.scene.pick(event.position)
        if (pickModel) {
          drawList.push(pickWGS)

          if (activeShapePoints.length === 0) {
            floatingPoint = this.createPoint(pick);
            floatingPointList.push(floatingPoint)
            activeShapePoints.push(pick);
            var dynamicPositions = new Cesium.CallbackProperty(function () {
              return new Cesium.PolygonHierarchy(activeShapePoints);
            }, false);
            activeShape = this.drawShape(dynamicPositions);
          }
          activeShapePoints.push(pick);
          floatingPointList.push(this.createPoint(pick))
        }
        // }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      handlerGeologyClipPlan.setInputAction((event) => {
        if (Cesium.defined(floatingPoint)) {
          var newPosition = window.viewer.scene.pickPosition(event.endPosition);
          if (Cesium.defined(newPosition)) {
            floatingPoint.position.setValue(newPosition);
            activeShapePoints.pop();
            activeShapePoints.push(newPosition);
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

      handlerGeologyClipPlan.setInputAction((event) => {
        // if (!my3dtiles.clippingPlanes || !my3dtiles.clippingPlanes._planes.length) {
        if (drawList.length < 3) {
          this.$message({
            message: '提示：需要绘制三个以上点, 请继续绘制！',
            type: 'warning'
          });
        } else {
          this.terminateShape();
          const unionClippingRegions = this.modelType === '0' ? true : false
          drawList = this.isDirRes(drawList, unionClippingRegions)
          const Planes = []
          for (let i = 0; i < drawList.length; i++) {
            if (i === (drawList.length - 1)) {
              Planes.push(this.createPlane(drawList[i], drawList[0], inverseTransform))
            } else {
              Planes.push(this.createPlane(drawList[i], drawList[i + 1], inverseTransform))
            }
          }
          console.log(Planes)
          const PlaneCollection = new Cesium.ClippingPlaneCollection({
            planes: Planes,
            unionClippingRegions // 再做优化
          })
          my3dtiles.clippingPlanes = PlaneCollection
        }

        handlerGeologyClipPlan.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK)
        handlerGeologyClipPlan.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK)
        handlerGeologyClipPlan.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE)
        handlerGeologyClipPlan = null
        this.isDrawGeologyClipPlan = false
        window.viewer._container.style.cursor = 'default';
        // }
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    },

    getInverseTransform(tileSet) {
      let transform;
      const tmp = my3dtiles.root.transform
      if ((tmp && tmp.equals(Cesium.Matrix4.IDENTITY)) || !tmp) {
        transform = Cesium.Transforms.eastNorthUpToFixedFrame(my3dtiles.boundingSphere.center)
      } else {
        transform = Cesium.Matrix4.fromArray(my3dtiles.root.transform)
      }
      return Cesium.Matrix4.inverseTransformation(transform, new Cesium.Matrix4())
    },

    cart3ToWGS(cart3) {
      return {
        lat: Cesium.Math.toDegrees(Cesium.Cartographic.fromCartesian(cart3).latitude),
        lng: Cesium.Math.toDegrees(Cesium.Cartographic.fromCartesian(cart3).longitude)
      }
    },

    createPlane(p1, p2, inverseTransform) {
      // 将仅包含经纬度信息的p1,p2，转换为相应坐标系的cartesian3对象
      const p1C3 = this.getOriginCoordinateSystemPoint(p1, inverseTransform)
      const p2C3 = this.getOriginCoordinateSystemPoint(p2, inverseTransform)

      // 定义一个垂直向上的向量up
      const up = new Cesium.Cartesian3(0, 0, 10)
      //  right 实际上就是由p1指向p2的向量
      const right = Cesium.Cartesian3.subtract(p2C3, p1C3, new Cesium.Cartesian3())

      // 计算normal， right叉乘up，得到平面法向量，这个法向量指向right的右侧
      let normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3())
      normal = Cesium.Cartesian3.normalize(normal, normal)

      // 由于已经获得了法向量和过平面的一点，因此可以直接构造Plane,并进一步构造ClippingPlane
      const planeTmp = Cesium.Plane.fromPointNormal(p1C3, normal)
      return Cesium.ClippingPlane.fromPlane(planeTmp)
    },

    getOriginCoordinateSystemPoint(point, inverseTransform) {
      const val = Cesium.Cartesian3.fromDegrees(point.lng, point.lat)
      return Cesium.Matrix4.multiplyByPoint(
        inverseTransform, val, new Cesium.Cartesian3(0, 0, 0))
    },


    clearGeologyClipPlan() {
      floatingPointList = []
      activeShapePoints = []
      if (geologyClipPlanObj) {
        geologyClipPlanObj.clear()
        geologyClipPlanObj = null
      }
      this.isDrawGeologyClipPlan = false

      let tilestObj = window.TilesetsList
      tilestObj.clippingPlanes ? (tilestObj.clippingPlanes.removeAll(), tilestObj.clippingPlanes = undefined) : ''

      drawList = []
    },

    isDirRes(polygon, isClockwise) {
      var lineStringList = [];
      polygon.forEach((p) => {
        lineStringList.push([p.lng, p.lat]);
      });

      var clockwiseRing = turf.lineString(lineStringList);
      let isR = turf.booleanClockwise(clockwiseRing)

      var points = [];
      if (isClockwise) {
        if (!isR) {
          points = polygon
        } else {
          var count = 0;
          for (var ii = polygon.length - 1; ii >= 0; ii--) {
            points[count] = polygon[ii];
            count++;
          }
        }
      } else {
        if (isR) {
          points = polygon
        } else {
          var count = 0;
          for (var ii = polygon.length - 1; ii >= 0; ii--) {
            points[count] = polygon[ii];
            count++;
          }
        }
      }
      return points
    },

    drawShape(positionData) {
      var shape = window.viewer.entities.add({
        polygon: {
          hierarchy: positionData,
          material: new Cesium.ColorMaterialProperty(
            Cesium.Color.BLUE.withAlpha(0.2)
          ),
        },
      });
      return shape;
    },

    createPoint(worldPosition) {
      var point = window.viewer.entities.add({
        position: worldPosition,
        point: {
          color: Cesium.Color.RED,
          pixelSize: 5,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        },
      });
      return point;
    },

    terminateShape() {
      activeShapePoints.pop();
      var pol = this.drawShape(activeShapePoints);
      floatingPointList.forEach(p => {
        window.viewer.entities.remove(p);
      })
      window.viewer.entities.remove(floatingPoint);
      window.viewer.entities.remove(activeShape);
      window.viewer.entities.remove(pol);
      floatingPoint = undefined;
      activeShape = undefined;

      activeShapePoints = [];
    },
  }
};
function initWebGLMap(domId) {
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4NzFkNzQwZi03ZTAyLTQxMzctYmJjMC0wYmRmZmViMDA1OGYiLCJpZCI6NDU3NzMsImlhdCI6MTY0MjEzOTMyNH0.VWjtgLef19NZAcQe7_M05tPNSXsQMMSj3bCJOgSKe_A';
  window.viewer = new Cesium.Viewer(domId, {
    homeButton: false,//隐藏viewhome
    sceneModePicker: false,//隐藏2/3维切换
    fullscreenButton: false,
    geocoder: false,//隐藏查找位置工具
    baseLayerPicker: false,//隐藏图层选择器
    navigationHelpButton: false,//隐藏帮助按钮
    shouldAnimate: true,//gltf动画
    animation: false,//速度控制
    timeline: false,//时间轴
    selectionIndicator: false,//移除选中绿框
    infoBox: false,//移除选中弹出框
  });
}
</script>
 
<style lang="less" scoped>
.closerGeologyClipPlan {
  text-decoration: none;
  position: absolute;
  top: 20px;
  right: 10px;
  z-index: 20;
}
.closerGeologyClipPlan:after {
  // content: "✖";
  content: "\e60b";
  font-family: "iconfont";
  font-size: 22px;
  color: rgba(0,0,0,.8);
}

#geologyClipPlanDiv {
  position: absolute;
  top: 0;
  color: rgba(29, 164, 220, 0.9);
  background: rgba(34, 69, 91, 0.7);
  border-radius: 6px;
  padding: 10px;

  .closerGeologyClipPlan {
    top: 1vh;
    right: 0.6vw;
    cursor: pointer;
  }

  .el-button {
    background: rgba(18, 167, 204, 0.52);
    color: #cef2ff;
    border: 0px;
  }

  .el-radio__inner {
    background-color: rgba(18, 167, 204, 0.82);
    border: 1px solid rgba(0, 185, 241, 1);
  }
  .el-radio {
    color: rgba(29, 164, 220, 0.9);
    margin-right: 10px;
  }
}

#geologyClipPlanDiv td {
  padding: 4px 2px;
}
</style>