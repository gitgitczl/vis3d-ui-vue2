import BaseLayer  from "./baseLayer";
/**
 * 单张图片图层（一般由arcmap切片后的数据发布）
 * @class
 * @augments BaseLayer
 * @alias BaseLayer.OSMLayer
 * @example 

 */
class OSMLayer extends BaseLayer{
    /**
     * @param {Cesium.Viewer} viewer 地图viewer对象 
     * @param {Object} opt 基础配置
     * @param {Array} opt.rectangle 地图服务范围 [117,40,118,41]
     */
    constructor(viewer, opt) {
        super(viewer,opt);
        /**
        * @property {String} type 类型
        */
        this.type = "osm";
        // url: 'https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png' 标准
        // url:  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png" 黑色
        let pattr = Object.assign(this.providerAttr || {}, {
            subdomains: ['a','b','c','d']
        });
        this._provider = new Cesium.UrlTemplateImageryProvider(pattr);
    }
}

export default OSMLayer;