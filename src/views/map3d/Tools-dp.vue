<template></template>
<script>
/* 工具栏风格二 下拉菜单效果 */
import { workConfig } from "../map3d/config/export"
/* 模块控制器 */
import workControl from "./workControl.js";
export default {
    name: "tools-dp",
    data() {
        return {
            baseMap: {
                icon: "icon-ditufuwu",
                type: "baseMap",
                name: "底图",
                toolName: "baseMap",
            },
            layers: {
                icon: "icon-cengshu",
                type: "layers",
                name: "图层",
                toolName: "layers",
            },
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

    },
    methods: {

    }
}
</script>