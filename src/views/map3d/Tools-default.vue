<template>
  <div>
    <!-- 地图侧边工具栏按钮 -->
    <div class="sidebar-box" v-show="isshowPanel">
      <ul class="basic-sidebar operate-btn">
        <el-tooltip v-for="(item, index) in basicReset" :key="index" class="item" effect="dark" :content="item.name"
          placement="left">
          <li :class="['iconfont', item.icon]" @click="open(item)"></li>
        </el-tooltip>
      </ul>

      <ul class="basic-sidebar operate-btn map-operate-btn">
        <el-tooltip v-for="(item, index) in mapLayer" :key="index" class="item" effect="dark" :content="item.name"
          placement="left">
          <li :class="['iconfont', item.icon]" @click="open(item)"></li>
        </el-tooltip>
      </ul>

      <ul class="basic-sidebar operate-btn">
        <el-tooltip v-for="(item, index) in mapOperate" :key="index" class="item" effect="dark" :content="item.name"
          placement="left">
          <li :class="['iconfont', item.icon]" @click="open(item)"></li>
        </el-tooltip>
      </ul>
    </div>

    <!-- 动态创建地图组件 -->
    <div v-for="(item, index) in mapComphonets" :key="index">
      <component :ref="item.toolName" :is="item.module" v-if="item.show" v-show="item.domShow" :title="item.title"
        @fire="fire" :position="item.position" :size="item.size" :attr="item.attr" :iconfont="item.iconfont"
        @close="close(item)">
      </component>
    </div>
  </div>
</template>

<script>
/* 地图侧边工具栏 */
import screenfull from "screenfull";
import html2canvas from "html2canvas";
import printJS from "print-js";
import workConfig from "./config/workConfig"
/* 模块控制器 */
import workControl from "./config/toolControl";
window.workControl = workControl; // 绑定到全局
let zoomTool = undefined; // 缩放工具
let overviewMap = undefined; // 鹰眼图
export default {
  name: "tools",
  data() {
    return {
      isshowPanel: true, // 是否显示操作按钮 
      mapComphonets: [],
      basicReset: [
        {
          icon: "icon-zuichu",
          type: "update",
          name: "刷新",
        },
        {
          icon: "icon-fangda",
          type: "scaleBig",
          name: "放大",
        },
        {
          icon: "icon-suoxiao",
          type: "scaleSmall",
          name: "缩小",
        },
        {
          icon: "icon-quanping",
          type: "fullScreen",
          name: "全屏",
        },
        {
          icon: "icon-bangzhushuoming",
          type: "help",
          name: "帮助说明",
          toolName: "help",
        },
      ],
      mapLayer: [
        {
          icon: "icon-ditufuwu",
          type: "baseMap",
          name: "底图",
          toolName: "baseMap",
        },
        {
          icon: "icon-cengshu",
          type: "layers",
          name: "图层",
          toolName: "layers",
        },
      ],
      mapOperate: [
        {
          icon: "icon-logozhanweibiao",
          type: "",
          name: "自定义面板",
          toolName: "custom",
        },
        {
          icon: "icon-tushangcehui",
          type: "",
          name: "图上标绘",
          toolName: "plot",
        },
        {
          icon: "icon-tushangliangsuan",
          type: "measure",
          name: "图上量算",
          toolName: "measure",
        },
        {
          icon: "icon-fenxikongjian",
          type: "",
          name: "空间分析",
          toolName: "analysis",
        },
        {
          icon: "icon-youlan",
          type: "",
          name: "飞行漫游",
          toolName: "roam",
        },
        {
          icon: "icon-zuobiaodingwei",
          type: "",
          name: "坐标定位",
          toolName: "coordinate",
        },
        {
          icon: "icon-diqudaohang",
          type: "",
          name: "地区导航",
          toolName: "region",
        },
        {
          icon: "icon-dianyingmulu",
          type: "",
          name: "视角书签",
          toolName: "viewBook",
        },
        /*   {
          icon: "icon-wodebiaoji",
          type: "",
          name: "我的标记",
        }, */
        {
          icon: "icon-xianludaohang",
          type: "",
          name: "线路导航",
          toolName: "pathPlan",
        },
        {
          icon: "icon-getihuabianji",
          type: "",
          name: "单体化编辑",
          toolName: "monomer",
        },
        {
          icon: "icon-fenpingduibi",
          type: "",
          name: "分屏对比",
          toolName: "twoScreen",
        },
        {
          icon: "icon-juanlianduibi",
          name: "卷帘对比",
          toolName: "layerSplit",
        },
        {
          icon: "icon-ditushuchu",
          type: "print",
          name: "地图输出",
        },
        {
          icon: "icon-yingyan",
          type: "overviewMap",
          name: "鹰眼图",
        },

        // {
        //   icon: "icon-ersanweiliandong",
        //   type: "",
        //   name: "二三维联动",
        // },
      ],
      isFullScreen: false, // 是否全屏
      isHelp: false,
      isOpenOverviewMap: false,
    };
  },

  mounted() {
    // 初始化各工具组件
    workControl.init(workConfig, (list) => {
      this.mapComphonets = list;
    });
  },

  methods: {

    // 打开具体工具模块
    open(item) {
      if (item.toolName) {
        workControl.openToolByName(item.toolName)
      }

      if (item.type == "scaleBig") { // 放大
        if (!zoomTool) zoomTool = new window.vis3d.common.ZoomTool(window.viewer);
        zoomTool.forward();
      }

      if (item.type == "scaleSmall") { // 缩小
        if (!zoomTool) zoomTool = new window.vis3d.common.ZoomTool(window.viewer);
        zoomTool.backward();
      }

      if (item.type == "update") { // 页面刷新
        window.location.reload();
      }

      if (item.type === "fullScreen") {  // 全屏
        this.screen();
      }

      if (item.type === "overviewMap") { // 鹰眼图
        this.isOpenOverviewMap = !this.isOpenOverviewMap;
        if (this.isOpenOverviewMap && !overviewMap) {
          overviewMap = new window.vis3d.common.OverviewMap(window.viewer);
        } else {
          overviewMap.destroy();
          overviewMap = undefined;
        }
      }

      if (item.type === "print") { // 地图打印
        this.printMap();
      }
    },
    close(item) {
      workControl.closeToolByName(item.toolName);
    },

    /**
     * 全屏
     */
    screen() {
      // 如果不允许进入全屏，发出不允许提示
      if (!screenfull.enabled) {
        this.$message("您的浏览器不能全屏");
        return false;
      }
      this.$set(this, "isFullScreen", !this.isFullScreen);

      let tempList = this.basicReset.map((item) => {
        let temp = {};
        if (item.type === "fullScreen") {
          temp = Object.assign({}, item, {
            name: this.isFullScreen ? "还原" : "全屏",
            icon: this.isFullScreen ? "icon-quanjusuoxiao" : "icon-quanping",
          });
        } else {
          temp = item;
        }
        return temp;
      });

      this.$set(this, "basicReset", tempList);

      screenfull.toggle();
    },


    /**
     * 地图打印
     */
    printMap() {
      window.viewer.scene.render();
      let container = document.getElementById(window.viewer._container.id);
      html2canvas(container, {
        backgroundColor: null,
        useCORS: true,
        windowHeight: document.body.scrollHeight,
      }).then((canvas) => {
        const url = canvas.toDataURL();
        printJS({
          printable: url,
          type: "image",
          documentTitle: "地图输出",
        });
      });
    },

    /**
     * 触发组件的方法
     * @param {Object} opt 
     */ 
    fire(opt) {
      let { toolName, methond, arg } = opt
      if (!this.$refs[toolName] || !this.$refs[toolName][0]) return;
      this.$refs[toolName][0][methond](arg);
    }

  },
};
</script>

<style lang="less" scoped>
.basic-sidebar {
  background-color: var(--cardHeadColor);
}

.basic-sidebar li {
  box-shadow: 0px 2px 16px rgba(37, 38, 49, 0.6);
}

.basic-sidebar li:hover {
  background: var(--toolsMouseoverColor);
  color: #ffffff;
}

.sidebar-box {
  position: absolute;
  right: 38px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .operate-btn {
    width: 100%;

    li {
      color: #bdc2d0;
      width: 100%;
      height: 32px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      cursor: pointer;
    }
  }

  .map-operate-btn {
    margin: 32px 0;
  }
}
</style>