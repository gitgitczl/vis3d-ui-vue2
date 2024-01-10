
import "./vis3d.css";
import util from "./util";

import DrawTool from "./plot/drawTool";
import LayerTool from "./layer/layerTool";
import PopupTooltipTool from "./common/popupTooltip/popupTooltip"

import "./common/rightTool/rightTool.css";
import RightTool from "./common/rightTool/rightTool";

import "./common/lnglatTool/lnglatTool.css"
import LatlngNavigation from "./common/lnglatTool/lnglatTool";

import "./common/navgation/styles/cesium-navigation.css"
import Navigation from "./common/navgation/CesiumNavigation";

/**
 * 定义mapViewer.opt参数
 * @typedef {Object} mapViewer.opt
 * 构建参数
 * @property {Object} map 地图相关基础参数
 * @property {String} baseServer 基础地址，配置后，所有url中的`${baseServer}`将被此参数替代
 * @property {Array} baseLayers 地图底图图层配置
 * @property {Array} operateLayers 地图业务图层配置
 */
/**
 * 地图viewer对象类
 * @class 
 */
class MapViewer {
    /**
     * 
     * @param {String} domId 地图div容器id
     * @param {mapViewer.opt} opt 
     * @param {Object} opt.map 地图配置
     * @example
     *  const mapConfig = {
            baseServer: "http://localhost:1119/",
            map: {
                cameraView:{ // 初始化视角
                "x" : 117.11652300702349,
                "y" : 31.822531554698113,
                "z" : 249.22424831865297,
                "heading" : 92.73801048659865,
                "pitch" : -78.63126631978243,
                "roll" : 359.9999069885447,
                "duration" : 0
                },
                errorRender: false, // 是否开启崩溃刷新
                debugShowFramesPerSecond : false, // 是否显示帧数
                worldAnimate: false,
                lnglatNavigation: true, // 经纬度及相机位置提示
                rightTool: true, // 是否开启右键功能
                popupTooltipTool: true, // 是否开启气泡窗
                navigationTool: true, // 导航球及比例尺
                depthTestAgainstTerrain: true, // 是否开启深度监测
                viewer: { // 同Cesium.viewer中配置
                    animation: false,
                    baseLayerPicker: false,
                    fullscreenButton: false,
                    geocoder: false,
                    homeButton: false,
                    infoBox: false,
                    sceneModePicker: false,
                    selectionIndicator: false,
                    timeline: false,
                    navigationHelpButton: false,
                    scene3DOnly: true,
                    useDefaultRenderLoop: true,
                    showRenderLoopErrors: false,
                    terrainExaggeration: 1,
                },
                terrain: {
                    url: "http://data.marsgis.cn/terrain",
                    show: true,
                },
            },
            baseLayers: [
                {
                    name: "单张地图",
                    type: "singleImage",
                    url: "./vis3d/images/layer/world.jpg",
                    iconImg: "./vis3d/images/layer/world.jpg",
                    show: false,
                    alpha: 1,
                    rectangle: [-180, -90, 180, 90],
                }
            ],
            operateLayers: [
                {
                    name: "测试图层",
                    type: "group",
                    open: true,
                    children: [
                        {
                            name: "天地图",
                            type: "tdt",
                            layerName: "img",
                            show: false,
                            key: "a217b99b7be68b98104548d78e9a679a",
                            compare: true,
                        },
                        {
                            name: "单张地图",
                            type: "singleImage",
                            url: "./vis3d/images/layer/world.jpg",
                            iconImg: "./vis3d/images/layer/world.jpg",
                            show: false,
                            layerSplit: true,
                            alpha: 1,
                            rectangle: [-180, -90, 180, 90],
                        },
                        {
                            name: "全国地图（深色）",
                            type: "xyz",
                            show: false,
                            url: "http://8.142.20.247:25548/layer/chengdu/{z}/{x}/{y}.png",
                        }
                    ],
                },
                {
                    name: "三维模型",
                    type: "group",
                    open: true,
                    children: [
                        {
                            name: "城区模型",
                            type: "3dtiles",
                            url: "http://8.141.58.76:6814/data/3dtiles/tileset.json",
                            show: false,
                            center: {
                                z: 45,
                            },
                            maximumScreenSpaceError: 1,
                        }
                    ],
                },
            ],
            };    
        let mapViewer = new vis3d.MapViewer(
            "mapContainer",
            mapConfig
        ));
     * 
     */
    constructor(domId, opt,success) {
        if (!domId) return;
        /**
         * @property {String} div容器id
         */
        this.domId = domId;
        this.opt = opt || {};

        /**
        * @property {Cesium.Viewer} 地图viewer对象
        */
        this._viewer = null;

        /**
         * @property {LayerTool} baseLayerTool 底图图层控制器
         */
        this.baseLayerTool = null;

        /**
        * @property {LayerTool} operateLayerTool 业务图层控制器
        */
        this.operateLayerTool = null;

        this.operatePlotTool = null;

        /**
        * @property {RightTool}  rightTool 右键菜单工具
        */
        this.rightTool = null;

        /**
        * @property {LatlngNavigation}  lnglatNavigation 底图坐标提示工具
        */
        this.lnglatNavigation = null;

        /**
         * @property {Navigation} compassTool 指北针
         */
        this.compassTool = null;

        /**
         * @property {PopupTooltipTool}  popupTooltipTool 鼠标提示工具
         */
        this.popupTooltipTool = null;

        this._viewer = this.createViewer();
        this.loadTerrain(this.opt.map.terrain.url, this.opt.map.terrain.show);

        this.loadbaseLayers();
        this.loadOperateLayers();

        if (this.opt.map.lnglatNavigation) this.openLnglatNavigation();
        if (this.opt.map.rightTool) this.openRightTool();
        //  if (this.opt.map.popupTooltipTool) this.openPopupTooltip();
        this.openPopupTooltip();
        if (this.opt.map.navigationTool) this.openNavigationTool();

        if (this.opt.map.worldAnimate) {
            this.openWorldAnimate();
        } else {
            if (this.opt.map.cameraView)
                util.setCameraView(this.opt.map.cameraView, this._viewer);
        }

        if (this.opt.map.errorRender) {
            this._viewer.scene.renderError.addEventListener(function () {
                window.location.reload();
            }, this);
        }

        // 开启窗口大小监听
        /*  if(this.opt.map.openSizeListener){
             this.openSizeListener();
         } */

        this.viewer.scene.debugShowFramesPerSecond =
            this.opt.map.debugShowFramesPerSecond;

        // 亮度设置
        if (this.opt.map.brightness != undefined) {
            var stages = this.viewer.scene.postProcessStages;
            this.viewer.scene.brightness = this.viewer.scene.brightness || stages.add(Cesium.PostProcessStageLibrary.createBrightnessStage());
            this.viewer.scene.brightness.enabled = true;
            this.viewer.scene.brightness.uniforms.brightness = Number(this.opt.map.brightness);
        }

        if(success) success(this);
    }

    get viewer() {
        return this._viewer;
    }

    // 构建地图
    createViewer() {
        const viewerAttr = this.opt.map.viewer;
        let viewer = new window.Cesium.Viewer(this.domId,viewerAttr);
        // 移除原来影像
        viewer.imageryLayers.removeAll();
        // 是否展示cesium官方logo
        viewer._cesiumWidget._creditContainer.style.display = "none";
        viewer.mapConfig = this.opt;
        viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
            Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
        );
        // 是否开启深度检测
        viewer.scene.globe.depthTestAgainstTerrain =
            this.opt.map.depthTestAgainstTerrain;
        return viewer;
    }
    // 构建图层
    loadbaseLayers() {
        let { baseLayers } = this.opt;
        const baseServer = this.opt.baseServer || "";
        if (!baseLayers) return;
        if (!this.baseLayerTool) this.baseLayerTool = new LayerTool(this._viewer);
        for (let i = 0; i < baseLayers.length; i++) {
            let layer = baseLayers[i];
            if (!layer.type) {
                console.log("缺少基础图层的图层类型", layer);
                return;
            }
            if (layer.type == "group") continue;
            // 添加自定义id
            layer.id =
                layer.id ||
                new Date().getTime() + "" + Number(Math.random() * 1000).toFixed(0);
            if (layer.url) layer.url = layer.url.replace("${baseServer}", baseServer);
            this.baseLayerTool.add(layer);
        }
    }
    // 构建业务图层
    loadOperateLayers() {
        let { operateLayers } = this.opt;
        if (!operateLayers) return;
        // 递归查到所有的图层
        let allOperateLayers = [];
        function dg(layers) {
            for (let i = 0; i < layers.length; i++) {
                let layer = layers[i];
                // 添加id
                layer.id =
                    layer.id ||
                    new Date().getTime() + "" + Number(Math.random() * 1000).toFixed(0);
                layer.alpha = layer.alpha == undefined ? 1 : layer.alpha;
                if (layer.children && layer.children.length > 0) {
                    dg(layer.children);
                } else {
                    allOperateLayers.push(layer);
                }
            }
        }
        dg(operateLayers);
        const baseServer = this.opt.baseServer || "";
        for (let i = 0; i < allOperateLayers.length; i++) {
            let layer = allOperateLayers[i];
            if (!layer.type) {
                console.log("缺少基础图层的图层类型", layer);
                return;
            }
            if (layer.type == "group") continue;

            if (layer.type == "plot" && layer.show) {
                // 兼容单个类型标绘在文件中配置
                if (!this.operatePlotTool) {
                    this.operatePlotTool = new DrawTool(this._viewer, {
                        canEdit: false,
                    });
                }
                layer.type = layer.plotType;
                this.operatePlotTool.createByPositions(layer);
            } else {
                if (layer.url)
                    layer.url = layer.url.replace("${baseServer}", baseServer);
                if (!this.operateLayerTool)
                    this.operateLayerTool = new LayerTool(this._viewer);
                this.operateLayerTool.add(layer);
            }
        }
    }
    /**
     * 加载地形
     * @param {String} url 地形路径地址
    */
    async loadTerrain(url, visible) {
        if (!url) return;
        // 移除原地形
        this._viewer.scene.terrainProvider = new Cesium.EllipsoidTerrainProvider(
            {}
        );

        visible = visible == undefined ? true : visible;
        let terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(url);
        this._viewer.scene.terrainProvider = terrainProvider;

        this.setTerrainVisible(visible);
    }

    /**
     * 设置地形的显示隐藏
     * @param {Boolean} visible true显示 / false隐藏
    */
    async setTerrainVisible(visible) {
        if (!visible) {
            this._viewer.scene.terrainProvider = await new Cesium.EllipsoidTerrainProvider(
                {}
            );
        } else {
            this.loadTerrain(this.terrainUrl);
        }
        this._viewer.scene.render();
    }

    /**
     * 开启右键工具
     */
    openRightTool() {
        if (!this.rightTool) {
            this.rightTool = new RightTool(this.viewer, {});
        }
    }

    /**
     * 关闭右键工具
     */
    closeRightTool() {
        if (this.rightTool) {
            this.rightTool.destroy();
            this.rightTool = null;
        }
    }

    /**
     * 开启鼠标提示
     */
    openPopupTooltip() {
        if (!this.popupTooltip) {
            this.popupTooltip = new PopupTooltipTool(this.viewer, {});
            this.popupTooltip.bindTooltip();
            this.popupTooltip.bindPopup();
        }
    }

    /**
    * 关闭鼠标提示
    */
    closePopupTooltip() {
        if (this.popupTooltip) {
            this.popupTooltip.destroy();
            this.popupTooltip = undefined;
        }
    }


    /**
     * 开启底部坐标提示
     */
    openLnglatNavigation() {
        if (!this.lnglatNavigation)
            this.lnglatNavigation = new LatlngNavigation(this._viewer);
    }

    /**
    * 关闭底部坐标提示
    */
    closeLnglatNavigation() {
        if (this.lnglatNavigation) {
            this.lnglatNavigation.destroy();
            this.lnglatNavigation = null;
        }
    }

    openWorldAnimate() {
        let that = this;
        this.setRotate(
            { x: this.opt.map.cameraView.x, y: this.opt.map.cameraView.y },
            function () {
                if (that.opt.map.cameraView) {
                    that.opt.map.cameraView.duration = 3;
                    util.setCameraView(that.opt.map.cameraView, that.viewer);
                }
            }
        );
    }

    setRotate(obj, callback) { //传入所需定位的经纬度 及旋转的速度 旋转的圈数
        if (!obj.x || !obj.y) {
            console.log("设定地球旋转时，并未传入经纬度！");
            return;
        }
        var v = obj.v || 1;
        var i = 0;
        var q = obj.q || 2;
        var x = obj.x;
        var y = obj.y;
        var z = obj.z;
        let that = this;
        var interVal = window.setInterval(function () {
            x = x + v;
            if (x >= 179) {
                x = -180;
                i++;
            }
            that.viewer.scene.camera.setView({
                destination: new Cesium.Cartesian3.fromDegrees(x, y, z || 20000000)
            });

            if (i == q) { //此处有瑕疵  未修改
                clearInterval(interVal);
                callback();
            }
        }, 10);
    }


    openNavigationTool() {
        this.compassTool = new Navigation(this._viewer, {
            enableCompass: true, // 罗盘
            /* compass: {
                style: {
                    top: "120px",
                    left: "120px"
                }
            }, */
            enableZoomControls: true, // 缩放控制器
            enableDistanceLegend: true, // 比例尺
            /*  distanceLegend: {
                 style: {
                     top: "120px",
                     left: "120px"
                 }
             }, */
            enableCompassOuterRing: true, // 罗盘外环
            view: this.viewer.mapConfig.map && this.viewer.mapConfig.map.cameraView,
        });
    }

    /**
     * 销毁
    */
    destroy() {
        if (this.baseLayerTool) {
            this.baseLayerTool.destroy();
            this.baseLayerTool = null;
        }
        if (this.operateLayerTool) {
            this.operateLayerTool.destroy();
            this.operateLayerTool = null;
        }

        if (this.operatePlotTool) {
            this.operatePlotTool.destroy();
            this.operatePlotTool = null;
        }

        if (this.lnglatNavigation) {
            this.lnglatNavigation.destroy();
            this.lnglatNavigation = null;
        }

        if (this._viewer) {
            this._viewer.destroy();
            this._viewer = null;
        }
    }

    /**
     * 添加地图窗口大小监听
     * @param {Function} callback 
     */
    openSizeListener(callback) {
        let that = this;
        var obdom = document.getElementById(this.domId);
        var MutationObserver = window.MutationObserver || window.webkitMutationObserver || window.MozMutationObserver;
        var mutationObserver = new MutationObserver(function (mutations) {
            let width = window.getComputedStyle(obdom).getPropertyValue('width');
            let height = window.getComputedStyle(obdom).getPropertyValue('height');
            width = window.parseInt(width);
            height = window.parseInt(height);
            if (that.lnglatNavigation) {
                let res = width > 1000;
                that.lnglatNavigation.setVisible(res);
            }

            if (that.compassTool) {
                that.compassTool.setVisible(height > 300);
            }

            if (callback) callback(width, height)
        })

        mutationObserver.observe(obdom, {
            childList: false, // 子节点的变动（新增、删除或者更改）
            attributes: true, // 属性的变动
            characterData: false, // 节点内容或节点文本的变动
            subtree: false // 是否将观察器应用于该节点的所有后代节点
        })
    }
}

export default MapViewer;