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
    const baseLayerObjs = window.mapViewer.baseLayerTool.layerObjs;
    const operateLayerObjs = window.mapViewer.operateLayerTool.layerObjs;

    for (let i = 0; i < baseLayerObjs.length; i++) {
      const item = baseLayerObjs[i];
      this.layerList.push(JSON.parse(JSON.stringify(item.attr)));
    }

    for (let j = 0; j < operateLayerObjs.length; j++) {
      const item = operateLayerObjs[j];
      this.layerList.push(JSON.parse(JSON.stringify(item.attr)));
    }

    this.nowSelectId = this.layerList[0].id;
    // 默认选中第一个
    const layer = baseLayerObjs[0].layer;
    if (!layerSplit) {
      layerSplit = new this.vis3d.common.LayerSplit(window.viewer, {
        layer: layer,
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
      window.workControl.closeToolByName("layerSplit")
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
  },
};
</script>
