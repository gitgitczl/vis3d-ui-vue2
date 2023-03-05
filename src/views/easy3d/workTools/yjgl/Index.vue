<template>
  <div>
    <!-- 第一步 绘制多边形范围-->
    <div v-show="[step == 0]">
      <span @click="drawPolygon">绘制范围</span>
      <el-table :data="polygonList" style="width: 100%">
        <el-table-column prop="index" label="序号" width="60">
        </el-table-column>
        <el-table-column prop="name" label="名称" width="60"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <span
              title="删除"
              class="el-icon-delete operate-btn-icon"
              @click="roamDelete(scope.row)"
            ></span
          ></template>
        </el-table-column>
      </el-table>
      <span @click="clearPolygon">清除</span>
    </div>
    <!-- 第二步 绘制交警位置 并标记名称-->
    <div v-show="[step == 1]">
      <span @click="drawPoint">标识点位</span>
      <span @click="clearPoint">清除</span>
    </div>
    <!-- 第三步 标记出口箭头 -->
    <div v-show="[step == 2]">
      <span @click="drawExit">出口箭头</span>
      <span @click="clearExit">清除</span>
    </div>
    <!-- 第四步 标记入口箭头 -->
    <div v-show="[step == 3]">
      <span @click="drawEntrance">入口箭头</span>
      <span @click="clearEntrance">清除</span>
    </div>
    <!-- 绘制作业路线 -->
    <div v-show="[step == 4]">
      <span @click="drawPolyline">绘制路线</span>
      <span @click="clearPolyline">清除</span>
    </div>
    <!-- 导出数据 -->
    <div v-show="[step == 5]">
      <span @click="exportData">导出数据</span>
    </div>

    <!-- 分割线 -->
    <div></div>
    <div>
      <span v-show="isNext" @click="goNext">下一步</span>
      <span v-show="isLast" @click="goLast">上一步</span>
    </div>
  </div>
</template>
<script>
let polygons = [];
let points = [];
let exits = [];
let entrances = [];
let polylines = [];
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
  mounted() {},
  destroyed() {},
  methods: {
    goNext() {
      if (this.step == 0) {
        if (polygons.length < 1) {
          this.$message("请绘制至少一个范围！");
          return;
        }
      }
      if (this.step == 1) {
        if (points.length < 1) {
          this.$message("请绘制至少一个点位！");
          return;
        }
      }
      if (this.step == 2) {
        if (exits.length < 1) {
          this.$message("请绘制至少一个出口！");
          return;
        }
      }
      if (this.step == 3) {
        if (entrances.length < 1) {
          this.$message("请绘制至少一个入口！");
          return;
        }
      }
      if (this.step == 4) {
        if (polylines.length < 1) {
          this.$message("请绘制至少一条线路！");
          return;
        }
      }

      this.step++;
      if (this.step >= 5) {
        this.step = 5;
        this.isNext = false;
      }
    },
    goLast() {
      this.step--;
      if (this.step <= 0) {
        this.step = 0;
        this.isLast = false;
      }
    },

    drawPolygon() {},
    clearPolygon() {},
  },
};
</script>