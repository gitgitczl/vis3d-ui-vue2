<template>
  <div>
        <ul class="slope-toolip">
          <li>提示：</li>
          <li>1.cesium接口，部分情况下依赖正确的接口</li>
          <li>2.目标点如果在观察位置坡面的背面方向，会出现不准确的现象 </li>
          <li>3.红色表示不可见，表示有外观</li>
        </ul>

        <div class="analysis-btn analysis-top-btn basic-analysis-btn">
          <span>圆形通视分析</span>
          <span>单线通视分析</span>
          <span class="basic-analysis-btn-clear">清除</span>
        </div>
    </div>
</template>

<script>
/* 通视分析 */
export default {
  name: "Insight",
  data() {
    return {};
  },
  mounted() {},
  destroyed() {},
  methods: {
    
  },
};
</script>