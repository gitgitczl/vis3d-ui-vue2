<template>
  <Card
    @close="close"
    :title="title"
    :position="position"
    :size="size"
    :iconfont="iconfont"
  >
    <div v-if="plotActive && Object.keys(plotStyleAttr).length">
      <div
        class="plot-type"
        v-for="(item, index) in plotStyleAttr"
        :key="index"
      >
        <!-- 标签 -->
        <div :span="14" v-if="item.type === 'checkbox'">
          <el-row style="margin-bottom: 10px">
            <el-col :span="6" class="plot-type-name">{{ item.name }}：</el-col>
            <el-col :span="18" class="reset-radio">
              <el-radio-group v-model="item.value" @change="toChange">
                <el-radio
                  v-for="(opt, index) in item.options"
                  :key="index"
                  :label="index"
                  >{{ opt.name }}
                </el-radio>
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
              v-show="ind != 'name' && ind != 'value'"
            >
              <el-col :span="6" class="plot-type-name"
                >{{ detial.name }}：</el-col
              >
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
      <!-- 自定义属性信息 -->
      <div
        class="plot-style-self basic-text-input"
        v-for="(item, index) in infos"
        :key="index"
      >
        <label>{{ item.fieldName }}：</label>
        <el-input v-bind="item.value" placeholder="请输入内容"></el-input>
      </div>
    </div>

    <template slot="sidebar">
      <div class="polt-style-btn basic-polt-style-btn">
        <span
          v-for="(item, index) in plotStyleBtn"
          :key="index"
          :class="[plotActive === index ? 'polt-style-btn-active' : '']"
          @click="onChangePlotStyle(index)"
          >{{ item }}</span
        >
      </div>
    </template>
  </Card>
</template>

<script>

import plotStyle from "./plotStyle.json";
import Detail from "@/views/easy3d/components/detail/Detail.vue";
/* 标绘样式设置 */
export default {
  name: "plotStyle",
  components: {
    
    Detail,
  },
  props: {
    title: "",
    position: {},
    size: {},
    iconfont: {
      type: String,
      default: "icon-dianyingmulu",
    },
  },
  data() {
    return {
      plotStyleAttr: {},
      plotStyleBtn: ["标绘属性", "自有属性"],
      plotActive: 1,

      infos: [
        {
          fieldName: "名称",
          value: "",
        },
        {
          fieldName: "备注",
          value: "",
        },
      ],
    };
  },

  mounted() {
    let plotEntityObjId = this.$store.state.map3d.plotEntityObjId;
    this.setAttr(plotEntityObjId);
  },

  methods: {
    close() {
      this.$emit("close", "plotStyle");
    },
    setAttr(id) {
      /* 根据当前编辑的对象的样式类型 构建样式面板 */
      let nowPlotEntityObj = window.plotDrawTool.getEntityObjById(id) || {};
      let entityObj = nowPlotEntityObj.entityObj;
      if (!entityObj) return;
      this.plotStyleAttr = plotStyle[entityObj.attr.styleType];
      // 设置样式默认值
      let entityStyleValue = entityObj.getStyle();

      // 循环样式配置里面的属性 并绑定到标签
      for (let i in this.plotStyleAttr) {
        let attr = this.plotStyleAttr[i];

        if (attr.type == "checkbox") {
          // 当前实体的值
          attr.value =
            typeof entityStyleValue[i] == "boolean"
              ? entityStyleValue[i]
                ? "show"
                : "hide"
              : entityStyleValue[i];
          // 循环checkbox中options选中的属性
          let checkboxSelect = attr.options[attr.value];
          for (let key in checkboxSelect) {
            if (key != "name" && key != "value") {
              checkboxSelect[key].value = entityStyleValue[key];
            }
          }
        } else {
          attr.value =
            entityStyleValue[i] === undefined
              ? attr.value
              : entityStyleValue[i];
        }
      }

      // 设置当前对象的属性 供导出为geojson
      entityObj.setAttr(this.infos);
    },

    // 获取标签变化的值 修改实体样式
    toChange() {
      let val = JSON.parse(JSON.stringify(this.plotStyleAttr));
      let newStyle = this.transformStyleVal(val);
      this.$store.commit("setNowPlotStyleAttr", newStyle);
    },

    onChangePlotStyle(index) {
      this.$set(this, "plotActive", index);
    },

    transformStyleVal(style) {
      if (!style) return;
      let styleVal = {};
      for (let i in style) {
        styleVal[i] = style[i].value;
        if (style[i].type == "checkbox") {
          let option = style[i].options[style[i].value];
          if (!option) continue;
          styleVal[i] = option.value; // 当前 checkbox 的选项值  非其子选项中的option值
          for (let step in option) {
            if (step != "name" && step != "value") {
              styleVal[step] = option[step].value;
            }
          }
        }
      }
      return styleVal;
    },
  },
  watch: {
    "$store.state.map3d.plotEntityObjId": function (newid, oldid) {
      // 防止当前页面未关闭 却传入了不同的id
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
.plot-type-name {
  text-align: left;
}
.plot-type {
  margin-bottom: 10px;
  &:last-child {
    margin-bottom: 0;
  }
}
.polt-style-btn {
  position: absolute;
  left: -30px;
  top: 0;
  width: 30px;
  height: 220px;
  display: flex;
  flex-direction: column;
  span {
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
  margin: 10px auto;
  display: flex;
  align-items: center;
  label {
    width: 60px;
  }
}
</style>
