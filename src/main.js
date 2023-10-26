import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);
// ======================== 引入3d平台相关 ========================
// 1、引入字体库
import '@/assets/font/iconfont.css'
// 2、引入核心类库vis3d.js
import "@/lib/vis3d-min/vis3d.css"
import vis3d from "@/lib/vis3d-min/vis3d.min.js"
Vue.prototype.vis3d = window.vis3d = vis3d;
Vue.config.productionTip = false
// 3、全局引入自定义拖拽组件
import Card from "@/views/map3d/components/card/Card.vue";
Vue.component("Card", Card);
// 4、定义【主题样式】
Vue.prototype.toolStyle = {
  themeType: "dark", // 主题样式颜色 dark（暗色）、blue（科技蓝）、green（生态绿）
  toolsType: 'dropdown' // 右侧工具条类型 default（条状工具条） 、dropdown（下拉工具）
}
// 用于【区域定位】
import vRegion from 'v-region'
Vue.use(vRegion)
// 打印
import Print from 'vue-print-nb'
Vue.use(Print);

new Vue({
  render: h => h(App),
}).$mount('#app')
