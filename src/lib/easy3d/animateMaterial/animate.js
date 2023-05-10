import FlowLineMaterial from "./flowline";
import WallMaterial from "./wall";
import WaveMaterial from "./wave";
import ScanMaterial from "./scan";
import CylinderMaterial from "./cylinder"
let Cesium = require('cesium/Cesium.js');

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
                vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
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

Object.defineProperties(WallMaterial.prototype, {
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
Cesium.Material._materialCache.addMaterial('WallMaterial', {
    fabric: {
        type: 'WallMaterial',
        uniforms: {
            color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
            image: "",
            time: 0,
            repeat: new Cesium.Cartesian2(5, 1),
            axisY: false
        },
        source: "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                        {\n\
                            czm_material material = czm_getDefaultMaterial(materialInput);\n\
                            vec2 st = repeat * materialInput.st;\n\
                            vec4 colorImage = texture2D(image, vec2(fract((axisY?st.s:st.t) - time), st.t));\n\
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
                            // material.emission = colorImage.rgb;\n\
                            return material;\n\
                        }"
    },
    translucent: function (material) {
        return true;
    }
});

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

export default {
    FlowLineMaterial, WallMaterial, WaveMaterial, ScanMaterial, CylinderMaterial
}
