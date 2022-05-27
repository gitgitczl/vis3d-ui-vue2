function FlyLineMaterial(opt) {
    this.defaultColor = new Cesium.Color(0, 0, 0, 0);
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this.color = opt.color || this.defaultColor;
    this.duration = opt.duration || 3000;
    this.image = opt.image;
    if (!this.image) {
        console.warn("缺少材质图片！");
    }
}

FlyLineMaterial.prototype.getType = function (time) {
    return 'FlyLine';
}
FlyLineMaterial.prototype.getValue = function (time, result) {
    if (!Cesium.defined(result)) {
        result = {};
    }
    if (!this._time) {
        this._time = (new Date()).getTime();
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
    result.image = this.image;
    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
    return result;
}
FlyLineMaterial.prototype.equals = function (other) {
    return this === other ||
        (other instanceof FlyLineMaterial &&
            Cesium.Property.equals(this._color, other._color))
}

export default FlyLineMaterial;