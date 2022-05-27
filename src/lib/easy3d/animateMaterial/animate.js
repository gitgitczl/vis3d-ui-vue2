import FlowLineMaterial from "./flowline";
import FlyLineMaterial from "./flyline";
import AnimateWall from "./wall";
import AnimateWave from "./wave";
let Cesium = require('cesium/Cesium.js');
export default function registerAnimate() {
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


    Object.defineProperties(FlyLineMaterial.prototype, {
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
    Cesium.Material._materialCache.addMaterial("FlyLine", {
        fabric: {
            type: "FlyLine",
            uniforms: {
                color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
                image: '',
                time: 0
            },
            source: `
            czm_material czm_getMaterial(czm_materialInput materialInput)\n\
            {\n\
                    czm_material material = czm_getDefaultMaterial(materialInput);\n\
                    vec2 st = materialInput.st;\n\
                    vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
                    material.alpha = colorImage.a * color.a;\n\
                    material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
                    return material;\n\
                }
    `
        },
        translucent: function (material) {
            return true;
        }
    });


    Object.defineProperties(AnimateWall.prototype, {
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
    Cesium.Material._materialCache.addMaterial('AnimateWall', {
        fabric: {
            type: 'AnimateWall',
            uniforms: {
                color: new Cesium.Color(1.0, 1.0, 1.0, 0.5),
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
                                material.emission = colorImage.rgb;\n\
                                return material;\n\
                            }"
        },
        translucent: function (material) {
            return true;
        }
    });

    Object.defineProperties(AnimateWave.prototype, {
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

    Cesium.Material._materialCache.addMaterial("AnimateWave", {
        fabric: {
            type: "AnimateWave",
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

    return {
        FlowLineMaterial, FlyLineMaterial, AnimateWall, AnimateWave
    }
}