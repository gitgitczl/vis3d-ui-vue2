import BaseLayer from './baseLayer';
class WMSLayer extends BaseLayer {
    constructor(viewer, opt) {
        super(viewer, opt);
        this.type = "wms";
        if (!this.providerAttr.layers) {
            console.log("当前服务缺少 layers 参数！", this.providerAttr);
        }
        this._provider = new Cesium.WebMapServiceImageryProvider(this.providerAttr);
    }
}

export default WMSLayer;