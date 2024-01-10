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

let layerSplit = null;
let lastLayerAttr = {}; // 当前操作的图层
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
    

    if (!layerSplit) {
      layerSplit = new window.vis3d.common.LayerSplit(window.viewer, {
        layer: lyrObj._layer,
      });
    }
  },
  destroyed() {
    if (layerSplit) {
      layerSplit.destroy();
      layerSplit = null;
    }
    this.resetLastlyr();
  },
  methods: {
    changeLayer(attr) {
      // 还原上一个选中的对象
      this.resetLastlyr();
      let lyr = this.getLayerObjById(attr.id);
      if (!lyr || !layerSplit) return;
      lastLayerAttr = attr;
    },
    // 还原上一个操作
    resetLastlyr() {
      if (!lastLayerAttr) return;
      let initState = lastLayerAttr.initState;
      let lyrObj = window.mapViewer.operateLayerTool.getLayerObjById(
        lastLayerAttr.id
      ).layerObj;
      if (lyrObj) lyrObj.setVisible(initState);
      lastLayerAttr = null;
    },
    close() {
      window.workControl.closeToolByName("layerSplit");
    }
  },
};
</script>
