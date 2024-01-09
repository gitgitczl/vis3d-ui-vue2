<template>
  <div style="height: 100%">
    <!-- <div id="mapContainer2"></div> -->
    <!-- 图层选择 -->
    <Card :size="size" @close="close" :title="title" :position="position" iconfont="icon-cengshu">
      <div class="basic-tooltip">
        提示：左侧图层可由“图层树”设置，右侧图层由此处设置。
      </div>
      <label for="">图层：</label>
      <el-select v-model="selectLayerIds" multiple placeholder="请选择" @change="setLayerVisible">
        <el-option v-for="item in allLayers" :key="item.id" :label="item.name" :value="item.id">
        </el-option>
      </el-select>
    </Card>
    <!-- 底图选择 -->
  </div>
</template>
<script>
/* 分屏对比 */
import { mapConfig } from "../../config/export"
let screenLayerTool = undefined;
export default {
  name: "twoScreen",
  props: {
    title: "",
    position: {},
    size: {},
    iconfont: {
      type: String,
      default: "icon-fenpingduibi",
    },
  },
  components: {

  },
  data() {
    return {
      selectLayerIds: [], // 当前选择的图层id
      lastSelectLayerIds: [],
      allLayers: []

    };
  },

  mounted() {
    // 筛选出可对比的地图
    let oldViewerContainer = window.viewer.container;
    oldViewerContainer.style.width = "50%";
    oldViewerContainer.style.left = "50%";
    // 构建地图容器
    let mapContainer2 = document.createElement("div");
    mapContainer2.setAttribute('id', 'mapContainer2');
    mapContainer2.style.width = "50%";
    mapContainer2.style.height = "100%";
    mapContainer2.style.position = "absolute";
    mapContainer2.style.top = "0";
    mapContainer2.style.right = "0";
    mapContainer2.style.borderLeftStyle = "solid";
    mapContainer2.style.borderLeftWidth = "2px";
    mapContainer2.style.borderLeftColor = "#9d9a9a";

    const app = document.getElementById('app');
    app.appendChild(mapContainer2);

    let newMapConfig = JSON.parse(JSON.stringify(mapConfig));
    newMapConfig.operateLayers = []; // 只放置底图
    // 构建新的三维地图并绑定事件联动
    window.mapViewer2 = new window.vis3d.MapViewer(
      "mapContainer2",
      newMapConfig
    );
    window.viewer2 = window.mapViewer2._viewer;
    window.viewer.camera.changed.addEventListener(
      this.viewerChangeHandler,
      this
    );
    window.viewer.camera.percentageChanged = 0.01;

    window.viewer2.camera.changed.addEventListener(
      this.viewerChangeHandler2,
      this
    );
    window.viewer2.camera.percentageChanged = 0.01;

    this.viewerChangeHandler();

    // 设置下拉框选项
    this.allLayers = this.allLayers.concat(newMapConfig.baseLayers);
    const layerList = JSON.parse(JSON.stringify(mapConfig.operateLayers));
    for (let i = 0; i < layerList.length; i++) {
      const item = layerList[i];
      if (item.type == 'group') {
        for (let j = 0; j < item.children.length; j++) {
          const lyrattr = item.children[j];
          this.allLayers.push(lyrattr);
        }
      } else {
        this.allLayers.push(item);
      }
    }

    if (!screenLayerTool) {
      screenLayerTool = new window.vis3d.layer.Tool(viewer2);
    }
  },

  destroyed() {
    let oldViewerContainer = window.viewer.container;
    oldViewerContainer.style.width = "100%";
    oldViewerContainer.style.left = "0";
    debugger
    if (window.mapViewer2) {
      window.mapViewer2.destroy();
      delete window.mapViewer2;
    }

    const mapContainer2 = document.getElementById("mapContainer2");
    if (mapContainer2) mapContainer2.parentNode.removeChild(mapContainer2);

  },

  methods: {
    viewerChangeHandler: function (e) {
      window.viewer2.camera.changed.removeEventListener(
        this.viewerChangeHandler2,
        this
      );
      this.updateView(window.viewer, window.viewer2);
      window.viewer2.camera.changed.addEventListener(
        this.viewerChangeHandler2,
        this
      );
    },
    viewerChangeHandler2: function (e) {
      window.viewer.camera.changed.removeEventListener(
        this.viewerChangeHandler,
        this
      );
      this.updateView(window.viewer2, window.viewer);
      window.viewer.camera.changed.addEventListener(
        this.viewerChangeHandler,
        this
      );
    },
    updateView: function (viewer, viewer2) {
      let cameraView = this.vis3d.util.getCameraView(viewer);
      cameraView.duration = 0;
      this.vis3d.util.setCameraView(cameraView, viewer2);
    },
    close() {
      this.$emit("close", "twoScreen");
    },
    // 设置图层显示隐藏
    setLayerVisible() {
      console.log('selectLayerIds===>', this.selectLayerIds)
      for (let i = 0; i < this.selectLayerIds.length; i++) {
        const nowId = this.selectLayerIds[i];
        if (this.lastSelectLayerIds.indexOf(nowId) == -1) { // 新增的图层
          const attr = this.getLayerAttrById(nowId);
          attr.show = true;
          screenLayerTool.add(attr);
        }
      }

      for (let ind = 0; ind < this.lastSelectLayerIds.length; ind++) {
        const lastId = this.lastSelectLayerIds[ind];
        if (this.selectLayerIds.indexOf(lastId) == -1) { // 移出的图层
          screenLayerTool.setVisible(lastId,false);
        }
      }
      this.lastSelectLayerIds = JSON.parse(JSON.stringify(this.selectLayerIds));
    },
    getLayerAttrById(id) {
      const list = this.allLayers.filter(res => {
        return res.id == id;
      });
      return list[0];
    }
  },
};
</script>

<style scoped>
#mapContainer2 {
  width: 50%;
  height: 100%;
  top: 0;
  padding: 0;
  margin: 0;
  position: absolute;
}
</style>
