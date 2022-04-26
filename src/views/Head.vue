<template>
  <div class="basic-head head-box">
    <!-- logo -->
    <div class="logo-box">
      <span><img :src="logoBg" /></span>
      <p>三维全息展示平台</p>
    </div>
    <div class="head-nav"></div>
    <!-- 设置、用户名 -->
    <div class="head-right">
      <div class="head-right-info" @click.stop="onOpenReset">
        <i class="iconfont icon-shezhi"></i>
        <label>设置</label>
        <span class="iconfont icon-xiala"></span>
      </div>
      <div class="head-right-info">
        <i class="iconfont"></i>
        <label>用户名</label>
        <span class="iconfont icon-xiala"></span>
      </div>
    </div>
    <!-- 设置 -->
    <ul class="head-reset" v-show="isReset">
      <li v-for="(item, index) in buttonList" :key="index">
        <div class="head-reset-title">
          <i :class="['iconfont', item.icon]"></i>
          <label>{{ item.name }}</label>
        </div>
        <el-switch v-model="item.isOpen" @change="openTool(item)"></el-switch>
      </li>
    </ul>
  </div>
</template>

<script>
import logoBg from "@/assets/images/logo.png";
export default {
  name: "Head",

  data() {
    return {
      logoBg,
      buttonList: [
        {
          name: "一键关闭",
          icon: "icon-yijianguanbi",
          isOpen: false,
        },
        {
          name: "POI搜索",
          icon: "icon-poisousuo",
          isOpen: false,
        },
        {
          name: "工具栏",
          icon: "icon-gongjulan",
          isOpen: true,
        },
        {
          name: "导航器",
          icon: "icon-daohangqi",
          isOpen: false,
        },
        {
          name: "快捷按钮",
          icon: "icon-kuaijieanniu",
          isOpen: false,
        },
        {
          name: "尺码",
          icon: "icon-chima",
          isOpen: false,
        },
        {
          name: "经纬度",
          icon: "icon-jingweidu",
          isOpen: true,
        },
      ],
      isReset: false, // 打开设置面板
    };
  },

  mounted() {},

  methods: {
    /**
     * 打开设置面板
     */
    onOpenReset() {
      this.$set(this, "isReset", !this.isReset);
    },
    openTool(attr) {

      if(attr.name === '工具栏') {
        this.$store.commit('SET_ISTOOLOPEN', attr.isOpen)
      }


      if (attr.name == "经纬度") {
        this.$store.commit("setOpenBottomLnglatTool", attr.isOpen);
      }
    },
  },
};
</script>

<style lang="less" scoped>
.head-box {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 999;
  width: 100%;
  height: 56px;
}

.logo-box {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  span {
    width: 20px;
    height: 20px;
    display: flex;
    img {
      object-fit: cover;
    }
  }
  p {
    font-size: 16px;
    font-weight: bold;
    color: #1c9ed5;
    margin-left: 10px;
  }
}

.head-nav {
  position: absolute;
  left: 40%;
  top: 50%;
  transform: translateY(-50%);
}

.head-right {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  .head-right-info {
    display: flex;
    align-items: center;
    margin-right: 30px;
    cursor: pointer;
    label {
      margin: 0 8px;
      cursor: pointer;
    }
    &:last-child {
      margin-right: 0;
    }
  }
}

.head-reset {
  position: absolute;
  right: 20px;
  top: 56px;
  z-index: 9999;
  width: 220px;
  box-sizing: border-box;
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  li {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 0 15px;
    &:nth-child(2n - 1) {
      background: #2a303c;
    }
    .head-reset-title {
      display: flex;
      align-items: center;
    }
  }
}
</style>