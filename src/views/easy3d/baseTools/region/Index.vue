<template>
  <Card
    :width="400"
    :height="100"
    @close="close"
    :title="title"
    :position="position"
    titleIcon="icon-cengshu"
  >
    <div class="basic-region">
      <v-region type="group" :town="false" @values="setRegion"></v-region>
    </div>
  </Card>
</template>

<script>
import Card from "@/views/easy3d/components/card/Card.vue";
let regionPolygon = null;
export default {
  name: "region",

  props: {
    title: "",
    position: {},
  },

  components: {
    Card,
  },

  destroyed(){
     if (regionPolygon) {
        window.viewer.dataSources.remove(regionPolygon);
        regionPolygon = null;
      }
  },

  data() {
    return {};
  },

  methods: {
    close() {
      this.$emit("close", "region");
    },
    setRegion(data) {
      if (regionPolygon) {
        window.viewer.dataSources.remove(regionPolygon);
        regionPolygon = null;
      }
      let { province, city, area } = data;
      let key = "";

      if (area) {
        // 精确到区县
        key = area.key;
      } else {
        if (city) {
          // 市级
          key = city.key;
        } else {
          if (province) {
            // 省级
            key = province.key;
          }
        }
      }
      if (!key) return;
      let that = this;
      this.axios.get(`/data/bound/xzqh/${key}.json`).then(function (response) {
        window.viewer.dataSources
          .add(window.Cesium.GeoJsonDataSource.load(response.data), {
            stroke: Cesium.Color.WHITE,
            fill: Cesium.Color.BLUE.withAlpha(0.3), //注意：颜色必须大写，即不能为blue
            strokeWidth: 5,
            clampToGround: true,
          })
          .then(function (ds) {
            regionPolygon = ds;
            window.viewer.flyTo(ds,{
              duration : 2
            })
          });
      }).catch(function(err){
        that.$message.error("此区域数据缺失！");
      });
    },
  },
};
</script>