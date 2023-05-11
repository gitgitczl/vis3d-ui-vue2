<template>
  <div class="flood-bar">
    <ul class="flood-body basic-flood basic-number">
      <li>
        <label>分析区域：</label>
        <p @click="draw">绘制区域</p>
      </li>
      <li>
        <label>底部高度：</label>
        <el-input-number
          v-model="bottomHeight"
          @input="changeHeight"
          placeholder="请输入高度"
        ></el-input-number>
      </li> 
      <li>
        <label>顶部高度：</label>
        <el-input-number
          :controls="false"
          v-model="topHeight"
          placeholder="请输入高度"
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
/* 限高分析 */
window.limitHeightDrawTool = null;
let positions = null;
let limitHeight = null;
export default {
  name: "LimitHeight",
  data() {
    return {
      bottomHeight: 0, // 最低高度
      topHeight: 9999,
    };
  },
  mounted() {
    let that = this;
    if (!window.limitHeightDrawTool)
      window.limitHeightDrawTool = new this.easy3d.plot.Tool(window.viewer, {
        canEdit: true,
      });

    window.limitHeightDrawTool.on("endCreate", function (entObj, ent) {
      // 创建完成后 打开控制面板
    });
    window.limitHeightDrawTool.on("startEdit", function (entObj, ent) {
      // 开始编辑
    });
    window.limitHeightDrawTool.on("endEdit", function (entObj, ent) {
      // 编辑完成后
      positions = entObj.getPositions();
    });
  },
  destroyed() {
    this.clear();
    if (window.limitHeightDrawTool) {
      window.limitHeightDrawTool.destroy();
      window.limitHeightDrawTool = null;
    }
  },
  methods: {
    clear() {
      if (limitHeight) {
        limitHeight.destroy();
        limitHeight = null;
      }
      window.limitHeightDrawTool.removeAll();
      positions = null;
      this.bottomHeight = 0;
      this.topHeight = 0;
    },
    start() {
      if(!positions) return;
      window.limitHeightDrawTool.end();
      window.limitHeightDrawTool.removeAll();
      limitHeight = new this.easy3d.analysis.LimitHeight(window.viewer, {
        positions: positions,
        bottomHeight: this.bottomHeight,
        topHeight: this.topHeight
      });
    },
    draw() {
      if (!window.limitHeightDrawTool) return;
      window.limitHeightDrawTool.start({
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
    changeHeight(val) {
      if (!limitHeight) return;
      limitHeight.setHeight(Number(val));
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
    p {
      height: 40px;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      padding: 0 20px;
      border-radius: 2px;
      cursor: pointer;
    }
  }
}
.flood-bar {
  margin-top: 10px;
}
</style>
