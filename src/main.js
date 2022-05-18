import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios'
import less from 'less'
import easy3d from "@/lib/easy3d/easy3d.export.js"
import cUtil from "@/lib/easy3d/cUtil";
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

window.cUtil = cUtil;
var cesium = require('cesium/Cesium.js');
var widgets = require('cesium/Widgets/widgets.css');

Vue.prototype.Cesium = window.Cesium = cesium;
Vue.prototype.easy3d = window.easy3d = easy3d;

Vue.prototype.widgets = widgets

Vue.config.productionTip = false
Vue.prototype.axios = axios

Vue.use(ElementUI);
Vue.use(less)

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
