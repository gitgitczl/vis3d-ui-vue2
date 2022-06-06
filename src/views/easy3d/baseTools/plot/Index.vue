<template>
  <Card
    :title="title"
    :width="342"
    :position="position"
    :size="size"
    height="auto"
    titleIcon="icon-tushangcehui"
    @close="close"
  >
    <div class="plot-btn-box basic-plot">
      <ul class="plot-btn">
        <el-tooltip
          v-for="(item, index) in plotBtn1"
          :key="index"
          class="item"
          effect="dark"
          :content="item.name"
          placement="top"
        >
          <li>
            <i :class="['iconfont', item.icon]"></i>
          </li>
        </el-tooltip>
      </ul>
      <span></span>
      <ul class="plot-btn">
        <el-tooltip
          v-for="(item, index) in plotBtn2"
          :key="index"
          class="item"
          effect="dark"
          :content="item.name"
          placement="top"
        >
          <li>
            <i :class="['iconfont', item.icon]"></i>
          </li>
        </el-tooltip>
      </ul>
    </div>
    <div class="plot-select basic-select">
      <el-select
        v-model="plotInitValue"
        @change="onChangePlot"
        placeholder="请选择"
      >
        <el-option
          v-for="(item, index) in plotTypeList"
          :key="index"
          :label="item"
          :value="item"
        >
        </el-option>
      </el-select>
    </div>

    <ul class="plot-box basic-tool">
      <li
        v-for="(item, index) in plotList"
        :key="index"
        :class="[index === isPlotActive ? 'tool-active' : '']"
        @click="onChangePlotType(index, item)"
      >
        <span><img :src="item.iconImg" /></span>
        <label>{{ item.name }}</label>
      </li>
    </ul>
  </Card>
</template>
<script>
import plotList from "./plotList.json";
import Card from "@/views/easy3d/components/card/Card.vue";
// 地图标注 基础组件
window.plotDrawTool = null;
let nowPlotEntObj = null; //当前编辑的对象
export default {
  name: "plot",
  components: {
    Card,
  },
  props: {
    title: "",
    position: {},
    size: {},
  },
  data() {
    return {
      cardDialog: false, // 是否打开弹窗
      plotBtn1: [
        {
          name: "打开文件",
          icon: "icon-dakaiwenjian",
        },
        {
          name: "文件",
          icon: "icon-jianyiwenjian",
        },
        {
          name: "保存",
          icon: "icon-baocun",
        },
      ],
      plotBtn2: [
        {
          name: "删除",
          icon: "icon-shanchu",
        },
        {
          name: "编辑",
          icon: "icon-shifoubianji",
        },
        {
          name: "属性",
          icon: "icon-shifouqiyongleshuxingdanchuang",
        },
      ],
      plotInitValue: "",
      isPlotActive: -1,
      plotTypeList: [], // 标绘类型
      plotList: [], // 标绘列表
    };
  },

  mounted() {
    // 设置下拉框
    this.$set(this, "plotTypeList", Object.keys(plotList));
    this.$set(
      this,
      "plotInitValue",
      this.plotTypeList.length ? this.plotTypeList[0] : ""
    );
    this.$set(
      this,
      "plotList",
      this.plotTypeList.length ? plotList[this.plotTypeList[0]] : []
    );

    let that = this;
    if (!window.plotDrawTool) {
      window.plotDrawTool = new this.easy3d.DrawTool(window.viewer, {
        canEdit: true,
      });
      window.plotDrawTool.on("endCreate", function (entObj, ent) {
        // 创建完成后 打开控制面板
        nowPlotEntObj = entObj;
        that.isPlotActive = -1;
      });
      window.plotDrawTool.on("startEdit", function (entObj, ent) {
        // 开始编辑
        nowPlotEntObj = entObj;
        that.$store.commit("setPlotEntityObjId", entObj.objId);
        that.easy3d.workControl.openToolByName("plotStyle");
      });
      window.plotDrawTool.on("endEdit", function (entObj, ent) {
        // 编辑完成后
        nowPlotEntObj = null;
        let lnglats = entObj.getPositions(true);
        that.easy3d.workControl.closeToolByName("plotStyle");
      });
    }
  },

  destroyed() {},
  methods: {
    // 选择标绘类型
    onChangePlot(data) {
      this.$set(this, "plotList", plotList[data]);
      this.$set(this, "isPlotActive", -1);
    },

    /**
     * 选择绘制样式
     */
    onChangePlotType(index, item) {
      this.$set(this, "isPlotActive", index);
      this.startDraw(item);
    },

    // 绘制
    startDraw(item, index) {
      if (!window.plotDrawTool) return;
      window.plotDrawTool.start(item);
      this.$set(this, "cardDialog", true);
    },

    close() {
      this.$emit("close", "plot");
    },

    // 将style对象转为线性的
    transformStyleVal(style) {
      if (!style) return;
      let styleVal = {};
      for (let i in style) {
        styleVal[i] = style[i].value;
        if (style[i].type == "checkbox") {
          let option = style[i].options[style[i].value];
          for (let step in option) {
            styleVal[step] = option[step].value;
          }
        }
      }
      return styleVal;
    },
  },
  watch: {
    // 监听当前绘制的对象的属性改变 from plotStyle
    "$store.state.map3d.nowPlotStyleAttr": {
      handler(style) {
        if (!nowPlotEntObj) return;
        let plotStyle = this.transformStyleVal(style);
        window.plotDrawTool.updateOneStyle(nowPlotEntObj, plotStyle);
      },
      deep: true,
    },
  },
};
</script>

<style lang="less">
.plot-btn-box {
  display: flex;
  align-items: center;
  span {
    width: 1px;
    height: 10px;
    background: #6f768c;
    margin: 0 20px;
  }
  .plot-btn {
    display: flex;
    align-items: center;
    li {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      i {
        font-size: 20px;
      }
    }
  }
}
.plot-select {
  margin: 20px 0;
  .el-select {
    width: 100%;
  }
  .el-input__inner {
    border-radius: 20px;
  }
}
.plot-box {
  display: flex;
  flex-wrap: wrap;
  li {
    width: 90px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 16px 10px 0;
    cursor: pointer;
    &:nth-child(3n) {
      margin-right: 0;
    }
    span {
      font-size: 26px;
      margin-bottom: 10px;
    }
    label {
      cursor: pointer;
    }
  }
  img {
    width: 90px;
    height: 64px;
  }
}
</style>