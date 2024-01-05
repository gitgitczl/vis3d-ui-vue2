/**
 * 动态锥体
 * @param {Object} options 
 * @param {Cesium.Color} options.color  锥体颜色
 * @param {Number} options.duration  速度
 * @param {Boolean} options.bottom  是否显示锥体底部
 */
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

Object.defineProperties(CylinderMaterial.prototype, {
    isConstant: {
        get: function () {
            return false;
        }
    },
    definitionChanged: {
        get: function () {
            return this._definitionChanged;
        }
    },
    color: Cesium.createPropertyDescriptor('color')
});

Cesium.Material._materialCache.addMaterial('cylinderMaterial', {
    fabric: {
        type: Cesium.Material.CircleFadeMaterialType,
        uniforms: {
            color: new Cesium.Color(1, 0, 0, 1.0),
            time: 1,
            bottom: true
        },
        source: `czm_material czm_getMaterial(czm_materialInput materialInput)\n\
	    {\n\
            czm_material material = czm_getDefaultMaterial(materialInput);\n\
            material.diffuse = 1.5 * color.rgb;\n\
            vec2 st = materialInput.st;\n\
            float dis = distance(st, vec2(0.5, 0.5));\n\
            float per = fract(time);\n\
            if(dis > per * 0.5){\n\
                //material.alpha = 0.0;\n\
                discard;\n\
            }else {\n\
                material.alpha = color.a  * dis / per ;\n\
            }\n\

            if(!bottom){
                vec3 v_normalMC = czm_inverseNormal * materialInput.normalEC;
                vec3 axis_z = vec3(0.0, 0.0, 1.0);
                if (dot(axis_z, v_normalMC) > 0.95){
                    material.alpha = 0.0;
                }
            }
           
            return material;\n\
	    }`
    },
    translucent: function translucent() {
        return true;
    }
});


export default CylinderMaterial;