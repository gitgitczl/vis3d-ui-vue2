
function FlowLineMaterial(opt) {
    this.defaultColor = new Cesium.Color(0, 0, 0, 0);
    opt = opt || {};
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this.color = opt.color || this.defaultColor; //颜色
    this._duration = opt.duration || 1000; //时长
    this.url = opt.image; //材质图片
    this._time = undefined;
    this.repeat = opt.repeat || new Cesium.Cartesian2(1.0, 1.0);
}

FlowLineMaterial.prototype.getType = function (time) {
    return "FlowLine";
};

FlowLineMaterial.prototype.getValue = function (time, result) {
    if (!Cesium.defined(result)) {
        result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, this.defaultColor, result.color);
    result.image = this.url;
    if (this._time === undefined) {
        this._time = new Date().getTime();
    }
    result.time = (new Date().getTime() - this._time) / this._duration;
    result.repeat = this.repeat;
    return result;
};

FlowLineMaterial.prototype.equals = function (other) {
    return this === other ||
        (
            other instanceof FlowLineMaterial && 
            Cesium.Property.equals(this._color, other._color) && 
            this._image._value == other._image._value && 
            this.repeat.equals(other.repeat)
        );
};


export default FlowLineMaterial;