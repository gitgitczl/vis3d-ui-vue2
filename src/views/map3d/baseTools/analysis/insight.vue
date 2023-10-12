<template>
  <div>
    <ul class="slope-toolip">
      <li>提示：</li>
      <li>1.cesium接口，部分情况下依赖正确的接口</li>
      <li>2.目标点如果在观察位置坡面的背面方向，会出现不准确的现象</li>
      <li>3.红色表示不可见，表示有外观</li>
    </ul>

    <div class="analysis-btn analysis-top-btn basic-analysis-btn">
      <span
        :style="clickBtnIndex == 1 ? 'background: #1C9ED5' : 'none'"
        @click="drawCircle"
        >圆形通视分析</span
      >
      <span
        :style="clickBtnIndex == 2 ? 'background: #1C9ED5' : 'none'"
        @click="drawPolyline"
        >单线通视分析</span
      >
      <span class="basic-analysis-btn-clear" @click="clear">清除</span>
    </div>
  </div>
</template>

<script>
/* 通视分析 */
let drawTool = null;
let lines = [];
export default {
  name: "Insight",
  data() {
    return {
      clickBtnIndex: 0,
    };
  },
  mounted() {
    drawTool = new this.easy3d.plot.Tool(window.viewer, {
      canEdit: false,
    });
  },
  destroyed() {
    if (drawTool) {
      drawTool.destroy();
      drawTool = null;
    }
    for (let i = 0; i < lines.length; i++) {
      window.viewer.entities.remove(lines[i]);
    }
    lines = [];
    this.clickBtnIndex = 0;
  },

  methods: {
    clear() {
      if (drawTool) drawTool.removeAll();
      for (let i = 0; i < lines.length; i++) {
        window.viewer.entities.remove(lines[i]);
      }
      lines = [];
      this.clickBtnIndex = 0;
    },
    drawCircle() {
      if (!drawTool) return;
      this.clickBtnIndex = 1;
      let that = this;
      drawTool.start({
        type: "polyline",
        style: {
          color: "#ff0000",
          width: 2,
          clampToGround: true,
        },
        success: function (entObj, ent) {
          ent.show = false;
          let positions = entObj.getPositions();
          let ctgc_center = Cesium.Cartographic.fromCartesian(positions[0]);
          ctgc_center.height = ctgc_center.height + 2;
          let center = Cesium.Cartographic.toCartesian(ctgc_center);
          let pnts = that.easy3d.util.getCirclePointsByAngle(center, positions[1], 6);
          if (window.viewer.scene.sampleHeightSupported) {
            // 求出表面高度
            var promise = window.viewer.scene.sampleHeightMostDetailed(pnts);
            promise.then(function (updatedPosition) {
              for (let i = 0; i < updatedPosition.length; i++) {
                let cc = updatedPosition[i];
                cc.height = (cc.height || 0) + 1;
                let position = Cesium.Cartographic.toCartesian(cc);
                let point = that.easy3d.util.getIntersectPosition(
                  {
                    startPoint: center,
                    endPoint: position,
                  },
                  window.viewer
                );
                that.createLine(center, position, point);
              }
            });
          }
        },
      });
    },
    drawPolyline() {
      if (!drawTool) return;
      let that = this;
      this.clickBtnIndex = 2;
      drawTool.start({
        type: "polyline",
        style: {
          color: "#ffff00",
          width: 2,
          clampToGround: true,
        },
        success: function (entObj, ent) {
          ent.show = false;
          let positions = entObj.getPositions();
          let ctgc_center = Cesium.Cartographic.fromCartesian(positions[0]);
          ctgc_center.height = ctgc_center.height + 2;
          let center = Cesium.Cartographic.toCartesian(ctgc_center);
          let ctgc_aim = Cesium.Cartographic.fromCartesian(positions[1]);
          ctgc_aim.height = ctgc_aim.height + 1;
          let aim = Cesium.Cartographic.toCartesian(ctgc_aim);
          let point = that.easy3d.util.getIntersectPosition(
            {
              startPoint: center,
              endPoint: aim,
            },
            window.viewer
          );
          that.createLine(center, aim, point);
        },
      });
    },

    // 创建通视线
    createLine(p1, p2, point) {
      if (point) {
        // 判断分割点是否在p1 p2间
        let dis_p1p2 = Cesium.Cartesian3.distance(p1.clone(), p2.clone());
        let dis_p1point = Cesium.Cartesian3.distance(p1.clone(), point.clone());
        if (dis_p1p2 > dis_p1point) {
          let line1 = window.viewer.entities.add({
            polyline: {
              positions: [p1, point],
              clampToGround: true,
              material: Cesium.Color.GREEN,
              width: 2,
            },
          });
          let line2 = window.viewer.entities.add({
            polyline: {
              positions: [point, p2],
              clampToGround: true,
              material: Cesium.Color.RED,
              width: 2,
            },
          });

          lines.push(line1);
          lines.push(line2);
        } else {
          let line3 = window.viewer.entities.add({
            polyline: {
              positions: [p1, p2],
              clampToGround: true,
              material: Cesium.Color.GREEN,
              width: 2,
            },
          });
          lines.push(line3);
        }
      } else {
        let line4 = window.viewer.entities.add({
          polyline: {
            positions: [p1, p2],
            clampToGround: true,
            material: Cesium.Color.GREEN,
            width: 2,
          },
        });
        lines.push(line4);
      }
    },
  },
};
</script>
