<template>
  <div>
    <div class="analysis-btn analysis-top-btn basic-analysis-btn">
      <span>绘制矩形</span>
      <span>绘制面</span>
      <span class="basic-analysis-btn-clear">清除</span>
    </div>
    <ul class="heightLimit-content">
      <li class="basic-number land-height">
        <label>地表海拔：</label>
        <el-input-number
          :controls="false"
          v-model="height"
          :min="0"
          placeholder="请输入内容"
        ></el-input-number>
        <span class="land-change basic-btn">图上选点</span>
      </li>
      <li class="reset-slider basic-slider land-slider">
        <label>限制高度：</label>
        <el-slider v-model="limitHeight"></el-slider>
      </li>
      <li>
          <label>当前高度：</label>
          <p><i class="land-current-height">{{currentHeight}}</i>米</p>
      </li>
    </ul>
  </div>
</template>

<script>
/* 限高分析 */
export default {
  name: "HeightLimit",

  data() {
    return {
      height: 0, // 地表海拔
      limitHeight: 0, // 限制高度
      currentHeight: 140 // 当前高度
    };
  },

  mounted() {},

  destroyed() {},

  methods: {},
};
</script>

<style lang="less">
.heightLimit-content {
  margin-top: 10px;
  li {
    display: flex;
    align-items: center;
  }
}
.land-height {
  .el-input-number {
    width: 100px;
  }
  .land-change {
    height: 38px;
    padding: 0 15px;
    display: flex;
    align-items: center;
    margin-left: 15px;
    cursor: pointer;
  }
}
.land-slider {
  .el-slider {
    width: 200px;
  }
}
.land-current-height{
    font-weight: bold;
}
</style>