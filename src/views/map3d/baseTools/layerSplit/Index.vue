<template>
  <Card :title="title" :position="position" :size="size" :iconfont="iconfont" @close="close">
    <div class="basic-tooltip">
      提示：左侧图层可由“图层树”或“底图”设置，右侧图层由此处设置。
    </div>
    <div>
      <label>对比图层：</label>
      <el-select placeholder="请选择" v-model="nowSelectId" @change="changeLayer">
        <el-option v-for="(item, index) in layerList" :key="index" :label="item.name" :value="item.id"></el-option>
      </el-select>
    </div>
  </Card>
</template>
<script>

let layerSplit = undefined;
let splitLayerTool = undefined;
export default {
  name: "layerSplit",
  components: {

  },
  props: {
    size: {},
    position: {},
    title: "",
    iconfont: {
      type: String,
      default: "icon-juanlianduibi",
    },
  },
  data() {
    return {
      nowSelectId: "",
      layerList: [],
    };
  },

  mounted() {
    const baseLayerObjs = window.mapViewer.baseLayerTool.layerObjs;
    const operateLayerObjs = window.mapViewer.operateLayerTool.layerObjs;

    if (!splitLayerTool) splitLayerTool = new window.vis3d.layer.Tool(window.viewer);
    for (let i = 0; i < baseLayerObjs.length; i++) {
      const item = baseLayerObjs[i];
      const attr = JSON.parse(JSON.stringify(item.attr));
      attr.show = false;
      this.layerList.push(attr);
      splitLayerTool.add(attr);
    }

    for (let j = 0; j < operateLayerObjs.length; j++) {
      const item = operateLayerObjs[j];
      const attr = JSON.parse(JSON.stringify(item.attr));
      attr.show = false;
      this.layerList.push(attr);
      splitLayerTool.add(attr);
    }

    this.nowSelectId = this.layerList[0].id;
    const lbj = splitLayerTool.getLayerObjById(this.nowSelectId).layerObj;
    // 默认选中第一个
    splitLayerTool.setVisible(this.nowSelectId, true);
    if (!layerSplit) {
      layerSplit = new this.vis3d.common.LayerSplit(window.viewer, {
        layer: lbj.layer,
      });
    }

  },
  destroyed() {
    if (layerSplit) {
      layerSplit.destroy();
      layerSplit = null;
    }
    if (splitLayerTool) {
      splitLayerTool.destroy();
      splitLayerTool = undefined;
    }
    layerSplit = undefined;
    splitLayerTool = undefined;
  },
  methods: {
    changeLayer(id) {
      splitLayerTool.hideAll();
      const layer = splitLayerTool.getLayerObjById(id).layerObj.layer;
      splitLayerTool.setVisible(id, true);
      if (layerSplit) layerSplit.setLayer(layer);
    },
    close() {
      window.workControl.closeToolByName("layerSplit")
    }
  },
};
</script>
