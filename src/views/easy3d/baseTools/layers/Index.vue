<template>
  <Card @close="close" :title="title" :size="size" titleIcon="icon-cengshu">
    <div class="tree-body reset-tree basic-tree" onselectstart="return false">
      <el-tree
        ref="layerTree"
        show-checkbox
        :props="defaultProps"
        :data="operateLayers"
        :expand-on-click-node="false"
        :default-expanded-keys="expandedKeys"
        :default-checked-keys="checkedKeys"
        node-key="id"
        @node-click="nodeClick"
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
</template>

<script>
import Card from "@/views/easy3d/components/card/Card.vue";
export default {
  name: "Layers",
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
      operateLayers: [],
      expandedKeys: [], // 默认打开节点
      checkedKeys: [], // 默认选中节点
      defaultProps: {
        isLeaf: (node, data) => {
          if (!node.children || !node.children.length) {
            return true;
          }
        },
      },
      clickTimes: 0, // 当前点击的次数
    };
  },

  mounted() {
    let mapConfig = window.viewer.mapConfig || {};
    this.$set(this, "operateLayers", mapConfig.operateLayers);
  },

  destroyed() {},
  methods: {
    close() {
      this.$emit("close", "layers");
    },
    setLayeralpha(data) {
      let layerOpt = window.mapViewer.operateLayerTool.getLayerObjById(data.id);
      if (layerOpt) layerOpt.layer.setAlpha(data.alpha);
    },
    checkLayer(data, state) {
      this.checkedKeys = state.checkedKeys;
      let allshowLayers = window.mapViewer.operateLayerTool.getAllshowLayers();
      let allhideLayers = window.mapViewer.operateLayerTool.getAllhideLayers();
      for (let i = 0; i < allshowLayers.length; i++) {
        let layer = allshowLayers[i].layer;
        if (layer && state.checkedKeys.indexOf(layer.attr.id) == -1) {
          window.mapViewer.operateLayerTool.setVisible(layer.attr.id, false);
        }
      }

      for (let j = 0; j < allhideLayers.length; j++) {
        let layer = allhideLayers[j].layer;
        if (layer && state.checkedKeys.indexOf(layer.attr.id) != -1) {
          window.mapViewer.operateLayerTool.setVisible(layer.attr.id, true);
        }
      }
    },
    nodeClick(data) {
      this.clickTimes++;
      setTimeout(() => {
        if (this.clickTimes == 1) {
          //  单击节点
        }
        if (this.clickTimes == 2) {
          // 双击节点
          if (data.type == "group") return;
          let layerOpt = window.mapViewer.operateLayerTool.getLayerObjById(
            data.id
          );
          if (layerOpt && layerOpt.layer && layerOpt.layer.show)
            layerOpt.layer.zoomTo();
        }

        this.clickTimes = 0;
      }, 300);
    },
  },

  // 监听内部数据变化  保持和树统一
  watch: {
    operateLayers: {
      handler(data) {
        let operateLayerTool = window.mapViewer.operateLayerTool;
        // 根据属性 看哪些打开
        operateLayerTool._layerObjs.forEach((element) => {
          if (element.open) this.expandedKeys.push(element.id);
        });
        data.forEach((element) => {
          if (element.open && element.type == "group") {
            this.expandedKeys.push(element.id);
          }
        });
        // 根据属性 看哪些选中
        let showslayer = operateLayerTool.getAllshowLayers();
        showslayer.forEach((lyr) => {
          this.checkedKeys.push(lyr.id);
        });
      },
      deep: true,
    },
  },
};
</script>

<style lang="less">
.tree-body {
  height: 736px;
  overflow-x: hidden;
  overflow-y: auto;
  .custom-tree-node {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .custom-tree-node-slider {
    width: 150px;
  }
}
</style>