/**
 * 波纹材质
 * @constructor
 * @param {Object} opt 基础配置
 * @param {Cesium.Color} opt.color 颜色
 * @param {Number} [opt.duration=1000] 时间间隔（ms）
 * @example
 * var redEllipse = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(103.0, 40.0),
    ellipse: {
      semiMinorAxis: 250000.0,
      semiMajorAxis: 400000.0,
      material: new easy3d.AnimateWave({
        duration: 2000,
        color: Cesium.Color.RED,
      }),
    },
  });
 */
function AnimateWave(opt) {
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this.defaultColor = Cesium.Color.fromCssColorString("#02ff00");
    this.color = Cesium.defaultValue(opt.color, this.defaultColor); //颜色
    this._duration = opt.duration || 1000; //时长
    this._time = undefined;
}


AnimateWave.prototype.color = function () {
    return Cesium.createPropertyDescriptor('color');
}
AnimateWave.prototype.getType = function () {
    return 'AnimateWave';
}
AnimateWave.prototype.getValue = function (time, result) {
    if (!Cesium.defined(result)) {
        result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, this.color, result.color);

    if (this._time === undefined) {
        this._time = new Date().getTime();
    }
    result.time = (new Date().getTime() - this._time) / this._duration;
    return result;
}
AnimateWave.prototype.equals = function (other) {
    return this === other ||
        other instanceof AnimateWave && Cesium.Property.equals(this._color, other._color);
}



export default AnimateWave;