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

// 构建viewer
class MapViewer {
    constructor(domId, opt) {
        if (!domId) return;
        this.domId = domId;
        this.opt = opt || {};
        this._viewer = null;
        this.baseLayerTool = null;
        this.operateLayerTool = null;

        this.createViewer();
        this.loadTerrain();
        this.loadbaseLayers();
        this.loadOperateLayers();
        /* this.openNavigation(); */

        if (this.opt.map.cameraView) cUtil.setCameraView(this.opt.map.cameraView, this._viewer);
        if (this.opt.map.bottomLnglatTool) this.openBottomLnglatTool();
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
        let cesiumCredit = this.opt.map.cesiumCredit == undefined ? false : this.opt.map.cesiumCredit;
        if (!cesiumCredit) this._viewer._cesiumWidget._creditContainer.style.display = "none";
        this._viewer.mapConfig = this.opt;
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
    openRightClickTool() {

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


export default {
    cUtil, MapViewer, DrawTool, LayerTool, MeasureTool, Prompt, gadgets, RoamTool
}