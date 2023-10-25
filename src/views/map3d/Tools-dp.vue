<template>
    <div>
        <!-- 地图侧边工具栏按钮 -->
        <ul class="tool-box" v-show="isshowPanel">
            <li @click="open({ toolName: 'baseMap' })">
                <span class="iconfont icon-ditufuwu tool-icon"></span>
                <p>底图</p>
            </li>
            <li @click="open({ toolName: 'layers' })">
                <span class="iconfont icon-cengshu tool-icon"></span>
                <p>图层</p>
            </li>
            <li class="tool-slide-down">
                <el-dropdown>
                    <span class="el-dropdown-link tool-dropdown">
                        <span class="iconfont icon-gongjulan tool-icon"></span>
                        <p>工具</p>
                        <i class="el-icon-arrow-down el-icon--right"></i>
                    </span>
                    <el-dropdown-menu class="tool-dp-menu" slot="dropdown">
                        <el-dropdown-item v-for="(item, index) in mapOperate" :key="index">
                            <div class="tool-item" @click="open(item)">
                                <span :class="['iconfont', item.icon]"></span>
                                <p>{{ item.name }}</p>
                            </div>
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </li>
        </ul>
        <!-- 动态创建地图组件 -->
        <div v-for="(item, index) in mapComphonets" :key="index">
            <component :ref="item.toolName" :is="item.module" v-if="item.show" v-show="item.domShow" :title="item.name"
                @fire="fire" :position="item.position" :size="item.size" :attr="item.attr" :iconfont="item.iconfont"
                @close="close(item)">
            </component>
        </div>

    </div>
</template>
<script>
/* 工具栏风格二 下拉菜单效果 */
import { workConfig } from "../map3d/config/export"
/* 模块控制器 */
import workControl from "./workControl.js";
window.workControl = workControl; // 绑定到全局

export default {
    name: "tools-dp",
    data() {
        return {
            isshowPanel: true, // 是否显示操作按钮 
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
.tool-box {
    padding: 4px;
    position: absolute;
    right: 20px;
    top: 20px;
    z-index: 100;
    width: 240px;
    height: 30px;
    background-color: var(--cardHeadColor);
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 5px;
    cursor: pointer;

    li {
        width: 33.33%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #bdc2d0;
        box-sizing: border-box;
        border-right: 1px solid rgba(189, 194, 208, 0.4);

        &:last-child {
            border-right: none;
        }

        &:hover {
            /*   background: var(--toolsMouseoverColor); */
        }

        .tool-icon {
            margin-right: 5px;
        }
    }

    .tool-dropdown {
        display: flex;
        align-items: center;
    }
}

.tool-item {
    display: flex;
    align-items: center;

    span {
        margin-right: 5px;
    }
}

.tool-dp-menu {
    background: var(--cardHeadColor) !important;
}

.tool-slide-down {
    .el-dropdown {
        color: var(--fontColor);
    }
}
</style>