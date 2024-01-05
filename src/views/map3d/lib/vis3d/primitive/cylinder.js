
/**
 * @description 自定义锥体
 * @class
 * @param {Cesium.Viewer} viewer
 * @param {Object} opt 
 * @param {Cesium.Cartesian3} opt.center 中心点坐标
 * @param {Cesium.Color} opt.color 颜色
 * @param {Number} opt.radius 半径
 * @param {Number} opt.length 长度
 * @param {Number} opt.speed 速度
 */
class CustomCylinderPrimitive {
    constructor(viewer, opt) {
        this.viewer = viewer;
        this.opt = opt || {};
        const defaultOpt = {
            radius: 10, // 半径
            length: 300, // 高度
            speed: 0, // 闪烁速度
            color : Cesium.Color.WHITE
        }
        this.opt = Object.assign(defaultOpt, this.opt);
        this.opt.color = this.opt.color instanceof Cesium.Color ? this.opt.color : Cesium.Color.fromCssColorString(this.opt.color);
        if (this.opt.center instanceof Cesium.Cartesian3) {
            this.position = this.opt.center.clone();
        } else {
            this.position = Cesium.Cartesian3.fromDegrees(this.opt.center[0], this.opt.center[1], this.opt.center[2] || 0);
        }
        this.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(this.position);
        this._primitive = undefined;
        this.boundingSphere = new Cesium.BoundingSphere(new Cesium.Cartesian3(0, 0, 0), 1);
        this.primitiveType = this.opt.primitiveType || "TRANGLES";

      
        let geoi = new Cesium.GeometryInstance({
            geometry: this.getGeometry(),
            modelMatrix: this.modelMatrix
        });
        this._primitive = new Cesium.Primitive({
            geometryInstances: geoi,
            appearance: this.opt.image? this.getImgAppearance() :this.getAppearance(),
            asynchronous: false
        });
        return this._primitive;
    }

    /**
     * 销毁
     */
    destroy() {
        if (this.primitive) this.viewer.scene.primitives.add(this.primitive);
    }

    getGeometry() {
        let scale = [this.opt.radius,this.opt.radius,this.opt.length];
        let geometryValue = this.getGeometryValue(2, .3, 1, 10);
        if (scale) {
            for (let e = 0; e < geometryValue.position.length - 2; e += 3) {
                geometryValue.position[e] *= scale[0];
                geometryValue.position[e + 1] *= scale[1];
                geometryValue.position[e + 2] *= scale[2];
            }

        }
        return new Cesium.Geometry({
            attributes: {
                position: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                    componentsPerAttribute: 3,
                    values: geometryValue.position
                }),
                st: new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 2,
                    values: geometryValue.st
                })
            },
            indices: geometryValue.indices,
            primitiveType: Cesium.PrimitiveType[this.opt.primitiveType],
            boundingSphere: this.boundingSphere
        })
    }

    getGeometryValue = function (e = 1, t = 1, n = 1, a = 30) {
        var s = [e, 0]
            , l = [t, 0]
            , u = Cesium.Math.toRadians(360 / a)
            , c = 1 / a;
        let h = []
            , m = [0, 1, a + 1, 1, a + 2, a + 1]
            , d = [];
        h[0] = s[0],
            h[1] = s[1],
            h[2] = 0,
            h[3 * (a + 1)] = l[0],
            h[3 * (a + 1) + 1] = l[1],
            h[3 * (a + 1) + 2] = n,
            d[0] = 0,
            d[1] = 0,
            d[2 * (a + 1)] = 0;
        for (let e = d[2 * (a + 1) + 1] = 1, t, i, o, r; e <= a; e++)
            t = u * e,
                i = c * e,
                o = s[0] * Math.cos(t) - s[1] * Math.sin(t),
                r = s[1] * Math.cos(t) + s[0] * Math.sin(t),
                h[3 * e] = o,
                h[3 * e + 1] = r,
                o = l[h[3 * e + 2] = 0] * Math.cos(t) - l[1] * Math.sin(t),
                r = l[1] * Math.cos(t) + l[0] * Math.sin(t),
                h[3 * (a + 1) + 3 * e] = o,
                h[3 * (a + 1) + 3 * e + 1] = r,
                h[3 * (a + 1) + 3 * e + 2] = n,
                d[2 * e] = i,
                d[2 * e + 1] = 0,
                d[2 * (a + 1) + 2 * e] = i,
                d[2 * (a + 1) + 2 * e + 1] = 1,
                m.push(e, e + 1, a + e + 1, e + 1, a + e + 2, a + e + 1);
        return {
            position: h,
            st: d,
            indices: m
        }
    }

    getAppearance() {
        return new Cesium.EllipsoidSurfaceAppearance({
            material: new Cesium.Material({
                fabric: {
                    uniforms: {
                        color: this.opt.color
                    },
                    source: `
                        uniform vec4 color;
                        czm_material czm_getMaterial(czm_materialInput materialInput){
                            czm_material material = czm_getDefaultMaterial(materialInput);
                            vec2 st = materialInput.st;
                            float powerRatio = fract(czm_frameNumber / 30.0) + 1.0;
                            float alpha = pow(1.0 - st.t, powerRatio);
                            material.diffuse = czm_gammaCorrect(color.rgb);
                            material.alpha = alpha * color.a;
                            material.emission = vec3(0.2);
                            return material;
                        }
                    `
                }
            }),
            renderState: {
                cull: {
                    enabled: false
                }
            }
        })
    }

    getImgAppearance(){
        return new Cesium.EllipsoidSurfaceAppearance({
            material: new Cesium.Material({
                fabric: {
                    uniforms: {
                        image: this.opt.image,
                        color: Cesium.Color.WHITE
                    },
                    source: `
                        uniform sampler2D image;
                        uniform vec4 color;
                        czm_material czm_getMaterial(czm_materialInput materialInput){
                            czm_material material = czm_getDefaultMaterial(materialInput);
                            vec2 v_st = materialInput.st;
                            float dt = fract(czm_frameNumber / 90.0);
                            vec2 st = fract(vec2(1.0) + v_st - vec2(dt, dt));
                            vec4 imageColor = texture(image, st);
                            vec3 diffuse = imageColor.rgb;
                            float alpha = imageColor.a;
                            diffuse *= color.rgb;
                            alpha *= color.a;
                            diffuse *= color.rgb;
                            alpha *= color.a;
                            material.diffuse = diffuse;
                            material.alpha = alpha * pow(1.0 - v_st.t, 2.0);
                            material.emission = vec3(0.2);
                            return material;
                        }
                    `
                }
            }),
            renderState: {
                cull: {
                    enabled: false
                }
            }
        })
    }

    
}

export default CustomCylinderPrimitive