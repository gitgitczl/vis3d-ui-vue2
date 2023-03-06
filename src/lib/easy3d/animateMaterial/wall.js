/**
 * 墙体材质
 * @constructor
 * @param {Object} opt 基础配置
 * @param {Cesium.Color} opt.color 颜色
 * @param {Number} [opt.duration=1000] 时间间隔（ms）
 * @param {Cesium.Cartesian2} [opt.repeat=new Cesium.Cartesian2(5, 1)] 平铺
 * @param {Boolean} [axisY=false] 方向轴是否为y轴
 * @param {String} opt.image 材质图片
 * @example
 * viewer.entities.add({
    name: '动态立体墙',
    wall: {
      positions: positions,
      maximumHeights: maximumHeights,
      minimumHeights: minimumHeights,
      material: new WallMaterial({
        color: Cesium.Color.RED,
        duration: 3000,
        axisY: false,
        image: "../img/texture/glow.png",
        repeat: new Cesium.Cartesian2(1, 1) //平铺
      })
    }
  });
 */
function WallMaterial(opt) {
  this._definitionChanged = new Cesium.Event();
  this.color = opt.color;
  this.duration = opt.duration || 1000;
  this._time = (new Date()).getTime();
  if (!opt.image) {
    console.log("未传入材料图片！");
  }
  this.image = opt.image;
  this.repeat = opt.repeat || new Cesium.Cartesian2(5, 1);
  this.axisY = opt.axisY;
}


WallMaterial.prototype.getType = function (time) {
  return 'WallMaterial';
}
WallMaterial.prototype.getValue = function (time, result) {
  if (!Cesium.defined(result)) {
    result = {};
  }
  result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
  result.image = this.image;
  result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
  result.axisY = this.axisY;
  result.repeat = this.repeat;
  return result;

}
WallMaterial.prototype.equals = function (other) {
  return this === other ||
    (
      other instanceof WallMaterial &&
      Cesium.Property.equals(this._color, other._color) &&
      this._image._value == other._image._value &&
      this.repeat.equals(other.repeat)
    );
}




export default WallMaterial;