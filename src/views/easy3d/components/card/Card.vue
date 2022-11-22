<template>
  <vue-drag-resize
    id="easy3d-drag"
    ref="drag"
    class="easy3d-card basic-card"
    dragHandle=".card-title"
    :sticks="['br']"
    :isActive="true"
    :w="size.width"
    :h="size.height"
    :x="position.left"
    :y="position.top"
    :parentLimitation="true"
    :parentW="1910"
    :parentH="930"
    @resizing="onResizing"
    @resizestop="onResizstop"
    @dragging="onDragging"
    @dragstop="onDragstop"
    @clicked="onActivated"
    @deactivated="onDeactivated"
  >
    <!-- 头部 -->
    <div class="card-title">
      <div class="card-title-info">
        <i :class="['iconfont', iconfont]"></i>
        <p>{{ title }}</p>
      </div>
      <span class="iconfont icon-danchuangguanbi" @click="close"></span>
    </div>
    <div class="card-content">
      <!-- 插槽 -->
      <slot></slot>
    </div>
    <div class="card-footter"></div>
  </vue-drag-resize>
</template>
<script>
// 弹出层插件
export default {
  // 弹层属性
  props: {
    // 名称
    title: "",
    iconfont: {
      type: String,
      default: "",
    },
    // 面板位置
    position: {
      type: Object,
      default() {
        return {
          left: 100,
          top: 100,
        };
      },
    },
    // 面板尺寸
    size: {
      type: Object,
      default() {
        return {
          width: 400,
          height: 600,
        };
      },
    },
  },

  data() {
    return {
      parentWidth: 0,
      parentHeight: 0,
    };
  },
  created() {
    const mapdom = document.getElementById(window.viewer.container.id);
    const maph = mapdom.clientHeight;
    const mapw = mapdom.clientWidth;
    if (this.position.bottom) {
      this.position.top = maph - this.size.height - this.position.bottom;
    }
    if (this.position.right) {
      this.position.left = mapw - this.size.width - this.position.right;
    }
  },

  mounted() {
    this.$nextTick(() => {
      let drag = this.$refs.drag;
      let parentWidth = drag.parentElement.clientWidth;
      let parentHeight = drag.parentElement.clientHeight;
      this.$set(this, "parentWidth", parentWidth - 5);
      this.$set(this, "parentHeight", parentHeight - 5);

      // ============= 传入参数和拖拽组件的相互转化 =============
      /* if (this.size.width) this.width = this.size.width;
      if (this.size.height) this.height = this.size.height;
      if (this.position.left) this.offset.x = this.position.left;
      if (this.position.top) this.offset.y = this.position.top;
      if (this.position.right) {
        this.offset.x = parentWidth - this.width - this.position.right;
      }
      if (this.position.bottom) {
        this.offset.y = parentHeight - this.height - this.position.bottom;
      } */
    });
  },

  methods: {
    /**
     * 拖拽
     * @param {Number} params.left
     * @param {Number} params.top
     * @param {Number} params.width
     * @param {Number} params.height
     */
    onDragging(params) {},

    /**
     * 拖拽结束
     * @param {Number} params.left
     * @param {Number} params.top
     * @param {Number} params.width
     * @param {Number} params.height
     */
    onDragstop(params) {},

    /**
     * 放大
     * @param {Number} params.left
     * @param {Number} params.top
     * @param {Number} params.width
     * @param {Number} params.height
     */
    onResizing(params) {},

    /**
     * 放大结束
     * @param {Number} params.left
     * @param {Number} params.top
     * @param {Number} params.width
     * @param {Number} params.height
     */
    onResizstop(params) {},

    /**
     * 单击面板
     */
    onActivated() {},

    /**
     * 单击其他地方
     */
    onDeactivated() {},
    /**
     * 关闭 向上抛出
     */
    close() {
      this.$emit("close", true);
    },
  },
};
</script>

<style lang="less">
.easy3d-card {
  position: absolute;
  z-index: 999 !important;
}
.card-title {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 0 15px;
  cursor: pointer;
  .card-title-info {
    height: 100%;
    display: flex;
    align-items: center;
    overflow: hidden;
    i {
      font-size: 18px;
    }
    p {
      margin-left: 10px;
    }
  }
}
.card-content {
  position: relative;
  height: calc(100% - 44px);
  box-sizing: border-box;
  padding: 10px 20px;
  overflow: auto;
}
</style>
