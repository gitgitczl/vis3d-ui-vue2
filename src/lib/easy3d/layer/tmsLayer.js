import BaseLayer from './baseLayer';
/**
 * tms类型图层（一般由arcmap切片后的数据发布）
 * @class
 * @augments BaseLayer
 * @example 
 * let tmsLayer = new easy3d.TMSLayer(viewer,{
    url: "",
    minimumLevel: 1,
    maximumLevel: 19,
    minimumTerrainLevel: 1,
    view: {
        x: 118.73263653438936,
        y: 31.971959788539053,
        z: 6643.463555185671,
        heading: 341.6647257262609,
        pitch: -36.54290725763041,
        roll: 359.9323408763138,
    },
});
tmsLayer.load();
 */
class TMSLayer extends BaseLayer {
    /**
     * @param {Cesium.Viewer} viewer 地图viewer对象 
     * @param {Object} opt 基础配置
     * @param {String} opt.url 模型服务地址
     * @param {Number} opt.minimumLevel 地图服务最小层级
     * @param {Number} opt.maximumLevel 地图服务最大层级
     * @param {Number} [opt.tileWidth=256] 服务切片宽度
     * @param {Number} [opt.tileHeight=256] 服务切片高度
     */
    constructor(viewer, opt) {
        super(viewer, opt);
        this.type = "tmsLayer";
        this._provider = new Cesium.TileMapServiceImageryProvider(this.opt);
    }
}

export default TMSLayer;