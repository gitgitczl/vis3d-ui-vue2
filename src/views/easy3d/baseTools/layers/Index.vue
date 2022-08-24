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
              v-if="
                data.type !== '3dtiles' &&
                data.type !== 'group' &&
                !data.plotType
              "
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

    <!-- 树节点右击菜单 -->
    <ul class="tree-menu" v-show="isTreeMenu" :style="{ ...meunStyle }">
      <li>
        <span>上一层</span>
      </li>
      <li>
        <span>下一层</span>
      </li>
      <li>
        <span>置于顶层</span>
      </li>
      <li>
        <span>置于底层</span>
      </li>
    </ul>
  </Card>
</template>

<script>
/*  */
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
      isTreeMenu: false,
      meunStyle: {}, // 菜单定位样式
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
    this.$refs.layerTree.setCheckedKeys(this.checkedKeys);

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
      let visible;
      if (data.type == "group") {
        visible =
          data.children[0] &&
          state.checkedKeys.indexOf(data.children[0].id) != -1;
        for (let index = 0; index < data.children.length; index++) {
          let item = data.children[index];
          this.setNodeVisible(item, visible);
        }
      } else {
        visible = state.checkedKeys.indexOf(data.id) != -1;
        this.setNodeVisible(data, visible);
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
          if (data.plotType) {
            /*   window.mapViewer.operatePlotTool.zoomToById(data.id); */
          } else {
            let layerOpt = window.mapViewer.operateLayerTool.getLayerObjById(
              data.id
            );
            if (layerOpt && layerOpt.layerObj && layerOpt.layerObj.show)
              layerOpt.layerObj.zoomTo();
          }
        }

        this.clickTimes = 0;
      }, 300);
    },

    // 选中某个某个节点并打开对应图层
    checkOne(attr) {
      attr = attr || {};
      if (this.checkedKeys.indexOf(attr.id) != -1) return;
      this.checkedKeys.push(attr.id);
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
    },
    setNodeVisible(data, visible) {
      if (data.plotType) {
        window.mapViewer.operatePlotTool.setVisible(data.id, visible);
      } else {
        window.mapViewer.operateLayerTool.setVisible(data.id, visible);
      }
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

      lys.forEach((element) => {
        query(element);
      });

      return {
        layers,
        groups,
      };
    },

    nodeRightClick(event, data) {
      this.meunStyle = { top: `${event.pageY}px`, left: `${event.pageX}px` };
      this.$set(this, "isTreeMenu", true);

      /**
       * 点击其他地方关闭菜单
       */
      const self = this;
      document.onclick = function () {
        self.$set(self, "isTreeMenu", false);
      };
    },
  },

  // 保持和树统一
  watch: {
    "$store.state.map3d.operateLayers": {
      handler(operateLayers) {
        let data = this.getAllLayers(operateLayers);
        let { layers } = data || {};
        for (let i = 0; i < layers.length; i++) {
          let item = layers[i];
          if (item.show == true && this.checkedKeys.indexOf(item.id) == -1) {
            this.checkedKeys.push(item.id);
          }
        }
        this.$refs.layerTree.setCheckedKeys(this.checkedKeys);
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
.tree-menu {
  position: fixed;
  display: block;
  z-index: 20000;
  width: 130px;
  box-sizing: border-box;
  background-color: #363d4b;
  padding: 10px 0;
  border: 1px solid #363d4b;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  li {
    height: 30px;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 0 20px;
    color: #bdc2d0;
    cursor: pointer;
    border-bottom: 1px dashed #464d5c;
    &:last-child {
      border-bottom: none;
    }
    &:hover {
      background: #464d5c;
    }
    i {
      margin-right: 5px;
      font-size: 16px;
      font-weight: bold;
    }
  }
}
</style>
