import BaseLayer from './baseLayer';
/**
 * xyz切片类型图层
 * @class
 * @augments BaseLayer
 */
class XYZLayer extends BaseLayer{
     /**
     * @param {Cesium.Viewer} viewer 地图viewer对象 
     * @param {Object} opt 基础配置
     * @param {String} opt.url 模型服务地址
     * @param {Number} opt.minimumLevel 地图服务最小层级
     * @param {Number} opt.maximumLevel 地图服务最大层级
     * @param {Number} [opt.tileWidth=256] 服务切片宽度
     * @param {Number} [opt.tileHeight=256] 服务切片高度
     * @param {Boolean} [opt.enablePickFeatures=true] 是否可通过鼠标拾取元素
     */
    constructor(viewer, opt) {
        super(viewer, opt);

        /**
        * @property {String} type 类型
        */
        this.type = "xyz";
        this._provider = new Cesium.UrlTemplateImageryProvider(this.providerAttr);
    }
    // 获取当前图层
    get layer() {
        return this._layer;
    }
    get provider() {
        return this._provider;
    }
}

export default XYZLayer;