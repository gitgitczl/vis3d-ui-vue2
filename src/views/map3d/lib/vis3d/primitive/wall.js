// 自定义多边形墙
class CustomWallPrimitive {
    constructor(viewer, opt) {
        this.viewer = viewer;
        this.opt = opt || {};
        const defaultOpt = {
            radius: 600, // 半径
            height: 200, // 高度
            speed: 2, // 扩散事件
            number: 6, // 边数
            color : Cesium.Color.WHITE
        }
        this.opt = Object.assign(defaultOpt, this.opt);
        this.opt.color = this.opt.color instanceof Cesium.Color ? this.opt.color : Cesium.Color.fromCssColorString(this.opt.color);
        if (!this.opt.center) return;
        if (this.opt.center instanceof Cesium.Cartesian3) {
            this.position = this.opt.center;

        } else {
            this.position = Cesium.Cartesian3.fromDegrees(this.opt.center[0], this.opt.center[1], this.opt.center[2] || 0);
        }

        this.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(this.position);
        this._primitive = undefined;
        this.boundingSphere = new Cesium.BoundingSphere(new Cesium.Cartesian3(0, 0, 0), 1);
        this.primitiveType = this.opt.primitiveType || "TRANGLES";

        this.step = 0;
    }

    update(context, frameState, commandList) {

        if (this._primitive) {
            this._primitive.destroy();
            this._primitive = undefined;
        }


        let geoi = new Cesium.GeometryInstance({
            geometry: this.getGeometry(),
            modelMatrix: this.modelMatrix
        });
        this._primitive = new Cesium.Primitive({
            geometryInstances: geoi,
            appearance: this.getAppearance(),
            asynchronous: false
        });
        this._primitive.update(context, frameState, commandList);
    }



    destroy() {
        if (this.primitive) this.viewer.scene.primitives.add(this.primitive);
    }

    getGeometry() {
        this.opt.speed += .003 * 1.5;
        this.opt.speed = this.opt.speed > 1 ? 0 : this.opt.speed;
        let t = .5 * (1 - Math.cos(this.opt.speed * Math.PI * 2));
        let scale = [];
        scale[0] = scale[1] = this.opt.radius * (1 - Math.cos(this.opt.speed * Math.PI)) * .5,
            scale[2] = this.opt.height * t;
        let geometryValue = this.getGeometryValue(1, 1, 1, this.opt.number || 6);
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
            primitiveType: Cesium.PrimitiveType[this.primitiveType],
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
                            material.diffuse = czm_gammaCorrect(color.rgb);
                            material.alpha = color.a * pow(1.0 - st.t, 2.0);
                            material.emission = vec3(0.2);
                            return material;
                        }
                    `
                }
            }),
            renderState: {
                cull: {
                    enabled: !1
                }
            }
        })
    }
}

export default CustomWallPrimitive;