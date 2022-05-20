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
        @node-contextmenu="nodeRightClick"
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
  name: "layers",

  components: {
    Card,
  },

  props: {
    title: "",
    position: {},
    size: {},
    mapConfig: {},
  },

  data() {
    return {
      operateLayers: this.$store.state.map3d.operateLayers,
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
    let data = this.getAllLayers(this.operateLayers);
    let { layers, groups } = data || {};
    for (let i = 0; i < layers.length; i++) {
      let item = layers[i];
      if (item.show == true) {
        this.checkedKeys.push(item.id);
      }
    }
    for (let ind = 0; ind < groups.length; ind++) {
      let gp = groups[ind];
      if (gp.open && gp.type == "group") {
        this.expandedKeys.push(gp.id);
      }
    }
  },

  destroyed() {},
  methods: {
    close() {
      this.$emit("close", "layers");
    },
    setLayeralpha(data) {
      let layerOpt = window.mapViewer.operateLayerTool.getLayerObjById(data.id);
      if (layerOpt) layerOpt.layerObj.setAlpha(data.alpha);
    },
    nodeCheck(data, state) {
      this.checkedKeys = state.checkedKeys;
      let allshowLayers = window.mapViewer.operateLayerTool.getAllshow();
      let allhideLayers = window.mapViewer.operateLayerTool.getAllhide();
      let len = allshowLayers.length;
      for (let i = 0; i < len; i++) {
        let layer = allshowLayers[i];
        if (layer == undefined) continue;
        if (state.checkedKeys.indexOf(layer.attr.id) == -1) {
          window.mapViewer.operateLayerTool.setVisible(layer.attr.id, false);
        }
      }

      let len2 = allhideLayers.length;
      for (let j = 0; j < len2; j++) {
        let layer2 = allhideLayers[j];
        if (layer2 == undefined) continue;
        if (state.checkedKeys.indexOf(layer2.attr.id) != -1) {
          window.mapViewer.operateLayerTool.setVisible(layer2.attr.id, true);
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
          if (layerOpt && layerOpt.layerObj && layerOpt.layerObj.show)
            layerOpt.layerObj.zoomTo();
        }

        this.clickTimes = 0;
      }, 300);
    },

    // 选中某个某个节点并打开对应图层
    checkOne(attr) {
      attr = attr || {};
      if (this.checkedKeys.indexOf(attr.id) != -1) return;
      this.checkedKeys.push(attr.id);
      /* window.mapViewer.operateLayerTool.setVisible(attr.id, true); */ // baseTools/index.vue中已监听打开
      this.$refs.layerTree.setCheckedKeys(this.checkedKeys);
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
      this.$refs.layerTree.setCheckedKeys(this.checkedKeys);
      /* window.mapViewer.operateLayerTool.setVisible(attr.id, false); */ // baseTools/index.vue中已监听打开
    },

    // childeren转为线性
    getAllLayers(lys) {
      lys = lys || {};
      lys = JSON.parse(JSON.stringify(lys));
      let layers = [];
      let groups = [];
      function query(attr) {
        if (!attr.children) {
          layers.push(attr);
        } else {
          let newAttr = JSON.parse(JSON.stringify(attr));
          delete newAttr.children;
          groups.push(newAttr);

          attr.children.forEach(function (item) {
            query(item);
          });
        }
      }

      lys.forEach(element => {
         query(element);
      });
     
      return {
        layers,
        groups,
      };
    },

    nodeRightClick(a,b,c,d){
      
    }
   
  },

  // 保持和树统一
  watch: {
    "$store.state.map3d.operateLayer": {
      handler(data) {
        debugger
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