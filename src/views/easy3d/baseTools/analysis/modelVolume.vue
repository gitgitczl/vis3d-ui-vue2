<template>
  <div>
    <p class="slope-toolip">
      提示：请首先单击“绘制区域按钮”，再在图上绘制分析区域
    </p>
    <div class="analysis-btn analysis-top-btn basic-analysis-btn">
      <span @click="draw">绘制区域</span>
      <span class="basic-analysis-btn-clear" @click="clear">清除</span>
    </div>
    <ul class="volume-body basic-number">
      <li>
        <label class="res-label">体积：</label>
        <el-input-number
          :controls="false"
          v-model="volume"
          disabled
        ></el-input-number>
        <span> &nbsp;m³</span>
      </li>
      <li>
        <label class="res-label">高度差：</label>
        <el-input-number
          :controls="false"
          v-model="diffH"
          disabled
        ></el-input-number>
        <span> &nbsp;m</span>
      </li>
      <li>
        <label class="res-label">最小高度：</label>
        <el-input-number
          :controls="false"
          v-model="minH"
          disabled
        ></el-input-number>
        <span> &nbsp;m</span>
      </li>
      <li>
        <label class="res-label">最大高度：</label>
        <el-input-number
          :controls="false"
          v-model="maxH"
          disabled
        ></el-input-number>
        <span> &nbsp;m</span>
      </li>
    </ul>
  </div>
</template>
<script>
/* 方量分析 */
window.modelDrawTool = null;
let polygonPositions;
export default {
  name: "ModelVolume",
  data() {
    return {
      volume: 0,
      minH: 0,
      maxH: 0,
      diffH: 0,
    };
  },
  mounted() {
    let that = this;
    if (!window.modelDrawTool) {
      window.modelDrawTool = new this.easy3d.DrawTool(window.viewer, {
        canEdit: true,
      });
      window.modelDrawTool.on("endCreate", function (entObj, ent) {
        // 创建完成后 打开控制面板
      });
      window.modelDrawTool.on("startEdit", function (entObj, ent) {
        // 开始编辑
      });
      window.modelDrawTool.on("endEdit", function (entObj, ent) {
        polygonPositions = entObj.getPositions();
        // 编辑完成后
        that.compute(that.jzmHeight);
      });
    }
  },
  destroyed() {
    if (!window.modelDrawTool) {
      window.modelDrawTool.destroy();
      window.modelDrawTool = null;
    }
  },
  methods: {
    draw() {
      if (!window.modelDrawTool) return;
      window.modelDrawTool.removeAll();
      window.modelDrawTool.start({
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
    clear() {
      if (window.modelDrawTool) window.modelDrawTool.removeAll();
      this.volume = 0;
      this.minH = 0;
      this.maxH = 0;
      this.diffH = 0;
    },
    compute(h) {
      let uniformData = cUtil.computeUniforms(polygonPositions, true);
      let minh = uniformData.minHeight;
      let maxh = uniformData.maxHeight;
      this.diffH = Number(maxh - minh).toFixed(2);
      this.minH = Number(minh).toFixed(2);
      this.maxH = Number(maxh).toFixed(2);
      if (h) {
        if (h > maxh) {
          maxh = h;
        }
        if (h < minh) {
          minh = h;
        }
      }
      this.volume = this.digV(uniformData, minh);
    },
    // 挖方体积
    digV(data, minh) {
      if (!data) return;
      var uniforms = data.uniformArr;
      if (!uniforms || uniforms.length == 0 || !minh) return;
      var totalV = 0;
      for (var i = 0; i < uniforms.length; i++) {
        var item = uniforms[i];
        if (item.height > minh) {
          var v = item.area * (item.height - minh);
          totalV += v;
        }
      }
      totalV = totalV.toFixed(2);
      return totalV;
    },
  },
};
</script>

<style lang="less">
.volume-body {
  margin-top: 15px;
  li {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    label {
      display: flex;
      align-items: center;
    }
    .el-input-number {
      width: 100px;
    }
    .volume-btn {
      height: 40px;
      padding: 0 10px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      border-radius: 2px;
      margin-left: 15px;
      cursor: pointer;
    }
  }
}

.res-label {
  width: 100px;
}
</style>
