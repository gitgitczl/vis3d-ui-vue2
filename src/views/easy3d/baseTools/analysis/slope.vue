<template>
  <div>
    <div class="analysis-btn analysis-top-btn basic-analysis-btn">
      <span @click="draw">绘制范围</span>
      <span @click="clear" class="basic-analysis-btn-clear">清除</span>
    </div>
  </div>
</template>

<script>
/* 坡度分析 */
window.slopDrawTool = null;
let lines = [];
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
        const positions = entObj.getPositions();
        /* that.loadSlopeGeometry(positions); */
        let newps = that.lerpPositions(positions);
        newps.slopPositions.forEach((p, index) => {
          let obj = util.getSlopePosition(
            p.clone(),
            newps.radius,
            30,
            window.viewer
          );
          let color = that.getColorBySlop(obj.slope);
          let line = that.createArrow([obj.startP, obj.endP], color);
          let sp = obj.slope ? Number(obj.slope).toFixed(2) + "°" : "--";
          line.popup = `<span>坡度为：${sp || "--"}</span>`;
          if (line) lines.push(line);
        });
        window.slopDrawTool.removeOne(entObj);
      });
    }
  },
  destroyed() {
    this.clear();
    if (window.slopDrawTool) {
      window.slopDrawTool.destroy();
      window.slopDrawTool = null;
    }
  },
  methods: {
    clear() {
      lines.forEach((line) => {
        window.viewer.entities.remove(line);
      });
      lines = [];
      if (window.slopDrawTool) window.slopDrawTool.removeAll();
    },
    draw() {
      this.clear();
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

      // 计算箭头长度最小值
      let radius = Number.MAX_VALUE;
      for (var step = 0; step < indices.length; step += 3) {
        let a = newc3s[indices[step]];
        let b = newc3s[indices[step + 1]];
        let c = newc3s[indices[step + 2]];
        let h = this.getTrangleH(a, b, c);
        if (h < radius) radius = h;
      }

      // 数组去重
      let setIndices = [...new Set(indices)];
      let slopPositions = [];
      for (var index = 0; index < setIndices.length; index++) {
        slopPositions.push(newc3s[setIndices[index]]);
      }
      return { slopPositions, radius };
    },
    createArrow(positions, color) {
      return window.viewer.entities.add({
        polyline: {
          positions: positions,
          width: 6,
          clampToGround: true,
          material: new Cesium.PolylineArrowMaterialProperty(
            color || Cesium.Color.YELLOW.withAlpha(0.8)
          ),
        },
      });
    },
    // 计算三角形的高
    getTrangleH(a, b, c) {
      let ab = Cesium.Cartesian3.subtract(b, a, new Cesium.Cartesian3());
      let ac = Cesium.Cartesian3.subtract(c, a, new Cesium.Cartesian3());
      let pjab2ac = Cesium.Cartesian3.projectVector(
        ab,
        ac,
        new Cesium.Cartesian3()
      );
      let subtract = Cesium.Cartesian3.subtract(
        ab,
        ac,
        new Cesium.Cartesian3()
      );
      return Cesium.Cartesian3.magnitude(subtract);
    },
    getColorBySlop(slop) {
      let colors = [
        "#CCFFFF",
        "#CCFFCC",
        "#CCFF99",
        "#CCFF66",
        "#CCFF33",
        "#CCFF00",
        "#CCCCFF",
        "#CCCCCC",
        "#CCCC99",
        "#CCCC66",
        "#CCCC33",
        "#CCCC00",
        "#CC99FF",
        "#CC99CC",
        "#CC9999",
        "#CC9966",
        "#CC9933",
        "#CC9900",
        "#CC66FF",
        "#CC66CC",
        "#CC6699",
        "#CC6666",
        "#CC6633",
        "#CC6600",
        "#CC33FF",
        "#CC33CC",
        "#CC3399",
        "#CC3366",
        "#CC3333",
        "#CC3300",
        "#CC00FF",
        "#CC00CC",
        "#CC0099",
        "#CC0066",
        "#CC0033",
        "#CC0000",
      ];
      let colorStep = Math.floor((slop / 75) * colors.length);
      let color = colors[colorStep] || colors[colors.length - 1];
      let alpha = slop / 100;
      color = Cesium.Color.fromCssColorString("#CC0000").withAlpha(alpha);
      return color;
    },
    loadSlopeGeometry(positions) {
      let ins = new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(positions),
        }),
        attributes: {
          /* color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            Cesium.Color.ORANGE
          ), */
        },
      });
      window.viewer.scene.primitives.add(
        new Cesium.GroundPrimitive({
          geometryInstances: ins,
          /*  appearance: new Cesium.PerInstanceColorAppearance({
            translucent: false,
            closed: true,
          }), */
          appearance: new Cesium.MaterialAppearance({
            material: Cesium.Material.fromType("SlopeRamp"),
          }),
        })
      );
    },
  },
};
</script>
