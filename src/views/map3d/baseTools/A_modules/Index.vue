<template>
  <Card
    :title="title"
    :position="position"
    :size="size"
    height="auto"
    iconfont="icon-tushangcehui"
    @close="close"
  >
  </Card>
</template>
<script>

export default {
  name: "Map3dPlatformIndex",
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

  methods: {},
};
</script>