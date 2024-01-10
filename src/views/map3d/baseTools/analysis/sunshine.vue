<template>
  <div>
    <p class="basic-tooltip">提示：模拟设定时间范围内的太阳光效果</p>
    <div class="sunshine-item basic-time">
      <label>开始时间：</label>
      <el-date-picker v-model="startTime" type="datetime" placeholder="选择日期">
      </el-date-picker>
    </div>
    <div class="sunshine-item basic-time">
      <label>结束时间：</label>
      <el-date-picker v-model="endTime" type="datetime" placeholder="选择日期">
      </el-date-picker>
    </div>
    <div class="sunshine-item basic-time">
      <label>当前时间：</label>
      <el-date-picker v-model="nowTime" type="datetime" disabled>
      </el-date-picker>
    </div>
    <div class="analysis-btn basic-analysis-bottom-btn">
      <span @click="start">开始</span>
      <span @click="end">结束</span>
    </div>
  </div>
</template>

<script>
/* 日照分析 */
let sunshine = null;
export default {
  name: "Sunshine",

  data() {
    return {
      startTime: "",
      endTime: "",
      nowTime: "",
      intval: undefined
    };
  },

  mounted() { },

  destroyed() {
    if (sunshine) {
      sunshine.destroy();
      sunshine = null;
    }
  },

  methods: {
    start() {
      let that = this;
      if (!this.startTime || !this.endTime) return;
      let startDate = new Date(this.startTime);
      let endDate = new Date(this.endTime);

      let startt = startDate.getTime();
      let endtt = endDate.getTime();

      if (startt > endtt) {
        alert("开始时间不得大于结束时间！");
        return;
      }
      if (!sunshine) {
        sunshine = new window.vis3d.analysis.Sunshine(viewer, {
          startTime: startDate,
          endTime: endDate,
        });
      }
      sunshine.start();

      if (this.intval) {
        window.clearInterval(this.intval);
        this.intval = undefined;
      }
      this.intval = window.setInterval(function () {
        let time = window.viewer.clock.currentTime;
        let date = Cesium.JulianDate.toDate(time);
        that.nowTime = date;
      }, 100);
    },
    end() {
      if (!sunshine) return;
      sunshine.end();
      this.nowTime = "";
      this.startTime = "";
      if (this.intval) {
        window.clearInterval(this.intval);
        this.intval = undefined;
      }
      this.endTime = "";
    },
  },
};
</script>

<style lang="less">
.sunshine-item {
  display: flex;
  align-items: center;

  label {
    margin-right: 10px;
  }

  .el-slider {
    width: calc(100% - 80px);
  }

  margin: 8px auto;
}

.basic-analysis-bottom-btn span:nth-child(1) {
  border-color: #6a7485;
  background: rgba(106, 116, 133, 0.2);
}

.basic-analysis-bottom-btn span:nth-child(2) {
  border-color: var(--btnStyleColor);
  background: var(--btnStyleColor);
}
</style>
