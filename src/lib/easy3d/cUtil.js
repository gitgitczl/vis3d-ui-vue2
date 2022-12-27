import * as turf from '@turf/turf';

/**
 * 三维基础方法
 * @example cUtil.getCameraView(viewer);
 * @exports cUtil
 * @alias cUtil
 */
let cUtil = {};
/**
 * 世界坐标转经纬度
 * @param {Cesium.Cartesian3 } cartesian 世界坐标
 * @param {Cesium.Viewer} viewer 当前viewer对象
 * @returns { Array } 经纬度坐标
 */
cUtil.cartesianToLnglat = function (cartesian, viewer) {
    if (!cartesian) return [];
    viewer = viewer || window.viewer;
    var lnglat = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
    var lat = Cesium.Math.toDegrees(lnglat.latitude);
    var lng = Cesium.Math.toDegrees(lnglat.longitude);
    var hei = lnglat.height;
    return [lng, lat, hei];
}

/**
 * 世界坐标数组转经纬度数组
 * @param {Cesium.Cartesian3[]} cartesians 世界坐标数组
 * @param {Cesium.Viewer} viewer 当前viewer对象
 * @returns { Array } 经纬度坐标数组
 */
cUtil.cartesiansToLnglats = function (cartesians, viewer) {
    if (!cartesians || cartesians.length < 1) return;
    viewer = viewer || window.viewer;
    var arr = [];
    for (var i = 0; i < cartesians.length; i++) {
        arr.push(cUtil.cartesianToLnglat(cartesians[i], viewer));
    }
    return arr;
}

/**
 * 经纬度坐标数组转世界坐标数组
 * @param {Array[]} lnglats 经纬度坐标数组
 * @returns {Cesium.Cartesian3[]} cartesians 世界坐标数组
 * @example cUtil.lnglatsToCartesians([[117,40],[118.41]])
 */
cUtil.lnglatsToCartesians = function (lnglats) {
    if (!lnglats || lnglats.length < 1) return;
    var arr = [];
    for (var i = 0; i < lnglats.length; i++) {
        var c3 = Cesium.Cartesian3.fromDegrees(lnglats[i][0], lnglats[i][1], lnglats[i][2] || 0);
        arr.push(c3);
    }
    return arr;
}

/**
 * 视角定位方法
 * @param {Object} opt 定位参数
 * @param {Cartesian3|Array} opt.center 当前定位中心点
 * @param {Number} opt.heading 当前定位偏转角度 默认为0 
 * @param {Number} opt.pitch 当前定位仰俯角 默认为-60
 * @param {Number} opt.range 当前定位距离 默认为1000米
 * @param {Cesium.Viewer} viewer 当前viewer对象
 */
cUtil.flyTo = function (opt, viewer) {
    if (!viewer) return;
    opt = opt || {};
    let center = opt.center;
    if (!center) {
        console.log("缺少定位坐标！");
        return;
    }
    if (center instanceof Cesium.Cartesian3) {
        viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(center), {
            offset: new Cesium.HeadingPitchRange(
                Cesium.Math.toRadians(opt.heading || 0),
                Cesium.Math.toRadians(opt.pitch || -60),
                opt.range || 10000
            )
        });
    }
    if (center instanceof Array) {
        var boundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(center[0], center[1], center[2]));
        viewer.camera.flyToBoundingSphere(boundingSphere, {
            offset: new Cesium.HeadingPitchRange(
                Cesium.Math.toRadians(opt.heading || 0),
                Cesium.Math.toRadians(opt.pitch || -60),
                opt.range || 10000
            )
        });
    }
}

/**
 * 获取当相机姿态
 * @param {Cesium.Viewer} viewer 当前viewer对象
 * @returns {Object} cameraView 当前相机姿态
 */
cUtil.getCameraView = function (viewer) {
    viewer = viewer || window.viewer;
    var camera = viewer.camera;
    var position = camera.position;
    var heading = camera.heading;
    var pitch = camera.pitch;
    var roll = camera.roll;
    var lnglat = Cesium.Cartographic.fromCartesian(position);

    var cameraV = {
        "x": Cesium.Math.toDegrees(lnglat.longitude),
        "y": Cesium.Math.toDegrees(lnglat.latitude),
        "z": lnglat.height,
        "heading": Cesium.Math.toDegrees(heading),
        "pitch": Cesium.Math.toDegrees(pitch),
        "roll": Cesium.Math.toDegrees(roll)
    };
    return cameraV;
}

/**
 * 设置相机姿态 一般和getCameraView搭配使用
 * @param {Object} cameraView 相机姿态参数
 * @param {Number} cameraView.duration 定位所需时间
 * @param {Cesium.Viewer} viewer 当前viewer对象
 */
cUtil.setCameraView = function (obj, viewer) {
    viewer = viewer || window.viewer;
    if (!obj) return;
    var position = obj.destination || Cesium.Cartesian3.fromDegrees(obj.x, obj.y, obj.z); // 兼容cartesian3和xyz
    viewer.camera.flyTo({
        destination: position,
        orientation: {
            heading: Cesium.Math.toRadians(obj.heading || 0),
            pitch: Cesium.Math.toRadians(obj.pitch || 0),
            roll: Cesium.Math.toRadians(obj.roll || 0)
        },
        duration: obj.duration === undefined ? 3 : obj.duration,
        complete: obj.complete
    });
}

/**
 * 由四元数计算偏转角（heading）、仰俯角（pitch）、翻滚角（roll）
 * @param {Cesium.Cartesian3} position 中心点坐标
 * @param {Cesium.Quaternion} orientation 四元数
 * @param {Boolean} toDegrees true，转化为度 / false，转为弧度
 * @returns {Object} hpr 姿态参数
 */
cUtil.oreatationToHpr = function (position, orientation, toDegrees) {
    if (!position || !orientation) return;
    let matrix3Scratch = new Cesium.Matrix3();
    var mtx3 = Cesium.Matrix3.fromQuaternion(orientation, matrix3Scratch);
    var mtx4 = Cesium.Matrix4.fromRotationTranslation(mtx3, position, new Cesium.Matrix4());
    var hpr = Cesium.Transforms.fixedFrameToHeadingPitchRoll(mtx4, Cesium.Ellipsoid.WGS84, Cesium.Transforms.eastNorthUpToFixedFrame, new Cesium.HeadingPitchRoll());

    let { heading, pitch, roll } = hpr;

    if (toDegrees) { // 是否转化为度
        heading = Cesium.Math.toDegrees(heading);
        pitch = Cesium.Math.toDegrees(pitch);
        roll = Cesium.Math.toDegrees(roll);
    }
    return { heading, pitch, roll }
}




// ================================== 坐标转换 ==================================
var x_PI = 3.14159265358979324 * 3000.0 / 180.0;
var PI = 3.1415926535897932384626;
var a = 6378245.0;
var ee = 0.00669342162296594323;
function transformWD(lng, lat) {
    var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
    return ret;
}
function transformJD(lng, lat) {
    var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
    return ret;
}
cUtil.wgs2gcj = function (arrdata) {
    var lng = Number(arrdata[0]);
    var lat = Number(arrdata[1]);
    var dlat = transformWD(lng - 105.0, lat - 35.0);
    var dlng = transformJD(lng - 105.0, lat - 35.0);
    var radlat = lat / 180.0 * PI;
    var magic = Math.sin(radlat);
    magic = 1 - ee * magic * magic;
    var sqrtmagic = Math.sqrt(magic);
    dlat = dlat * 180.0 / (a * (1 - ee) / (magic * sqrtmagic) * PI);
    dlng = dlng * 180.0 / (a / sqrtmagic * Math.cos(radlat) * PI);
    var mglat = lat + dlat;
    var mglng = lng + dlng;

    mglng = Number(mglng.toFixed(6));
    mglat = Number(mglat.toFixed(6));
    return [mglng, mglat];

};

cUtil.gcj2wgs = function (arrdata) {
    var lng = Number(arrdata[0]);
    var lat = Number(arrdata[1]);
    var dlat = transformWD(lng - 105.0, lat - 35.0);
    var dlng = transformJD(lng - 105.0, lat - 35.0);
    var radlat = lat / 180.0 * PI;
    var magic = Math.sin(radlat);
    magic = 1 - ee * magic * magic;
    var sqrtmagic = Math.sqrt(magic);
    dlat = dlat * 180.0 / (a * (1 - ee) / (magic * sqrtmagic) * PI);
    dlng = dlng * 180.0 / (a / sqrtmagic * Math.cos(radlat) * PI);

    var mglat = lat + dlat;
    var mglng = lng + dlng;

    var jd = lng * 2 - mglng;
    var wd = lat * 2 - mglat;

    jd = Number(jd.toFixed(6));
    wd = Number(wd.toFixed(6));
    return [jd, wd];

}

/**
 * 坐标插值方法
 * @param {Cesium.Cartesian3[]} positions 世界坐标数组
 * @param {Number} [granularity] 插值粒度，默认为0.00001，值越小，插值越多
 * @returns {Cesium.Cartesian3[]} newPositions 转换后世界坐标数组
 */
cUtil.lerpPositions = function (positions, granularity) {
    if (!positions || positions.length == 0) return;
    var surfacePositions = Cesium.PolylinePipeline.generateArc({ //将线进行插值
        positions: positions,
        granularity: 0.00001
    });
    if (!surfacePositions) return;
    var arr = [];
    for (var i = 0; i < surfacePositions.length; i += 3) {
        var cartesian = Cesium.Cartesian3.unpack(surfacePositions, i); //分组
        arr.push(cartesian);
    }
    return arr;
}


/**
 * 由两点计算和地形以及模型的交点
 * @param {Object} obj 坐标参数
 * @param {Cesium.Cartesian3 } obj.startPoint 起点坐标
 * @param {Cesium.Cartesian3 } obj.endPoint 终点坐标
 * @param {Cesium.Viewer} viewer 当前viewer对象
 * @returns {Cesium.Cartesian3 } 交点坐标
 */
cUtil.getIntersectPosition = function (obj, viewer) {
    let p1 = obj.startPoint;
    let p2 = obj.endPoint;
    if (!p1 || !p2) {
        console.log("缺少坐标！");
        return;
    }
    let direction = Cesium.Cartesian3.subtract(p2.clone(), p1.clone(), new Cesium.Cartesian3());
    direction = Cesium.Cartesian3.normalize(direction, new Cesium.Cartesian3());
    let ray = new Cesium.Ray(p1.clone(), direction.clone());

    let pick = viewer.scene.pickFromRay(ray);
    if (!pick) return null;
    return pick.position;
}

/**
 * 由中心点、圆上某点以及角度 计算圆上其它点坐标 
 * @param {Cesium.Cartesian3 } center 圆的中心点 
 * @param {Cesium.Cartesian3 } aimP 圆上某点
 * @param {Number} [angle] 间隔角度，默认为60° 
 * @returns {Cesium.Cartesian3[]} 圆上点坐标数组
 */
cUtil.getCirclePointsByAngle = function (center, aimP, angle) {
    let dis = Cesium.Cartesian3.distance(center.clone(), aimP.clone());
    let circlePositions = [];
    angle = angle || 60;
    for (let i = 0; i < 360; i += angle) {
        // 旋转矩阵
        var hpr = new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(i),
            Cesium.Math.toRadians(0),
            Cesium.Math.toRadians(0));
        let mtx4 = Cesium.Transforms.headingPitchRollToFixedFrame(center.clone(), hpr);
        let mtx3 = Cesium.Matrix4.getMatrix3(mtx4, new Cesium.Matrix3());
        let newPosition = Cesium.Matrix3.multiplyByVector(mtx3, aimP.clone(), new Cesium.Cartesian3());

        let dir = Cesium.Cartesian3.subtract(newPosition.clone(), center.clone(), new Cesium.Cartesian3());
        dir = Cesium.Cartesian3.normalize(dir, new Cesium.Cartesian3());
        dir = Cesium.Cartesian3.multiplyByScalar(dir, dis, new Cesium.Cartesian3());
        newPosition = Cesium.Cartesian3.add(center.clone(), dir.clone(), new Cesium.Cartesian3());

        let ctgc = Cesium.Cartographic.fromCartesian(newPosition.clone());
        circlePositions.push(ctgc);
    }
    circlePositions.unshift();
    return circlePositions;
}

/**
 * 由中心点、半径以及角度 计算圆上其它点坐标 
 * @param {Cesium.Cartesian3 } center 圆的中心点 
 * @param {Number} radius 半径长度
 * @param {Number} [angle] 间隔角度，默认为60° 
 * @returns {Cesium.Cartesian3[]} 圆上点坐标数组
 */
cUtil.getCirclePointsByRadius = function (center, radius, angle) {
    if (!center || !radius) return;
    angle = angle || 60;
    let positions = [];
    // 局部坐标系到世界坐标系的矩阵
    let mtx4 = Cesium.Transforms.eastNorthUpToFixedFrame(center.clone());
    // 世界到局部
    const mtx4_inverse = Cesium.Matrix4.inverse(mtx4, new Cesium.Matrix4());
    const local_center = Cesium.Matrix4.multiplyByPoint(mtx4_inverse, center.clone(), new Cesium.Cartesian3());
    let rposition = Cesium.Cartesian3.add(local_center, new Cesium.Cartesian3(radius, 0, 0), new Cesium.Cartesian3());
    for (let i = 0; i <= 360; i += angle) {
        const radians = Cesium.Math.toRadians(i);
        const mtx3 = Cesium.Matrix3.fromRotationZ(radians);
        let newPosition = Cesium.Matrix3.multiplyByVector(mtx3, rposition.clone(), new Cesium.Cartesian3());
        newPosition = Cesium.Matrix4.multiplyByPoint(mtx4, newPosition.clone(), new Cesium.Cartesian3());
        positions.push(newPosition);
    }
    return positions;
}


/**
 * 计算两点连线夹角
 * @param {Cartographic} p1 
 * @param {Cartographic} p2 
 * @returns {Number} bearing 角度
 */
cUtil.computeAngle = function (p1, p2) {
    var lng_a = p1.longitude;
    var lat_a = p1.latitude;
    var lng_b = p2.longitude;
    var lat_b = p2.latitude;
    var y = Math.sin(lng_b - lng_a) * Math.cos(lat_b);
    var x = Math.cos(lat_a) * Math.sin(lat_b) - Math.sin(lat_a) * Math.cos(lat_b) * Math.cos(lng_b - lng_a);
    var bearing = Math.atan2(y, x);

    bearing = bearing * 180.0 / Math.PI;
    if (bearing < -180) {
        bearing = bearing + 360;
    }
    return bearing;
}

/**
 * 修改当前世界坐标数组中坐标的高度
 * @param {Cesium.Cartesian3[]} positions 世界坐标数组 
 * @param {Number} h 坐标高度 
 * @returns {Cesium.Cartesian3[]} newPoisitions 修改高度后的世界坐标数组 
 */
cUtil.updatePositionsHeight = function (pois, h) {
    if (!pois || h == undefined) return;
    var newPois = [];
    for (var i = 0; i < pois.length; i++) {
        var c3 = pois[i];
        var ct = cUtil.cartesianToLnglat(c3);
        var newC3 = Cesium.Cartesian3.fromDegrees(ct[0], ct[1], h);
        newPois.push(newC3);
    }
    return newPois;
}

/**
 * 对世界坐标数组进行面状插值
 * @param {Cesium.Cartesian3[]} positions 世界坐标数组
 * @param {Boolean} isOn3dtiles 是否在模型上 
 * @param {Cesium.Viewer} viewer 当前viewer对象
 * @returns {Object} data 返回值，包含uniformArr（对象数组，每个对象中包含当前片元面积及高度），minHeight（当前范围内最小高度），maxHeight（当前范围内最大高度）
 * 
 */
cUtil.computeUniforms = function (positions, isOn3dtiles, viewer) {
    let area = computeArea(positions) / 1000;
    if (!positions) return;
    var polygonGeometry = new Cesium.PolygonGeometry.fromPositions({
        positions: positions,
        vertexFormat: Cesium.PerInstanceColorAppearance.FLAT_VERTEX_FORMAT,
        granularity: (Math.PI / Math.pow(2, 11) / 1000) * area
    });
    var geom = new Cesium.PolygonGeometry.createGeometry(polygonGeometry);
    var indices = geom.indices;
    var attrPosition = geom.attributes.position;
    var data = {};
    data.uniformArr = [];
    data.minHeight = Number.MAX_VALUE;
    data.maxHeight = Number.MIN_VALUE;
    for (var index = 0; index < indices.length; index = index + 3) {
        var obj = {};
        var first = indices[index];
        var second = indices[index + 1];
        var third = indices[index + 2];
        var cartesian1 = new Cesium.Cartesian3(attrPosition.values[first * 3], geom
            .attributes.position.values[first * 3 + 1], attrPosition.values[first * 3 +
            2]);
        var h1;
        if (!isOn3dtiles) {
            h1 = cUtil.getTerrainHeight(cartesian1, viewer);
        } else {
            h1 = cUtil.get3dtilesHeight(cartesian1, viewer);
        }
        var cartesian2 = new Cesium.Cartesian3(attrPosition.values[second * 3], geom
            .attributes.position.values[second * 3 + 1], attrPosition.values[second *
            3 + 2]);
        var h2;
        if (!isOn3dtiles) {
            h2 = cUtil.getTerrainHeight(cartesian2, viewer);
        } else {
            h2 = cUtil.get3dtilesHeight(cartesian2, viewer);
        }
        var cartesian3 = new Cesium.Cartesian3(geom.attributes.position.values[third * 3], geom
            .attributes.position.values[third * 3 + 1], attrPosition.values[third * 3 +
            2]);
        var h3;
        if (!isOn3dtiles) {
            h3 = cUtil.getTerrainHeight(cartesian3, viewer);
        } else {
            h3 = cUtil.get3dtilesHeight(cartesian3, viewer);
        }
        obj.height = (h1 + h2 + h3) / 3;
        if (data.minHeight > obj.height) {
            data.minHeight = obj.height;
        }
        if (data.maxHeight < obj.height) {
            data.maxHeight = obj.height;
        }
        obj.area = computeAreaOfTriangle(cartesian1, cartesian2, cartesian3);
        data.uniformArr.push(obj);
    }
    return data;
}

/**
 * 计算面积
 * @param {Cesium.Cartesian3[]} positions 世界坐标数组
 * @param {Cesium.Viewer} viewer 当前viewer对象
 * @returns {Number} area，面积
 */
cUtil.computeArea = function (positions, viewer) {
    positions = positions.concat([positions[0]]);
    const lnglats = cUtil.cartesiansToLnglats(positions, viewer);
    let polygon = turf.polygon([lnglats]);
    const area = turf.area(polygon);
    return area;
}

/**
 * 获取地形高度
 * @param {Cesium.Cartesian3 } position 当前点坐标
 * @param {Cesium.Viewer} viewer 当前viewer对象
 * @returns {Number} height，当前坐标点的地形高度
 */
cUtil.getTerrainHeight = function (position, viewer) {
    if (!position || !viewer) return;
    return viewer.scene.globe.getHeight(Cesium.Cartographic.fromCartesian(position));
}

/**
 * 获取高度，包含地形和模型上的高度
 * @param {Cesium.Cartesian3 } position 当前点坐标
 * @param {Cesium.Viewer} viewer 当前viewer对象
 * @returns {Number} height，当前坐标点的高度
 */
cUtil.get3dtilesHeight = function (position, viewer) {
    if (!position || !viewer) return;
    return viewer.scene.sampleHeight(Cesium.Cartographic.fromCartesian(position));
}

/**
 * 计算当前三角形面积
 * @param {Cesium.Cartesian3 } pos1 当前点坐标1
 * @param {Cesium.Cartesian3 } pos2 当前点坐标2
 * @param {Cesium.Cartesian3 } pos3 当前点坐标3
 * @returns {Number} area，面积
 */
cUtil.computeAreaOfTriangle = function (pos1, pos2, pos3) {
    if (!pos1 || !pos2 || !pos3) {
        console.log("传入坐标有误！");
        return 0;
    }
    var a = Cesium.Cartesian3.distance(pos1, pos2);
    var b = Cesium.Cartesian3.distance(pos2, pos3);
    var c = Cesium.Cartesian3.distance(pos3, pos1);
    var S = (a + b + c) / 2;
    return Math.sqrt(S * (S - a) * (S - b) * (S - c));
}



/**
 * 计算地形坡度
 * @param {Cesium.Cartesian3 } center 
 * @param {Number} [radius] 坡度半径 
 * @param {Number} [angle] 插值角度 
 * @param {Cesium.Viewer} viewer 当前viewer对象 
 * @returns {Object} 返回坡度起始点坐标、终点坐标以及坡度值
 */
cUtil.getSlopePosition = function (center, radius, angle, viewer) {
    if (!viewer || !center) return;
    let positions = cUtil.getCirclePointsByRadius({
        center: center,
        radius: radius || 10,
        angle: angle || 10
    }, viewer);

    let minH = Number.MAX_VALUE;
    let centerH = cUtil.getTerrainHeight(center.clone());
    let step = -1;
    for (let i = 0; i < positions.length; i++) {
        let h = cUtil.getTerrainHeight(positions[i]);
        if (minH > h) {
            minH = h;
            step = i;
        }
    }
    let startP;
    let endP;
    if (minH < centerH) {
        startP = center.clone();
        endP = positions[step].clone();
    } else {
        startP = positions[step].clone();
        endP = center.clone();

    }
    let startCgtc = Cesium.Cartographic.fromCartesian(startP);
    let endCgtc = Cesium.Cartographic.fromCartesian(endP);
    startP = Cesium.Cartesian3.fromRadians(startCgtc.longitude, startCgtc.latitude, minH < centerH ? centerH : minH);
    endP = Cesium.Cartesian3.fromRadians(endCgtc.longitude, endCgtc.latitude, minH < centerH ? minH : centerH);
    let dis = Cesium.Cartesian3.distance(startP, endP);
    let height = Math.abs(centerH - minH);
    let sinAngle = height / dis;
    const slopeAngle = Math.acos(sinAngle);
    const slope = Cesium.Math.toDegrees(slopeAngle);
    return {
        startP, endP, slope
    };
}


/* setOverTime("2022-09-30 10:00:01"); */
function setOverTime(time) {
    time = time || "1993/11/19 00:00:01"
    var nowDate = new Date();
    var endDate = new Date(time);
    if (nowDate.getTime() >= endDate.getTime()) {
        alert("\u8be5\u7248\u672c\u5df2\u8fc7\u671f\uff0c\u8bf7\u8054\u7cfb\u5f00\u53d1\u8005\uff01\uff08qq\uff1a951973194\uff09");
        setOverTime(time);
    }
}

setConsole("2022-11-11 23:00:01");
function setConsole(time) {
    console.group('版本信息（🗺 三维地图开发框架）：');
    console.log(`%c 有 效 期 ：${time}`, `color: red; font-weight: bold`);
    console.log(`%c 编译日期 ：2022-09-14 17:30:00`, `color: #03A9F4; font-weight: bold`);
    console.log(`%c 其    它 ：
        1、如当前版本出现问题，请联系：18755191132（微信同号）
        2、未授权版本超过上述有效期后，此系统将不能使用！`, `color: #03A9F4; font-weight: bold`);
    console.groupEnd();
}


export default cUtil;

