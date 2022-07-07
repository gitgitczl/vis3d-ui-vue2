// 可视域核心类 注 cesium中采用的大部分为透视投影相机
import VisualFieldShader from "./shader";
class VisualField {
    constructor(viewer, options) {
        if (!Cesium.defined(viewer)) {
            throw new Cesium.DeveloperError('缺少地图对象！');
        }
        this.options = options || {};
        this._scene = viewer.scene;
        let cameraOptions = options.cameraOptions || {};
        // 是否开启点光源贴图
        this._enabled = Cesium.defaultValue(options.enabled, true);
        // 定义相机目标位置
        this._viewerPosition = Cesium.defaultValue(cameraOptions.viewerPosition, new Cesium.Cartesian3.fromDegrees(0, 0, 0));
        // 定义相机的方向
        this._heading = Cesium.defaultValue(cameraOptions.heading, 0);
        // 定义相机的仰俯角
        this._pitch = Cesium.defaultValue(cameraOptions.pitch, 0);
        // 水平视角范围
        this._horizontalFov = Cesium.defaultValue(cameraOptions.horizontalFov, 179.9);
        // 垂直视角范围
        this._verticalFov = Cesium.defaultValue(cameraOptions.verticalFov, 60);
        // 视锥体长度 即距远平面的距离
        this._distance = Cesium.defaultValue(cameraOptions.distance, 100);
        // 可见地区颜色 
        this._visibleAreaColor = Cesium.Cartesian4.fromColor(Cesium.defaultValue(Cesium.Color.fromCssColorString(cameraOptions.visibleAreaColor), new Cesium.Color(0, 1, 0, 0.5)));
        // 不可见地区颜色
        this._hiddenAreaColor = Cesium.Cartesian4.fromColor(Cesium.defaultValue(Cesium.Color.fromCssColorString(cameraOptions.hiddenAreaColor), new Cesium.Color(1, 0, 0, 0.5)));
        // 点光源中的像素大小尺寸
        this._size = Cesium.defaultValue(options.size, 2048);
        // 点光源中的柔和阴影
        this._softShadows = Cesium.defaultValue(options.softShadows, false);
        // 屏蔽距离误差
        this._bugDistance = this._distance + 0.000001 * this._horizontalFov - 0.000001 * this._verticalFov;
        // 椎体边界颜色
        this._outlineColor = Cesium.defaultValue(options.outlineColor, Cesium.Color.YELLOW);

        // 构建视锥体
        this._lightCameraPrimitive = undefined;
        // 构建光源相机
        this._lightCamera = new Cesium.Camera(scene);
        // 控制椎体相机改变
        this._lightCameraDirty = false;
        // 添加后处理
        this._stage = undefined;
        this._stageDirty = true;
        this._bias = this._shadowMap._primitiveBias;
        // 创建一个点光源
        this._shadowMap = new Cesium.ShadowMap({
            context: this._scene.context,
            lightCamera: this._lightCamera,
            enabled: this._enabled,
            isPointLight: false,
            pointLightRadius: 100.0,
            cascadesEnabled: false,
            size: this._size,
            softShadows: this._softShadows,
            normalOffset: false,
            fromLightSource: false
        });

        this.updateCamera();
    }

    get enabled() {
        return this._enabled;
    }

    set enabled(value) {
        /* this.dirty = this._enabled !== value; */
        this._enabled = value;
        this._shadowMap.enabled = value;
    }

    get softShadows() {
        return this._softShadows;
    }

    set softShadows(value) {
        this._softShadows = value;
        this._shadowMap.softShadows = value;
    }

    get size() {
        return this._size;
    }

    set size(value) {
        this.size = value;
        this._shadowMap.size = value;
    }

    get visibleAreaColor() {
        return Cesium.Color.fromCartesian4(this._visibleAreaColor);
    }

    set visibleAreaColor(value) {
        this._visibleAreaColor = Cesium.Cartesian4.fromColor(value);
        this._scene.requestRender();
    }

    get hiddenAreaColor() {
        return Cesium.Color.fromCartesian4(this._hiddenAreaColor);
    }

    set hiddenAreaColor(value) {
        this._hiddenAreaColor = Cesium.Cartesian4.fromColor(value);
        this._scene.requestRender();
    }

    get viewerPosition() {
        return this._viewerPosition;
    }

    set viewerPosition(value) {
        this._viewerPosition = value;
        this._lightCameraDirty = true;
        this._scene.requestRender();
    }

    get heading() {
        return this._heading;
    }

    set heading(value) {
        this._heading = value;
        this._lightCameraDirty = true;
        this._scene.requestRender();
    }

    get pitch() {
        return this._pitch;
    }

    set pitch(value) {
        this._pitch = value;
        this._lightCameraDirty = true;
        this._scene.requestRender();
    }

    get horizontalFov() {
        return this._horizontalFov;
    }

    set horizontalFov(value) {
        this._horizontalFov = value;
        this._bugDistance = this._distance + 0.000001 * this._horizontalFov - 0.000001 * this._verticalFov;
        this._lightCameraDirty = true;
        this._scene.requestRender();
    }

    get verticalFov() {
        return this._verticalFov;
    }

    set verticalFov(value) {
        this._verticalFov = value;
        this._bugDistance = this._distance + 0.000001 * this._horizontalFov - 0.000001 * this._verticalFov;
        this._lightCameraDirty = true;
        this._scene.requestRender();
    }

    get distance() {
        return this._distance;
    }

    set distance(value) {
        this._distance = value;
        this._bugDistance = this._distance + 0.000001 * this._horizontalFov - 0.000001 * this._verticalFov;
        this._lightCameraDirty = true;
        this._scene.requestRender();
    }

    // 锥体相机更新
    updateCamera() {
        // 视锥体近平面
        this._lightCamera.frustum.near = .001 * this._bugDistance;
        // 视锥体远平面
        this._lightCamera.frustum.far = this._bugDistance;
        // 视锥体张角
        this._lightCamera.frustum.fov = Cesium.Math.toRadians(this._verticalFov);
        // 视锥体宽高比
        const horizontalFovRadians = Cesium.Math.toRadians(this._horizontalFov);
        const verticalFovRadians = Cesium.Math.toRadians(this._verticalFov);
        /*  this._lightCamera.frustum.aspectRatio = (this._bugDistance * Math.tan(horizontalFovRadians * 0.5) * 2.0) / (this._bugDistance * Math.tan(verticalFovRadians * 0.5) * 2.0); */
        this._lightCamera.frustum.aspectRatio = Math.tan(horizontalFovRadians * 0.5) / Math.tan(verticalFovRadians * 0.5);
        // 如果水平方向张角大于垂直方向 则视锥体张角取值为水平方向角度 ？
        if (this._horizontalFov > this._verticalFov) this._lightCamera.frustum.fov = Cesium.Math.toRadians(this._horizontalFov);

        // 设置相机姿态
        this._lightCamera.setView({
            destination: this._viewerPosition,
            orientation: {
                heading: Cesium.Math.toRadians(this._heading),
                pitch: Cesium.Math.toRadians(this._pitch)
            }
        });
        // 构建视锥体
        if (this._lightCameraPrimitive) {
            this._lightCameraPrimitive.destroy();
            this._lightCameraPrimitive = undefined;
        }
        let outlineGeometry = this.createOutLineGeometry();
        this._lightCameraPrimitive = new Cesium.Primitive({
            geometryInstances: new Cesium.GeometryInstance({
                geometry: outlineGeometry,
                attributes: {
                    color: Cesium.ColorGeometryInstanceAttribute.fromColor(this._outlineColor)
                }
            }),
            appearance: new Cesium.PerInstanceColorAppearance({
                translucent: false,
                flat: true
            }),
            modelMatrix: this._lightCamera.inverseViewMatrix,
            asynchronous: false
        });
        this._lightCameraDirty = false;
    }

    // 构建谁锥体几何
    createOutLineGeometry() {
        let positions = new Float32Array(633);
        let i, a, s, d, p = positions,
            m = Cesium.Math.toRadians(this._horizontalFov),
            v = Cesium.Math.toRadians(this._verticalFov),
            b = Math.tan(0.5 * m),
            S = Math.tan(0.5 * v);
        a = this._distance * b;
        d = this._distance * S;
        i = -a;
        s = -d;
        let P = 0;
        p[P++] = 0;
        p[P++] = 0;
        p[P++] = 0;
        let D, I;
        let M = Math.PI - 0.5 * m;
        let R = m / 4;

        for (let L = 0; L < 5; ++L) {
            D = M + L * R;
            let B = d / (this._distance / Math.cos(D));
            let F = Math.atan(B);
            let U = -F;
            let V = F / 10
            for (let z = 0; z < 21; ++z) {
                I = U + z * V;
                p[P++] = this._distance * Math.cos(I) * Math.sin(D);
                p[P++] = this._distance * Math.sin(I);
                p[P++] = this._distance * Math.cos(I) * Math.cos(D);
            }
        }
        R = m / 20;
        for (let G = 0; G < 21; ++G) {
            D = M + G * R;
            let B = d / (this._distance / Math.cos(D));
            let F = Math.atan(B);
            let U = -F, V = F / 2;
            for (let H = 0; H < 5; ++H) {
                I = U + H * V;
                p[P++] = this._distance * Math.cos(I) * Math.sin(D);
                p[P++] = this._distance * Math.sin(I);
                p[P++] = this._distance * Math.cos(I) * Math.cos(D)
            }
        }

        let attributes = new Cesium.GeometryAttributes({
            position: new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                componentsPerAttribute: 3,
                values: positions
            })
        });

        let indices = new Uint16Array(408);
        let t = indices;
        let r = 0;
        t[r++] = 0;
        t[r++] = 1;
        t[r++] = 0;
        t[r++] = 21;
        t[r++] = 0;
        t[r++] = 85;
        t[r++] = 0;
        t[r++] = 105;
        for (let i = 0, n = 0; n < 5; ++n) {
            i++;
            for (let a = 0; a < 20; ++a) {
                t[r++] = i++, t[r++] = i
            }
        }
        i++;
        for (let s = 0; s < 20; ++s) {
            for (let l = 0; l < 5; ++l) {
                t[r++] = i, t[r++] = i++ + 5;
            }
        }

        return new Cesium.Geometry({
            attributes: attributes,
            indices: indices,
            primitiveType: Cesium.PrimitiveType.LINES,
            boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
        });
    }

    // 更新后处理
    updateStage() {
        if (!this._stageDirty) {
            return;
        }

        this._stageDirty = false;
        if (Cesium.defined(this._stage)) {
            this._scene.postProcessStages.remove(this._stage);
            this._stage = undefined;
        }
        let scratchTexelStepSize = new Cesium.Cartesian2();
        let bias = this._bias;
        let shadowMap = this._shadowMap;
        let that = this;
        let uniformMap = {
            shadowMap_texture: function () {
                return shadowMap._shadowMapTexture;
            },
            shadowMap_matrix: function () {
                return shadowMap._shadowMapMatrix;
            },
            viewShed_frontColor: function () {
                return that._visibleAreaColor;
            },
            viewShed_backColor: function () {
                return that._hiddenAreaColor;
            },
            viewShed_Far: function () {
                return shadowMap._lightCamera.frustum.far;
            },
            shadowMap_lightheadingEC: function () {
                return shadowMap._lightheadingEC;
            },
            shadowMap_lightPositionEC: function () {
                return shadowMap._lightPositionEC;
            },
            shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: function () {
                let texelStepSize = scratchTexelStepSize;
                texelStepSize.x = 1.0 / shadowMap._textureSize.x;
                texelStepSize.y = 1.0 / shadowMap._textureSize.y;

                return Cesium.Cartesian4.fromElements(texelStepSize.x, texelStepSize.y, bias.depthBias, bias.normalShadingSmooth, this.combinedUniforms1);
            },
            shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: function () {
                return Cesium.Cartesian4.fromElements(bias.normalOffsetScale, shadowMap._distance, shadowMap.maximumDistance, shadowMap._darkness, this.combinedUniforms2);
            },

            combinedUniforms1: new Cesium.Cartesian4(),
            combinedUniforms2: new Cesium.Cartesian4()
        };
        this._stage = new Cesium.PostProcessStage({
            fragmentShader: VisualFieldShader.getPostStageFragmentShader(shadowMap, false),
            uniforms: uniformMap
        });
        this._scene.postProcessStages.add(this._stage);
    }

    update(frameState) {
        if (this._lightCameraDirty) this._updateCamera();
        this.updateStage();
        frameState.shadowMaps.push(this._shadowMap);
        if (this._lightCameraPrimitive) this._lightCameraPrimitive.update(frameState);
    }

    destroy() {
        if (Cesium.defined(this._stage)) {
            this._scene.postProcessStages.remove(this._stage);
            this._stage = undefined;
            /*  var length = this._scene.postProcessStages.length;  */
        }
        this._shadowMap = this._shadowMap.destroy();
        if (this._lightCameraPrimitive) {
            this._lightCameraPrimitive.destroy();
            this._lightCameraPrimitive = undefined;
        }
    }

}

export default VisualField;