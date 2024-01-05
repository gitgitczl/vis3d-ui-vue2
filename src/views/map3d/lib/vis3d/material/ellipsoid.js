class EllipsoidTrailMaterial {
    constructor(options) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._speed = undefined;
        this.color = options.color;
        this.speed = options.speed;
    }

    get isConstant() {
        return false;
    }

    get definitionChanged() {
        return this._definitionChanged;
    }

    getType(time) {
        return "ellipsoidTrailMaterial";
    }

    getValue(time, result) {
        if (!Cesium.defined(result)) {
            result = {};
        }
        result.color = Cesium.Property.getValueOrDefault(this._color, time, Cesium.Color.RED, result.color);
        result.speed = Cesium.Property.getValueOrDefault(this._speed, time, 10, result.speed);
        return result;
    }

    equals(other) {
        return (this === other ||
            (other instanceof EllipsoidTrailMaterial &&
                Cesium.Property.equals(this._color, other._color) &&
                Cesium.Property.equals(this._speed, other._speed)))
    }
}

Object.defineProperties(EllipsoidTrailMaterial.prototype, {
    color: Cesium.createPropertyDescriptor('color'),
    speed: Cesium.createPropertyDescriptor('speed')
})

Cesium.Material._materialCache.addMaterial("ellipsoidTrailMaterial", {
    fabric: {
        type: "ellipsoidTrailMaterial",
        uniforms: {
            color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
            speed: 2
        },
        source: `
                uniform vec4 color;
                uniform float speed;
                czm_material czm_getMaterial(czm_materialInput materialInput){
                czm_material material = czm_getDefaultMaterial(materialInput);
                vec2 st = materialInput.st;
                float time = fract(czm_frameNumber * speed / 1000.0);
                float alpha = abs(smoothstep(0.5,1.,fract( -st.t - time)));
                alpha += .1;
                material.alpha = alpha;
                material.diffuse = color.rgb;
                return material;
            }
    `
    },
    translucent: function(material) {
        return true;
    }
})

export default EllipsoidTrailMaterial;