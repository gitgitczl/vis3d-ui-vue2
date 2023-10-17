<template>
  <Card
    :size="size"
    :title="title"
    :position="position"
    :iconfont="iconfont"
    @close="close"
  >
    <ul class="coordinate-box basic-text-input">
      <li>
        <label>经度</label>
        <el-input v-model="lng" placeholder="请输入经度"></el-input>
      </li>
      <li>
        <label>纬度</label>
        <el-input v-model="lat" placeholder="请输入纬度"></el-input>
      </li>
      <li>
        <label>高程</label>
        <el-input v-model="height" placeholder="请输入高程"></el-input>
      </li>
    </ul>

    <div class="coordinate-btn basic-coordinate">
      <span @click="showMarker">坐标定位</span>
      <span @click="drawMarker">图上拾取</span>
    </div>
  </Card>
</template>
<script>
import img_start from "../../images/plot/start.png"
let drawTool = null;
export default {
  name: "coordinate",
  props: {
    title: {
      type: String,
      default: "",
    },
    iconfont: {
      type: String,
      default: "icon-zuobiaodingwei",
    },
    size: {},
    position: {},
  },

  components: {
    
  },

  data() {
    return {
      lat: "",
      lng: "",
      height: "",
    };
  },
  mounted() {
    let that = this;
    if (!drawTool) {
      drawTool = new this.vis3d.plot.Tool(window.viewer);
      drawTool.on("endCreate", function (entObj, ent) {
        const lnglat = entObj.getPositions(1);
        if (!lnglat) return;
        that.lng = Number(lnglat[0]).toFixed(6);
        that.lat = Number(lnglat[1]).toFixed(6);
        that.height = Number(lnglat[2]).toFixed(2);
      });
      drawTool.on("endEdit", function (entObj, ent) {
        const lnglat = entObj.getPositions(1);
        if (!lnglat) return;
        that.lng = Number(lnglat[0]).toFixed(6);
        that.lat = Number(lnglat[1]).toFixed(6);
        that.height = Number(lnglat[2]).toFixed(2);
      });
      drawTool.on("editing", function (entObj, ent) {
        const lnglat = entObj.getPositions(true);
        if (!lnglat) return;
        that.lng = Number(lnglat[0]).toFixed(6);
        that.lat = Number(lnglat[1]).toFixed(6);
        that.height = Number(lnglat[2]).toFixed(2);

        console.log(that.lng)
      });
    }
  },
  destroyed() {
    if (drawTool) {
      drawTool.destroy();
      drawTool = null;
    }
  },

  methods: {
    close() {
      window.workControl.closeToolByName('coordinate');
    },
    showMarker() {
      if (!this.lng || !this.lat) {
        this.$message.error("经纬度输入错误！");
        return;
      }
      if (!drawTool) return;
      drawTool.removeAll();
      let entObj = drawTool.createByPositions({
        type: "billboard",
        style: {
          image: img_start,
          scale: 0.8,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        },
        positions: [this.lng, this.lat, this.height || 0],
      });
      window.viewer.zoomTo(entObj.entity);
    },
    drawMarker() {
      this.lng = '';
      this.lat = '';
      this.height = '';
      if (!drawTool) return;
      drawTool.removeAll();
      drawTool.start({
        type: "billboard",
        style: {
          image: img_start,
          scale: 0.5,
        },
      });
    },
  },
};
</script>

<style lang="less">
.coordinate-box {
  li {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    label {
      width: 60px;
    }
  }
}
.coordinate-btn {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  span {
    width: 88px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    border-radius: 2px;
    border: 1px solid transparent;
    cursor: pointer;
    margin-left: 20px;
    color: #ffffff;
    font-weight: bold;
  }
}
</style>
