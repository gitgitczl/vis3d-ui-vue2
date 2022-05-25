// easy3d类库暴露方法
import cUtil from "./cUtil";
import DrawTool from "./plot/drawTool";
import LayerTool from "./layer/layerTool";
import PopupTooltipTool from "./popupTooltip/popupTooltip";
import "./prompt/prompt.css";
import Prompt from "./prompt/prompt";
import "./rightTool/rightTool.css";
import RightTool from "./rightTool/rightTool";
import MeasureTool from "./measure/measureTool";

import "./lnglatTool/lnglatNavigation.css";
import LatlngNavigation from "./lnglatTool/lnglatNavigation";

import "./navigation/cesiumNavigation.css";
import createCN from "./navigation/cesiumNavigation";

import gadgets from "./gadgets/gadgets";

import RoamTool from "./roam/roamTool";
import ZoomTool from "./zoomTool/zoomTool"
import OverviewMap from "./overviewMap/overviewMap"

// 构建viewer
class MapViewer {
    constructor(domId, opt) {
        if (!domId) return;
        this.domId = domId;
        this.opt = opt || {};
        this._viewer = null;
        this.baseLayerTool = null;
        this.operateLayerTool = null;
        this.rightTool = null;
        this.bottomLnglatTool = null;
        this.popupTooltipTool = null;

        this.createViewer();
        this.loadTerrain();
        this.loadbaseLayers();
        this.loadOperateLayers();


        if (this.opt.map.cameraView) cUtil.setCameraView(this.opt.map.cameraView, this._viewer);
        if (this.opt.map.bottomLnglatTool) this.openBottomLnglatTool();
        if (this.opt.map.rightTool) this.openRightTool();
        if (this.opt.map.popupTooltipTool) this.openPopupTooltip();
    }

    get viewer() {
        return this._viewer;
    }

    // 构建地图
    createViewer() {
        let { viewerConfig } = this.opt.map;
        this._viewer = new window.Cesium.Viewer(this.domId, viewerConfig);
        this._viewer.imageryLayers.removeAll();
        // 是否展示cesium官方logo
        this._viewer._cesiumWidget._creditContainer.style.display = "none";
        this._viewer.mapConfig = this.opt;
        this._viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        this.viewer.scene.globe.depthTestAgainstTerrain = this.opt.map.depthTestAgainstTerrain;
    }
    // 构建图层
    loadbaseLayers() {
        let { baseLayers } = this.opt || [];
        if (!this.baseLayerTool) this.baseLayerTool = new LayerTool(this._viewer);
        for (let i = 0; i < baseLayers.length; i++) {
            let layer = baseLayers[i];
            if (layer.type != "group") this.baseLayerTool.add(layer);
        }
    }
    // 构建业务图层
    loadOperateLayers() {
        let { operateLayers } = this.opt || [];
        // 递归查到所有的图层
        let allOperateLayers = [];
        function dg(layers) {
            for (let i = 0; i < layers.length; i++) {
                let layer = layers[i];
                // 添加id
                layer.id = layer.id || new Date().getTime() + "" + Number(Math.random() * 1000).toFixed(0);
                if (layer.children && layer.children.length > 0) {
                    dg(layer.children)
                } else {
                    allOperateLayers.push(layer);
                }
            }
        };
        dg(operateLayers);
        if (!this.operateLayerTool) this.operateLayerTool = new LayerTool(this._viewer);
        for (let i = 0; i < allOperateLayers.length; i++) {
            let layer = allOperateLayers[i];
            if (layer.type != "group") this.operateLayerTool.add(layer);
        }
    }
    // 加载地形
    loadTerrain() {
        let { terrain } = this.opt.map;
        if (!terrain || !terrain.url || !terrain.show) return;
        // 移除原地形
        this._viewer.scene.terrainProvider = new Cesium.EllipsoidTerrainProvider({});
        let terrainProvider = new Cesium.CesiumTerrainProvider({
            url: terrain.url
        });
        this._viewer.scene.terrainProvider = terrainProvider;
    }

    // 开启右键工具
    openRightTool() {
        if (!this.popupTooltipTool) {
            this.popupTooltipTool = new RightTool(this.viewer, {})
        }
    }
    closeRightTool() {
        if (this.rightTool) {
            this.rightTool.destroy();
            this.rightTool = null;
        }
    }

    // 打开实体鼠标提示
    openPopupTooltip() {
        if (!this.popupTooltip) {
            this.popupTooltip = new PopupTooltipTool(this.viewer);
            this.popupTooltip.autoBindTooltip();
            this.popupTooltip.autoBindPopup();
        }
    }

    // 开启地图坐标提示
    openBottomLnglatTool() {
        if (!this.bottomLnglatTool) this.bottomLnglatTool = new LatlngNavigation(this._viewer);
    }

    closeBottomLnglatTool() {
        if (this.bottomLnglatTool) {
            this.bottomLnglatTool.destroy();
            this.bottomLnglatTool = null;
        }
    }

    // 开启地球动画
    openWorldAnimate() {

    }


    // 构建指北针
    openNavigation() {
        let CesiumNavigation = createCN();
        CesiumNavigation(this.viewer, {
            cameraView: this.opt.map.cameraView,
            style: {
                bottom: 60,
                right: 40,
            },
            enableCompass: true, // 罗盘
            enableZoomControls: true, // 缩放控件
            enableDistanceLegend: true, // 图例
            enableCompassOuterRing: true, // 指南针外环
        });
    }

    // 销毁
    destroy() {
        if (this.baseLayerTool) {
            this.baseLayerTool.destroy();
            this.baseLayerTool = null;
        }
        if (this.operateLayerTool) {
            this.operateLayerTool.destroy();
            this.operateLayerTool = null;
        }
        if (this.bottomLnglatTool) {
            this.bottomLnglatTool.destroy();
            this.bottomLnglatTool = null;
        }
        if (this._viewer) {
            this._viewer.destroy();
            this._viewer = null;
        }

    }

}



let workControl = {
    components: [],
    toolsState: {},  // 记录模块状态 true 打开 / false 关闭
    componentsArr: [],
    // 初始化
    init(workConfig, fun) {
        let { tools } = workConfig;
        let toolsObj = {};
        for (let i = 0; i < tools.length; i++) {
            let tool = tools[i];
            tool.domShow = true;
            toolsObj[tool.workName] = tool;
            this.importTool(tool.workName);
        }

        let that = this;
        Promise.all(this.components).then((modules) => {
            // 构建对应组件标签
            for (let i = 0; i < modules.length; i++) {
                let module = modules[i];
                const workName = module.default.name;
                let attr = toolsObj[workName];
                attr.module = module.default;
                that.componentsArr.push(attr);
            }
            if (fun) fun(that.componentsArr)
        });
    },
    importTool(name) {
        switch (name) {
            case "plot":
                this.components.push(import("@/views/easy3d/baseTools/plot/Index.vue"));
                break;
            case "plotStyle":
                this.components.push(import("@/views/easy3d/baseTools/plotStyle/Index.vue"));
                break;
            case "layers":
                this.components.push(import("@/views/easy3d/baseTools/layers/Index.vue"));
                break;
            case "measure":
                this.components.push(import("@/views/easy3d/baseTools/measure/Index.vue"));
                break;
            case "analysis":
                this.components.push(import("@/views/easy3d/baseTools/analysis/Index.vue"));
                break;
            case "baseMap":
                this.components.push(import("@/views/easy3d/baseTools/baseMap/Index.vue"));
                break;
            case "coordinate":
                this.components.push(import("@/views/easy3d/baseTools/coordinate/Index.vue"));
                break;
            case "twoScreen":
                this.components.push(import("@/views/easy3d/baseTools/twoScreen/Index.vue"));
                break;
            case "region":
                this.components.push(import("@/views/easy3d/baseTools/region/Index.vue"));
                break;
            case "viewBook":
                this.components.push(import("@/views/easy3d/baseTools/viewBook/Index.vue"));
                break;
            case "pathPlan":
                this.components.push(import("@/views/easy3d/baseTools/pathPlan/Index.vue"));
                break;
            case "roam":
                this.components.push(import("@/views/easy3d/baseTools/roam/Index.vue"));
                break;
            case "roamStyle":
                this.components.push(import("@/views/easy3d/baseTools/roamStyle/Index.vue"));
                break;
            case "layerSplit":
                this.components.push(import("@/views/easy3d/baseTools/layerSplit/Index.vue"));
                break;
            case "monomer":
                this.components.push(import("@/views/easy3d/baseTools/monomer/Index.vue"));
                break;
        }
    },
    // 关闭单个模块 当前模块  其它模块
    closeToolByName(name, dutoName) {
        let toolAttr = this.getComponentByName(name);
       /*  if(!toolAttr) return ; */
        // 是否能被其他模块释放 默认为true  与closeDisableExcept互斥
        if (dutoName) {
            toolAttr.disableByOthers =
                toolAttr.disableByOthers == undefined
                    ? true
                    : toolAttr.disableByOthers;
            if (!toolAttr.disableByOthers) return;
        }

        // 表示不能通过dutoName模块关闭当前模块 与disableByOthers互斥
        if (
            toolAttr.closeDisableExcept &&
            toolAttr.closeDisableExcept.indexOf(dutoName) != -1
        )
            return;
        // 释放时 是否销毁自己
        if (
            toolAttr.closeDisableSelf == undefined ||
            toolAttr.closeDisableSelf == true
        ) {
            toolAttr.show = false;
            toolAttr.domShow = false;
        } else {
            toolAttr.domShow = false;
        }

        this.toolsState[name] = false;
    },
    // 打开单个模块
    openToolByName(name) {
        if (this.toolsState[name] && this.toolsState[name] === true) return; // 防止二次打开
        let toolAttr = this.getComponentByName(name);
        // 打开某个模块
        toolAttr.show = true;
        toolAttr.domShow = true;
        // 打开的时候 关闭其他模块
        if (toolAttr.openDisableAnothers) {
            for (let key in this.componentsArr) {
                if (key != name) {
                    this.closeToolByName(key, name);
                }
            }
        }
        this.toolsState[name] = true;
    },
    getComponentByName(name) {
        if (!name) return;
        let component = null;
        for (let i = 0; i < this.componentsArr.length; i++) {
            let cpnt = this.componentsArr[i];
            if (cpnt.workName == name) {
                component = cpnt;
                break;
            }
        }
        return component;
    }
}



export default {
    cUtil, MapViewer, DrawTool, LayerTool, MeasureTool, Prompt, gadgets, RoamTool, workControl, ZoomTool, OverviewMap
}