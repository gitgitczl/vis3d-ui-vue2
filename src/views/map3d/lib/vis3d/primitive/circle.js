
/**
 * @description 自定义圆图元
 * @class
 * @param {Cesium.Viewer} viewer
 * @param {Object} opt 
 * @param {Cesium.Color} opt.color 颜色
 * @param {Number} opt.radius 半径
 * @param {Number} opt.speed 速度
 */
class CustomCriclePrimitive {
    constructor(viewer, opt) {
        this.viewer = viewer;
        this.opt = opt || {};
        const defaultOpt = {
            radius: 1000, // 半径
            speed: 1.0,
            color: Cesium.Color.WHITE
        }
        this.opt = Object.assign(defaultOpt, this.opt);

        this.opt.color = this.opt.color instanceof Cesium.Color ? this.opt.color : Cesium.Color.fromCssColorString(this.opt.color);
        if (!this.opt.center) return;
        if (this.opt.center instanceof Cesium.Cartesian3) {
            this.position = this.opt.center;
        } else {
            this.position = Cesium.Cartesian3.fromDegrees(this.opt.center[0], this.opt.center[1], this.opt.center[2] || 0);
        }

        this._primitive = undefined;

        this.init();
        return this._primitive;

    }

    init() {
        let rectanglePosition = this.getCoorsByRadius(this.position, this.opt.radius);
        let geometry = new Cesium.RectangleGeometry({
            rectangle: Cesium.Rectangle.fromCartesianArray(rectanglePosition),
            height: Cesium.Cartographic.fromCartesian(this.position.clone()).height
        });
        this._primitive = new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: geometry,
                /* modelMatrix : Cesium.Transforms.eastNorthUpToFixedFrame(center.clone()) */
            }),
            appearance: new Cesium.EllipsoidSurfaceAppearance({
                material: new Cesium.Material({
                    fabric: {
                        uniforms: {
                            image: this.opt.image || this.getImage(),
                            color: this.opt.color,
                            speed: this.opt.speed || 1.0
                        },
                        source: `
                            uniform float angle;
                            uniform sampler2D image;
                            uniform vec4 color;
                            czm_material czm_getMaterial(czm_materialInput materialInput)
                            {
                                czm_material material = czm_getDefaultMaterial(materialInput);
                                float angle = mod((czm_frameNumber/100.0) * speed ,360.0);
                                vec2 st = materialInput.st;
                                st.x = st.x - 0.5;
                                st.y = st.y - 0.5;
                                if(st.x * st.x + st.y * st.y <= 0.25){
                                    float x = st.x * cos(angle) - st.y * sin(angle);
                                    float y = st.y * cos(angle) + st.x * sin(angle);
                                    st.x = x + 0.5;
                                    st.y = y + 0.5;
                                } else {
                                    st.x = st.x + 0.5;
                                    st.y = st.y + 0.5;
                                }
                                material.diffuse = czm_gammaCorrect(texture(image, st).rgb * color.rgb);
                                material.alpha = texture(image, st).a * color.a;
                                material.emission = vec3(0.2);
                                return material;
                            }`
                    }
                })
            }),
            asynchronous: false
        });
    }


    getCoorsByRadius(center, radius) {
        if (!center) return;
        let trans = Cesium.Transforms.eastNorthUpToFixedFrame(center.clone());
        let trans_inverse = Cesium.Matrix4.inverse(trans.clone(), new Cesium.Matrix4());
        let center_local = Cesium.Matrix4.multiplyByPoint(trans_inverse, center.clone(), new Cesium.Cartesian3());
        let y = new Cesium.Cartesian3(0, 1, 0);
        let newArr = [];
        for (let i = 45; i <= 360; i += 180) {
            let roate_mtx = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(i), new Cesium.Matrix3());
            let roate_c = Cesium.Matrix3.multiplyByVector(roate_mtx, y, new Cesium.Cartesian3());
            Cesium.Cartesian3.multiplyByScalar(roate_c, radius, roate_c);
            let new_c = Cesium.Cartesian3.add(center_local, roate_c, new Cesium.Cartesian3());
            let cart = Cesium.Matrix4.multiplyByPoint(trans, new_c.clone(), new Cesium.Cartesian3());
            newArr.push(cart);
        }
        return newArr;

    }

    getImage() {
        let canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        let context = canvas.getContext("2d");
        let rg = context.createRadialGradient(256, 256, 0, 256, 256, 256);
        rg.addColorStop(.1, "rgba(255, 255, 255, 1.0)");
        rg.addColorStop(.2, "rgba(255, 255, 255, 0.0)");
        rg.addColorStop(.3, "rgba(255, 255, 255, 0.9)");
        rg.addColorStop(.5, "rgba(255, 255, 255, 0.0)");
        rg.addColorStop(.9, "rgba(255, 255, 255, 0.2)");
        rg.addColorStop(1, "rgba(255, 255, 255, 1.0)");
        context.clearRect(0, 0, 512, 512);
        context.strokeStyle = "rgb(255, 255, 255)";
        context.setLineDash([80, 80]);
        context.lineWidth = 30;
        context.arc(256, 256, 180, 0, 2 * Math.PI, !0);
        context.stroke();
        context.beginPath();
        context.arc(256, 256, 256, 0, 2 * Math.PI, !0);
        context.fillStyle = rg;
        context.fill();
        context.restore();
        return canvas;

    }
}

export default CustomCriclePrimitive;
