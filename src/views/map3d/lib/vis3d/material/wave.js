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
      material: new WaveMaterial({
        duration: 2000,
        color: Cesium.Color.RED,
      }),
    },
  });
 */
function WaveMaterial(opt) {
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this.defaultColor = Cesium.Color.fromCssColorString("#02ff00");
    this.color = Cesium.defaultValue(opt.color, this.defaultColor); //颜色
    this._duration = opt.duration || 1000; //时长
    this._time = undefined;
}


WaveMaterial.prototype.color = function () {
    return Cesium.createPropertyDescriptor('color');
}
WaveMaterial.prototype.getType = function () {
    return 'WaveMaterial';
}
WaveMaterial.prototype.getValue = function (time, result) {
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
WaveMaterial.prototype.equals = function (other) {
    return this === other ||
        other instanceof WaveMaterial && Cesium.Property.equals(this._color, other._color);
}



Object.defineProperties(WaveMaterial.prototype, {
    isConstant: {
        get: function () {
            return false;
        }
    },
    definitionChanged: {
        get: function () {
            return this._definitionChanged;
        }
    }
});

Cesium.Material._materialCache.addMaterial("WaveMaterial", {
    fabric: {
        type: "WaveMaterial",
        uniforms: {
            color: new Cesium.Color(1, 0, 0, 1.0),
            time: 10
        },
        source: `czm_material czm_getMaterial(czm_materialInput materialInput)
            {
                czm_material material = czm_getDefaultMaterial(materialInput);
                material.diffuse = 1.5 * color.rgb;
                vec2 st = materialInput.st;
                float dis = distance(st, vec2(0.5, 0.5));
                float per = fract(time);
                if(dis > per * 0.5){
                    discard;
                }else {
                    material.alpha = color.a  * dis / per / 2.0;
                }
                return material;
            }
        `
    },
    translucent: function translucent() {
        return true;
    }
});


export default WaveMaterial;