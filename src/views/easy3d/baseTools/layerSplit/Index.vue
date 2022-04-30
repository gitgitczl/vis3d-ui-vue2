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
let nowLayerAttr = {};
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
    debugger
    let allSplitLayers = [];
    let blys = window.mapViewer.baseLayerTool.getLayerObjByField(
      "layerSplit",
      true
    );
    let olys = window.mapViewer.operateLayerTool.getLayerObjByField(
      "layerSplit",
      true
    );
    allSplitLayers = blys.concat(olys);

    allSplitLayers.forEach((layer) => {
      this.layerList.push({
        id: layer.id,
        name: layer.attr.name,
      });
    });

    this.nowSelectId = this.layerList[0].id;
    let lyr = this.getLayerObjById(this.nowSelectId);
    nowLayerAttr = {
      oldVisible: lyr._layer.show,
    };
    nowLayerAttr = JSON.parse(JSON.stringify(nowLayerAttr));
    nowLayerAttr.layerObj = lyr;
    nowLayerAttr.layer = lyr._layer;
    // 默认选中第一个展示
    if (!layerSplit) {
      layerSplit = new MapSplit(window.viewer, {
        layer: lyr._layer,
      });
    }
    if (!lyr._layer.show) {
      this.$store.commit("setCheckLayerAttr", this.layerList[0]);
      nowLayerAttr.newVisible = true;
    }
  },
  destroyed() {
    this.resetLastlyr();
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
      if (!layer)
        layer = window.mapViewer.operateLayerTool.getLayerObjById(id).layer;
      return layer;
    },

    changeLayer(attr) {
      let lyr = this.getLayerObjById(attr.id);
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
      this.$store.commit("setCheckLayerAttr", attr);
    },
    close() {
      this.$emit("close", "layerSplit");
    },
    // 还原上一个选中的状态
    resetLastlyr() {
      debugger
      if (nowLayerAttr.layer) {
        if (!nowLayerAttr.oldVisible) {
          this.$store.commit("setUncheckLayerAttr", nowLayerAttr.layerObj.attr);
        } else {
          this.$store.commit("setUncheckLayerAttr", nowLayerAttr.layerObj.attr);
        }
        nowLayerAttr = {};
      }
    },
  },
};
</script>