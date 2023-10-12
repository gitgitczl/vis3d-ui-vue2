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

    <!-- 引入地图组件 -->
    <div v-for="(item, index) in mapComphonets" :key="index">
      <component :is="item.module" v-if="item.show" v-show="item.domShow" :title="item.name" :position="item.position"
        :size="item.size" :attr="item.attr" :iconfont="item.iconfont" @close="close(item)" />
    </div>
  </div>
</template>

<script>
/* 地图侧边工具栏 */
import screenfull from "screenfull";
import html2canvas from "html2canvas";
import printJS from "print-js";
import { workConfig } from "../map3d/config/export"
/* 模块控制器 */
import workControl from "./workControl.js";
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
          workName: "help",
        },
      ],
      mapLayer: [
        {
          icon: "icon-ditufuwu",
          type: "baseMap",
          name: "底图",
          workName: "baseMap",
        },
        {
          icon: "icon-cengshu",
          type: "layers",
          name: "图层",
          workName: "layers",
        },
      ],
      mapOperate: [
        {
          icon: "icon-tushangliangsuan",
          type: "measure",
          name: "图上量算",
          workName: "measure",
        },
        {
          icon: "icon-fenxikongjian",
          type: "",
          name: "空间分析",
          workName: "analysis",
        },
        {
          icon: "icon-zuobiaodingwei",
          type: "",
          name: "坐标定位",
          workName: "coordinate",
        },
        {
          icon: "icon-diqudaohang",
          type: "",
          name: "地区导航",
          workName: "region",
        },
        {
          icon: "icon-tushangcehui",
          type: "",
          name: "图上标绘",
          workName: "plot",
        },
        {
          icon: "icon-dianyingmulu",
          type: "",
          name: "视角书签",
          workName: "viewBook",
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
          workName: "pathPlan",
        },
        {
          icon: "icon-youlan",
          type: "",
          name: "飞行漫游",
          workName: "roam",
        },
        {
          icon: "icon-getihuabianji",
          type: "",
          name: "单体化编辑",
          workName: "monomer",
        },
        {
          icon: "icon-fenpingduibi",
          type: "",
          name: "分屏对比",
          workName: "twoScreen",
        },
        {
          icon: "icon-juanlianduibi",
          name: "卷帘对比",
          workName: "layerSplit",
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

    // 打开具体工具模块
    open(item) {
      if (item.workName) {
        workControl.openToolByName(item.workName)
      }

      if (item.type == "scaleBig") { // 放大
        if (!zoomTool) zoomTool = new this.vis3d.gadgets.ZoomTool(window.viewer);
        zoomTool.forward();
      }

      if (item.type == "scaleSmall") { // 缩小
        if (!zoomTool) zoomTool = new this.vis3d.gadgets.ZoomTool(window.viewer);
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
          overviewMap = new this.vis3d.common.OverviewMap(window.viewer);
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
      workControl.closeToolByName(item.workName);
    },


    // 地图打印
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

  },
};
</script>

<style lang="less" scoped>
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
    li {
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

/* .basic-dialog{
  z-index: 999;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50% -50%);
} */
</style>