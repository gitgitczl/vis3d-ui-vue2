<template>
  <div>
    <p class="slope-toolip">提示：此功能须基于模型进行绘制展示。</p>
    <div class="analysis-btn analysis-top-btn basic-analysis-btn">
      <span @click="startDraw">添加可视域</span>
      <span class="basic-analysis-btn-clear" @click="clear">清除</span>
    </div>
    <div class="visualfield-body">
      <ul class="visualfield-slider reset-slider basic-slider">
        <li>
          <p>水平张角：</p>
          <el-slider
            v-model="horizontalFov"
            @input="setHorizontalFov"
            :max="180"
          ></el-slider>
        </li>
        <li>
          <p>垂直张角：</p>
          <el-slider
            v-model="verticalFov"
            @input="setVerticalFov"
            :max="180"
          ></el-slider>
        </li>
        <li>
          <p>投射距离：</p>
          <el-slider
            v-model="distance"
            @input="setDistance"
            :max="1000"
          ></el-slider>
        </li>
        <li>
          <p>偏转角：</p>
          <el-slider
            v-model="heading"
            @input="setHeading"
            :max="360"
          ></el-slider>
        </li>
        <li>
          <p>仰俯角：</p>
          <el-slider v-model="pitch" @input="setPitch" :max="360"></el-slider>
        </li>
        <li>
          <p>俯仰角度：</p>
          <el-slider
            v-model="pitch"
            @input="setPitch"
            :min="-90"
            :max="90"
          ></el-slider>
        </li>
        <li>
          <p>可见区域颜色：</p>
          <el-color-picker
            size="small"
            v-model="visibleAreaColor"
            @active-change="setVisibleAreaColor"
          ></el-color-picker>
        </li>
        <li>
          <p>可见透明度：</p>
          <el-slider
            v-model="visibleAreaColorAlpha"
            :max="1"
            :step="0.1"
            @input="setVisibleAreaColorAlpha"
          ></el-slider>
        </li>
        <li>
          <p>不可见区域颜色：</p>
          <el-color-picker
            size="small"
            v-model="hiddenAreaColor"
            @active-change="setHiddenAreaColor"
          ></el-color-picker>
        </li>
        <li>
          <p>不可见透明度：</p>
          <el-slider
            v-model="hiddenAreaColorAlpha"
            :max="1"
            :step="0.1"
            @input="setHiddenAreaColorAlpha"
          ></el-slider>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
/* 可视域分析 */
let visualFieldTool = null;
let vfPrimitive = undefined;
export default {
  name: "VisualField",
  data() {
    return {
      horizontalFov: 120,
      verticalFov: 60,
      distance: 0,
      heading: 0,
      pitch: 0,
      visibleAreaColor: "#00FF00",
      visibleAreaColorAlpha: 0.5,
      hiddenAreaColor: "#FF0000",
      hiddenAreaColorAlpha: 0.5,
    };
  },
  mounted() {},
  destroyed() {},
  methods: {
    startDraw() {
      this.clear();
      let that = this;
      if (!visualFieldTool) {
        visualFieldTool = new this.easy3d.analysis.visualFieldTool(
          window.viewer
        );
      }

      if (vfPrimitive) {
        visualFieldTool.removeOne(vfPrimitive);
        vfPrimitive = undefined;
      }

      visualFieldTool.startDraw(
        {
          visibleAreaColor: this.visibleAreaColor,
          visibleAreaColorAlpha: this.visibleAreaColorAlpha,
          hiddenAreaColor: this.hiddenAreaColor,
          hiddenAreaColorAlpha: this.visibleAreaColorAlpha,
          verticalFov: this.verticalFov,
          horizontalFov: this.horizontalFov,
        },
        function (vp) {
          vfPrimitive = vp;
          let { heading, distance } = vp.attr;
          that.heading = heading;
          that.distance = distance;
        }
      );
    },
    setHorizontalFov(val) {
      if (!visualFieldTool) return;
      visualFieldTool.setHorizontalFov(vfPrimitive, val);
    },
    setVerticalFov(val) {
      if (!visualFieldTool) return;
      visualFieldTool.setVerticalFov(vfPrimitive, val);
    },
    setDistance(val) {
      if (!visualFieldTool) return;
      visualFieldTool.setDistance(vfPrimitive, val);
    },
    setHeading(val) {
      if (!visualFieldTool) return;
      visualFieldTool.setHeading(vfPrimitive, val);
    },
    setPitch(val) {
      if (!visualFieldTool) return;
      visualFieldTool.setPitch(vfPrimitive, val);
    },
    setVisibleAreaColor(val) {
      if (!visualFieldTool) return;
      visualFieldTool.setVisibleAreaColor(vfPrimitive, val);
    },
    setVisibleAreaColorAlpha(val) {
      if (!visualFieldTool) return;
      visualFieldTool.setVisibleAreaColorAlpha(vfPrimitive, val);
    },
    setHiddenAreaColor(val) {
      if (!visualFieldTool) return;
      visualFieldTool.setHiddenAreaColor(vfPrimitive, val);
    },
    setHiddenAreaColorAlpha(val) {
      if (!visualFieldTool) return;
      visualFieldTool.setHiddenAreaColorAlpha(vfPrimitive, val);
    },
    clear() {
      if (!visualFieldTool) return;
      visualFieldTool.destroy();
      visualFieldTool = null;

      this.horizontalFov = 120;
      this.verticalFov = 60;
      this.distance = 0;
      this.heading = 0;
      this.pitch = 0;
      this.visibleAreaColor = "#00FF00";
      this.visibleAreaColorAlpha = 0.5;
      this.hiddenAreaColor = "#FF0000";
      this.hiddenAreaColorAlpha = 0.5;
    },
  },
};
</script>

<style lang="less">
.visualfield-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  ul {
    width: 100%;
  }
}
.visualfield-slider {
  li {
    display: flex;
    align-items: center;
    p {
      width: 35%;
      display: flex;
      justify-content: flex-end;
      margin-right: 20px;
    }
    .el-slider {
      width: 110px;
    }
  }
}
.visualfield-btn {
  height: 32px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 15px;
  border-radius: 2px;
  cursor: pointer;
}
</style>
