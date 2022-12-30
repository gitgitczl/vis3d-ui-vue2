// arcgis online 切片
import BaseLayer from './baseLayer.js';
/**
 * mapserver 类型图层
 * @class
 * @augments BaseLayer
 * @alias BaseLayer.MapserverLayer
 * @example 
 *      let mapserverLayer = new easy3d.MapserverLayer(viewer,{
 *              url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
 *              show: true,
 *      });
 *      mapserverLayer.load();
 */
class MapserverLayer extends BaseLayer {
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
        this.type = "mapserver";
        this._provider = new Cesium.ArcGisMapServerImageryProvider(this.providerAttr);
    }
}

export default MapserverLayer;