<template>
  <Card
    :title="title"
    :position="position"
    :size="size"
    :iconfont="iconfont"
    @close="close"
  >
    <label>可选图层：</label>
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
    return;
    let operateLayers = this.$store.state.map3d.operateLayers;
    let res = this.getAllLayers(operateLayers);

    let allLayers = res.layers;
    for (let i = 0; i < allLayers.length; i++) {
      let item = allLayers[i];
      item = JSON.parse(JSON.stringify(item));
      item.initState = item.show; // 记录原始状态
      if (item.layerSplit == true) {
        // 是否用来做分屏对比
        this.layerList.push(item);
      }
    }

    // 默认选中第一个展示
    this.nowSelectId = this.layerList[0].id;

    let lyrObj = window.mapViewer.operateLayerTool.getLayerObjById(
      this.nowSelectId
    ).layerObj;
    lyrObj.setVisible(true);

    lastLayerAttr = this.layerList[0];

    if (!layerSplit) {
      layerSplit = new this.easy3d.LayerSplit(window.viewer, {
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
      this.$emit("close", "layerSplit");
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
