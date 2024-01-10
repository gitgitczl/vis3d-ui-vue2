<template>
  <div class="flood-bar">
    <ul class="flood-body basic-number">
      <li>
        <label>分析区域：</label>
        <p class="basic-btn" @click="draw">绘制区域</p>
      </li>
      <li>
        <label>最低海拔(米)：</label>
        <el-input-number
          :controls="false"
          v-model="minHeight"
          placeholder="请输入内容"
        ></el-input-number>
      </li>
      <li>
        <label>最高海拔(米)：</label>
        <el-input-number
          :controls="false"
          v-model="maxHeight"
          placeholder="请输入内容"
        ></el-input-number>
      </li>
      <li>
        <label>淹没速度(米/秒)：</label>
        <el-input-number
          :controls="false"
          v-model="speed"
          placeholder="请输入内容"
        ></el-input-number>
      </li>
      <li>
        <label>当前海拔：</label>
        <el-input-number
          :controls="false"
          v-model="nowHeight"
          disable
        ></el-input-number>
      </li>
    </ul>
    <div class="analysis-btn basic-analysis-btn">
      <span @click="start">开始分析</span>
      <span @click="clear" class="basic-analysis-btn-clear">清除</span>
    </div>
  </div>
</template>

<script>
/* 淹没分析 */
window.floodDrawTool = null;
let polygonPositions = null;
let floodPolygon = null;
let interVal = null;
export default {
  name: "Flood",
  data() {
    return {
      minHeight: 0, // 最低高度
      maxHeight: 0, // 最大高度
      speed: 1, // 淹没速度
      nowHeight: 0,
    };
  },
  mounted() {
    let that = this;
    if (!window.floodDrawTool)
      window.floodDrawTool = new window.vis3d.plot.Tool(window.viewer, {
        canEdit: true,
      });

    window.floodDrawTool.on("endCreate", function (entObj, ent) {
      // 创建完成后 打开控制面板
    });
    window.floodDrawTool.on("startEdit", function (entObj, ent) {
      // 开始编辑
    });
    window.floodDrawTool.on("endEdit", function (entObj, ent) {
      // 编辑完成后
      polygonPositions = entObj.getPositions();
      let uniformData = util.computeUniforms(
        polygonPositions,
        false,
        window.viewer
      );
      that.minHeight = Number(uniformData.minHeight).toFixed(2);
      that.maxHeight = Number(uniformData.maxHeight).toFixed(2);
    });
  },
  destroyed() {
    this.clear();
    window.floodDrawTool.destroy();
    window.floodDrawTool = null;
  },
  methods: {
    clear() {
      if (interVal) {
        window.clearInterval(interVal);
        interVal = null;
      }
      if (window.floodDrawTool) {
        window.floodDrawTool.removeAll();
      }
      if (floodPolygon) {
        window.viewer.entities.remove(floodPolygon);
        floodPolygon = null;
      }
      this.minHeight = 0;
      this.maxHeight = 0;
      this.speed = 1;
      this.nowHeight = 0;
    },
    start() {
      if (!polygonPositions) return;
      window.floodDrawTool.removeAll();
      if (floodPolygon) {
        window.viewer.entities.remove(floodPolygon);
        floodPolygon = null;
      }
      floodPolygon = this.createFloodPolygon();
      if (!floodPolygon) return;
      let that = this;
      let nh = this.minHeight;
      interVal = window.setInterval(() => {
        if (that.nowHeight >= that.maxHeight) {
          that.nowHeight = that.maxHeight;
          return;
        }
        nh += 0.1 * that.speed;
        that.nowHeight = Number(nh).toFixed(2);
      }, 100);
    },
    draw() {
      if (!window.floodDrawTool) return;
      window.floodDrawTool.start({
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
    // 构建淹没面
    createFloodPolygon() {
      let that = this;
      return window.viewer.entities.add({
        polygon: {
          hierarchy: polygonPositions,
          material: Cesium.Color.BLUE.withAlpha(0.5),
          height: 0,
          perPositionHeight: true,
          extrudedHeight: new Cesium.CallbackProperty(function () {
            return that.nowHeight;
          }, false),
        },
      });
    },
  },
};
</script>

<style lang="less">
.flood-body {
  li {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    label {
      width: 120px;
      display: flex;
      justify-content: flex-end;
    }

  }
}
.flood-bar {
  margin-top: 10px;
}
</style>
