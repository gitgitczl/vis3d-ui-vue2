
let Cesium = window.Cesium ;
function getNormal(t) {
    for (var e, i, n, r, o = t.attributes.normal.values, a = 0; a < o.length; a += 3)
        e = o[a],
        i = o[a + 1],
        n = o[a + 2],
        r = 1 / Math.sqrt(e * e + i * i + n * n),
        o[a] = e * r,
        o[a + 1] = i * r,
        o[a + 2] = n * r
}

function computeVertexNormals(t) {
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
            getNormal(t),
        i.normal.needsUpdate = !0
    }
    return t
}



function CylinderGeometry(t) {
    this.length = t.length,
        this.topRadius = t.topRadius,
        this.bottomRadius = t.bottomRadius,
        this.slices = t.slices ? t.slices : 64,
        this.zReverse = t.zReverse
}


var s = new Cesium.Cartesian2;
var u = new Cesium.Cartesian3;
var l = new Cesium.Ray;
CylinderGeometry._createGeometry = function (t) {
    var e = t.length
        , i = t.topRadius
        , n = t.bottomRadius
        , r = t.slices
        , a = 2 * Math.PI / (r - 1)
        , u = t.zReverse
        , l = []
        , h = []
        , d = []
        , m = []
        , f = [n, i]
        , p = [0, u ? -e : e]
        , c = 0
        , _ = Math.atan2(n - i, e)
        , g = s;
    g.z = Math.sin(_);
    for (var v = Math.cos(_), y = 0; y < p.length; y++) {
        m[y] = [];
        for (var C = f[y], w = 0; w < r; w++) {
            m[y].push(c++);
            var x = a * w
                , A = C * Math.cos(x)
                , b = C * Math.sin(x);
            l.push(A, b, p[y]),
                A = v * Math.cos(x),
                b = v * Math.sin(x),
                h.push(A, b, g.z),
                d.push(y / (p.length - 1), 0)
        }
    }
    for (var M = [], y = 1; y < p.length; y++)
        for (var w = 1; w < r; w++) {
            var P = m[y - 1][w - 1]
                , S = m[y][w - 1]
                , F = m[y][w]
                , E = m[y - 1][w];
            M.push(F),
                M.push(E),
                M.push(P),
                M.push(F),
                M.push(P),
                M.push(S),
                w == m[y].length - 1 && (P = m[y - 1][w],
                    S = m[y][w],
                    F = m[y][0],
                    E = m[y - 1][0],
                    M.push(F),
                    M.push(E),
                    M.push(P),
                    M.push(F),
                    M.push(P),
                    M.push(S))
        }
    M = new Int16Array(M),
        l = new Float32Array(l),
        h = new Float32Array(h),
        d = new Float32Array(d);
    var T = {
        position: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.DOUBLE,
            componentsPerAttribute: 3,
            values: l
        }),
        normal: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
            componentsPerAttribute: 3,
            values: h
        }),
        st: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
            componentsPerAttribute: 2,
            values: d
        })
    }
        , R = Cesium.BoundingSphere.fromVertices(l)
        , G = new Cesium.Geometry({
            attributes: T,
            indices: M,
            primitiveType: Cesium.PrimitiveType.TRIANGLES,
            boundingSphere: R
        });
    return l = [],
        M = [],
        d = [],
        G
};
CylinderGeometry.createGeometry = function (t, e) {
    if (!e)
        return this._createGeometry(t);
    Cesium.Matrix4.multiplyByPoint(e, Cesium.Cartesian3.ZERO, u),
        u.clone(l.origin);
    var i = t.length
        , r = t.topRadius
        , s = (t.bottomRadius,
            t.slices)
        , h = 2 * Math.PI / (s - 1)
        , d = t.zReverse
        , m = []
        , f = []
        , p = []
        , c = []
        , _ = [0, d ? -i : i]
        , g = 0
        , g = 0;
    m.push(0, 0, 0),
        f.push(1, 1),
        g++;
    for (var v = new Cesium.Cartesian3, y = r / 15, C = 0; C < 16; C++) {
        for (var w = y * C, x = [], A = 0; A < s; A++) {
            var b = h * A
                , M = w * Math.cos(b)
                , P = w * Math.sin(b);
            v.x = M,
                v.y = P,
                v.z = _[1];
            var S = (0,
                a.extend2Earth)(v, e, l);
            S ? (x.push(g),
                m.push(M, P, _[1]),
                f.push(C / 15, 1),
                g++) : (S = u,
                    x.push(-1))
        }
        c.push(x)
    }
    for (var F, E, T = [0, c.length - 1], R = 0; R < T.length; R++)
        for (var C = T[R], A = 1; A < c[C].length; A++)
            F = c[C][A - 1],
                E = c[C][A],
                F >= 0 && E >= 0 && p.push(0, F, E);
    m = new Float32Array(m),
        p = new Int32Array(p),
        f = new Float32Array(f);
    var G = {
        position: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.DOUBLE,
            componentsPerAttribute: 3,
            values: m
        }),
        st: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
            componentsPerAttribute: 2,
            values: f
        })
    }
        , V = Cesium.BoundingSphere.fromVertices(m)
        , D = new Cesium.Geometry({
            attributes: G,
            indices: p,
            primitiveType: Cesium.PrimitiveType.TRIANGLES,
            boundingSphere: V
        });
    return (0,
        computeVertexNormals)(D),
        m = [],
        p = [],
        D
};
CylinderGeometry.createOutlineGeometry = function (t) {
    var e = t.length
        , i = t.topRadius
        , n = t.bottomRadius
        , r = t.slices
        , a = 2 * Math.PI / (r - 1)
        , u = t.zReverse
        , l = []
        , h = []
        , d = []
        , m = []
        , f = [n, i]
        , p = [0, u ? -e : e]
        , c = 0
        , _ = Math.atan2(n - i, e)
        , g = s;
    g.z = Math.sin(_);
    for (var v = Math.cos(_), y = 0; y < p.length; y++) {
        m[y] = [];
        for (var C = f[y], w = 0; w < r; w++) {
            m[y].push(c++);
            var x = a * w
                , A = C * Math.cos(x)
                , b = C * Math.sin(x);
            l.push(A, b, p[y]),
                A = v * Math.cos(x),
                b = v * Math.sin(x),
                h.push(A, b, g.z),
                d.push(y / (p.length - 1), 0)
        }
    }
    for (var M = [], y = 1; y < p.length; y++)
        for (var w = 1; w < r; w += 1) {
            var P = m[y - 1][w - 1]
                , S = m[y][w - 1];
            m[y][w],
                m[y - 1][w];
            w % 8 == 1 && M.push(P, S)
        }
    M = new Int16Array(M),
        l = new Float32Array(l),
        h = new Float32Array(h),
        d = new Float32Array(d);
    var F = {
        position: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.DOUBLE,
            componentsPerAttribute: 3,
            values: l
        }),
        normal: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
            componentsPerAttribute: 3,
            values: h
        }),
        st: new Cesium.GeometryAttribute({
            componentDatatype: Cesium.ComponentDatatype.FLOAT,
            componentsPerAttribute: 2,
            values: d
        })
    }
        , E = Cesium.BoundingSphere.fromVertices(l)
        , T = new Cesium.Geometry({
            attributes: F,
            indices: M,
            primitiveType: Cesium.PrimitiveType.LINES,
            boundingSphere: E
        });
    return l = [],
        M = [],
        d = [],
        T
};
CylinderGeometry.fromAngleAndLength = function (t, e, i) {
    return t = Cesium.Math.toRadians(t),
        new n({
            topRadius: Math.tan(t) * e / 2,
            bottomRadius: 0,
            length: e,
            zReverse: i
        })
};

export default CylinderGeometry;