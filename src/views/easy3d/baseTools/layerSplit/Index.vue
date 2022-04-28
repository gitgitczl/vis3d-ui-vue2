<template>
  <Card
    :title="title"
    :position="position"
    :size="size"
    height="auto"
    titleIcon="icon-tushangcehui"
    @close="close"
  >
    <label>可选图层</label>
    <el-select placeholder="请选择" v-model="nowSelectId" @change="changeLayer">
      <el-option
        v-for="(item, index) in layerList"
        :key="index"
        :label="item.name"
        :value="item.id"
      ></el-option>
    </el-select>
  </Card>
</template>
<script>
import Card from "@/views/easy3d/components/card/Card.vue";
import MapSplit from "@/lib/easy3d/layerSplit/layerSplit.js";
let layerSplit = null;
let nowLyr = null;
export default {
  name: "LayerSplit",
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
    // 构建卷帘对比单选框
   
    let blys = window.mapViewer.baseLayerTool.getLayerObjByField(
      "layerSplit",
      true
    );
    let olys = window.mapViewer.operateLayerTool.getLayerObjByField(
      "layerSplit",
      true
    );
    let allSplitLayers = blys.concat(olys);

    allSplitLayers.forEach((layer) => {
      this.layerList.push({
        id: layer.id,
        name: layer.attr.name,
      });
    });

    this.nowSelectId = this.layerList[0].id;
    let lyr = this.getLayerObjById(this.nowSelectId);
    lyr.setVisible(true);
    nowLyr = lyr;
    if (!layerSplit) {
      layerSplit = new MapSplit(window.viewer, {
        layer: lyr._layer,
      });
    }
  },
  destroyed() {
    if (layerSplit) {
      layerSplit.destroy();
      layerSplit = null;
    }
  },
  methods: {
    getLayerObjById(id) {
      if (!id) return null;
      let layer = null;
      layer = window.mapViewer.baseLayerTool.getLayerObjById(id).layer;
      if(!layer) layer = window.mapViewer.operateLayerTool.getLayerObjById(id).layer;
      return layer;
    },

    changeLayer() {
      let lyr = this.getLayerObjById(this.nowSelectId);
      if (!lyr) return;
      lyr.setVisible(true);
      nowLyr = lyr;
      if (layerSplit) layerSplit.setLayer(lyr);
    },
    close() {
      this.$emit("close", "layerSplit");
    },
  },
};
</script>