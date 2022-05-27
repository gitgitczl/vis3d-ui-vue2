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

  destroyed() {
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

      this.axios
        .get(`/data/bound/xzqh/${key}.json`)
        .then(function (response) {
          let dspromise = window.Cesium.GeoJsonDataSource.load(response.data, {
            stroke: Cesium.Color.YELLOW,
            fill: Cesium.Color.YELLOW.withAlpha(0.5),
            strokeWidth: 3,
            clampToGround: true,
          });
          dspromise.then(function (ds) {
            regionPolygon = ds;
            window.viewer.flyTo(ds, {
              duration: 1,
            });
          });
          window.viewer.dataSources.add(dspromise);
        })
        .catch(function (err) {
          that.$message.error("此区域数据缺失！");
        });
    },
  },
};
</script>