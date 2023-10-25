<template>
  <Card :size="size" @close="close" :title="title" :position="position" :iconfont="iconfont">
    <div class="basic-region" style="color: white !important;">
      <v-region type="group" :town="false" @values="setRegion"></v-region>
    </div>
  </Card>
</template>

<script>

let regionPolygon = null;
export default {
  name: "region",

  props: {
    title: "",
    position: {},
    size: {},
    iconfont: {
      type: String,
      default: "icon-diqudaohang"
    }
  },

  components: {

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
      window.workControl.closeToolByName('region')
    },
    setRegion(data) {
      if (regionPolygon) {
        window.viewer.dataSources.remove(regionPolygon);
        regionPolygon = null;
      }
      let { province, city, area } = data;
      let key = "";
      let fileName = "";
      if (area) {
        // 精确到区县
        key = area.key;
        fileName = "county";
      } else {
        if (city) {
          // 市级
          key = city.key;
          fileName = "city";
        } else {
          if (province) {
            // 省级
            key = province.key;
            fileName = "province";
          }
        }
      }
      if (!key) return;
      let that = this;

      this.axios
        .get(`http://47.117.134.108:9010/data/geojson/${key}.json`)
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
<style>
.basic-region .rg-default-btn {
  background: rgba(37, 38, 49, 0.96);
  border-color: rgba(37, 38, 49, 0.96);
  color: var(--fontColor);
}

.basic-region .rg-default-btn:hover {
  border-color: rgba(37, 38, 49, 0.96);
  color: var(--fontColor);
}
</style>
