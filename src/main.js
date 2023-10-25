import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

// ============= 加密后 =================
// 正式环境
import "@/lib/vis3d-min/vis3d.css"
import vis3d from "@/lib/vis3d-min/vis3d.min.js"
// 测试环境
/* import vis3d from "@/lib/vis3d/vis3d.export.js" */
Vue.prototype.vis3d = window.vis3d = vis3d;
import '@/assets/font/iconfont.css'
// 定义面板主题样式
Vue.prototype.toolStyle = {
  themeType: "green", // 主题样式颜色 dark（暗色）、blue（科技蓝）、green（生态绿）
  toolType: 'default' // 右侧工具条类型 default（条状工具条）
}

// 拖拽组件注册
import VueDragResize from 'vue-drag-resize'
Vue.component('vue-drag-resize', VueDragResize)

// 区域组件
import vRegion from 'v-region'
Vue.use(vRegion)

// 打印
import Print from 'vue-print-nb'
Vue.use(Print);

import Card from "@/views/map3d/components/card/Card.vue";
Vue.component("Card", Card);

Vue.config.productionTip = false

import axios from 'axios'
Vue.prototype.axios = axios

Vue.use(ElementUI);

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
