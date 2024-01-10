<template>
  <Card
    :title="title"
    :size="size"
    :position="position"
    :iconfont="iconfont"
    @close="close"
  >
    <div class="help-box">
      <p>1、点击鼠标左键不放可进行地图平移。</p>
      <p>2、点击右键不放，向左进行地图放大，向右进行地图缩小。</p>
      <p>3、点击滚轮不放，旋转鼠标可进行视角旋转。</p>
      <p>4、ctrl+鼠标左键可进行视角旋转。</p>
    </div>
  </Card>
</template>

<script>
// 帮助说明

export default {
  name: "help",

  components: {
    
  },

  props: {
    title: "",
    position: {},
    size: {},
    iconfont: {
      type: String,
      default: "icon-bangzhushuoming",
    },
  },

  data() {
    return {};
  },

  methods: {
    close() {
      window.workControl.closeToolByName(this.$options.name)
    },
  },
};
</script>

<style lang="less">
.help-box {
  p {
    margin-bottom: 10px;
  }
}
</style>
