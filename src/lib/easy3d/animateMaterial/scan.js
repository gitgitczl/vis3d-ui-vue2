function ScanMaterial(opt) {
    this.defaultColor = new Cesium.Color(0, 0, 0, 0);
    opt = opt || {};
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this.color = opt.color || this.defaultColor; //颜色
    this._duration = opt.duration || 1000; //时长
    this._time = undefined;
}

ScanMaterial.prototype.getType = function (time) {
    return "ScanMaterial";
};

ScanMaterial.prototype.getValue = function (time, result) {
    if (!Cesium.defined(result)) {
        result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this.color, time, this.defaultColor, result.color);
    if (this._time === undefined) {
        this._time = new Date().getTime();
    }
    result.time = (new Date().getTime() - this._time) / this._duration;
    return result;
};

ScanMaterial.prototype.equals = function (other) {
    return this === other ||
        (
            other instanceof ScanMaterial &&
            Cesium.Property.equals(this._color, other._color)
        );
};

export default ScanMaterial;