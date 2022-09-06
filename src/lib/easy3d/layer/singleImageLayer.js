import BaseLayer  from "./baseLayer";
class SingleImageLayer extends BaseLayer{
    constructor(viewer, opt) {
        super(viewer,opt);
        this.type = "singleImage";
        this._provider = new Cesium.SingleTileImageryProvider(this.opt);
    }
}

export default SingleImageLayer;