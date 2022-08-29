<template>
  <div>
    <div class="analysis-btn analysis-top-btn basic-analysis-btn">
      <span @click="draw">绘制范围</span>
      <span class="basic-analysis-btn-clear">清除</span>
    </div>
  </div>
</template>

<script>
/* 坡度分析 */
window.slopDrawTool = null;
export default {
  name: "Slope",
  data() {
    return {};
  },
  mounted() {
    let that = this;
    if (!window.slopDrawTool) {
      window.slopDrawTool = new this.easy3d.DrawTool(window.viewer, {
        canEdit: false,
      });
      window.slopDrawTool.on("endCreate", function (entObj, ent) {
        // 创建完成后 打开控制面板
        window.slopDrawTool.removeOne(entObj);
        const positions = entObj.getPositions();
        let newps = that.lerpPositions(positions);
        newps.forEach((p,index) => {
            if(index==0) {
                let obj = cUtil.getSlopePosition(window.viewer,p.clone());
                let line = that.createArrow([obj.startP, obj.endP]);
            }
        });
      });
    }
  },
  destroyed() {},
  methods: {
    draw() {
      window.slopDrawTool.start({
        type: "polygon",
        styleType: "polygon",
        style: {
          color: "#00FFFF",
          colorAlpha: 0.5,
          outline: true,
          outlineColor: "#ff0000",
          heightReference: 1,
        },
      });
    },
    lerpPositions(positions) {
      var polygonGeometry = new Cesium.PolygonGeometry.fromPositions({
        positions: positions,
        vertexFormat: Cesium.PerInstanceColorAppearance.FLAT_VERTEX_FORMAT,
        granularity: Math.PI / Math.pow(2, 11) / 100,
      });
      var geom = new Cesium.PolygonGeometry.createGeometry(polygonGeometry);
      var indices = geom.indices;
      var attrPositions = geom.attributes.position.values;
      let newc3s = [];
      for (let step = 0; step < attrPositions.length; step += 3) {
        newc3s.push(
          new Cesium.Cartesian3(
            attrPositions[step],
            attrPositions[step + 1],
            attrPositions[step + 2]
          )
        );
      }
      // 数组去重
      indices = [...new Set(indices)];
      let returnPositions = [];
      for (var index = 0; index < indices.length; index++) {
        returnPositions.push(newc3s[indices[index]]);
      }
      return returnPositions;
    },
    createArrow(positions) {
      return window.viewer.entities.add({
        polyline: {
          positions: positions,
          width: 1,
          clampToGround : true,
          material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.RED),
        },
      });
    },
  },
};
</script>
