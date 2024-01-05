/**
 * 动态扫描
 * @param {Object} options 
 * @param {Cesium.Color} options.color  锥体颜色
 * @param {Number} options.duration  扫描速度
 */
function ScanMaterial(opt) {
    this.defaultColor = new Cesium.Color(0, 0, 0, 0);
    opt = opt || {};
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this.color = opt.color || this.defaultColor; //颜色
    this._duration = opt.duration || 1000; //时长
    this._time = undefined;
}

ScanMaterial.prototype.getType = function (time) {
    return "ScanMaterial";
};

ScanMaterial.prototype.getValue = function (time, result) {
    if (!Cesium.defined(result)) {
        result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this.color, time, this.defaultColor, result.color);
    if (this._time === undefined) {
        this._time = new Date().getTime();
    }
    result.time = (new Date().getTime() - this._time) / this._duration;
    return result;
};

ScanMaterial.prototype.equals = function (other) {
    return this === other ||
        (
            other instanceof ScanMaterial &&
            Cesium.Property.equals(this._color, other._color)
        );
};

Object.defineProperties(ScanMaterial.prototype, {
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

Cesium.Material._materialCache.addMaterial("ScanMaterial", {
    fabric: {
        type: "",
        uniforms: {
            color: new Cesium.Color(1, 0, 0, 1.0),
            time: new Date().getTime(),
            corver: 90,
            speed: 5
        },

        source: `czm_material czm_getMaterial(czm_materialInput materialInput){
                    czm_material material = czm_getDefaultMaterial(materialInput);
                    vec2 st = materialInput.st;
                    st.x = st.x - 0.5;
                    st.y = st.y - 0.5;
                    vec2 normalize_st = normalize(st);
                    float rotateAngle = mod(time * speed,360.0);
                    vec2 center_y = vec2(1.0,0.0);
                    center_y.x = cos(rotateAngle);
                    center_y.y = sin(rotateAngle);

                    vec2 normalize_center_y = normalize(center_y);
                    // 计算当前纹理坐标和中心点的夹角
                    float angle_cos_y = dot(normalize_center_y,normalize_st);
                    angle_cos_y = acos(angle_cos_y);
                    float angle = degrees(angle_cos_y);

                    vec3 normalize_center_y_vec3 = vec3(normalize_center_y,0.0);
                    vec3 st_vec3 = vec3(st,0.0);
                    vec3 cross_value = cross(normalize_center_y_vec3,st_vec3);
                    if(cross_value.z > 0.0){
                        angle = angle + 360.0;
                    }

                    float alpha ;
                    if(angle > corver){
                        alpha = 0.0;
                    }else{
                        alpha = 1.0 - angle/corver;
                    }

                    material.diffuse = color.rgb;
                    material.alpha = alpha;
                    return material;
        }`
    },
    translucent: function translucent() {
        return true;
    }
});

export default ScanMaterial;