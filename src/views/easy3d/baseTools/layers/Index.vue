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
        @check="nodeCheck"
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

    let operateLayerTool = window.mapViewer.operateLayerTool;
    // 根据属性 看哪些打开
    operateLayerTool._layerObjs.forEach((element) => {
      if (element.open) this.expandedKeys.push(element.id);
    });
    this.operateLayers.forEach((element) => {
      if (element.open && element.type == "group") {
        this.expandedKeys.push(element.id);
      }
    });
    // 根据属性 看哪些选中
    let showslayer = operateLayerTool.getAllshow();
    showslayer.forEach((lyr) => {
      this.checkedKeys.push(lyr.id);
    });
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
    nodeCheck(data, state) {
      this.checkedKeys = state.checkedKeys;
      let allshowLayers = window.mapViewer.operateLayerTool.getAllshow();
      let allhideLayers = window.mapViewer.operateLayerTool.getAllhide();
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

    // 选中某个某个节点并打开对应图层
    checkOne(attr) {
      attr = attr || {};
      if (this.checkedKeys.indexOf(attr.id) != -1) return;
      this.checkedKeys.push(attr.id);
      window.mapViewer.operateLayerTool.setVisible(attr.id, true);
    },
    // 取消选中
    uncheckOne(attr) {
      attr = attr || {};
      if (this.checkedKeys.indexOf(attr.id) == -1) return;
      for (let i = this.checkedKeys.length - 1; i >= 0; i--) {
        if (this.checkedKeys[i] == attr.id) {
          this.checkedKeys.splice(i, 1);
          break;
        }
      }
      window.mapViewer.operateLayerTool.setVisible(attr.id, false);
    },
  },

  // 监听内部数据变化  保持和树统一
  watch: {
    "$store.state.map3d.checkLayerAttr": {
      handler(attr) {
        this.checkOne(attr);
      },
      deep: true,
    },
    "$store.state.map3d.uncheckLayerAttr": {
      handler(attr) {
        this.uncheckOne(attr);
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