<template>
  <div class="sidebar-box">
    <ul class="basic-sidebar operate-btn">
      <el-tooltip v-for="(item, index) in basicReset" :key="index" class="item" effect="dark" :content="item.name"
        placement="left">
        <li :class="['iconfont', item.icon]" @click="opentoolName(item)"></li>
      </el-tooltip>
    </ul>

    <ul class="basic-sidebar operate-btn map-operate-btn">
      <el-tooltip v-for="(item, index) in mapLayer" :key="index" class="item" effect="dark" :content="item.name"
        placement="left">
        <li :class="['iconfont', item.icon]" @click="opentoolName(item)"></li>
      </el-tooltip>
    </ul>

    <ul class="basic-sidebar operate-btn">
      <el-tooltip v-for="(item, index) in mapOperate" :key="index" class="item" effect="dark" :content="item.name"
        placement="left">
        <li :class="['iconfont', item.icon]" @click="opentoolName(item)"></li>
      </el-tooltip>
    </ul>
  </div>
</template>

<script>
import screenfull from "screenfull";
import html2canvas from "html2canvas";
import printJS from "print-js";
export default {
  name: "sidebar",

  data() {
    return {
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
      ], // 基础设置

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
          icon: "icon-tushangcehui",
          type: "",
          name: "图上标绘",
          toolName: "plot",
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
          icon: "icon-youlan",
          type: "",
          name: "飞行漫游",
          toolName: "roam",
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
          toolName: "twoScreen",
          name: "分屏对比",
        },
        {
          icon: "icon-juanlianduibi",
          toolName: "layerSplit",
          name: "卷帘对比",
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

    // 打开某个工具
    opentoolName(item) {
      if (item.toolName)
        this.$store.commit("setOperateTool", {
          toolName: item.toolName,
          openState: true,
        });

      if (item.type == "scaleBig") {
        this.$store.commit("setIsZoomIn", true);
      }

      if (item.type == "scaleSmall") {
        this.$store.commit("setIsZoomOut", true);
      }

      if (item.type == "update") {
        window.location.reload();
      }
      // 全屏
      if (item.type === "fullScreen") {
        this.screen();
      }

      // 鹰眼图
      if (item.type === "overviewMap") {
        this.isOpenOverviewMap = !this.isOpenOverviewMap;
        this.$store.commit("setIsOpenOverviewMap", this.isOpenOverviewMap);
      }

      if (item.type === "print") {
        this.printMap();
      }
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