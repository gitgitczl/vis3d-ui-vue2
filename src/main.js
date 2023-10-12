import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

/* import less from 'less' */
// ============= 加密后 =================
import "@/lib/vis3d-min/vis3d.css"
import vis3d from "@/lib/vis3d-min/vis3d.min.js"
Vue.prototype.vis3d = window.vis3d = vis3d;
Vue.prototype.easy3d = window.easy3d = vis3d;
import '@/assets/font/iconfont.css'
// 本地加密类库
import store from './store';
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
  store,
  render: h => h(App),
}).$mount('#app')
