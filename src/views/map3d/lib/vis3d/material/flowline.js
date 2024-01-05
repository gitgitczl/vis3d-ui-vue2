
/**
 * 流动线材质
 * @constructor
 * @param {Object} opt 基础配置
 * @param {Cesium.Color} opt.color 颜色
 * @param {Number} [opt.duration=1000] 时间间隔（ms）
 * @param {String} opt.image 材质图片
 * @param {Cesium.Cartesian2} [opt.repeat=new Cesium.Cartesian2(1.0, 1.0)] 平铺
 * @example
 * var line3 = viewer.entities.add({
    name: "飞行弧线",
    polyline: {
      positions: points4,
      width: 15,
      material: new FlowLineMaterial({
        image: "../img/texture/rightarrow.png",
        repeat: new Cesium.Cartesian2(100, 1),
        duration: 2500
      })
    }
  });
 */
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
    result.color = Cesium.Property.getValueOrClonedDefault(this.color, time, this.defaultColor, result.color);
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

FlowLineMaterial.prototype.isConstant = function () {
    return false;
}

FlowLineMaterial.prototype.definitionChanged = function () {
    return this._definitionChanged;
}



Object.defineProperties(FlowLineMaterial.prototype, {
    isConstant: {
        get: function get() {
            return false;
        }
    },
    definitionChanged: {
        get: function get() {
            return this._definitionChanged;
        }
    },
    color: Cesium.createPropertyDescriptor('color')
});

Cesium.Material._materialCache.addMaterial("FlowLine", {
    fabric: {
        type: "FlowLine",
        uniforms: {
            color: new Cesium.Color(1, 0, 0, 1.0),
            image: '',
            time: 0,
            repeat: new Cesium.Cartesian2(1.0, 1.0)
        },

        source: "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
            {\n\
                czm_material material = czm_getDefaultMaterial(materialInput);\n\
                vec2 st = repeat * materialInput.st;\n\
                vec4 colorImage = texture(image, vec2(fract(st.s - time), st.t));\n\
                if(color.a == 0.0)\n\
                {\n\
                    material.alpha = colorImage.a;\n\
                    material.diffuse = colorImage.rgb; \n\
                }\n\
                else\n\
                {\n\
                    material.alpha = colorImage.a * color.a;\n\
                    material.diffuse = max(color.rgb * material.alpha * 3.0, color.rgb); \n\
                }\n\
                return material;\n\
            }"
    },
    translucent: function translucent() {
        return true;
    }
});




export default FlowLineMaterial;