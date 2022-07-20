<template>
  <div class="map-box" ref="mapbox">
    <div id="mapContainer"></div>
    <Head />
    <!-- 侧边工具栏 -->
    <Sidebar></Sidebar>
    <!-- 循环构建组件 -->
    <div v-for="(item, index) in componentsArr" :key="index">
      <component
        :is="item.module"
        v-if="item.show"
        v-show="item.domShow"
        :title="item.name"
        :position="item.position"
        :size="item.size"
        :attr="item.attr"
        @close="close"
      />
    </div>
  </div>
</template>
<script>
import Head from "@/views/Head.vue";
import Sidebar from "@/views/easy3d/sidebar.vue";


window.viewer = null;
window.mapViewer = null;
let zoomTool = null;
let overviewMap = null;

export default {
  name: "Map",
  components: {
    Head,
    Sidebar
  },
  data() {
    return {
      componentsArr: [],
      plotEntityObjId: null,
      nowStartRoamAttr: null // 当前漫游的数据
    };
  },

  created() {},

  mounted() {
    // 构建基础地图
    let that = this;
    let mapViewer = (window.mapViewer = new this.easy3d.MapViewer(
      "mapContainer",
      window.mapConfig
    ));
    window.viewer = mapViewer._viewer;
    this.$store.commit("setBaseLayers", window.mapConfig.baseLayers);
    this.$store.commit("setOperateLayers", window.mapConfig.operateLayers);

    // 读取配置文件中配置 并构建相应组件
    this.easy3d.workControl.init(window.workConfig, function (list) {
      that.componentsArr = list;
    });

    // 构建缩放按钮
    if (!zoomTool) {
      zoomTool = new this.easy3d.ZoomTool(window.viewer);
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
      this.$store.commit("setOperateTool", {
        toolName: name,
        openState: false,
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
          this.easy3d.workControl.closeToolByName(name);
        } else {
          this.easy3d.workControl.openToolByName(name);
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
        if (!overviewMap)
          overviewMap = new this.easy3d.OverviewMap(window.viewer);
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
        this.$store.commit(
          "setLayerCheckState",
          JSON.parse(JSON.stringify(data))
        );
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