<template>
  <div>
    <ul class="globeSurface-body">
      <li class="basic-checkbox">
          <p>状态：</p>
          <el-checkbox v-model="isView">是否显示</el-checkbox>
      </li>
      <li class="reset-slider basic-slider">
        <p>地表透明度：</p>
        <el-slider v-model="opcity"></el-slider>
      </li>
      <li class="analysis-btn analysis-top-btn basic-analysis-btn globeSurface-btn">
        <span>俯视视角</span>
        <span>地下视角1</span>
        <span>地下视角2</span>
        <span class="basic-analysis-btn-clear">清除</span>
      </li>
    </ul>
  </div>
</template>

<script>
/* 地表透明 */
export default {
  name: "GlobeSurface",

  data() {
    return {
      isView:false,
      opcity: 0
    };
  },

  mounted() {},

  destroyed() {},

  methods: {},
};
</script>

<style lang="less">
.globeSurface-body{
  li{
    display: flex;
    align-items: center;
    justify-content: flex-start;
    p{
      width: 90px;
      display: flex;
      justify-content: flex-end;
      margin-right: 10px;
    }
    .el-slider{
      width: calc(100% - 90px);
    }
  }
}
.globeSurface-btn{
  flex-wrap: wrap;
  justify-content: flex-start;
  span{
    &:last-child{
      margin-top: 10px;
    }
  }
}
</style>