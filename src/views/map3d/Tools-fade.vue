<template>
	<div class="tools-fade" :style="{right: isshowPanel ? '0' : '-268px'}">
		<span :class="[isshowPanel ? 'el-icon-close' : 'el-icon-arrow-left', 'open-close-icon']" @click="onOpenTool"></span>
		<div class="tools-icon-box">
			<div class="layer-base-icon">
				<el-tooltip effect="dark" content="底图" placement="top">
					<span class="iconfont icon-ditufuwu"></span>
				</el-tooltip>
			</div>
			<div class="layer-base-icon">
				<el-tooltip effect="dark" content="图层" placement="top">
					<span class="iconfont icon-cengshu"></span>
				</el-tooltip>
			</div>
			<div class="layer-base-icon" v-for="(item, index) in mapOperate" :key="index">
				<el-tooltip effect="dark" :content="item.name" placement="top">
					<span :class="['iconfont', item.icon]"></span>
				</el-tooltip>
			</div>
		</div>
	</div>
</template>
<script>
/* 工具栏风格三 淡入淡出 */
import { workConfig } from "../map3d/config/export"
/* 模块控制器 */
import workControl from "./workControl.js";
window.workControl = workControl; // 绑定到全局

export default {
	name: "tools-fade",
	data() {
		return {
			isshowPanel: false, // 是否显示操作按钮 
			mapComphonets: [],
			mapOperate: [
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
				}
			]
		}
	},
	mounted() {
		// 初始化各工具组件
		// workControl.init(workConfig, (list) => {
		//     this.mapComphonets = list;
		// });
	},
	methods: {
		/**
		 * 打开工具条
		 * @param {*} item 
		 */
		onOpenTool() { 
			this.$set(this, 'isshowPanel', !this.isshowPanel)
		},

		// 打开具体工具模块
		open(item) {
			if (item.toolName) {
				workControl.openToolByName(item.toolName)
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
			workControl.closeToolByName(item.toolName);
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

		// 触发组件的方法
		fire(opt) {
			let { toolName, methond, arg } = opt
			if (!this.$refs[toolName] || !this.$refs[toolName][0]) return;
			this.$refs[toolName][0][methond](arg);
		}
	}
}
</script>

<style lang="less" scoped>
.tools-fade {
	position: absolute;
	right: -268px;
	bottom: 60px;
	z-index: 100;
	width: 300px;
	height: 100px;
	display: flex;
	align-items: center;
	transition: right 0.5s;
}

.open-close-icon {
	width: 32px;
	height: 32px;
	border-radius: 50% 0 0 50%;
	background: var(--cardHeadColor);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 14px;
	color: #bdc2d0;
	cursor: pointer;
}

.tools-icon-box {
	width: calc(100% - 32px);
	height: 64px;
	display: flex;
	flex-wrap: wrap;
	background: var(--cardHeadColor);
}

.layer-base-icon {
	width: 32px;
	height: 32px;
	color: #bdc2d0;
	border-right: 1px solid rgba(189, 194, 208, 0.4);
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;

	&:hover {
		background: var(--toolsMouseoverColor);
	}
}
</style>