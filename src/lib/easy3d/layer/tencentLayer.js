// arcgis online 切片
import BaseLayer from './baseLayer.js';
/**
 * mapserver 类型图层
 * @class
 * @augments BaseLayer
 * @alias BaseLayer.MapserverLayer
 * @example 

 */
class TencentLayer extends BaseLayer {
    /**
     * @param {Cesium.Viewer} viewer 地图viewer对象 
     * @param {Object} opt 基础配置，其它参数见{@link BaseLayer}的Parameters。
     * @param {String} opt.url 地图服务地址
     * @param {String} [opt.token] 地图服务token
     * @param {String} [opt.layers] 服务中图层名称
     * @param {Boolean} [opt.enablePickFeatures=true] 是否可通过鼠标拾取元素
     * @param {Number} [opt.tileWidth=256] 服务切片宽度
     * @param {Number} [opt.tileHeight=256] 服务切片高度
     * @param {Number} [opt.maximumLevel] 地图服务最大层级
     */
    constructor(viewer, opt) {
        super(viewer, opt);
        /**
        * @property {String} type 类型
        */
        this.type = "tencent";

        const lyrurl = this.getUrlByType(opt.layerType || "1");
        let pattr = {
            url: lyrurl,
            customTags: {
                sx: function (imageryProvider, x, y, level) {
                    return x >> 4;
                },
                sy: function (imageryProvider, x, y, level) {
                    return ((1 << level) - y) >> 4
                }
            }
        }
        pattr = Object.assign(this.providerAttr || {}, pattr);

        this._provider = new Cesium.UrlTemplateImageryProvider(pattr);
    }

    getUrlByType(type) {
        let url = "";
        switch (type) {
            case "1": // 影像图
                url = "https://p2.map.gtimg.com/sateTiles/{z}/{sx}/{sy}/{x}_{reverseY}.jpg?version=400";
                break;
            case "2":   // 矢量图
                url = "https://rt3.map.gtimg.com/tile?z={z}&x={x}&y={reverseY}&styleid=1&version=297";
                break;
            case "3": // 黑色风格
                url = "https://rt3.map.gtimg.com/tile?z={z}&x={x}&y={reverseY}&styleid=4&scene=0";
                break;
            case "4":  // 注记图1
                url = "https://rt3.map.gtimg.com/tile?z={z}&x={x}&y={reverseY}&styleid=3&scene=0";
                break;
            case "5": // 注记图2
                url = "https://rt3.map.gtimg.com/tile?z={z}&x={x}&y={reverseY}&styleid=2&version=297";
                break;
            default:
                ;
        }
        return url;
    }
}

export default TencentLayer;