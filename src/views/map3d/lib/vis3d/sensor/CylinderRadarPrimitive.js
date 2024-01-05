import CylinderGeometry from "./CylinderGeometry"

let Cesium = window.Cesium ;
class CylinderRadarPrimitive {
    constructor(viewer, opt) {
        this.viewer = viewer;
        this.opt = opt || {};
        this._geometry = undefined;
        if (this.opt.angle > 90) this.opt.angle = 89.9;
        if (this.opt.angle < 0) this.opt.angle = 0.1;
        // 张角
        this._angle = 90 - this.opt.angle;
        // 半径
        this._radius = this.opt.radius ? this.opt.radius : 5;
        // 中心点坐标；
        this._position = this.opt.position;
        // 姿态
        this._rotation = this.opt.rotation ? this.opt.rotation : {
            heading: 0,
            pitch: 0,
            roll: 0
        };

        // 颜色
        this._color = this.opt.color ? this.opt.color : Cesium.Color.YELLOW;
        // 边框线颜色
        this._lineColor = this.opt.lineColor ? this.opt.lineColor : Cesium.Color.WHITE;
        // 是否展示
        this._visible = Cesium.defaultValue(this.opt.visible, true);
        this._outline = Cesium.defaultValue(this.opt.outline, true);
        this._topVisible = Cesium.defaultValue(this.opt.topVisible, true);
        this._topOutline = Cesium.defaultValue(this.opt.topOutline, true);
        this._modelMatrix = Cesium.Matrix4.clone(Cesium.Matrix4.IDENTITY);
        this._quaternion = new Cesium.Quaternion;
        this._translation = new Cesium.Cartesian3;
        this._scale = new Cesium.Cartesian3(1, 1, 1);
        this._matrix = new Cesium.Matrix4;
        this._inverseMatrix = new Cesium.Matrix4;
        this._positionCartographic = new Cesium.Cartographic;
        this._positionCartesian = null;
        this._drawCommands = [];
        this.updateGeometry();
    }

    set color(color) {
        this._color = color;
    }

    get color() {
        return this._color;
    }

    set lineColor(color) {
        this._lineColor = color;
    }

    get lineColor() {
        return this._lineColor;
    }

    set position(position) {
        this._position = position.clone();
    }
    get position() {
        return this._position;
    }

    set visible(visible) {
        this._visible = visible;
    }

    get visible() {
        return this._visible;
    }

    set topVisible(visible) {
        this._topVisible = visible;
    }

    get topVisible() {
        return this._topVisible;
    }

    set angle(angle) {
        this._angle = 90 - angle <= 0 ? 0.1 : 90 - angle;
    }

    get angle() {
        return this._angle;
    }

    set topOutline(topOutline) {
        this._topOutline = topOutline
    }

    get topOutline() {
        return this._topOutline;
    }

    set radius(radius) {
        return this._radius = radius;
    }

    get radius() {
        return this._radius;
    }


    computeMatrix(t, e) {
        if (this._positionCartesian || (this._positionCartesian = new Cesium.Cartesian3),
            this.position instanceof Cesium.Cartesian3 ? this._positionCartesian = this.position : "function" == typeof this.position.getValue ? this._positionCartesian = this.position.getValue(t) : this.position._value && this.position._value instanceof Cesium.Cartesian3 && (this._positionCartesian = this.position._value),
            this._trackedEntity && this._trackedEntity.position) {
            var i = this._positionCartesian
                , n = Cesium.Property.getValueOrUndefined(this._trackedEntity.position, t, l);
            if (n) {
                this._trackedEntityPosition = n;
                var o = radarSpace.matrix.getHeadingPitchRollForLine(i, n, this.viewer.scene.globe.ellipsoid);
                this._rotation.heading = o.heading,
                    this._rotation.pitch = o.pitch,
                    this._rotation.roll = o.roll
            }
        }
        return this._modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(this._positionCartesian, this.viewer.scene.globe.ellipsoid, this._modelMatrix),
            this._positionCartographic = Cesium.Cartographic.fromCartesian(this._positionCartesian, this.viewer.scene.globe.ellipsoid, this._positionCartographic),
            Cesium.Transforms.eastNorthUpToFixedFrame(this._positionCartesian, this.viewer.scene.globe.ellipsoid, this._modelMatrix),
            Cesium.Quaternion.fromHeadingPitchRoll(this._rotation, this._quaternion),
            this._matrix = Cesium.Matrix4.fromTranslationQuaternionRotationScale(this._translation, this._quaternion, this._scale, this._matrix),
            Cesium.Matrix4.multiplyTransformation(this._modelMatrix, this._matrix, this._matrix),
            Cesium.Matrix4.inverseTransformation(this._matrix, this._inverseMatrix),
            this._matrix
    }
    getTopGeometry() {
        for (var t = this.radius, e = [], i = [], n = [], r = [], o = 90 - parseInt(this.angle), s = o < 1 ? o / 8 : 1, l = 2 * Math.PI / 127, h = 0, d = this.angle; d < 91; d += s) {
            var m = Cesium.Math.toRadians(d < 90 ? d : 90);
            m = Math.cos(m) * t;
            for (var f = [], p = 0; p < 128; p++) {
                var c = l * p
                    , _ = m * Math.cos(c)
                    , g = m * Math.sin(c)
                    , v = Math.sqrt(t * t - _ * _ - g * g);
                e.push(_, g, v),
                    i.push(1, 1),
                    f.push(h++)
            }
            r.push(f)
        }
        for (var d = 1; d < r.length; d++)
            for (var p = 1; p < r[d].length; p++) {
                var y = r[d - 1][p - 1]
                    , C = r[d][p - 1]
                    , w = r[d][p]
                    , x = r[d - 1][p];
                n.push(y, C, w),
                    n.push(y, w, x)
            }
        e = new Float32Array(e),
            n = new Int32Array(n),
            i = new Float32Array(i);
        var A = {
            position: new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                componentsPerAttribute: 3,
                values: e
            }),
            st: new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 2,
                values: i
            })
        }
            , b = Cesium.BoundingSphere.fromVertices(e)
            , M = new Cesium.Geometry({
                attributes: A,
                indices: n,
                primitiveType: Cesium.PrimitiveType.TRIANGLES,
                boundingSphere: b
            });
        return (0,
            this.computeVertexNormals)(M),
            M
    }
    getTopOutlineGeometry() {
        for (var t = this.radius, e = [], i = [], n = [], r = [], o = 90 - parseInt(this.angle), s = o < 1 ? o / 8 : 1, l = 2 * Math.PI / 127, h = 0, d = this.angle; d < 91; d += s) {
            var m = Cesium.Math.toRadians(d < 90 ? d : 90);
            m = Math.cos(m) * t;
            for (var f = [], p = 0; p < 128; p++) {
                var c = l * p
                    , _ = m * Math.cos(c)
                    , g = m * Math.sin(c)
                    , v = Math.sqrt(t * t - _ * _ - g * g);
                e.push(_, g, v),
                    i.push(1, 1),
                    f.push(h++)
            }
            r.push(f)
        }
        for (var d = 1; d < r.length; d++)
            for (var p = 1; p < r[d].length; p++) {
                var y = r[d - 1][p - 1]
                    , C = r[d][p - 1]
                    , w = r[d][p];
                r[d - 1][p];
                p % 8 == 1 && n.push(y, C),
                    d % 8 == 1 && n.push(C, w)
            }
        e = new Float32Array(e),
            n = new Int32Array(n),
            i = new Float32Array(i);
        var x = {
            position: new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                componentsPerAttribute: 3,
                values: e
            }),
            st: new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 2,
                values: i
            })
        }
            , A = Cesium.BoundingSphere.fromVertices(e)
            , b = new Cesium.Geometry({
                attributes: x,
                indices: n,
                primitiveType: Cesium.PrimitiveType.LINES,
                boundingSphere: A
            });
        return (0,
            this.computeVertexNormals)(b),
            b
    }
    updateGeometry() {
         
        this._geometry = CylinderGeometry.createGeometry(new CylinderGeometry({
            topRadius: this._radius * Math.cos(Cesium.Math.toRadians(this.angle)),
            bottomRadius: 0,
            length: this._radius * Math.sin(Cesium.Math.toRadians(this.angle))
        }));
        this._topGeometry = this.getTopGeometry(),
            this._topOutlineGeometry = this.getTopOutlineGeometry(),
            this._outlineGeometry = CylinderGeometry.createOutlineGeometry(new CylinderGeometry({
                topRadius: this._radius * Math.cos(Cesium.Math.toRadians(this.angle)),
                bottomRadius: 0,
                slices: 128,
                length: this._radius * Math.sin(Cesium.Math.toRadians(this.angle))
            }));
        this._positions = new Float32Array(this._geometry.attributes.position.values.length);
        for (var t = 0; t < this._positions.length; t++)
            this._positions[t] = this._geometry.attributes.position.values[t];
        this._drawCommands && this._drawCommands.length && (this._drawCommands.forEach(function (t) {
            t.vertexArray = t.vertexArray && t.vertexArray.destroy()
        }),
            this._drawCommands.splice(0, this._drawCommands.length))
    }

    update(t) {
        if (this._visible) {
            this.updateGeometry();
            this.computeMatrix(t.time);
            this._geometry.boundingSphere = Cesium.BoundingSphere.fromVertices(this._geometry.attributes.position.values);
            if (this._drawCommands.length == 0) {
                this._drawCommands.push(this.createDrawCommand(this._geometry, t));
                if (this._outline) {
                    this._drawCommands.push(this.createDrawCommand(this._outlineGeometry, t));
                }
                if (this._topVisible) {
                    this._drawCommands.push(this.createDrawCommand(this._topGeometry, t));
                    if (this._topOutline) this._drawCommands.push(this.createDrawCommand(this._topOutlineGeometry, t))
                }
            };
            this._drawCommands.forEach(function (e) {
                t.commandList.push(e)
            });

        }
    }

    destroyCommands() {
        this._drawCommands && this._drawCommands.forEach(function (t) {
            Cesium.defined(t.command) && (t.command.shaderProgram = t.command.shaderProgram && t.command.shaderProgram.destroy(),
                t.command.vertexArray = t.command.vertexArray && t.command.vertexArray.destroy(),
                t.command = void 0)
        }),
            this._drawCommands && (this._drawCommands.length = 0)
    }

    getFragmentShaderSource(t) {
        return `\n
        in vec3 v_position;\n
        in vec3 v_normal;\n
        uniform float picked;\n
        uniform vec4  pickedColor;\n
        uniform vec4  defaultColor;\n
        uniform float specular;\n
        uniform float shininess;\n
        uniform vec3  emission;\n
        in vec2 v_st;\n
        uniform bool isLine;\n
        uniform float glowPower;\n
        void main() {\n    vec3 positionToEyeEC = -v_position; \n    vec3 normalEC =normalize(v_normal);\n    vec4 color=defaultColor;\n    if(picked!=0.0){\n        color = pickedColor;\n    }\n    //if(v_st.x<0.5){\n    //    color.a =0.75-v_st.x; \n    //}\n    //else  {\n    //    color.a =v_st.x-0.25; \n    //}\n    czm_material material;\n    material.specular = specular;\n    material.shininess = shininess;\n    material.normal =  normalEC;\n    material.emission =emission;//vec3(0.2,0.2,0.2);\n    material.diffuse = color.rgb ;\n    if(isLine){\n        material.alpha = 1.0; \n    }\n    else{\n        material.alpha =  color.a; \n    }\n        //float glow = glowPower / abs(v_st.t  ) - (glowPower / 0.5); \n        // \n        //material.emission = max(vec3(glow - 1.0 + color.rgb), color.rgb); \n        //if(isLine)\n        //    material.alpha = clamp(0.0, 1.0, glow) * color.a; \n         \n    
        if(v_st.x==0.0){ \n          
            out_FragColor = color ;\n    
        }else { \n        
            out_FragColor =color ;\n 
            // gl_FragColor = czm_phong(normalize(positionToEyeEC), material) ; \n    
        } 
        \n}`
    }
    getVertexShaderSource(t) {
        return `\n#ifdef GL_ES\n    precision highp float;\n
        #endif\n\n
        in vec3 position;\n
        in vec2 st;\n
        in vec3 normal;\n
        uniform mat4 modelViewMatrix;\n
        uniform mat3 normalMatrix;\n
        uniform mat4 projectionMatrix;\n
        out vec3 v_position;\n
        out vec3 v_normal;\n
        out vec2 v_st;\n\n
        out vec3 v_light0Direction;\n\n
        void main(void) \n{\n    vec4 pos =  modelViewMatrix * vec4( position,1.0);\n    v_normal =  normalMatrix *  normal;\n    v_st = st;\n    v_position = pos.xyz;\n    v_light0Direction = mat3( modelViewMatrix) * vec3(1.0,1.0,1.0);\n    gl_Position =  projectionMatrix * pos;\n}`
    }
    createDrawCommand(t, e, i) {
        let that =  this;
        var n = e.context
            , r = new Cesium.Cartesian3;
        Cesium.Matrix4.multiplyByPoint(this._matrix, t.boundingSphere.center, r);
        var o = new Cesium.BoundingSphere(r, t.boundingSphere.radius)
            , s = new Cesium.DrawCommand({
                modelMatrix: i || this._matrix,
                owner: this,
                primitiveType: t.primitiveType,
                pass: Cesium.Pass.TRANSLUCENT,
                boundingVolume: o
            })
            , u = this
            , l = Cesium.GeometryPipeline.createAttributeLocations(t);
        return s.vertexArray = Cesium.VertexArray.fromGeometry({
            context: n,
            geometry: t,
            attributeLocations: l,
            bufferUsage: Cesium.BufferUsage.STATIC_DRAW
        }),
            s.vertexArray._attributeLocations = l,
            s.shaderProgram = Cesium.ShaderProgram.replaceCache({
                context: n,
                vertexShaderSource: this.getVertexShaderSource(t),
                fragmentShaderSource: this.getFragmentShaderSource(t),
                attributeLocations: l
            }),
            s.renderState = Cesium.RenderState.fromCache({
                blending: Cesium.BlendingState.ALPHA_BLEND,
                depthTest: {
                    enabled: true,
                    func: Cesium.DepthFunction.LESS
                },
                cull: {
                    enabled: false,
                    face: Cesium.CullFace.BACK
                }
            }),
            s.uniformMap = {

            },
            s.uniformMap.projectionMatrix = function () {
                return e.context.uniformState.projection
            }
            ,
            s.uniformMap.modelViewMatrix = function () {
                return e.context.uniformState.modelView
            }
            ,
            s.uniformMap.shininess = function () {
                return u.shininess || (u.shininess = 0),
                    u.shininess
            }
            ,
            s.uniformMap.emission = function () {
                return u.emission || (u.emission = new Cesium.Cartesian3(.2, .2, .2)),
                    u.emission
            }
            ,
            s.uniformMap.specular = function () {
                return u.specular || (u.specular = 0),
                    u.specular
            }
            ,
            s.uniformMap.isLine = function () {
                return t.primitiveType == Cesium.PrimitiveType.LINES || t.primitiveType == Cesium.PrimitiveType.LINE_STRIP
            }
            ,
            s.uniformMap.defaultColor = function () {
                let color = Cesium.Color.BLUE;
                if(t.primitiveType == Cesium.PrimitiveType.LINES){
                    color = that._lineColor
                }else{
                    color = that._color
                }
                return color
            }
            ,
            s.uniformMap.picked = function () {
                return u.picked || (u.picked = 0),
                    u.picked
            }
            ,
            s.uniformMap.pickedColor = function () {
                return u.pickedColor || (u.pickedColor = new Cesium.Color(1, 1, 0, 1)),
                    u.pickedColor
            }
            ,
            s.uniformMap.normalMatrix = function () {
                return e.context.uniformState.normal
            }
            ,
            s.uniformMap.glowPower = function () {
                return .25
            }
            ,
            s
    }

    destroy(t) {
        t && (this.viewer.scene.primitives.remove(this),
            this._drawCommands.forEach(function (t) {
                t.vertexArray = t.vertexArray && t.vertexArray.destroy()
            }),
            this._drawCommands = [])
    }

    getNormal(t) {
        for (var e, i, n, r, o = t.attributes.normal.values, a = 0; a < o.length; a += 3)
            e = o[a],
                i = o[a + 1],
                n = o[a + 2],
                r = 1 / Math.sqrt(e * e + i * i + n * n),
                o[a] = e * r,
                o[a + 1] = i * r,
                o[a + 2] = n * r
    }

    computeVertexNormals(t) {
        var e = t.indices
            , i = t.attributes
            , n = e.length;
        if (i.position) {
            var o = i.position.values;
            if (void 0 === i.normal)
                i.normal = new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 3,
                    values: new Float32Array(o.length)
                });
            else
                for (var a = i.normal.values, s = 0; s < n; s++)
                    a[s] = 0;
            for (var u, l, h, d = i.normal.values, m = new Cesium.Cartesian3, f = new Cesium.Cartesian3, p = new Cesium.Cartesian3, c = new Cesium.Cartesian3, _ = new Cesium.Cartesian3, s = 0; s < n; s += 3)
                u = 3 * e[s + 0],
                    l = 3 * e[s + 1],
                    h = 3 * e[s + 2],
                    Cesium.Cartesian3.fromArray(o, u, m),
                    Cesium.Cartesian3.fromArray(o, l, f),
                    Cesium.Cartesian3.fromArray(o, h, p),
                    Cesium.Cartesian3.subtract(p, f, c),
                    Cesium.Cartesian3.subtract(m, f, _),
                    Cesium.Cartesian3.cross(c, _, c),
                    d[u] += c.x,
                    d[u + 1] += c.y,
                    d[u + 2] += c.z,
                    d[l] += c.x,
                    d[l + 1] += c.y,
                    d[l + 2] += c.z,
                    d[h] += c.x,
                    d[h + 1] += c.y,
                    d[h + 2] += c.z;
            for (var e, ii, n, r, o = t.attributes.normal.values, a = 0; a < o.length; a += 3) {
                e = o[a],
                    ii = o[a + 1],
                    n = o[a + 2],
                    r = 1 / Math.sqrt(e * e + ii * ii + n * n),
                    o[a] = e * r,
                    o[a + 1] = ii * r,
                    o[a + 2] = n * r
            }
            i.normal.needsUpdate = true
        }
        return t
    }

}

export default CylinderRadarPrimitive;