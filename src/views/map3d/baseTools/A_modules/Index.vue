<template>
  <Card
    :title="title"
    :position="position"
    :size="size"
    height="auto"
    iconfont="icon-tushangcehui"
    @close="close"
  >
  <div style="color: red;font-weight: bold;font-size: 24px;"> vis3d-ui-vue2,自定义工具面板! </div>
  </Card>
</template>
<script>

export default {
  name: "modules", // 此处必须设置
  components: {
    
  },
  props: {
    size: {},
    position: {},
    title: "",
  },
  data() {
    return {};
  },

  mounted() {},

  methods: {
    close() {
      window.workControl.closeToolByName(this.$options.name)
    },
  },
};
</script>