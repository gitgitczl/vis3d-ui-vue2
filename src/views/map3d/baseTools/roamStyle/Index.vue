<template>
  <Card :size="size" @close="close" :title="title" :position="position">
    <div class="roam-style-btn">
      <span class="basic-btn" @click="stopRoam">暂停</span>
      <span class="basic-btn" @click="goonRoam">继续</span>
      <span class="basic-btn-danger" @click="endRoam">结束</span>
    </div>
    <ul class="roam-style-box">
      <li class="basic-text-input">
        <label>名&nbsp;&nbsp;&nbsp;&nbsp;称：</label>
        <el-input v-model="nowStartRoamAttr.name" disabled></el-input>
      </li>
      <li class="basic-text-input">
        <label>总距离（m）：</label>
        <el-input disabled v-model="nowStartRoamAttr.alldistance"></el-input>
      </li>
      <li class="basic-text-input">
        <label>总时间：</label>
        <el-input disabled v-model="nowStartRoamAttr.alltimes"></el-input>
      </li>

      <li class="basic-progress">
        <label>进&nbsp;&nbsp;&nbsp;&nbsp;度：</label>
        <el-progress :text-inside="true" :stroke-width="24" :percentage="Number(
          Number(
            (nowStartRoamAttr.distanceED / nowStartRoamAttr.alldistance) *
            100
          ).toFixed(2)
        )
          " v-if="!isNaN(
    Number(
      (nowStartRoamAttr.distanceED / nowStartRoamAttr.alldistance) *
      100
    )
  )
    " status="success"></el-progress>
        <!-- <el-input disabled v-model="nowStartRoamAttr.distanceED"></el-input> -->
      </li>

      <li class="reset-select basic-select">
        <label>视&nbsp;&nbsp;&nbsp;&nbsp;角：</label>
        <el-select v-model="nowStartRoamAttr.viewType" placeholder="请选择" @change="changeView">
          <el-option label="无" value="no"></el-option>
          <el-option label="第一视角" value="dy"> </el-option>
          <el-option label="上帝视角" value="sd"></el-option>
          <el-option label="跟随视角" value="gs"></el-option>
        </el-select>
      </li>
    </ul>
  </Card>
</template>
<script>
/* 漫游相关参数设置 */

export default {
  name: "roamStyle",
  props: {
    title: "",
    position: {},
    size: {},
    iconfont: {
      type: String,
      default: "icon-youlan",
    },
    attr: {} // 
  },
  components: {

  },
  data() {
    return {
      nowStartRoamAttr: {}
    }
  },
  destroyed() {
    // 关闭当前页面时 结束当前漫游
    this.endRoam();
  },

  computed: {},

  mounted() {
    this.nowStartRoamAttr = this.attr
  },

  methods: {
    close() {
      window.workControl.closeToolByName(this.$options.name)
    },
    stopRoam() {
      if (window.nowRoam) window.nowRoam.stop();
    },
    goonRoam() {
      if (window.nowRoam) window.nowRoam.goon();
    },
    endRoam() {
      if (window.nowRoam) window.nowRoam.end();
    },
    changeView(data) {
      if (window.nowRoam) window.nowRoam.setViewType(data);
    },
    setNowRoamAttr(attr) {
      this.nowStartRoamAttr = attr
    }
  }
};
</script>

<style lang="less">
.roam-style-btn {
  display: flex;
  align-items: center;

  span {
    height: 40px;
    border-radius: 2px;
    cursor: pointer;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;

    &:last-child {
      margin-right: 0;
    }
  }
}

.roam-style-box {
  margin-top: 15px;

  li {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0;
    }

    label {
      width: 80px;
    }

    .el-progress {
      width: 100%;
    }
  }
}
</style>
