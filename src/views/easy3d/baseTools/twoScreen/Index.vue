<template>
  <div style="height: 100%">
    <div id="mapContainer2"></div>
    <!-- 图层选择 -->
    <Card
      :width="400"
      :height="800"
      @close="close"
      :title="title"
      :position="position"
      titleIcon="icon-cengshu"
    >
      <div class="tree-body reset-tree basic-tree">
        <el-tree
          show-checkbox
          :props="defaultProps"
          :data="operateLayers"
          :expand-on-click-node="false"
          :default-expanded-keys="expandedKeys"
          :default-checked-keys="checkedKeys"
          node-key="id"
          @check="checkLayer"
        >
          <div class="custom-tree-node" slot-scope="{ data }">
            <span>{{ data.name }}</span>
            <div class="custom-tree-node-slider">
              <el-slider
                v-show="checkedKeys.indexOf(data.id) != -1"
                v-if="data.type !== '3dtiles' && data.type !== 'group'"
                show-input
                :show-input-controls="false"
                :show-tooltip="false"
                v-model="data.alpha"
                :max="1"
                :step="0.1"
                @change="setLayeralpha(data)"
                @input="setLayeralpha(data)"
              >
              </el-slider>
            </div>
          </div>
        </el-tree>
      </div>
    </Card>
    <!-- 底图选择 -->
  </div>
</template>
<script>
/* 分屏对比 */
import Card from "@/views/easy3d/components/card/Card.vue";
export default {
  name: "twoScreen",
  props: {
    title: "",
    position: {},
  },
  components: {
    Card,
  },
  data() {
    return {
      defaultProps: {
        isLeaf: (node, data) => {
          if (!node.children || !node.children.length) {
            return true;
          }
        },
      },
      operateLayers: [],
      expandedKeys: [], // 默认打开节点
      checkedKeys: [], // 默认选中节点
    };
  },

  mounted() {
    // 筛选出可对比的地图
    let oldViewerContainer = window.viewer.container;
    oldViewerContainer.style.width = "50%";
    oldViewerContainer.style.left = "50%";

    let newMapConfig = JSON.parse(JSON.stringify(window.mapConfig));
    let { operateLayers } = newMapConfig;
    operateLayers = JSON.parse(JSON.stringify(operateLayers));
    function dg(layers) {
      for (let i = layers.length - 1; i >= 0; i--) {
        let layer = layers[i];
        if (layer.children && layer.children.length > 1) {
          dg(layer.children);
        } else {
          if (!layer.compare) layers.splice(i, 1);
        }
      }
    }
    dg(operateLayers);
    newMapConfig.operateLayers = operateLayers;
    this.$set(this, "operateLayers", operateLayers);

    // 构建底图
    window.mapViewer2 = new this.easy3d.MapViewer(
      "mapContainer2",
      newMapConfig
    );
    window.viewer2 = window.mapViewer2._viewer;

    // 构建图层树
    let operateLayerTool = window.mapViewer2.operateLayerTool;
    operateLayerTool._layerObjs.forEach((element) => {
      if (element.open) this.expandedKeys.push(element.id);
    });
    operateLayers.forEach((element) => {
      if (element.open && element.type == "group") {
        this.expandedKeys.push(element.id);
      }
    });
    let showslayer = operateLayerTool.getAllshow();
    showslayer.forEach((lyr) => {
      this.checkedKeys.push(lyr.id);
    });

    // 绑定联动事件
    window.viewer.camera.changed.addEventListener(
      this.viewerChangeHandler,
      this
    );
    window.viewer.camera.percentageChanged = 0.01;

    window.viewer2.camera.changed.addEventListener(
      this.viewerChangeHandler2,
      this
    );
    window.viewer2.camera.percentageChanged = 0.01;

    this.viewerChangeHandler();
  },
  destroyed() {
    let oldViewerContainer = window.viewer.container;
    oldViewerContainer.style.width = "100%";
    oldViewerContainer.style.left = "0";
    if (window.mapViewer2) {
      window.mapViewer2.destroy();
      delete window.mapViewer2;
    }
  },

  methods: {
    viewerChangeHandler: function (e) {
      window.viewer2.camera.changed.removeEventListener(
        this.viewerChangeHandler2,
        this
      );
      this.updateView(window.viewer, window.viewer2);
      window.viewer2.camera.changed.addEventListener(
        this.viewerChangeHandler2,
        this
      );
    },
    viewerChangeHandler2: function (e) {
      window.viewer.camera.changed.removeEventListener(
        this.viewerChangeHandler,
        this
      );
      this.updateView(window.viewer2, window.viewer);
      window.viewer.camera.changed.addEventListener(
        this.viewerChangeHandler,
        this
      );
    },
    updateView: function (viewer, viewer2) {
      let cameraView = this.easy3d.cUtil.getCameraView(viewer);
      cameraView.duration = 0;
      this.easy3d.cUtil.setCameraView(cameraView, viewer2);
    },
    close() {
      this.$emit("close", "twoScreen");
    },
    setLayeralpha(data) {
      let layerOpt = window.mapViewer2.operateLayerTool.getLayerObjById(data.id);
      if (layerOpt && layerOpt.layerObj) layerOpt.layerObj.setAlpha(data.alpha);
    },
    checkLayer(data, state) {
      this.checkedKeys = state.checkedKeys;
      let allshowLayers = window.mapViewer2.operateLayerTool.getAllshow();
      let allhideLayers = window.mapViewer2.operateLayerTool.getAllhide();
      for (let i = 0; i < allshowLayers.length; i++) {
        let layer = allshowLayers[i].layer;
        if (state.checkedKeys.indexOf(layer.attr.id) == -1) {
          window.mapViewer2.operateLayerTool.setVisible(
            layer.attr.id,
            false
          );
        }
      }

      for (let j = 0; j < allhideLayers.length; j++) {
        let layer = allhideLayers[j].layer;
        if (state.checkedKeys.indexOf(layer.attr.id) != -1) {
          window.mapViewer2.operateLayerTool.setVisible(
            layer.attr.id,
            true
          );
        }
      }
    },
  },
};
</script>

<style scoped>
#mapContainer2 {
  width: 50%;
  height: 100%;
  top: 0;
  padding: 0;
  margin: 0;
  position: absolute;
}
</style>