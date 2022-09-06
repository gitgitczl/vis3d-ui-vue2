// arcgis online 切片
import BaseLayer from './baseLayer.js';
class MapserverLayer extends BaseLayer {
    constructor(viewer, opt) {
        super(viewer, opt);
        this.type = "mapserver";
        this._provider = new Cesium.ArcGisMapServerImageryProvider(this.providerAttr);
    }
}

export default MapserverLayer;