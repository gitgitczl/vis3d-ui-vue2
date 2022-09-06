function AnimateWall(obj) {
  this._definitionChanged = new Cesium.Event();
  this.color = obj.color;
  this.duration = obj.duration;
  this._time = (new Date()).getTime();
  if (!obj.image) {
    console.log("未传入材料图片！");
  }
  this.image = obj.image;
  this.repeat = obj.repeat || new Cesium.Cartesian2(5, 1);
  this.axisY = obj.axisY;
}


AnimateWall.prototype.getType = function (time) {
  return 'AnimateWall';
}
AnimateWall.prototype.getValue = function (time, result) {
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
AnimateWall.prototype.equals = function (other) {
  return this === other ||
        (
            other instanceof AnimateWall && 
            Cesium.Property.equals(this._color, other._color) && 
            this._image._value == other._image._value && 
            this.repeat.equals(other.repeat)
        );
}




export default AnimateWall;