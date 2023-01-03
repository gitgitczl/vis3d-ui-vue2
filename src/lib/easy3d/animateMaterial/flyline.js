/**
 * 飞线材质
 * @constructor
 * @param {Object} opt 基础配置
 * @param {Cesium.Color} opt.color 颜色
 * @param {Number} [opt.duration=1000] 时间间隔（ms）
 * @param {String} opt.image 材质图片
 * @example
 *  var lineEntity = viewer.entities.add({
    name: '',
    polyline: {
      positions: linepositions,
      width: 5,
      clampToGround: true,
      material: new easy3d.FlyLineMaterial({ //动画线材质
        color: Cesium.Color.RED,
        duration: 3000,
        image: "../img/texture/glow.png",
        repeat: new Cesium.Cartesian2(1, 1) //平铺
      }),
    }
  });
 * 
 */
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
    result.color = Cesium.Property.getValueOrClonedDefault(this.color, time, Cesium.Color.WHITE, result.color);
    result.image = this.image;
    result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
    return result;
}
FlyLineMaterial.prototype.equals = function (other) {
    return this === other ||
        (
            other instanceof FlyLineMaterial &&
            Cesium.Property.equals(this._color, other._color) &&
            this._image._value == other._image._value &&
            this.repeat.equals(other.repeat)
        );
}

export default FlyLineMaterial;