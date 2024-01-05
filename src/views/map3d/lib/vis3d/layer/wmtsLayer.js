import BaseLayer from './baseLayer';
/**
 * 加载OGC标准的wmts服务
 * @class
 * @augments BaseLayer
 * @alias BaseLayer.WMTSLayer
 * @example 
 * let wmtsLayer = new vis3d.WMTSLayer(viewer,{
    url : 'http://localhost:8080/geoserver/wms',
    layers : 'xian:satellite16', 
    parameters: {
        service : 'WMS',
        format: 'image/png',
        transparent: true,
    },
    minimumLevel: 1,
    maximumLevel: 19,
    view: {
        x: 118.73263653438936,
        y: 31.971959788539053,
        z: 6643.463555185671,
        heading: 341.6647257262609,
        pitch: -36.54290725763041,
        roll: 359.9323408763138,
    },
});
wmtsLayer.load();
 */
class WMTSLayer extends BaseLayer {
    /**
    * @param {Cesium.Viewer} viewer 地图viewer对象 
    * @param {Object} opt 基础配置
    * @param {String} opt.url 模型服务地址
    * @param {String} opt.layer 服务中图层名称
    * @param {String} opt.style 样式设置
    * @param {String} opt.tileMatrixSetID 
    * @param {Array} opt.tileMatrixLabels 
    * @param {String} [opt.format='image/jpeg'] 切片类型
    * @param {Number} opt.minimumLevel 地图服务最小层级
    * @param {Number} opt.maximumLevel 地图服务最大层级
    * @param {Number} [opt.tileWidth=256] 服务切片宽度
    * @param {Number} [opt.tileHeight=256] 服务切片高度
    */
    constructor(viewer, opt) {
        super(viewer, opt);

        /**
        * @property {String} type 类型
        */
        this.type = "wmts";
        if (!this.providerAttr.layers) {
            console.log("当前服务缺少 layers 参数！", this.providerAttr);
        }
        this._provider = new Cesium.WebMapTileServiceImageryProvider(this.providerAttr);
    }
}

export default WMTSLayer;