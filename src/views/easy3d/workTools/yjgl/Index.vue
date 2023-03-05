<template>
  <Card>
    <div class="yjgl-bar">
      <!-- 第一步 绘制多边形范围-->
      <div v-show="step == 0">
        <span class="draw-btn" @click="drawFence">绘制范围</span>
        <el-table :data="polygonList" style="width: 100%">
          <el-table-column type="index" label="序号" width="60">
          </el-table-column>
          <el-table-column label="名称" width="60">
            <template slot-scope="scope">
              <el-input v-model="scope.row.name"></el-input>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <span
                title="删除"
                class="el-icon-delete operate-btn-icon"
                @click="removeOne(scope.row)"
              ></span
            ></template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 第二步 绘制交警位置 并标记名称-->
      <div v-show="step == 1">
        <span class="draw-btn" @click="drawPoint">标识点位</span>
        <el-table :data="pointList" style="width: 100%">
          <el-table-column prop="index" label="序号" width="60">
          </el-table-column>
          <el-table-column prop="name" label="名称" width="60">
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <span
                title="删除"
                class="el-icon-delete operate-btn-icon"
                @click="removeOne(scope.row)"
              ></span
            ></template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 第三步 标记出口箭头 -->
      <div v-show="step == 2">
        <span @click="drawExit">出口箭头</span>

        <el-table :data="exitList" style="width: 100%">
          <el-table-column prop="index" label="序号" width="60">
          </el-table-column>
          <el-table-column prop="name" label="名称" width="60">
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <span
                title="删除"
                class="el-icon-delete operate-btn-icon"
                @click="removeOne(scope.row)"
              ></span
            ></template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 第四步 标记入口箭头 -->
      <div v-show="step == 3">
        <span class="draw-btn" @click="drawEntrance">入口箭头</span>

        <el-table :data="entranceList" style="width: 100%">
          <el-table-column prop="index" label="序号" width="60">
          </el-table-column>
          <el-table-column prop="name" label="名称" width="60">
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <span
                title="删除"
                class="el-icon-delete operate-btn-icon"
                @click="removeOne(scope.row)"
              ></span
            ></template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 绘制作业路线 -->
      <div v-show="step == 4">
        <span class="draw-btn" @click="drawRoute">绘制路线</span>
        <el-table :data="polylineList" style="width: 100%">
          <el-table-column prop="index" label="序号" width="60">
          </el-table-column>
          <el-table-column prop="name" label="名称" width="60">
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <span
                title="删除"
                class="el-icon-delete operate-btn-icon"
                @click="removeOne(scope.row)"
              ></span
            ></template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 导出数据 -->
      <div v-show="step == 5">
        <span class="draw-btn" @click="exportData">导出数据</span>
      </div>

      <!-- 分割线 -->
      <div></div>
      <div class="operate">
        <span v-show="isNext" @click="goNext">下一步</span>
        <span v-show="isLast" @click="goLast">上一步</span>
      </div>
    </div>
  </Card>
</template>
<script>
let drawTool = undefined;
export default {
  name: "yjgl",
  data() {
    return {
      isNext: true,
      isLast: false,
      step: 0,
      polygonList: [],
      pointList: [],
      exitList: [],
      entranceList: [],
      polylineList: [],
    };
  },
  mounted() {
    if (!drawTool) {
      drawTool = new this.easy3d.DrawTool(window.viewer, {
        canEdit: true,
        fireEdit: false,
      });
    }
  },
  destroyed() {
    if (drawTool) {
      drawTool.destroy();
      drawTool = undefined;
    }
  },
  methods: {
    goNext() {
      if (this.step == 0) {
        if (this.polygonList.length < 1) {
          this.$message("请绘制至少一个范围！");
          return;
        }
      }
      if (this.step == 1) {
        if (this.pointList.length < 1) {
          this.$message("请绘制至少一个点位！");
          return;
        }
      }
      if (this.step == 2) {
        if (this.exitList.length < 1) {
          this.$message("请绘制至少一个出口！");
          return;
        }
      }
      if (this.step == 3) {
        if (this.entranceList.length < 1) {
          this.$message("请绘制至少一个入口！");
          return;
        }
      }
      if (this.step == 4) {
        if (this.routeList.length < 1) {
          this.$message("请绘制至少一条线路！");
          return;
        }
      }

      this.step++;
      if (this.step >= 5) {
        this.step = 5;
        this.isNext = false;
        this.isLast = true;
      }
    },
    goLast() {
      this.step--;
      if (this.step <= 0) {
        this.step = 0;
        this.isNext = true;
        this.isLast = false;
      }
    },

    removeOne(row) {
      let objId = row.objId;
      let list = [];
      let that = this;
      if (row.type == "fence") {
        list = that.polygonList;
      } else if (row.type == "point") {
        list = that.pointList;
      } else if (row.type == "exit") {
        list = that.exitList;
      } else if (row.type == "entrance") {
        list = that.entranceList;
      } else if (row.type == "route") {
        list = that.routeList;
      } else {
      }
      for (let i = 0; i < list.length; i++) {
        if (list[i].objId == objId) {
          list.splice(i, 1);
        }
      }
      drawTool.removeByObjId(objId);
    },

    drawFence() {
      let that = this;
      drawTool.start({
        type: "polygon",
        style: {
          color: "#0000ff",
          outline: true,
          outlineColor: "#ff0000",
          heightReference: 1,
        },
        success: function (entObj) {
          that.polygonList.push({
            objId: entObj.objId,
            name: "未命名区域",
            type: "fence",
          });
        },
      });
    },
    drawPoint() {
      let that = this;
      drawTool.start({
        type: "billboard",
        style: {
          image: "./easy3d/images/plot/start.png",
        },
        success: function (entObj) {
          that.pointList.push({
            objId: entObj.objId,
            name: "未命名点位",
            type: "point",
          });
        },
      });
    },
    drawExit() {
      let that = this;
      drawTool.start({
        type: "polyline",
        style: {
          clampToGround: true,
          color: "#ffff00",
        },
        success: function (entObj) {
          that.exitList.push({
            objId: entObj.objId,
            name: "未命名出口",
            type: "exit",
          });
        },
      });
    },
    drawEntrance() {
      let that = this;
      drawTool.start({
        type: "polyline",
        style: {
          clampToGround: true,
          color: "#ffff00",
        },
        success: function (entObj) {
          that.entranceList.push({
            objId: entObj.objId,
            name: "未命名入口",
            type: "entrance",
          });
        },
      });
    },
    drawRoute() {
      let that = this;
      drawTool.start({
        type: "polyline",
        style: {
          clampToGround: true,
          color: "#0EFCDC",
          animateType: "flowline",
          duration: 1000,
          image: "./easy3d/images/texture/glow.png",
        },
        success: function (entObj) {
          that.entranceList.push({
            objId: entObj.objId,
            name: "未命名轨迹",
            type: "route",
          });
        },
      });
    },
    exportData() {},
  },
};
</script>

<style lang="less">
.yjgl-bar .draw-btn {
  padding: 10px;
  margin: 10px 0px;
  border: 1px solid;
  display: block;
  width: 60px;
  border-radius: 4px;
}
.operate {
  display: flex;
  justify-content: flex-end;
  span {
    margin: 10px;
  }
}
</style>