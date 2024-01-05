let Cesium = window.Cesium ;
function n(t, e) {
    if (!(t instanceof e))
        throw new TypeError("Cannot call a class as a function")
}

function r(t, e) {
    var i = t
        , n = e
        , r = Math.cos
        , o = Math.sin;
    return [r(-i) * r(n), o(-i) * r(n), o(n)]
}

function o(t, e, i, n) {
    return t + n / i * (e - t)
}

function a(t, e) {
    var i = e.findIndex(function (e) {
        return e.fov > t
    });
    if (i > 0) {
        var n = e[i - 1]
            , r = e[i]
            , o = (t - n.fov) / (r.fov - n.fov);
        return n.radius * (1 - o) + r.radius * o
    }
}

function s(t, e, i, n, s, u, l) {
    for (var h = new Float32Array((s + 1) * (u + 1) * 3), d = 0; d < s + 1; ++d)
        for (var m = 0; m < u + 1; ++m) {
            var f = o(i, n, u, m)
                , p = r(o(t, e, s, d), f)
                , c = l ? a(f, l) : 1;
            h[3 * (m * (s + 1) + d) + 0] = p[0] * c,
                h[3 * (m * (s + 1) + d) + 1] = p[1] * c,
                h[3 * (m * (s + 1) + d) + 2] = p[2] * c
        }
    return h
}

function u(t, e, i, n, s, u, l) {
    for (var h = new Float32Array((n + 1) * (s + 1) * 3), d = 0; d < n + 1; ++d)
        for (var m = 0; m < s + 1; ++m) {
            var f = o(e, i, s, m)
                , p = r(t, f)
                , c = u ? a(f, u) : 1
                , _ = l ? a(f, l) : 1
                , g = o(c, _, n, d);
            h[3 * (m * (n + 1) + d) + 0] = p[0] * g,
                h[3 * (m * (n + 1) + d) + 1] = p[1] * g,
                h[3 * (m * (n + 1) + d) + 2] = p[2] * g
        }
    return h
}

function l(t, e) {
    for (var i = new Uint16Array(t * e * 6), n = 0; n < t; ++n)
        for (var r = 0; r < e; ++r) {
            var o = r * (t + 1) + n
                , a = r * (t + 1) + n + 1
                , s = (r + 1) * (t + 1) + n
                , u = (r + 1) * (t + 1) + n + 1
                , l = 6 * (r * t + n);
            i[l + 0] = o,
                i[l + 1] = a,
                i[l + 2] = u,
                i[l + 3] = o,
                i[l + 4] = u,
                i[l + 5] = s
        }
    return i
}

function h(t, e, i, n) {
    for (var r = t * i, o = e * n, a = new Uint16Array((t + 1) * (2 * o) + (e + 1) * (2 * r) + 8), s = 0; s < t + 1; ++s)
        for (var u = 0; u < o; ++u) {
            var l = s * i;
            a[2 * (s * o + u) + 0] = u * (r + 1) + l,
                a[2 * (s * o + u) + 1] = (u + 1) * (r + 1) + l
        }
    for (var h = (t + 1) * (2 * o), d = 0; d < e + 1; ++d)
        for (var m = 0; m < r; ++m) {
            var f = d * n;
            a[h + 2 * (m + d * r) + 0] = f * (r + 1) + m,
                a[h + 2 * (m + d * r) + 1] = f * (r + 1) + m + 1
        }
    return a
}

var c = `
in vec3 position;\n            
in vec3 normal;\n            
out vec3 v_positionEC;\n            
out vec3 v_normalEC;\n            
void main()\n            
 {\n               
    v_positionEC = (czm_modelView * vec4(position, 1.0)).xyz;       
    v_normalEC = czm_normal * normal;                               
    gl_Position = czm_modelViewProjection * vec4(position, 1.0);\n         
}\n           `;

var _ = `\n            
in vec3 v_positionEC;\n            
in vec3 v_normalEC;\n            
uniform vec4 color;\n\n            
void main(){\n               
        vec3 positionToEyeEC = -v_positionEC;\n\n                
        vec3 normalEC = normalize(v_normalEC);\n           
        #ifdef FACE_FORWARD\n                
        normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);\n           
        #endif\n\n                
        czm_materialInput materialInput;\n               
        materialInput.normalEC = normalEC;\n               
        materialInput.positionToEyeEC = positionToEyeEC;\n               
        czm_material material = czm_getDefaultMaterial(materialInput);\n                
        material.diffuse = color.rgb;\n               
        material.alpha = color.a;\n\n        
        out_FragColor = vec4(material.diffuse + material.emission, material.alpha);\n           
        // #ifdef FLAT\n                
        //     gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);\n            
        // #else\n               
        //     // gl_FragColor = czm_phong(normalize(positionToEyeEC), material);\n           
        // #endif\n           
    }\n            `;


let CamberRadarPrimitive = function (e) {
    this.innerFovRadiusPairs = e.innerFovRadiusPairs,
        this.outerFovRadiusPairs = e.outerFovRadiusPairs,
        this.radius = e.radius,
        this.startRadius = e.startRadius,
        this.modelMatrix = Cesium.defaultValue(e.modelMatrix, Cesium.Matrix4.IDENTITY),
        this.startFovH = Cesium.defaultValue(e.startFovH, Cesium.Math.toRadians(-50)),
        this.endFovH = Cesium.defaultValue(e.endFovH, Cesium.Math.toRadians(50)),
        this.startFovV = Cesium.defaultValue(e.startFovV, Cesium.Math.toRadians(5)),
        this.endFovV = Cesium.defaultValue(e.endFovV, Cesium.Math.toRadians(85)),
        this.segmentH = Cesium.defaultValue(e.segmentH, 20),
        this.segmentV = Cesium.defaultValue(e.segmentV, 20),
        this.subSegmentH = Cesium.defaultValue(e.subSegmentH, 3),
        this.subSegmentV = Cesium.defaultValue(e.subSegmentV, 3),
        this.color = Cesium.defaultValue(e.color, new Cesium.Color(1, 1, 0, .5)),
        this.lineColor = Cesium.defaultValue(e.lineColor, new Cesium.Color(1, 0, 0)),
        this.show = Cesium.defaultValue(e.show, !0),
        this._modelMatrix = Cesium.Matrix4.clone(Cesium.Matrix4.IDENTITY),
        this._startFovH = 0,
        this._endFovH = 0,
        this._startFovV = 0,
        this._endFovV = 0,
        this._segmentH = 1,
        this._segmentV = 1,
        this._subSegmentH = 1,
        this._subSegmentV = 1,
        this._boundingSphere = new Cesium.BoundingSphere,
        this._initBoundingSphere = void 0,
        this._command = void 0
}



CamberRadarPrimitive.prototype.createOuterCurveCommand = function (t) {
    var e = this._subSegmentH * this._segmentH
        , i = this._subSegmentV * this._segmentV
        , n = s(this._startFovH, this._endFovH, this._startFovV, this._endFovV, e, i, this._outerFovRadiusPairs)
        , r = s(this._startFovH, this._endFovH, this._startFovV, this._endFovV, e, i, this._outerFovRadiusPairs)
        , o = l(e, i)
        , a = h(this._segmentH, this._segmentV, this._subSegmentH, this._subSegmentV);
    return this.createRawCommand(t, n, r, o, a)
};

CamberRadarPrimitive.prototype.createInnerCurveCommand = function (t) {
    var e = this._subSegmentH * this._segmentH
        , i = this._subSegmentV * this._segmentV
        , n = s(this._startFovH, this._endFovH, this._startFovV, this._endFovV, e, i, this._innerFovRadiusPairs)
        , r = s(this._startFovH, this._endFovH, this._startFovV, this._endFovV, e, i, this._innerFovRadiusPairs)
        , o = l(e, i)
        , a = h(this._segmentH, this._segmentV, this._subSegmentH, this._subSegmentV);
    return this.createRawCommand(t, n, r, o, a)
}

CamberRadarPrimitive.prototype.createLeftCrossSectionCommand = function (t) {
    var e = this._subSegmentV * this._segmentV
        , i = u(this._startFovH, this._startFovV, this._endFovV, 10, e, this._innerFovRadiusPairs, this._outerFovRadiusPairs)
        , n = u(this._startFovH, this._startFovV, this._endFovV, 10, e, this._innerFovRadiusPairs, this._outerFovRadiusPairs)
        , r = l(10, e)
        , o = h(10, this._segmentV, 1, this._subSegmentV);
    return this.createRawCommand(t, i, n, r, o)
}
CamberRadarPrimitive.prototype.createRightCrossSectionCommand = function (t) {
    var e = this._subSegmentV * this._segmentV
        , i = u(this._endFovH, this._startFovV, this._endFovV, 10, e, this._innerFovRadiusPairs, this._outerFovRadiusPairs)
        , n = u(this._endFovH, this._startFovV, this._endFovV, 10, e, this._innerFovRadiusPairs, this._outerFovRadiusPairs)
        , r = l(10, e)
        , o = h(10, this._segmentV, 1, this._subSegmentV);
    return this.createRawCommand(t, i, n, r, o)
}

CamberRadarPrimitive.prototype.createRawCommand = function (t, e, i, n, r) {
    var o = this
        , a = Cesium.Appearance.getDefaultRenderState(!0, !1, void 0)
        , s = Cesium.RenderState.fromCache(a)
        , u = new Cesium.ShaderSource({
            sources: [c]
        })
        , l = new Cesium.ShaderSource({
            sources: [_]
        })
        , h = {
            color: function () {
                return o.color
            }
        }
        , d = {
            color: function () {
                return o.lineColor
            }
        }
        , m = Cesium.ShaderProgram.fromCache({
            context: t,
            vertexShaderSource: u,
            fragmentShaderSource: l,
            attributeLocations: {
                position: 0,
                normal: 1
            }
        })
        , p = Cesium.Buffer.createVertexBuffer({
            context: t,
            typedArray: e,
            usage: Cesium.BufferUsage.STATIC_DRAW
        })
        , v = Cesium.Buffer.createVertexBuffer({
            context: t,
            typedArray: i,
            usage: Cesium.BufferUsage.STATIC_DRAW
        })
        , y = Cesium.Buffer.createIndexBuffer({
            context: t,
            typedArray: n,
            usage: Cesium.BufferUsage.STATIC_DRAW,
            indexDatatype: Cesium.IndexDatatype.UNSIGNED_SHORT
        })
        , C = Cesium.Buffer.createIndexBuffer({
            context: t,
            typedArray: r,
            usage: Cesium.BufferUsage.STATIC_DRAW,
            indexDatatype: Cesium.IndexDatatype.UNSIGNED_SHORT
        })
        , w = new Cesium.VertexArray({
            context: t,
            attributes: [{
                index: 0,
                vertexBuffer: p,
                componentsPerAttribute: 3,
                componentDatatype: Cesium.ComponentDatatype.FLOAT
            }, {
                index: 1,
                vertexBuffer: v,
                componentsPerAttribute: 3,
                componentDatatype: Cesium.ComponentDatatype.FLOAT
            }],
            indexBuffer: y
        })
        , x = new Cesium.VertexArray({
            context: t,
            attributes: [{
                index: 0,
                vertexBuffer: p,
                componentsPerAttribute: 3,
                componentDatatype: Cesium.ComponentDatatype.FLOAT
            }, {
                index: 1,
                vertexBuffer: v,
                componentsPerAttribute: 3,
                componentDatatype: Cesium.ComponentDatatype.FLOAT
            }],
            indexBuffer: C
        })
        , A = Cesium.BoundingSphere.fromVertices(e);
    return {
        command: new Cesium.DrawCommand({
            vertexArray: w,
            primitiveType: Cesium.PrimitiveType.TRIANGLES,
            renderState: s,
            shaderProgram: m,
            uniformMap: h,
            owner: this,
            pass: Cesium.Pass.TRANSLUCENT,
            modelMatrix: new Cesium.Matrix4,
            boundingVolume: new Cesium.BoundingSphere,
            cull: !0
        }),
        lineCommand: new Cesium.DrawCommand({
            vertexArray: x,
            primitiveType: Cesium.PrimitiveType.LINES,
            renderState: s,
            shaderProgram: m,
            uniformMap: d,
            owner: this,
            pass: Cesium.Pass.TRANSLUCENT,
            modelMatrix: new Cesium.Matrix4,
            boundingVolume: new Cesium.BoundingSphere,
            cull: !0
        }),
        initBoundingSphere: A
    }
}

CamberRadarPrimitive.prototype.update = function (t) {
    var e = this;
    if (this.show) {
        (this.innerFovRadiusPairs !== this._innerFovRadiusPairs || this.outerFovRadiusPairs !== this._outerFovRadiusPairs || this.startFovH !== this._startFovH || this.endFovH !== this._endFovH || this.startFovV !== this._startFovV || this.endFovV !== this._endFovV || this.segmentH !== this._segmentH || this.segmentV !== this._segmentV || this.subSegmentH !== this._subSegmentH || this.subSegmentV !== this._subSegmentV) && (this._innerFovRadiusPairs = this.innerFovRadiusPairs,
            this._outerFovRadiusPairs = this.outerFovRadiusPairs,
            this._startFovH = this.startFovH,
            this._endFovH = this.endFovH,
            this._startFovV = this.startFovV,
            this._endFovV = this.endFovV,
            this._segmentH = this.segmentH,
            this._segmentV = this.segmentV,
            this._subSegmentH = this.subSegmentH,
            this._subSegmentV = this.subSegmentV,
            this._modelMatrix = Cesium.clone(Cesium.Matrix4.IDENTITY),
            this.destroyCommands()),
            Cesium.defined(this._commands) && 0 !== this._commands.length || (this._commands || (this._commands = []),
                this._commands.push(this.createOuterCurveCommand(t.context)),
                this._commands.push(this.createLeftCrossSectionCommand(t.context)),
                this._commands.push(this.createRightCrossSectionCommand(t.context)),
                this._commands.push(this.createInnerCurveCommand(t.context))),
            Cesium.Matrix4.equals(this.modelMatrix, this._modelMatrix) || (Cesium.Matrix4.clone(this.modelMatrix, this._modelMatrix),
                this._commands.forEach(function (t) {
                    t.command.modelMatrix = Cesium.Matrix4.IDENTITY,
                        t.command.modelMatrix = e._modelMatrix,
                        t.command.boundingVolume = Cesium.BoundingSphere.transform(t.initBoundingSphere, e._modelMatrix, e._boundingSphere),
                        t.lineCommand.modelMatrix = Cesium.Matrix4.IDENTITY,
                        t.lineCommand.modelMatrix = e._modelMatrix,
                        t.lineCommand.boundingVolume = Cesium.BoundingSphere.transform(t.initBoundingSphere, e._modelMatrix, e._boundingSphere)
                })),
            this._commands.forEach(function (e) {
                e.command && t.commandList.push(e.command),
                    e.lineCommand && t.commandList.push(e.lineCommand)
            })
    }
}

CamberRadarPrimitive.prototype.destroyCommands = function () {
    this._commands && this._commands.forEach(function (t) {
        Cesium.defined(t.command) && (t.command.shaderProgram = t.command.shaderProgram && t.command.shaderProgram.destroy(),
            t.command.vertexArray = t.command.vertexArray && t.command.vertexArray.destroy(),
            t.command = void 0),
            Cesium.defined(t.lineCommand) && (t.lineCommand.shaderProgram = t.lineCommand.shaderProgram && t.lineCommand.shaderProgram.destroy(),
                t.lineCommand.vertexArray = t.lineCommand.vertexArray && t.lineCommand.vertexArray.destroy(),
                t.lineCommand = void 0)
    }),
        this._commands && (this._commands.length = 0)
}

CamberRadarPrimitive.prototype.destroy = function () {
    return this.destroyCommands(),
        Cesium.destroyObject(this)
}


Object.defineProperties(CamberRadarPrimitive.prototype, {
    startRadius: {
        get: function () {
            return this._startRadius
        },
        set: function (t) {
            this._startRadius = t,
                this.innerFovRadiusPairs = [{
                    fov: Cesium.Math.toRadians(0),
                    radius: t
                }, {
                    fov: Cesium.Math.toRadians(10),
                    radius: .9 * t
                }, {
                    fov: Cesium.Math.toRadians(20),
                    radius: .8 * t
                }, {
                    fov: Cesium.Math.toRadians(30),
                    radius: .7 * t
                }, {
                    fov: Cesium.Math.toRadians(40),
                    radius: .6 * t
                }, {
                    fov: Cesium.Math.toRadians(50),
                    radius: .5 * t
                }, {
                    fov: Cesium.Math.toRadians(60),
                    radius: .4 * t
                }, {
                    fov: Cesium.Math.toRadians(70),
                    radius: .3 * t
                }, {
                    fov: Cesium.Math.toRadians(80),
                    radius: .1 * t
                }, {
                    fov: Cesium.Math.toRadians(90),
                    radius: .01 * t
                }]
        }
    },
    radius: {
        get: function () {
            return this._radius
        },
        set: function (t) {
            this._radius = t,
                this.outerFovRadiusPairs = [{
                    fov: Cesium.Math.toRadians(0),
                    radius: t
                }, {
                    fov: Cesium.Math.toRadians(10),
                    radius: .9 * t
                }, {
                    fov: Cesium.Math.toRadians(20),
                    radius: .8 * t
                }, {
                    fov: Cesium.Math.toRadians(30),
                    radius: .7 * t
                }, {
                    fov: Cesium.Math.toRadians(40),
                    radius: .6 * t
                }, {
                    fov: Cesium.Math.toRadians(50),
                    radius: .5 * t
                }, {
                    fov: Cesium.Math.toRadians(60),
                    radius: .4 * t
                }, {
                    fov: Cesium.Math.toRadians(70),
                    radius: .3 * t
                }, {
                    fov: Cesium.Math.toRadians(80),
                    radius: .1 * t
                }, {
                    fov: Cesium.Math.toRadians(90),
                    radius: .01 * t
                }]
        }
    }
});


export default CamberRadarPrimitive;