<template>
  <Card @close="close" :title="title" :size="size" :position="position" :iconfont="iconfont">
    <ul class="pathPlan-change basic-text-input">
      <li>
        <label>起点：</label>
        <el-input v-model="startPlot" placeholder="请输入起点坐标"></el-input>
        <span class="basic-btn" @click="drawStrart">图上选点</span>
      </li>
      <li>
        <label>终点：</label>
        <el-input v-model="endPlot" placeholder="请输入终点坐标"></el-input>
        <span class="basic-btn" @click="drawEnd">图上选点</span>
      </li>
      <li>
        <label>避让区：</label>
        <el-input v-model="avoid" placeholder="请绘制避让区" disabled></el-input>
        <span class="basic-btn" @click="drawAvoidArea">图上绘制</span>
      </li>
    </ul>
    <div class="path-compute">
      <span class="basic-btn" @click="startCompute">开始计算</span>
      <span class="basic-btn basic-reset" @click="reset">取消</span>
    </div>
    <div class="reset-table pathPlan-table">
      <el-table ref="singleTable" :data="pathPlanList" :border="true" style="width: 100%" max-height="300">
        <el-table-column property="id" align="center" label="序号" width="50">
        </el-table-column>

        <el-table-column property="content" label="推荐线路">
          <template slot-scope="scope">
            <!-- <div class="pathPlan-operate-box basic-checkbox">
              <p>方案一</p>
              <i class="basic-btn" @click="startRoam()">开始导航</i>
              <i class="basic-btn">查看线路</i>
              <el-checkbox v-model="scope.row.isChecked">备选项</el-checkbox>
            </div> -->
            <div class="pathPlan-detail">
              <span>{{ scope.row.content }}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </Card>
</template>
<script>
/* 路径规划 */
import startImg from "../../images/pathPlan/start.png"
import endImg from "../../images/pathPlan/end.png"
let routeDrawTool = undefined;
let gaodeRoute = undefined;
let startMarkerObj = undefined;
let endMarkerObj = undefined;
let avoidAreaObj = undefined;
let routes = [];
let colors = [
  window.Cesium.Color.AQUA,
  window.Cesium.Color.SPRINGGREEN,
  window.Cesium.Color.YELLOW,
  window.Cesium.Color.DODGERBLUE,
];
let avoidpolygons = []; // 避让区范围坐标
export default {
  name: "pathPlan",

  props: {
    title: "",
    position: {},
    size: {},
    iconfont: {
      type: String,
      default: "icon-xianludaohang",
    },
  },

  components: {

  },

  data() {
    return {
      startPlot: "",
      endPlot: "",
      avoid: "",
      pathPlanList: [],
    };
  },

  mounted() {
    if (!routeDrawTool) {
      routeDrawTool = new window.vis3d.plot.Tool(window.viewer, {
        canEdit: false
      });
      routeDrawTool.on("endEdit", function (entObj, ent) {
        if (!ent) return;
        if (ent.type == "start") {
        }
        if (ent.type == "end") {
        }
        if (ent.type == "area") {
        }
      });
    }
    if (!gaodeRoute) gaodeRoute = new window.vis3d.query.GaodeRoute({
      keys: ["a73e387f642573295b498d7fd6b4c537"]
    });
  },

  destroyed() {
    this.clearRoutes();
    this.pathPlanList = [];
    if (window.routeDrawTool) {
      window.routeDrawTool.destroy();
      window.routeDrawTool = undefined;
    }
  },

  methods: {
    close() {
      window.workControl.closeToolByName("pathPlan")
    },

    drawStrart() {
      if (startMarkerObj) {
        startMarkerObj.destroy();
        startMarkerObj = undefined;
      }
      let that = this;
      routeDrawTool.start({
        type: "billboard",
        style: {
          image: startImg,
        },
        success: function (entObj, ent) {
          startMarkerObj = entObj;
          ent.type = "start";
          let lnglat = entObj.getPositions(true);
          that.startPlot =
            Number(lnglat[0]).toFixed(6) + "," + Number(lnglat[1]).toFixed(6);
        },
      });
    },
    drawEnd() {
      if (endMarkerObj) {
        endMarkerObj.destroy();
        endMarkerObj = undefined;
      }
      let that = this;
      routeDrawTool.start({
        type: "billboard",
        style: {
          image: endImg,
        },
        success: function (entObj, ent) {
          endMarkerObj = entObj;
          ent.type = "end";
          let lnglat = entObj.getPositions(true);
          that.endPlot =
            Number(lnglat[0]).toFixed(6) + "," + Number(lnglat[1]).toFixed(6);
        },
      });
    },
    drawAvoidArea() {
      if (avoidAreaObj) {
        avoidAreaObj.destroy();
        avoidAreaObj = undefined;
      }
      routeDrawTool.start({
        type: "polygon",
        style: {
          heightReference: 1,
          color: "#ffff00",
          colorAlpha: .5,
          outline: true,
          outlineColor: "#ff0000"
        },
        success: function (entObj, ent) {
          const lnglats = entObj.getPositions(true);
          avoidpolygons.push(lnglats);
        },
      });
    },
    startCompute() {
      this.clearRoutes();
      this.pathPlanList = [];
      if (!this.startPlot || !this.endPlot) {
        this.$message.error("缺少点位数据！");
        return;
      }
      let startPoint = this.startPlot.split(",");
      let endPoint = this.endPlot.split(",");
      let that = this;

      // 驾车路线规划
      gaodeRoute.query(1, {
        origin: startPoint,
        destination: endPoint,
        avoidpolygons: avoidpolygons
      }, function (list) {
        if (!list || list.length < 1) return;

        for (let ind = 0; ind < list.length; ind++) {
          const item = list[ind];
          const positions = window.vis3d.util.lnglatsToCartesians(item.lnglats, viewer);
          let route = that.createPath(positions, colors[ind]);
          route.tooltip = `方案${ind + 1}`
          if (route) {
            route.color = colors[ind];
            route.pathInd = ind;
            routes.push(route);

          }
          let content = "";
          const inslength = item.instructions.length;
          for (let i = 0; i < inslength; i++) {
            let fh = i == inslength - 1 ? "。" : ",";
            content += item.instructions[i] + fh;
          }
          that.pathPlanList.push({
            id: ind + 1,
            content: content,
          });
        }

      }, function () {
        that.$message({
          message: '查询路线失败，请重试！',
          type: 'warning'
        })
      })
    },
    reset() {
      this.clearRoutes(); // 清除原来路线
      this.pathPlanList = [];
      routeDrawTool.removeAll();
      this.pathPlanList = [];
      this.startPlot = "";
      this.endPlot = "";
    },
    // 构建路线
    createPath(positions, color) {
      if (!positions || positions.length < 1) return;
      color = color || Cesium.Color.BLUE;
      let lowColor = color.withAlpha(0.6);
      let route = window.viewer.entities.add({
        polyline: {
          positions: positions,
          width: 3,
          material: lowColor,
          clampToGround: 1,
        },
      });
      return route;
    },
    // 清除所有路线
    clearRoutes() {
      routes.forEach(function (route) {
        if (route) window.viewer.entities.remove(route);
      });
      routes = [];
    },
  },
};
</script>

<style lang="less">
.pathPlan-change {
  li {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0;
    }

    .el-input {
      width: 150px;
      margin: 0 20px;
    }

    label {
      width: 80px;
      display: flex;
      justify-content: flex-end;
    }

    span {
      height: 40px;
      padding: 0 10px;
      border-radius: 5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.path-compute {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 15px;

  .basic-btn {
    height: 40px;
    line-height: 40px;
    padding: 0 10px;
    border-radius: 5px;
    cursor: pointer;
    display: block;
    margin: 0 10px;
    background-color: green;
  }

  .basic-reset {
    background-color: #e6a23c !important;
  }
}

.pathPlan-table {
  margin-top: 15px;
}

.pathPlan-operate-box {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);

  i {
    height: 30px;
    padding: 0 5px;
    border-radius: 5px;
    margin: 0 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-style: normal;
    cursor: pointer;
  }
}

.pathPlan-detail {
  margin: 10px 0 0 0;
}
</style>
