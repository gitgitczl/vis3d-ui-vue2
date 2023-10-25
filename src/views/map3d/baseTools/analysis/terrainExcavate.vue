<template>
  <div>
    <p class="basic-tooltip">提示：模拟设定时间范围内的太阳光效果</p>
    <div class="analysis-btn analysis-top-btn basic-analysis-btn">
      <span>绘制区域</span>
      <span class="basic-analysis-btn-clear">清除</span>
    </div>
    <ul class="terrainExcavate-body basic-number">
      <li>
        <label>开挖深度：</label>
        <el-input-number :controls="false" v-model="height" placeholder="请输入内容"></el-input-number>
        <span>米</span>
      </li>
    </ul>
    <div class="analysis-btn basic-analysis-btn basic-terrainExcavate-btn">
      <span>添加矩形</span>
      <span>添加多边形</span>
    </div>
  </div>
</template>

<script>
/* 地形开挖 */
export default {
  name: "TerrainExcavate",

  data() {
    return {
      height: 0
    };
  },

  mounted() { },

  destroyed() { },

  methods: {},
};
</script>

<style lang="less">
.terrainExcavate-body {
  margin-top: 15px;

  li {
    display: flex;
    align-items: center;

    .el-input-number {
      margin: 0 10px;
    }
  }
}

.basic-terrainExcavate-btn span:nth-child(1) {
  border-color: #1c9ed5;
  background: rgba(28, 158, 213, 0.2);
}

.basic-terrainExcavate-btn span:nth-child(2) {
  border-color: #1c9ed5;
  background: #1c9ed5;
}
</style>