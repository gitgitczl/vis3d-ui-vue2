function CylinderMaterial(options) {
	options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

	this._definitionChanged = new Cesium.Event();
	this._color = undefined;
	this._colorSubscription = undefined;

	this.color = Cesium.defaultValue(options.color, Cesium.Color.WHITE); //颜色
	this._duration = options.duration || 1000; //时长

	this.bottom = options.bottom == undefined ? true : options.bottom;

	this._time = undefined;
}

CylinderMaterial.prototype.getType = function (time) {
	return 'cylinderMaterial';
}
CylinderMaterial.prototype.getValue = function (time, result) {
	if (!Cesium.defined(result)) {
		result = {};
	}
	result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
	result.bottom = this.bottom;

	if (this._time === undefined) {
		this._time = new Date().getTime();
	}
	result.time = (new Date().getTime() - this._time) / this._duration;
	return result;

}
CylinderMaterial.prototype.equals = function (other) {
	return this === other ||
		(other instanceof CylinderMaterial &&
			Property.equals(this._color, other._color))
}

export default CylinderMaterial;