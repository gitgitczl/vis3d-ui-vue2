<template>
  <Card
    :title="title"
    :size="size"
    titleIcon="icon-tushangliangsuan"
    @close="close"
  >
    <ul class="measure-box basic-tool">
      <li
        v-for="(item, index) in measureList"
        :key="index"
        :class="[index === isMeasureActive ? 'tool-active' : '']"
        @click="onChangeMeasure(item, index)"
      >
        <i :class="['iconfont', item.icon]"></i>
        <label>{{ item.name }}</label>
      </li>
    </ul>

    <div v-show="isShowUnit" class="measure-unit-box basic-select">
      <label>单位</label>
      <el-select v-model="unitValue" placeholder="请选择" @change="changeUint">
        <el-option
          v-for="(item, index) in unitList"
          :key="index"
          :label="item"
          :value="item"
        >
        </el-option>
      </el-select>
    </div>

    <p class="measure-clear-btn basic-measure-clear" @click="clear">
      清空测量数据
    </p>

    <div v-show="isShowRes" class="measure-result">
      <label>处理结果：</label>
      <span>{{ res }}</span>
    </div>
  </Card>
</template>
    

<script>
import Card from "@/views/easy3d/components/card/Card.vue";
let measureTool = null;
export default {
  name: "Measure",
  components: {
    Card,
  },
  props: {
    title: "",
    position: {},
    offset: {},
    size: {},
  },
  data() {
    return {
      measureList: [
        {
          name: "空间距离",
          type: "1",
          unitType: "dis",
          icon: "icon-kongjianjuli",
        },
        {
          name: "贴地距离",
          type: "2",
          unitType: "dis",
          icon: "icon-tiedijuli",
        },
        /* {
          name: "水平测算",
          unitType: "dis",
          icon: "icon-shuipingcesuan",
        }, */
        {
          name: "面积",
          type: "3",
          unitType: "area",
          icon: "icon-tiedixingzhuang",
        },
        {
          name: "角度",
          type: "7",
          unitType: "",
          icon: "icon-jiaodu",
        },
        {
          name: "高度差",
          type: "4",
          unitType: "dis",
          icon: "icon-gaoducha",
        },
        {
          name: "三角测量",
          type: "5",
          unitType: "dis",
          icon: "icon-sanjiaoceliang",
        },
        {
          name: "坐标测量",
          type: "6",
          unitType: "",
          icon: "icon-zuobiaoceliang",
        },
      ],
      isMeasureActive: -1,
      isShowUnit: false,
      isShowRes: false,
      disUnit: ["米", "千米"],
      areaUnit: ["平方米", "平方千米"],
      unitList: [],
      unitValue: "米",
      res: 0,
    };
  },
  mounted() {
    let that = this;
    if (!measureTool) {
      measureTool = new this.easy3d.MeasureTool(window.viewer);
      measureTool.on("measureEnd", function (ms) {
        that.isShowRes = ms.unitType ? true : false;
      });
    }
  },
  destroyed() {
    if (measureTool) {
      measureTool.destroy();
      measureTool = null;
    }
  },
  methods: {
    close() {
      this.$emit("close", "measure");
    },

    /**
     * 选择图上量算
     * @param {Object} data 量算信息
     * @param {Number} index 索引
     */
    onChangeMeasure(data, index) {
      if (!measureTool) return;
      if (
        measureTool.nowMeasureObj &&
        measureTool.nowMeasureObj.status != "endCreate"
      ) {
        this.$message({
          message: "请结束上一次量算！",
          type: "warning",
        });
        return;
      }

      this.$set(this, "isMeasureActive", index);
      // 设置单位
      this.$set(this, "isShowUnit", data.unitType !== "" ? true : false);
      if (data.unitType) {
        this.$set(
          this,
          "unitList",
          data.unitType === "dis" ? this.disUnit : this.areaUnit
        );
        this.$set(
          this,
          "unitValue",
          data.unitType === "dis" ? this.disUnit[0] : this.areaUnit[0]
        );
      }
      // 开始量算
      measureTool.start({
        type: data.type,
        unit: this.unitValue,
      });
    },

    // 修改单位
    changeUint(res) {
      this.unitValue = res;
      if (!measureTool) return;
      measureTool.setUnit(res);
    },

    clear() {
      if (!measureTool) return;
      measureTool.clear();
      this.isMeasureActive = -1;
    },
  },
};
</script>

<style lang="less">
.measure-box {
  display: flex;
  flex-wrap: wrap;
  li {
    width: 90px;
    height: 64px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 16px 0 0;
    cursor: pointer;
    &:nth-child(3n) {
      margin-right: 0;
    }
    i {
      font-size: 26px;
      margin-bottom: 10px;
    }
    label {
      cursor: pointer;
    }
  }
}
.measure-unit-box {
  margin-top: 10px;
  label {
    margin-right: 15px;
  }
}
.measure-clear-btn {
  width: 100%;
  height: 32px;
  border-radius: 2px;
  cursor: pointer;
  margin-top: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: bold;
}
.measure-result {
  display: flex;
  align-items: center;
  margin-top: 20px;
  label {
    color: #6d748a;
  }
  span {
    font-weight: bold;
    color: #1c9ed5;
  }
}
</style>