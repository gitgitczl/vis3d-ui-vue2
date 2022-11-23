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
          <p>可见区域透明度：</p>
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
          <p>不可见区透明度：</p>
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
let visualField = null;
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
      if (!visualField) {
        visualField = new this.easy3d.analysis.VisualTool(window.viewer, {
          visibleAreaColor: this.visibleAreaColor,
          visibleAreaColorAlpha: this.visibleAreaColorAlpha,
          hiddenAreaColor: this.hiddenAreaColor,
          hiddenAreaColorAlpha: this.visibleAreaColorAlpha,
          verticalFov: this.verticalFov,
          horizontalFov: this.horizontalFov,
        });
      }
      visualField.startDraw(function (heading, distance) {
        that.heading = heading;
        that.distance = distance;
      });
    },
    setHorizontalFov(val) {
      if (!visualField) return;
      visualField.setHorizontalFov(val);
    },
    setVerticalFov(val) {
      if (!visualField) return;
      visualField.setVerticalFov(val);
    },
    setDistance(val) {
      if (!visualField) return;
      visualField.setDistance(val);
    },
    setHeading(val) {
      if (!visualField) return;
      visualField.setHeading(val);
    },
    setPitch(val) {
      if (!visualField) return;
      visualField.setPitch(val);
    },
    setVisibleAreaColor(val) {
      if (!visualField) return;
      visualField.setVisibleAreaColor(val);
    },
    setVisibleAreaColorAlpha(val) {
      if (!visualField) return;
      visualField.setVisibleAreaColorAlpha(val);
    },
    setHiddenAreaColor(val) {
      if (!visualField) return;
      visualField.setHiddenAreaColor(val);
    },
    setHiddenAreaColorAlpha(val) {
      if (!visualField) return;
      visualField.setHiddenAreaColorAlpha(val);
    },
    clear() {
      if (!visualField) return;
      visualField.destroy();
      visualField = null;

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
