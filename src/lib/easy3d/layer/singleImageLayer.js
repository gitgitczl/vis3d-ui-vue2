import BaseLayer  from "./baseLayer";
/**
 * 单张图片图层（一般由arcmap切片后的数据发布）
 * @class
 * @augments BaseLayer
 * @example 
 * let singleLayer = new easy3d.SingleImageLayer(viewer,{
    url: "./easy3d/images/layer/world.jpg",
    rectangle: [-180, -90, 180, 90],
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
singleLayer.load();
 */
class SingleImageLayer extends BaseLayer{
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
        this.type = "singleImage";
        this._provider = new Cesium.SingleTileImageryProvider(this.opt);
    }
}

export default SingleImageLayer;