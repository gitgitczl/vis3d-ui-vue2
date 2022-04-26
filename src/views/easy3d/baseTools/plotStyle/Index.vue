<template>
  <Card
    :width="400"
    :height="600"
    @close="close"
    :title="title"
    :position="position"
    :size="size"
    titleIcon="icon-dianyingmulu"
  >
    <div v-if="plotActive && Object.keys(plotStyleAttr).length">
      <div
        class="plot-type"
        v-for="(item, index) in plotStyleAttr"
        :key="index"
      >
        <!-- 标签 -->
        <div :span="14" v-if="item.type === 'checkbox'">
          <el-row style="margin-bottom: 10px;">
            <el-col :span="6" class="plot-type-name">{{ item.name }}：</el-col>
            <el-col :span="18" class="reset-radio">
              <el-radio-group v-model="item.value">
                <el-radio
                  v-for="(opt, index) in item.options"
                  :key="index"
                  :label="index"
                  >{{ opt.name }}</el-radio
                >
              </el-radio-group>
            </el-col>
          </el-row>

          <div
            v-for="(opt, step) in item.options"
            :key="step"
            v-show="step == item.value"
          >
            <Detail
              v-for="(detial, ind) in opt"
              :key="ind"
              :detailAttr="detial"
              @toChange="toChange"
              v-show="ind != 'name'"
            >
              <el-col :span="6" class="plot-type-name">{{ detial.name }}：</el-col>
            </Detail>
          </div>
        </div>

        <!-- 普通属性 -->
        <div v-else>
          <Detail :detailAttr="item" @toChange="toChange">
            <el-col :span="6" class="plot-type-name">{{ item.name }}：</el-col>
          </Detail>
        </div>
      </div>
    </div>
    <div v-if="!plotActive">
      <div class="plot-style-self basic-text-input">
        <label>名称：</label>
        <el-input v-model="name" placeholder="请输入内容"></el-input>
      </div>
    </div>

    <div class="polt-style-btn basic-polt-style-btn">
      <span 
      v-for="(item, index) in plotStyleBtn" 
      :key="index" 
      :class="[plotActive === index ? 'polt-style-btn-active' : '']"
      @click="onChangePlotStyle(index)"
      >{{item}}</span>
    </div>
  </Card>
</template>

<script>
import Card from "@/views/easy3d/components/card/Card.vue";
import plotStyle from "./plotStyle.json";
import Detail from "@/views/easy3d/components/detail/Detail.vue";
/* 标绘样式设置 */
export default {
  name: "PlotStyle",
  components: {
    Card,
    Detail,
  },
  props: {
    title: "",
    position: {},
    size:{},
    plotEntityObjId: "", // 当前编辑的对象
  },
  data() {
    return {
      plotStyleAttr: {},
      plotStyleBtn: ['标绘属性', '自有属性'],
      plotActive: 0,
      name: ''
    };
  },

  mounted() {
    this.setAttr(this.plotEntityObjId);
  },

  methods: {
    close() {
      this.$emit("close", "plotStyle");
    },
    setAttr(id) {
      /* 根据当前编辑的对象的样式类型 构建样式面板 */
      let nowPlotEntityObj =
        window.plotDrawTool.getEntityObjById(id) || {};
      let entityObj = nowPlotEntityObj.entityObj;
      if (!entityObj) return;
      this.plotStyleAttr = plotStyle[entityObj.attr.styleType];
      // 设置样式默认值
      let entityStyleValue = entityObj.getStyle();
      for (let i in this.plotStyleAttr) {
        let attr = this.plotStyleAttr[i];
        if (attr.type == "checkbox") {
          for (let key in attr.options[attr.value]) {
            if (key != "name")
              attr.options[attr.value][key].value = entityStyleValue[key];
          }
        }
        attr.value =
          entityStyleValue[i] === undefined ? attr.value : entityStyleValue[i];
      }
    },

    // 获取标签变化的值
    toChange() {
      this.$store.commit("setNowPlotStyleAttr", this.plotStyleAttr);
    },

    onChangePlotStyle(index) {
      this.$set(this, 'plotActive', index)
    }
  },
  watch: {
    plotEntityObjId(newid, oldid) { // 防止当前页面未关闭 却传入了不同的id
      if (newid != oldid) {
        this.setAttr(newid);
      }
    },
  },
};
</script>

<style lang="less" scoped>
.plot-box {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 999;
  width: 400px;
  height: 800px;
  background: rgba(0, 0, 0, 0.7);
  box-sizing: border-box;
  padding: 10px;
  .el-divider__text {
    font-size: 18px;
  }
}
.plot-body {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}
.plot-child {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  li {
    width: 75px;
    height: 75px;
    margin-right: 10px;
    margin-bottom: 10px;
    display: flex;
    cursor: pointer;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
.plot-type-name{
  text-align: left;
}
.plot-type{
  margin-bottom: 10px;
  &:last-child{
    margin-bottom: 0;
  }
}
.polt-style-btn{
  position: absolute;
  left: -30px;
  top: 0;
  width: 30px;
  height: 220px;
  display: flex;
  flex-direction: column;
  span{
    width: 100%;
    height: 100px;
    box-sizing: border-box;
    padding: 0 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px 0 0 10px;
    cursor: pointer;
  }
}
.plot-style-self {
  display: flex;
  align-items: center;
  label{
    width: 60px;
  }
}
</style>