<template>
  <div id="app" ref="app">
    <Head />
    <Map />
    <div class="basic-dialog">
      <el-dialog
        title="帮助说明"
        :visible.sync="isHelp"
        width="300px"
        :close-on-click-modal="false"
        @close="isHelp = false">
        <p>1、点击鼠标左键不放可进行地图平移。</p>
        <p>2、点击右键不放，向左进行地图放大，向右进行地图缩小。</p>
        <p>3、点击滚轮不放，旋转鼠标可进行视角旋转。</p>
        <p>4、ctrl+鼠标左键可进行视角旋转。</p>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import html2canvas from 'html2canvas'
import printJS from 'print-js'
import Head from '@/views/Head.vue'
import Map from '@/views/easy3d/index.vue'
export default {
  name: 'App',
  components: {
    Map,
    Head,
  },

  data() {
    return {
      cssStyle: 'basic',
      dialogName: '',
      isHelp: false // 帮助说明
    }
  },

  computed: {
    isToolOpen() {
      return this.$store.state.map3d.isToolOpen
    }
  },

  mounted() {
    
  },

  methods: {
    /**
     * 打开帮助说明
     */
    onOpenHelp() {
      // debugger
      this.$set(this, 'isHelp', true)
    },

    /**
     * 地图输出
     */
    onPrintMap() {
      window.viewer.scene.render()
      html2canvas(this.$refs.app, {
        backgroundColor: null,
        useCORS: true,
        windowHeight: document.body.scrollHeight
      }).then((canvas) => {
        const url = canvas.toDataURL()
        this.img = url
        printJS({
          printable: url,
          type: 'image',
          documentTitle: '地图输出'
        })
      })
    }
  }
}
</script>

<style>
#app {
  width: 100vw;
  height: 100vh;
  padding: 0;
}
</style>
