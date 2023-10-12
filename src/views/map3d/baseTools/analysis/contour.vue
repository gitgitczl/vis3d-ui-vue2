<template>
  <div>
    <div class="analysis-btn analysis-top-btn basic-analysis-btn">
      <span>绘制矩形</span>
      <span>绘制多边形</span>
      <span class="basic-analysis-btn-clear">清除</span>
    </div>
    <ul class="contour-content">
      <li class="reset-color-picker">
        <label>颜&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;色：</label>
        <el-color-picker v-model="color" size="small"></el-color-picker>
      </li>
      <li class="reset-slider basic-slider contour-slider">
        <label>间&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;隔：</label>
        <el-slider v-model="intarval"></el-slider>
      </li>
      <li class="reset-slider basic-slider contour-slider">
        <label>线&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;框：</label>
        <el-slider v-model="lineWidth"></el-slider>
      </li>
      <li class="reset-radio">
        <label>地表渲染：</label>
        <el-radio-group v-model="landValue">
          <el-radio :label="0">无</el-radio>
          <el-radio :label="1">高程</el-radio>
          <el-radio :label="2">坡度</el-radio>
          <el-radio :label="3">坡向</el-radio>
        </el-radio-group>
      </li>
      <li class="basic-checkbox">
        <label>状态控制：</label>
        <el-checkbox v-model="status">状态控制</el-checkbox>
      </li>
    </ul>
  </div>
</template>

<script>
/* 等高线 */
export default {
  name: "Contour",
  data() {
    return {
      color: '#3AD513',
      intarval: 0,
      lineWidth: 0,
      landValue: 0,
      status: false
    };
  },
  mounted() {},
  destroyed() {},
  methods: {},
};
</script>

<style lang="less">
.contour-content {
  margin-top: 10px;
  li {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    &:last-child {
      margin-bottom: 0;
    }
    
    .el-radio{
      margin-right: 9px;
    }
  }
  .contour-slider {
    .el-slider {
      width: 200px;
    }
  }
}
</style>