import { param } from "jquery";
import cUtil from "../cUtil";
// 图层管理父类
/**
 * 图层基类
 * @description 图层基类，一般不直接实例化
 * @alias BaseLayer
 * @class
 */
class BaseLayer {
    /**
     * @param {Cesium.Viewer} viewer 地图viewer对象 
     * @param {Object} opt 基础配置，可将
     * @param {String | Number} opt.id 地图服务id
     * @param {String} opt.url 地图服务地址
     * @param {Object} [opt.view] 图层定位视角
     * @param {Array} [opt.rectangle] 地图服务范围 [117,40,118,41]
     * @param {Number|Function} [opt.alpha=1.0] 图层透明度
     * @param {Number|Function} [opt.nightAlpha=1.0] 在晚上的图层透明度
     * @param {Number|Function} [opt.dayAlpha=1.0] 在白天的图层透明度
     * @param {Number|Function} [opt.brightness=1.0] 图层亮度
     * @param {Number|Function} [opt.contrast=1.0] 图层对比度
     * @param {Number|Function} [opt.hue=0.0] 图层色调
     * @param {Number|Function} [opt.saturation=1.0] 图层饱和度
     * @param {Number|Function} [opt.gamma=1.0] 
     * @param {Boolean} [opt.show=true] 是否显示
     * @param {Number} [opt.maximumAnisotropy=maximum supported] 
     * @param {Number} [opt.minimumTerrainLevel] 显示该图层的最小地形层级
     * @param {Number} [opt.maximumTerrainLevel] 显示该图层的最大地形层级
     * @param {String} [opt.colorToAlpha] 颜色转透明度
     * @param {Number} [opt.colorToAlphaThreshold=0.004] 
     * 
     */
    constructor(viewer, opt) {

        this.viewer = viewer;
        this.opt = opt || {};
        // 定义imageryLayer基础参数种类
        const layerAttrs = [
            'alpha', 'nightAlpha', 'dayAlpha', 'brightness', 'contrast',
            'hue', 'saturation', 'gamma', 'show', 'maximumAnisotropy', 'minimumTerrainLevel', 'maximumTerrainLevel',
            'colorToAlpha', 'colorToAlphaThreshold'
        ]

        /**
         * @property {String | Number} id 图层id
         */
        this.id = opt.id || Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
        if (!opt.url && opt.type != "tdt" && opt.type != "grid") {
            console.log("缺少服务地址！", opt);
            return;
        }

        /**
         * @property {Object} providerAttr provider相关配置
         */
        this.providerAttr = {};

        /**
         * @property {Object} imageryLayerAttr imageryLayer相关配置
         */
        this.imageryLayerAttr = {};

        if (this.opt.rectangle) {
            let trectangle = new Cesium.Rectangle(
                Cesium.Math.toRadians(this.opt.rectangle[0]),
                Cesium.Math.toRadians(this.opt.rectangle[1]),
                Cesium.Math.toRadians(this.opt.rectangle[2]),
                Cesium.Math.toRadians(this.opt.rectangle[3]));
            this.providerAttr.rectangle = trectangle;
            this.imageryLayerAttr.rectangle = trectangle;
        }

        this.providerAttr.url = opt.url;
        // 从opt中过滤出provider的参数

        let optFields = Object.keys(this.opt);
        for (let ind = 0; ind < optFields.length; ind++) {
            let field = optFields[ind];
            if (field == "rectangle") continue;
            if (layerAttrs.indexOf(field) == -1) {
                this.providerAttr[field] = this.opt[field];
            } else {
                this.imageryLayerAttr[field] = this.opt[field];
            }
        }

        /**
         * @property {Cesium.ImageryLayer} layer 图层
         */
        this._layer = null;

        /**
         * @property {Cesium.ImageryProvider} provider 图层
         */
        this._provider = {};

        /*  if (this.opt.srs == "EPSG:3857") {
            this.opt.tilingScheme = new Cesium.WebMercatorTilingScheme();
        } else if (this.opt.srs == "EPSG:4490") {

        } else if (this.opt.srs == "EPSG:4326") {
            this.opt.tilingScheme = new Cesium.GeographicTilingScheme();
        } else {

        } */
    }

    get layer() {
        return this._layer;
    }

    /**
     * 加载
     */
    load() {
        if (!this._provider || this._provider == {}) return;
        this._layer = new Cesium.ImageryLayer(this._provider, this.imageryLayerAttr);
        /* this.viewer.imageryLayers.add(this._layer, this.opt.index); */
        this.viewer.imageryLayers.add(this._layer);
        this._layer.attr = this.opt; // 保存配置信息
    }

    getLayer() {
        return this._layer;
    }

    /**
    * 移除
    */
    remove() {
        if (this._layer) this.viewer.imageryLayers.remove(this._layer);
    }

    /**
    * 展示
    */
    show() {
        if (this._layer) {
            this._layer.show = true;
            this._layer.attr.show = true;
        }
    }

    /**
    * 隐藏
    */
    hide() {
        if (this._layer) {
            this._layer.show = false;
            this._layer.attr.show = false;
        }
    }

    /**
     * @param {Boolean} visible 是否显示
     */
    setVisible(visible) {
        visible = visible == undefined ? true : visible;
        if (visible) {
            this.show();
        } else {
            this.hide();
        }
    }

    /**
     * 缩放至图层
     */
    zoomTo() {
        if (this.opt.view) {
            cUtil.setCameraView(this.opt.view);
        } else {
            if (this._layer.type == "3dtiles") this.viewer.zoomTo(this._layer);
        }
    }

    /**
     * 设置透明度
     * @param {Number} alpha 透明度（0~1）
     */
    setAlpha(alpha) {
        if (!this._layer) return;
        alpha = alpha == undefined ? 1 : alpha;
        this._layer.alpha = alpha;
    }

    lowerLayer() {
        if (this._layer) this.viewer.imageryLayers.lower(this._layer);
    }
    lowerLayerToBottom() {
        if (this._layer) this.viewer.imageryLayers.lowerToBottom(this._layer);
    }
    raiseLayer() {
        if (this._layer) this.viewer.imageryLayers.raise(this._layer);
    }
    raiselayerToTop() {
        if (this._layer) this.viewer.imageryLayers.raiseToTop(this._layer);
    }

}

export default BaseLayer;