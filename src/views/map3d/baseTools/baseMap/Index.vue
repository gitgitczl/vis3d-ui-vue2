<template>
  <Card
    height="auto"
    :title="title"
    @close="close"
    :size="size"
    :position="position"
    :iconfont="iconfont"
  >
    <ul class="basemap-box basic-tool">
      <li
        v-for="(item, index) in baseMapList"
        :key="index"
        :class="[item.show ? 'tool-active' : '']"
        @click="onChangeBaseMap(item)"
      >
        <img :src="item.iconImg || ''" />
        <span>{{ item.name || "" }}</span>
      </li>
    </ul>
    <div class="basic-checkbox basemap-checkbox">
      <el-checkbox v-model="isShowTerrain" @change="changeTerrain"
        >显示地形</el-checkbox
      >
    </div>
  </Card>
</template>

<script>
import { mapConfig } from "../../config/export"
export default {
  components: {
    
  },
  props: {
    title: "",
    position: {},
    size: {},
    iconfont: {
      type: String,
      default: "icon-ditufuwu",
    },
  },
  data() {
    return {
      baseMapList: [],
      isShowTerrain: true,
      nowShowLayerId: null,
    };
  },
  mounted() {
    this.baseMapList = mapConfig.baseLayers;
    let lys = this.baseMapList.filter((layer) => {
      return layer.show == true;
    });

    this.nowShowLayerId = lys[0].id;
    this.isShowTerrain =
      !window.viewer.scene.terrainProvider ||
      window.viewer.scene.terrainProvider instanceof
        Cesium.EllipsoidTerrainProvider
        ? false
        : true;
  },
  destroyed() {},
  methods: {
    close() {
      window.workControl.closeToolByName(this.$options.name)
    },

    // 选中底图
    onChangeBaseMap(data) {
      if (data.id == this.nowShowLayerId) return; // 屏蔽重复点击

      let tempList = this.baseMapList.map((item) => {
        let temp = {};
        if (item.id === data.id) {
          temp = Object.assign({}, item, { show: true });
        } else {
          temp = Object.assign({}, item, { show: false });
        }
        return temp;
      });
      this.nowShowLayerId = data.id;
      this.$set(this, "baseMapList", tempList);
      
      window.mapViewer.baseLayerTool.hideAll();
      window.mapViewer.baseLayerTool.showById(data.id);
    },
    changeTerrain() {
      window.mapViewer.setTerrainVisible(this.isShowTerrain);
    },
  },
};
</script>

<style lang="less">
.basemap-box {
  display: flex;
  flex-wrap: wrap;
  li {
    width: 120px;
    height: 120px;
    box-sizing: border-box;
    padding: 5px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #6d748a;
    cursor: pointer;
    margin-right: 16px;
    img {
      width: 90px;
      height: 80px;
      object-fit: cover;
    }
  }
}
.basemap-checkbox {
  margin-top: 20px;
}
</style>
