<template>
  <div>
    <p class="slope-toolip">提示：模拟设定时间范围内的太阳光效果</p>
    <div class="sunshine-item basic-time">
      <label>日期选择：</label>
      <el-date-picker
        v-model="date"
        type="date"
        placeholder="选择日期">
      </el-date-picker>
    </div>
    <div class="sunshine-item reset-slider basic-slider">
      <label>时间选择：</label>
      <el-slider v-model="time"></el-slider>
    </div>
    <div class="sunshine-item">
      <label>当前时间：</label>
      <p>3月21日 15:23</p>
    </div>
    <div class="analysis-btn basic-analysis-bottom-btn">
      <span>清除</span>
      <span>播放</span>
    </div>
  </div>
</template>

<script>
/* 日照分析 */
export default {
  name: 'Sunshine',

  data() {
    return {
      date: '', // 日期
      time: 0 // 时间
    };
  },

  mounted() {},

  destroyed() {},

  methods: {},
};
</script>

<style lang="less">
.sunshine-item{
  display: flex;
  align-items: center;
  label{
    margin-right: 10px;
  }
  .el-slider{
    width: calc(100% - 80px);
  }
}

</style>