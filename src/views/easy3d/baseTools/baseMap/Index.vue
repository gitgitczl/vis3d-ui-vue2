<template>
  <Card
    :width="342"
    height="auto"
    :title="title"
    @close="close"
    :size="size"
    titleIcon="icon-cengshu"
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
      <el-checkbox v-model="isShowTerrain" @change="changeTerrain">显示地形</el-checkbox>
    </div>
  </Card>
</template>

<script>
import Card from "@/views/easy3d/components/card/Card.vue";
export default {
  name: "baseMap",
  components: {
    Card,
  },
  props: {
    title: "",
    position: {},
    size: {},
  },
  data() {
    return {
      baseMapList: this.$store.state.map3d.baseLayers,
      isShowTerrain: true,
      nowShowLayerId: null,
    };
  },
  mounted() {
    let lys = this.baseMapList.filter((layer) => {
      return layer.show == true;
    });

    this.nowShowLayerId = lys[0].id;
  },
  destroyed() {},
  methods: {
    close() {
      this.$emit("close", "baseMap");
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