<template>
  <Card
    :size="size"
    :title="title"
    :iconfont="iconfont"
    @close="close"
    :position="position"
  >
    <div class="analysis-tomain" @click="tomain" v-show="analysisName !== ''">
      <span>{{ analysisName }}</span>
    </div>
    <ul class="analysis-box basic-tool" v-show="analysisName == ''">
      <li
        v-for="(item, index) in btnlist"
        :key="index"
        :class="[changeAnalysisType === item.type ? 'tool-active' : '']"
        @click="onChangeAnalysis(item)"
      >
        <i :class="['iconfont', item.icon]"></i>
        <label>{{ item.name }}</label>
      </li>
    </ul>

    <div>
      <!-- 日照分析 -->
      <Sunshine v-show="changeAnalysisType === 'sunshine'" />
      <!-- 可视域分析 -->
      <VisualField v-show="changeAnalysisType === 'visualField'" />
      <!-- 方量分析 -->
      <Volume v-show="changeAnalysisType === 'volume'" />
      <!-- 淹没分析 -->
      <Flood v-show="changeAnalysisType === 'flood'" />
      <!-- 地形开挖 -->
      <TerrainExcavate v-show="changeAnalysisType === 'terrainExcavate'" />
      <!-- 地表透明 -->
      <GlobeSurface v-show="changeAnalysisType === 'globeSurface'" />
      <!-- 坡度坡向 -->
      <Slope v-show="changeAnalysisType === 'slope'" />
      <!-- 模型剖切 -->
      <ModelClip v-show="changeAnalysisType === 'modelClip'" />
      <!-- 模型压平 -->
      <ModelFlat v-show="changeAnalysisType === 'modelFlat'" />
      <!-- 限高分析 -->
      <LimitHeight v-show="changeAnalysisType === 'LimitHeight'" />
      <!-- 通视分析 -->
      <Insight v-show="changeAnalysisType === 'insight'" />
      <!-- 等高线 -->
      <Contour v-show="changeAnalysisType === 'contour'" />
    </div>
  </Card>
</template>

<script>

import Contour from "@/views/easy3d/baseTools/analysis/contour.vue";
import Flood from "@/views/easy3d/baseTools/analysis/flood.vue";
import GlobeSurface from "@/views/easy3d/baseTools/analysis/globeSurface.vue";
import Insight from "@/views/easy3d/baseTools/analysis/insight.vue";
import ModelClip from "@/views/easy3d/baseTools/analysis/modelClip.vue";
import ModelFlat from "@/views/easy3d/baseTools/analysis/modelFlat.vue";
import Slope from "@/views/easy3d/baseTools/analysis/slope.vue";
import Sunshine from "@/views/easy3d/baseTools/analysis/sunshine.vue";
import TerrainExcavate from "@/views/easy3d/baseTools/analysis/terrainExcavate.vue";
import VisualField from "@/views/easy3d/baseTools/analysis/visualField.vue";
import Volume from "@/views/easy3d/baseTools/analysis/volume.vue";
import LimitHeight from "@/views/easy3d/baseTools/analysis/limitHeight.vue";
import ModelVolume from "@/views/easy3d/baseTools/analysis/modelVolume.vue";

export default {
  name: "analysis",
  components: {
    
    Contour,
    Flood,
    GlobeSurface,
    Insight,
    ModelClip,
    ModelFlat,
    Slope,
    Sunshine,
    TerrainExcavate,
    VisualField,
    Volume,
    LimitHeight,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
    iconfont: {
      type: String,
      default: "icon-fenxikongjian",
    },
    position: {},
    size: {},
  },
  data() {
    return {
      analysisName: "",
      btnlist: [
        {
          name: "日照分析",
          icon: "icon-rizhaofenxi",
          type: "sunshine",
        },
        {
          name: "可视域",
          icon: "icon-keshiyu",
          type: "visualField",
        },
        {
          name: "方量分析",
          icon: "icon-fangliangfenxi",
          type: "volume",
        },
        {
          name: "淹没分析",
          icon: "icon-yanmeifenxi",
          type: "flood",
        },
        {
          name: "地形开挖",
          icon: "icon-dixingkaiwa",
          type: "terrainExcavate",
        },
        {
          name: "地表透明",
          icon: "icon-dibiaotouming",
          type: "globeSurface",
        },
        {
          name: "坡度坡向",
          icon: "icon-podupoxiang",
          type: "slope",
        },
        {
          name: "模型剖切",
          icon: "icon-moxingpouqie",
          type: "modelClip",
        },
        {
          name: "模型压平",
          icon: "icon-moxingyaping",
          type: "modelFlat",
        },
        {
          name: "限高分析",
          icon: "icon-xiangaofenxi",
          type: "LimitHeight",
        },
        {
          name: "通视分析",
          icon: "icon-tongshifenxi",
          type: "insight",
        },
        {
          name: "等高线分析",
          icon: "icon-denggaoxianfenxi",
          type: "contour",
        },
      ],
      changeAnalysisType: "",
    };
  },

  mounted() {},

  destroyed() {},
  methods: {
    close() {
      this.$emit("close", "analysis");
    },

    tomain() {
      this.analysisName = "";
      this.$set(this, "changeAnalysisType", "");
    },

    /**
     * 选择空间分析
     * @param {Object} data
     */
    onChangeAnalysis(data) {
      this.analysisName = data.name;
      this.$set(this, "changeAnalysisType", data.type);
    },
  },
};
</script>

<style lang="less">
.analysis-box {
  display: flex;
  flex-wrap: wrap;
  li {
    width: 90px;
    height: 64px;
    box-sizing: border-box;
    padding: 5px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-right: 12px;
    margin-bottom: 12px;
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
.slope-toolip {
  font-size: 12px;
  margin: 15px 0;
  li {
    display: flex;
    flex-wrap: wrap;
    color: #6d748a;
  }
}
.analysis-btn {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
  span {
    height: 32px;
    padding: 0 15px;
    box-sizing: border-box;
    border: 1px solid transparent;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-right: 7px;
    &:last-child {
      margin-right: 0;
    }
  }
}
.analysis-top-btn {
  justify-content: flex-start;
}
.analysis-tomain {
  padding: 6px 4px;
  border-bottom: 1px gray dashed;
  cursor: pointer;
}
</style>
