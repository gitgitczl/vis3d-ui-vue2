<template>
  <Card @close="close" :title="title" :size="size" :position="position" :iconfont="iconfont">
    <div class="add-box basic-search">
      <el-input v-model="viewerTitle" placeholder="请输入名称"></el-input>
      <span class="btn" @click="onAddViewer">添加</span>
    </div>
    <ul class="viewer-list">
      <li v-for="(item, index) in viewerList" :key="index" @click="setCameraView(item)">
        <img :src="item.imgSrc" />
        <div class="viewer-info">
          <p>{{ item.name }}</p>
          <span class="el-icon-delete" @click="onDeleteViewer(index)"></span>
        </div>
      </li>
    </ul>
  </Card>
</template>

<script>

export default {
  name: "viewBook",

  props: {
    position: {},
    size: {},
    iconfont: {
      type: String,
      default: "icon-dianyingmulu",
    },
  },

  components: {

  },

  data() {
    return {
      viewerTitle: "",
      viewerList: [],
    };
  },

  methods: {
    close() {
      window.workControl.closeToolByName("viewBook");
    },

    /**
     * 添加视角书签
     */
    onAddViewer() {
      if (!this.viewerTitle) {
        this.$message.error("请输入名称！");
        return;
      }

      if (this.viewerList.some((item) => item.name === this.viewerTitle)) {
        this.$message.error("名称不可重复！");
        return;
      }

      window.viewer.scene.render();
      let view = this.vis3d.util.getCameraView(window.viewer);
      this.viewerList.unshift({
        name: this.viewerTitle,
        imgSrc: window.viewer.canvas.toDataURL("image/png"),
        view: view,
      });

      this.$set(this, "viewerTitle", "");
    },

    /**
     * 删除
     * @param {Number} index
     */
    onDeleteViewer(index) {
      this.viewerList.shift(index);
    },
    setCameraView(attr) {
      if (!attr || !attr.view) return;
      this.vis3d.util.setCameraView(attr.view);
    },
  },
};
</script>

<style lang="less">
.basic-search .btn {
  background-color: #1c9ed5;
}

.add-box {
  display: flex;
  align-items: center;

  .btn {
    width: 80px;
    height: 40px;
    border-radius: 5px;
    cursor: pointer;
    margin-left: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.viewer-list {
  height: calc(100% - 50px);
  margin-top: 10px;
  overflow-x: hidden;
  overflow-y: auto;

  li {
    position: relative;
    height: 200px;
    display: flex;
    margin: 10px 0;

    img {
      object-fit: cover;
    }

    .viewer-info {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      background: rgba(0, 0, 0, 0.5);
      padding: 0 20px;
      color: #ffffff;

      span {
        cursor: pointer;
      }
    }
  }
}
</style>
