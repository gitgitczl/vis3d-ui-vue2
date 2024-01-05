/**
 * 精灵线
 * @constructor
 * @param {Object} opt 基础配置
 * @param {Cesium.Color} opt.color 颜色
 * @param {Number} [opt.duration=1000] 时间间隔（ms）
 * @param {String} opt.image 材质图片
 */
function SpritelineMaterial(opt) {
    let { duration, image } = opt;
    this._definitionChanged = new Cesium.Event()
    this.duration = duration || 1000;
    this.image = image
    this._time = performance.now()
}

SpritelineMaterial.prototype.getType = function (time) {
    return 'Spriteline'
}
SpritelineMaterial.prototype.getValue = function (
    time,
    result
) {
    if (!Cesium.defined(result)) {
        result = {}
    }
    result.image = this.image
    result.time =
        ((performance.now() - this._time) % this.duration) / this.duration
    return result
}
SpritelineMaterial.prototype.equals = function (e) {
    return (
        this === e ||
        (e instanceof SpritelineMaterial && this.duration === e.duration)
    )
}

Object.defineProperties(SpritelineMaterial.prototype, {
    isConstant: {
        get: function () {
            return false
        },
    },
    definitionChanged: {
        get: function () {
            return this._definitionChanged
        },
    },
    color: Cesium.createPropertyDescriptor('color'),
    duration: Cesium.createPropertyDescriptor('duration')
})

Cesium.Material._materialCache.addMaterial("Spriteline", {
    fabric: {
        type: Cesium.Material.SpritelineType,
        uniforms: {
            color: new Cesium.Color(1, 0, 0, 0.5),
            image: '',
            transparent: true,
            time: 20,
        },
        source: `
        czm_material czm_getMaterial(czm_materialInput materialInput)
        {
        czm_material material = czm_getDefaultMaterial(materialInput);
        vec2 st = materialInput.st;
        vec4 colorImage = texture(image, vec2(fract(st.s - time), st.t));
        material.alpha = colorImage.a;
        material.diffuse = colorImage.rgb * 1.5 ;
        return material;
        }
    `,
    },
    translucent: function (material) {
        return true
    },
})



export default SpritelineMaterial;