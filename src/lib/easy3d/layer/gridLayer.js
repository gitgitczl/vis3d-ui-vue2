// 添加网格图
import BaseLayer from './baseLayer';
class GridLayer extends BaseLayer {
    constructor(viewer, opt) {
        super(viewer, opt);
        this.type = "grid";
        let layerColor = Cesium.Color.fromCssColorString(opt.color || '#C0C0C0');
        this.viewer.scene.globe.baseColor = Cesium.Color.GREY;
        this.providerAttr.cells = this.providerAttr.cells || 4;
        this.providerAttr.color = layerColor;
        this._provider = new Cesium.GridImageryProvider(this.providerAttr);
    }
}

export default GridLayer;