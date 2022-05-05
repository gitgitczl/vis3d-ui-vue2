<template>
  <div class="map-box" ref="mapbox">
    <div id="mapContainer"></div>
    <!-- 侧边工具栏 -->
    <Sidebar></Sidebar>
    <!-- 帮助说明 -->
    <Help
      v-if="baseTools['help'].show"
      v-show="
        baseTools['help'].domShow == undefined
          ? true
          : baseTools['help'].domShow
      "
      :title="baseTools['help'].name"
      :position="baseTools['help'].position"
      :size="baseTools['help'].size"
      @close="close"
    />
    <!-- 图上标绘 -->
    <Plot
      @plotEntityObjId="setPlotEntityObjId"
      v-if="baseTools['plot'].show"
      v-show="
        baseTools['plot'].domShow == undefined
          ? true
          : baseTools['plot'].domShow
      "
      :title="baseTools['plot'].name"
      :position="baseTools['plot'].position"
      :size="baseTools['plot'].size"
      @close="close"
    />
    <!-- 图上标会样式设置 -->
    <PlotStyle
      :plotEntityObjId="plotEntityObjId"
      v-if="baseTools['plotStyle'].show"
      :title="baseTools['plotStyle'].name"
      :position="baseTools['plotStyle'].position"
      :size="baseTools['plotStyle'].size"
      @close="close"
    />

    <!-- 图上量算 -->
    <Measure
      v-if="baseTools['measure'].show"
      :title="baseTools['measure'].name"
      :position="baseTools['measure'].position"
      @close="close"
      :size="baseTools['measure'].size"
    />
    <!-- 空间分析 -->
    <Analysis
      v-if="baseTools['analysis'].show"
      v-show="
        baseTools['analysis'].domShow == undefined
          ? true
          : baseTools['analysis'].domShow
      "
      :title="baseTools['analysis'].name"
      @close="close"
    />
    <!-- 图层 -->
    <Layers
      v-if="baseTools['layers'].show"
      v-show="
        baseTools['layers'].domShow == undefined
          ? true
          : baseTools['layers'].domShow
      "
      :title="baseTools['layers'].name"
      :position="baseTools['layers'].position"
      :size="baseTools['layers'].size"
      :mapConfig="mapConfig"
      @close="close"
    />
    <!-- 底图 -->
    <BaseMap
      v-if="baseTools['baseMap'].show"
      v-show="
        baseTools['baseMap'].domShow == undefined
          ? true
          : baseTools['baseMap'].domShow
      "
      :title="baseTools['baseMap'].name"
      :position="baseTools['baseMap'].position"
      :size="baseTools['baseMap'].size"
      @close="close"
    />
    <!-- 坐标定位 -->
    <Coordinate
      v-if="baseTools['coordinate'].show"
      v-show="
        baseTools['coordinate'].domShow == undefined
          ? true
          : baseTools['coordinate'].domShow
      "
      :title="baseTools['coordinate'].name"
      :position="baseTools['coordinate'].position"
      @close="close"
    />
    <!-- 分屏对比 -->
    <TwoScreen
      v-if="baseTools['twoScreen'].show"
      v-show="
        baseTools['twoScreen'].domShow == undefined
          ? true
          : baseTools['twoScreen'].domShow
      "
      :title="baseTools['twoScreen'].name"
      :position="baseTools['twoScreen'].position"
      @close="close"
    ></TwoScreen>
    <!-- 地区导航 -->
    <Region
      v-if="baseTools['region'].show"
      v-show="
        baseTools['region'].domShow == undefined
          ? true
          : baseTools['region'].domShow
      "
      :title="baseTools['region'].name"
      :position="baseTools['region'].position"
      @close="close"
    ></Region>
    <!-- 视角书签 -->
    <ViewBook
      v-if="baseTools['viewBook'].show"
      v-show="
        baseTools['viewBook'].domShow == undefined
          ? true
          : baseTools['viewBook'].domShow
      "
      :title="baseTools['viewBook'].name"
      :position="baseTools['viewBook'].position"
      @close="close"
    ></ViewBook>
    <!-- 路径规划 -->
    <PathPlan
      v-if="baseTools['pathPlan'].show"
      v-show="
        baseTools['pathPlan'].domShow == undefined
          ? true
          : baseTools['pathPlan'].domShow
      "
      :title="baseTools['pathPlan'].name"
      :position="baseTools['pathPlan'].position"
      @close="close"
    ></PathPlan>
    <Roam
      v-if="baseTools['roam'].show"
      v-show="
        baseTools['roam'].domShow == undefined
          ? true
          : baseTools['roam'].domShow
      "
      :title="baseTools['roam'].name"
      :position="baseTools['roam'].position"
      @nowStartRoamAttr="setNowStartRoamAttr"
      @close="close"
    ></Roam>

    <RoamStyle
      v-if="baseTools['roamStyle'].show"
      v-show="
        baseTools['roamStyle'].domShow == undefined
          ? true
          : baseTools['roamStyle'].domShow
      "
      :title="baseTools['roamStyle'].name"
      :position="baseTools['roamStyle'].position"
      :size="baseTools['roamStyle'].size"
      :nowStartRoamAttr="nowStartRoamAttr"
      @close="close"
    ></RoamStyle>

    <LayerSplit
      v-if="baseTools['layerSplit'].show"
      v-show="
        baseTools['layerSplit'].domShow == undefined
          ? true
          : baseTools['layerSplit'].domShow
      "
      :title="baseTools['layerSplit'].name"
      :position="baseTools['layerSplit'].position"
      :size="baseTools['layerSplit'].size"
      @close="close"
    ></LayerSplit>

    <Monomer
      v-if="baseTools['monomer'].show"
      v-show="
        baseTools['monomer'].domShow == undefined
          ? true
          : baseTools['monomer'].domShow
      "
      :title="baseTools['monomer'].name"
      :position="baseTools['monomer'].position"
      :size="baseTools['monomer'].size"
      @close="close"
    ></Monomer>
  </div>
</template>
<script>
import Help from "@/views/easy3d/baseTools/help/Index.vue";
import Sidebar from "@/views/easy3d/baseTools/sidebar/Index.vue";
import Plot from "@/views/easy3d/baseTools/plot/Index.vue";
import PlotStyle from "@/views/easy3d/baseTools/plotStyle/Index.vue";
import Layers from "@/views/easy3d/baseTools/layers/Index.vue";
import Measure from "@/views/easy3d/baseTools/measure/Index.vue";
import Analysis from "@/views/easy3d/baseTools/analysis/Index.vue";
import BaseMap from "@/views/easy3d/baseTools/baseMap/Index.vue";
import Coordinate from "@/views/easy3d/baseTools/coordinate/Index.vue";
import ZoomTool from "@/lib/easy3d/zoomTool/zoomTool.js";
import OverviewMap from "@/lib/easy3d/overviewMap/overviewMap.js";

import TwoScreen from "@/views/easy3d/baseTools/twoScreen/Index.vue";
import Region from "@/views/easy3d/baseTools/region/Index.vue";
import ViewBook from "@/views/easy3d/baseTools/viewBook/Index.vue";
import PathPlan from "@/views/easy3d/baseTools/pathPlan/Index.vue";
import Roam from "@/views/easy3d/baseTools/roam/Index.vue";
import RoamStyle from "@/views/easy3d/baseTools/roamStyle/Index.vue";
import LayerSplit from "@/views/easy3d/baseTools/layerSplit/Index.vue";
import Monomer from "@/views/easy3d/baseTools/monomer/Index.vue";

import html2canvas from "html2canvas";
import printJS from "print-js";

window.viewer = null;
window.mapViewer = null;
let zoomTool = null;
let overviewMap = null;

export default {
  name: "Map",
  components: {
    Help,
    Plot,
    Measure,
    Analysis,
    Layers,
    BaseMap,
    Coordinate,
    TwoScreen,
    Region,
    ViewBook,
    PathPlan,
    PlotStyle,
    Roam,
    RoamStyle,
    LayerSplit,
    Monomer,
    Sidebar,
  },
  data() {
    return {
      baseTools: {
        help: {},
        plot: {},
        plotStyle: {},
        measure: {},
        analysis: {},
        layers: {},
        baseMap: {},
        coordinate: {},
        twoScreen: {},
        region: {},
        viewBook: {},
        pathPlan: {},
        roam: {},
        roamStyle: {},
        layerSplit: {},
        monomer: {},
        mapConfig: {}, // 监听配置文件的mapConfig
      },
      plotEntityObjId: null,
      nowStartRoamAttr: null, // 当前漫游的数据
      toolsState: {
        // 记录模块状态 true 打开 / false 关闭
      },
    };
  },

  created() {},

  mounted() {
    // 构建基础地图
    this.mapConfig = window.mapConfig;
    let mapViewer = (window.mapViewer = new this.easy3d.MapViewer(
      "mapContainer",
      this.mapConfig
    ));
    window.viewer = mapViewer._viewer;

    let toolsconf = {};
    // 读取配置文件中配置
    let { tools } = window.workConfig;
    for (let i = 0; i < tools.length; i++) {
      let tool = tools[i];
      tool.domShow = true;
      toolsconf[tool.workName] = tool;
    }
    this.baseTools = toolsconf;

    if (!zoomTool) {
      zoomTool = new ZoomTool(window.viewer);
    }
  },
  destroyed() {
    if (window.viewer) {
      window.viewer.destroy();
      window.viewer = null;
    }
  },
  methods: {
    initWork() {},

    // 工具关闭
    close(name) {
      if (!this.baseTools[name]) return;
      this.$store.commit("setOperateTool", {
        toolName: name,
        openState: false,
      });
    },
    // 关闭单个模块 当前模块  其它模块
    closeToolByName(name, dutoName) {
      let toolAttr = this.baseTools[name];
      // 是否能被其他模块释放 默认为true  与closeDisableExcept互斥
      if (dutoName) {
        toolAttr.disableByOthers =
          toolAttr.disableByOthers == undefined
            ? true
            : toolAttr.disableByOthers;
        if (!toolAttr.disableByOthers) return;
      }

      // 表示不能通过dutoName模块关闭当前模块 与disableByOthers互斥
      if (
        toolAttr.closeDisableExcept &&
        toolAttr.closeDisableExcept.indexOf(dutoName) != -1
      )
        return;

      // 释放时 是否销毁自己
      if (
        toolAttr.closeDisableSelf == undefined ||
        toolAttr.closeDisableSelf == true
      ) {
        this.baseTools[name].show = false;
        this.baseTools[name].domShow = false;
      } else {
        this.baseTools[name].domShow = false;
      }

      this.toolsState[name] = false;
    },
    // 打开单个模块
    openToolByName(name) {
      if (this.toolsState[name] && this.toolsState[name] === true) return; // 防止二次打开
      let toolAttr = this.baseTools[name];
      // 打开某个模块
      this.baseTools[name].show = true;
      this.baseTools[name].domShow = true;
      // 打开的时候 关闭其他模块
      if (toolAttr.openDisableAnothers) {
        for (let key in this.baseTools) {
          if (key != name) {
            this.closeToolByName(key, name);
          }
        }
      }
      this.toolsState[name] = true;
    },

    // 获取当前标绘的ent对象 打开样式面板
    setPlotEntityObjId(id) {
      if (id) {
        this.plotEntityObjId = id;
        this.openToolByName("plotStyle");
      } else {
        this.closeToolByName("plotStyle");
      }
    },

    setNowStartRoamAttr(attr) {
      if (Object.keys(attr).length != 0) {
        this.nowStartRoamAttr = attr;
        this.openToolByName("roamStyle");
      } else {
        this.openToolByName("roamStyle");
      }
    },

    // 地图打印
    printMap() {
      window.viewer.scene.render();
      html2canvas(this.$refs.mapbox, {
        backgroundColor: null,
        useCORS: true,
        windowHeight: document.body.scrollHeight,
      }).then((canvas) => {
        const url = canvas.toDataURL();
        this.img = url;
        printJS({
          printable: url,
          type: "image",
          documentTitle: "地图输出",
        });
      });
    },

    // =================== 监听操作图层的开启关闭 =======================
    setLayerVisible(attr, visible) {
      attr = attr || {};
      window.mapViewer.operateLayerTool.setVisible(attr.id, visible);
    },
  },
  watch: {
    // 监听工具面板的开启
    "$store.state.map3d.operateTool": {
      handler(data) {
        let name = data.toolName;
        if (!name) return;
        if (!data.openState) {
          // 关闭某个模块
          this.closeToolByName(name);
        } else {
          this.openToolByName(name);
        }
      },
      deep: true,
    },

    // 监听底图坐标提示栏的开启关闭
    "$store.state.map3d.openBottomLnglatTool": function (isOpen) {
      if (isOpen) {
        if (window.mapViewer) window.mapViewer.openBottomLnglatTool();
      } else {
        if (window.mapViewer) window.mapViewer.closeBottomLnglatTool();
      }
    },
    // 监听是否点击放大按钮
    "$store.state.map3d.isZoomIn": function (res) {
      if (res && zoomTool) {
        zoomTool.forward();
        this.$store.commit("setIsZoomIn", false);
      }
    },
    // 监听是否点击缩小按钮
    "$store.state.map3d.isZoomOut": function (res) {
      if (res && zoomTool) {
        zoomTool.backward();
        this.$store.commit("setIsZoomOut", false);
      }
    },
    // 监听 是否打开鹰眼图
    "$store.state.map3d.isOpenOverviewMap": function (res) {
      if (res) {
        if (!overviewMap) overviewMap = new OverviewMap(window.viewer);
      } else {
        if (overviewMap) {
          overviewMap.destroy();
          overviewMap = null;
        }
      }
    },
    // 监听 是否打印
    "$store.state.map3d.isPrintMap": function (res) {
      if (res) {
        this.printMap();
        this.$store.commit("setIsPrintMap", false);
      }
    },

    /**
     * 监听当前operateLayer的显示隐藏
     */
    "$store.state.map3d.operateLayerVisible": {
      handler(data) {
        let { attr, visible } = data || {};
        if (!attr.id) return;
        this.setLayerVisible(attr, visible);
        this.$store.commit("setLayerCheckState", JSON.parse(JSON.stringify(data)));
      },
      deep: true,
    },
  },
};
</script>
<style scoped>
.map-box {
  width: 100%;
  height: 100%;
}
#mapContainer {
  width: 100%;
  height: 100%;
  top: 0;
  padding: 0;
  margin: 0;
  position: absolute;
}
</style>