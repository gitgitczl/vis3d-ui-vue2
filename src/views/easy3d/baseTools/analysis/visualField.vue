<template>
  <div>
    <div class="analysis-btn analysis-top-btn basic-analysis-btn">
      <span>添加可视域</span>
      <span class="basic-analysis-btn-clear">清除</span>
    </div>
    <div class="visualfield-body">
      <ul class="visualfield-slider reset-slider basic-slider">
        <li>
          <p>水平张角：</p>
          <el-slider v-model="horizontalFov" :max="180"></el-slider>
        </li>
        <li>
          <p>垂直张角：</p>
          <el-slider v-model="verticalFov" :max="180"></el-slider>
        </li>
        <li>
          <p>投射距离：</p>
          <el-slider v-model="distance"></el-slider>
        </li>
        <li>
          <p>偏转角度：</p>
          <el-slider v-model="heading" :max="360"></el-slider>
        </li>
        <li>
          <p>俯仰角度：</p>
          <el-slider v-model="pitch" :min="-90" :max="90"></el-slider>
        </li>
        <li>
          <p>可见区域颜色：</p>
          <el-color-picker
            size="small"
            v-model="visibleAreaColor"
          ></el-color-picker>
        </li>
        <li>
          <p>可见区域透明度：</p>
          <el-slider v-model="visibleAreaColorAlpha"></el-slider>
        </li>
        <li>
          <p>不可见区域颜色：</p>
          <el-color-picker
            size="small"
            v-model="hiddenAreaColor"
          ></el-color-picker>
        </li>
        <li>
          <p>不可见区透明度：</p>
          <el-slider v-model="hiddenAreaColorAlpha"></el-slider>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
/* 可视域分析 */
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
      visibleAreaColorAlpha: 1,
      hiddenAreaColor: "#FF0000",
      hiddenAreaColorAlpha: 1,
    };
  },
  mounted() {},
  destroyed() {},
  methods: {},
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