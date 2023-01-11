
import "./easy3d.css";
import cUtil from "./cUtil";
import DrawTool from "./plot/drawTool";
import LayerTool from "./layer/layerTool";
import PopupTooltipTool from "./popupTooltip/popupTooltip";
import "./rightTool/rightTool.css";
import RightTool from "./rightTool/rightTool";
import "./lnglatTool/lnglatNavigation.css";
import LatlngNavigation from "./lnglatTool/lnglatNavigation";
import CesiumNavigation from "./mapNavgation/CesiumNavigation";
import "./mapNavgation/styles/cesium-navigation.css";
import easy3dView from "./viewRoate";

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
                bottomLnglatTool: true, // 经纬度及相机位置提示
                rightTool: true, // 是否开启右键功能
                popupTooltipTool: true, // 是否开启气泡窗
                navigationTool: true, // 导航球及比例尺
                depthTestAgainstTerrain: true, // 是否开启深度监测
                viewerConfig: { // 同Cesium.viewer中配置
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
                    url: "./easy3d/images/layer/world.jpg",
                    iconImg: "./easy3d/images/layer/world.jpg",
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
                            url: "./easy3d/images/layer/world.jpg",
                            iconImg: "./easy3d/images/layer/world.jpg",
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
        let mapViewer = new easy3d.MapViewer(
            "mapContainer",
            mapConfig
        ));
     * 
     */
    constructor(domId, opt) {
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
        * @property {LatlngNavigation}  bottomLnglatTool 底图坐标提示工具
        */
        this.bottomLnglatTool = null;

        /**
         * @property {CesiumNavigation} compassTool 指北针
         */
        this.compassTool = null;

        /**
         * @property {PopupTooltipTool}  popupTooltipTool 鼠标提示工具
         */
        this.popupTooltipTool = null;

        this.createViewer();

        this.loadbaseLayers();
        this.loadOperateLayers();


        let { terrain } = this.opt.map;
        debugger
        this.terrainUrl = terrain && terrain.url;

        if (terrain && terrain.url && terrain.show) this.loadTerrain(terrain.url);

        if (this.opt.map.bottomLnglatTool) this.openBottomLnglatTool();
        if (this.opt.map.rightTool) this.openRightTool();
        if (this.opt.map.popupTooltipTool) this.openPopupTooltip();
        if (this.opt.map.navigationTool) this.openNavigationTool();

        if (this.opt.map.worldAnimate) {
            this.openWorldAnimate();
        } else {
            if (this.opt.map.cameraView)
                cUtil.setCameraView(this.opt.map.cameraView, this._viewer);
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
        this._viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
            Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
        );
        this.viewer.scene.globe.depthTestAgainstTerrain =
            this.opt.map.depthTestAgainstTerrain;
    }
    // 构建图层
    loadbaseLayers() {
        let { baseLayers } = this.opt;
        const baseServer = this.opt.baseServer || "";
        if (!baseLayers) return;
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
            if (!this.baseLayerTool) this.baseLayerTool = new LayerTool(this._viewer);
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
    loadTerrain(url) {
        // 移除原地形
        this._viewer.scene.terrainProvider = new Cesium.EllipsoidTerrainProvider(
            {}
        );
        this.terrainUrl = url;
        if (!url) return;
        let terrainProvider = new Cesium.CesiumTerrainProvider({
            url: url,
        });
        this._viewer.scene.terrainProvider = terrainProvider;
    }

    /**
     * 设置地形的显示隐藏
     * @param {Boolean} visible true显示 / false隐藏
    */
    setTerrainVisible(visible) {
        if (!visible) {
            this._viewer.scene.terrainProvider = new Cesium.EllipsoidTerrainProvider(
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
            this.popupTooltip.autoBindTooltip();
            this.popupTooltip.autoBindPopup();
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
    openBottomLnglatTool() {
        if (!this.bottomLnglatTool)
            this.bottomLnglatTool = new LatlngNavigation(this._viewer);
    }

    /**
    * 关闭底部坐标提示
    */
    closeBottomLnglatTool() {
        if (this.bottomLnglatTool) {
            this.bottomLnglatTool.destroy();
            this.bottomLnglatTool = null;
        }
    }

    openWorldAnimate() {
        let that = this;
        easy3dView.setRotate(
            { x: this.opt.map.cameraView.x, y: this.opt.map.cameraView.y },
            function () {
                if (that.opt.map.cameraView) {
                    cUtil.setCameraView(that.opt.map.cameraView);
                }
            }
        );
    }

    openNavigationTool() {
        this.compassTool = new CesiumNavigation(this._viewer, {
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

        if (this.bottomLnglatTool) {
            this.bottomLnglatTool.destroy();
            this.bottomLnglatTool = null;
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
            if (that.bottomLnglatTool) {
                let res = width > 1000;
                that.bottomLnglatTool.setVisible(res);
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