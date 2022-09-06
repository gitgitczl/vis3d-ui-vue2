import BaseLayer from './baseLayer';
class XYZLayer extends BaseLayer{
    constructor(viewer, opt) {
        super(viewer, opt);
        this.type = "XYZLayer";
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