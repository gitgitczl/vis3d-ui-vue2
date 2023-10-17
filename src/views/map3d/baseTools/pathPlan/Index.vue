<template>
  <Card
    @close="close"
    :title="title"
    :size="size"
    :position="position"
    :iconfont="iconfont"
  >
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
        <el-input
          v-model="avoid"
          placeholder="请绘制避让区"
          disabled
        ></el-input>
        <span class="basic-btn">图上绘制</span>
      </li>
    </ul>
    <div class="path-compute">
      <span class="basic-btn" @click="startCompute">开始计算</span>
      <span class="basic-btn basic-reset" @click="reset">取消</span>
    </div>
    <div class="reset-table pathPlan-table">
      <el-table
        ref="singleTable"
        :data="pathPlanList"
        :border="true"
        style="width: 100%"
        max-height="300"
      >
        <el-table-column property="id" align="center" label="序号" width="50">
        </el-table-column>

        <el-table-column property="content" label="推荐线路">
          <template slot-scope="scope">
            <div class="pathPlan-operate-box basic-checkbox">
              <p>方案一</p>
              <i class="basic-btn" @click="startRoam()">开始导航</i>
              <i class="basic-btn">查看线路</i>
              <!-- <el-checkbox v-model="scope.row.isChecked">备选项</el-checkbox> -->
            </div>
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

let drawTool = null;
let gaodeRoute = null;
let startMarkerObj = null;
let endMarkerObj = null;
let routes = [];
let colors = [];
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
    colors = [
      window.Cesium.Color.AQUA,
      window.Cesium.Color.SPRINGGREEN,
      window.Cesium.Color.YELLOW,
      window.Cesium.Color.DODGERBLUE,
    ];
    if (!drawTool) {
      drawTool = new this.vis3d.plot.Tool(window.viewer,{
        canEdit : false
      });
      drawTool.on("endEdit", function (entObj, ent) {
        if (!ent) return;
        if (ent.type == "start") {
        }
        if (ent.type == "end") {
        }
        if (ent.type == "area") {
        }
      });
    }
    if (!gaodeRoute) gaodeRoute = new this.vis3d.gadgets.GaodeRoute({
      keys : ["a73e387f642573295b498d7fd6b4c537"]
    });
  },
  
  destroyed() {
    if (window.drawTool) {
      window.drawTool.destroy();
      window.drawTool = undefined;
    }
  },

  methods: {
    close() {
      window.workControl.closeToolByName("pathPlan")
    },

    drawStrart() {
      if (startMarkerObj) {
        startMarkerObj.destroy();
        startMarkerObj = null;
      }
      let that = this;
      drawTool.start({
        type: "billboard",
        style: {
          image: "./map3d/images/pathPlan/start.png",
        },
        success: function (entObj, ent) {
          startMarkerObj = entObj;
          ent.type = "start";
          let lnglat = entObj.getPositions(true);
          that.startPlot =
            Number(lnglat[0]).toFixed(6) + "," + Number(lnglat[1]).toFixed(6);
        },
        error: function () {
          that.$message.error("线路计算失败，请重试!");
        },
      });
    },
    drawEnd() {
      if (endMarkerObj) {
        endMarkerObj.destroy();
        endMarkerObj = null;
      }
      let that = this;
      drawTool.start({
        type: "billboard",
        style: {
          image: "./map3d/images/pathPlan/end.png",
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
    startCompute() {
      this.pathPlanList = [];
      this.clearRoutes();
      if (!this.startPlot || !this.endPlot) {
        this.$message.error("缺少点位数据！");
        return;
      }
      let startPoint = this.startPlot.split(",");
      let endPoint = this.endPlot.split(",");
      let that = this;
      gaodeRoute.query({
        points: [startPoint, endPoint],
        type: 3,
        success: function (data) {
          if (!data) return;
          let { origin, destination, paths } = data;
          paths.forEach(function (path, index) {
            let pathInd = index % 4;
            let color = colors[pathInd];
            let { points, steps } = path;
            let route = that.createPath(points, color);
            if (route) {
              route.color = color;
              route.pathInd;
              routes.push(route);
            }

            let content = "";
            for (let i = 0; i < steps.length; i++) {
              let fh = i == steps.length - 1 ? "。" : ",";
              content += steps[i].instruction + fh;
            }
            that.pathPlanList.push({
              id: index + 1,
              content: content,
            });
          });
        },
      });
    },
    reset() {
      if (startMarkerObj) {
        startMarkerObj.destroy();
        startMarkerObj = null;
      }
      if (endMarkerObj) {
        endMarkerObj.destroy();
        endMarkerObj = null;
      }

      this.startPlot = "";
      this.endPlot = "";
    },
    // 构建路线
    createPath(lnglats, color) {
      let positions = [];
      for (let i = 0; i < lnglats.length; i++) {
        let item = lnglats[i];
        if (item && item[0] && item[1]) {
          positions.push(
            window.Cesium.Cartesian3.fromDegrees(item[0], item[1])
          );
        }
      }
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
        if (route) {
          window.viewer.entites.remove(route);
        }
      });
      routes = [];
      this.pathPlanList = [];
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
    color: #bdc2d0;
    font-style: normal;
    cursor: pointer;
  }
}

.pathPlan-detail {
  margin: 10px 0 0 0;
}
</style>
