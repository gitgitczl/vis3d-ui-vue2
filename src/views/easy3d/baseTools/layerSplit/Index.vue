<template>
  <Card :title="title" :position="position" :size="size" height="auto" titleIcon="icon-tushangcehui" @close="close">
    <label>可选图层</label>
    <el-select placeholder="请选择" v-model="nowSelectId" @change="changeLayer">
      <el-option v-for="(item, index) in layerList" :key="index" :label="item.name" :value="item.id"></el-option>
    </el-select>
  </Card>
</template>
<script>
import Card from "@/views/easy3d/components/card/Card.vue";
import LayerSplit from "@/lib/easy3d/layerSplit/layerSplit.js";
let layerSplit = null;
let nowLayerAttr = {};
export default {
  name: "layerSplit",
  components: {
    Card,
  },
  props: {
    size: {},
    position: {},
    title: "",
  },
  data() {
    return {
      nowSelectId: "",
      layerList: [],
    };
  },

  mounted() {
    // 默认选中第一个展示
    let operateLayers = this.$store.state.map3d.operateLayers;
    let res = this.getAllLayers(operateLayers);

    let allLayers = res.layers;
    for (let i = 0; i < allLayers.length; i++) {
      let item = allLayers[i];
      if (item.layerSplit == true) {
        this.layerList.push(item);
      }
    }

    this.nowSelectId = this.layerList[0].id;

    let lyrObj = window.mapViewer.operateLayerTool.getLayerObjById(
      this.nowSelectId
    ).layerObj;
    lyrObj.setVisible(true);

    nowSplitLayerObj = lyrObj;

    if (!layerSplit)
      layerSplit = new LayerSplit(window.viewer, {
        layer: lyrObj._layer,
      });
  },
  destroyed() {
    this.resetLastlyr();
    if (layerSplit) {
      layerSplit.destroy();
      layerSplit = null;
    }
  },
  methods: {
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
    changeLayer(attr) {
      let lyr = this.getLayerObjById(attr.id);
      nowSplitLayerObj = lyrObj;
      if (!lyr) return;
      if (layerSplit) layerSplit.setLayer(lyr);
      // 还原上一个选中的对象
      this.resetLastlyr();
      nowLayerAttr = {
        oldVisible: lyr._layer.show,
      };
      nowLayerAttr = JSON.parse(JSON.stringify(nowLayerAttr));
      nowLayerAttr.layerObj = lyr;
      nowLayerAttr.layer = lyr._layer;
      nowLayerAttr.newVisible = true;
      // 控制对应图层的显示隐藏
      this.$store.commit("setOperateLayerVisible", {
        attr: JSON.parse(JSON.stringify(attr)),
        visible: true,
      });
    },
    close() {
      this.$emit("close", "layerSplit");
    },
   
  },
};
</script>