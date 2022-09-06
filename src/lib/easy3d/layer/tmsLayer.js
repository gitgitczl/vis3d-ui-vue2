import BaseLayer from './baseLayer';
class TMSLayer extends BaseLayer {
    constructor(viewer, opt) {
        super(viewer, opt);
        this.type = "tmsLayer";
        this._provider = new Cesium.TileMapServiceImageryProvider(this.opt);
    }
}

export default TMSLayer;