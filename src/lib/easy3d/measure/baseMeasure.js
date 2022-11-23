let turf = require("turf/turf.js");
class BaseMeasure {
    constructor(viewer, opt) {
        opt = opt || {};
        this.viewer = viewer;
        this.objId = Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
        this.state = null;  // 标识当前状态 no startCreate creating endCreate startEdit endEdit editing
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.floatLable = null;
        this.unit = opt.unit;
        this.controlPoints = [];
        this.pointStyle = {};
        this.modifyPoint = null;
        this.promptStyle = opt.prompt || {
            show: true,
            offset: {
                x: 60,
                y: 60
            }
        }
    }

    createLine(positions, clampToGround) {
        if (!positions) return;
        let ent = this.viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(function () {
                    return positions
                }, false),
                show: true,
                material: new Cesium.PolylineOutlineMaterialProperty({
                    color: Cesium.Color.GOLD,
                    outlineWidth: 1,
                    outlineColor: Cesium.Color.BLACK,
                }),
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                width: 3,
                clampToGround: clampToGround
            }
        });

        return ent;
    }

    // 操作控制
    forbidDrawWorld(isForbid) {
        this.viewer.scene.screenSpaceCameraController.enableRotate = !isForbid;
        this.viewer.scene.screenSpaceCameraController.enableTilt = !isForbid;
        this.viewer.scene.screenSpaceCameraController.enableTranslate = !isForbid;
        this.viewer.scene.screenSpaceCameraController.enableInputs = !isForbid;
    }

    createLabel(c, text) {
        if (!c) return;
        return this.viewer.entities.add({
            position: c,
            label: {
                text: text || "",
                font: '18px Helvetica',
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0, -20)
            }
        });
    }

    setUnit(unit) {
        if (!unit) return;
        this.unit = unit;
    }

    // 角度计算
    getAzimuthtAndCenter(mtx, positions) {
        if (!positions || positions.length < 2) return;
        let center = positions[0].clone();
        mtx = mtx || Cesium.Transforms.eastNorthUpToFixedFrame(center.clone());
        let mtxInverse = Cesium.Matrix4.inverse(mtx, new Cesium.Matrix4());

        let aim = positions[1].clone();
        center = Cesium.Matrix4.multiplyByPoint(mtxInverse, center, new Cesium.Cartesian3());
        aim = Cesium.Matrix4.multiplyByPoint(mtxInverse, aim, new Cesium.Cartesian3());

        let newC = Cesium.Cartesian3.subtract(aim, center, new Cesium.Cartesian3());
        newC = Cesium.Cartesian3.normalize(newC, new Cesium.Cartesian3());
        const north = new Cesium.Cartesian3(0, 1, 0);
        const arc_north = Cesium.Cartesian3.dot(north, newC);
        // east用于判断与正北是否大于180度
        const east = new Cesium.Cartesian3(1, 0, 0);
        const arc_east = Cesium.Cartesian3.dot(east, aim);
        const radians_north = Math.acos(arc_north);
        let dg = Cesium.Math.toDegrees(radians_north);
        if (arc_east < 0) dg = 360 - dg;
        return dg;
    }

    formateLength(val, dw) {
        if (val == undefined) return;
        dw = dw || "m";
        let dwStr = '';
        if (dw == "km" || dw == "千米") {
            dwStr += (Number(val) / 1000).toFixed(2) + "km";
        } else if (dw == "m" || dw == "米") {
            dwStr += Number(val).toFixed(2) + "m";
        } else {

        }
        return dwStr;
    }

    formateArea(val, dw) {
        if (val == undefined) return;
        let dwStr = '';
        dw = dw || "m";
        if (dw == "km" || dw == "平方千米") {
            dwStr += (Number(val) / 1000000).toFixed(2) + "km²";
        } else if (dw == "m" || dw == "平方米") {
            dwStr += Number(val).toFixed(2) + "m²";
        } else {

        }
        return dwStr;
    }

    //兼容模型和地形上坐标拾取
    getCatesian3FromPX(px, viewer) {
        var picks = viewer.scene.drillPick(px);
        viewer.scene.render();
        var cartesian;
        var isOn3dtiles = false;
        for (var i = 0; i < picks.length; i++) {
            if ((picks[i] && picks[i].primitive) && picks[i].primitive instanceof Cesium.Cesium3DTileset) { //模型上拾取
                isOn3dtiles = true;
                break;
            }
        }
        if (isOn3dtiles) {
            cartesian = viewer.scene.pickPosition(px);
        } else {
            var ray = viewer.camera.getPickRay(px);
            if (!ray) return null;
            cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        }
        return cartesian;
    }

    // 获取长度
    getGroundLength(positions, callback) {
        var that = this;
        var ellipsoid = this.viewer.scene.globe.ellipsoid;
        let len = this.getLength(positions[0], positions[1]);
        if (!this.viewer.terrainProvider.availability) {
            console.log("缺少地形数据，或地形加载失败！");
            if (callback) callback(len);
            return;
        }

        let granularity = 0.00001;

        if (len > 10000) {
            granularity = granularity * 10;
        } else if (len > 50000) {
            granularity = granularity * 100;
        } else if (len > 100000) {
            granularity = granularity * 5000;
        } else {
            granularity = granularity * 10000;
        }

        var surfacePositions = Cesium.PolylinePipeline.generateArc({
            positions: positions,
            granularity: 0.00001
        });
        if (!surfacePositions) return;
        var cartographicArray = [];
        var tempHeight = Cesium.Cartographic.fromCartesian(positions[0]).height;
        for (var i = 0; i < surfacePositions.length; i += 3) {
            var cartesian = Cesium.Cartesian3.unpack(surfacePositions, i);
            cartographicArray.push(ellipsoid.cartesianToCartographic(cartesian));
        }


        Cesium.when(Cesium.sampleTerrainMostDetailed(that.viewer.terrainProvider, cartographicArray), function (updateLnglats) {
            var allLength = 0;
            var offset = 10.0;
            for (var i = 0; i < updateLnglats.length; i++) {
                var item = updateLnglats[i];
                if (!item.height) { //当未获取到当前坐标下的地形高度时 手动设置为初始点的高度
                    item.height = tempHeight;
                } else {
                    item.height += offset;
                }
            }
            var raisedPositions = ellipsoid.cartographicArrayToCartesianArray(updateLnglats); //转为世界坐标数组
            for (var z = 0; z < raisedPositions.length - 1; z++) {
                allLength += Cesium.Cartesian3.distance(raisedPositions[z], raisedPositions[z + 1]);
            }
            if (allLength)
                callback(allLength);
        });

    }



    // 坡度量算
    getSlope(position, callback) {
        if (!position) return;
        // 求出该点周围两点的坐标 构建平面
        var ctg = Cesium.Cartographic.fromCartesian(position);
        var random = 1 / 100000;
        var lat = Cesium.Math.toDegrees(ctg.latitude);
        var lng = Cesium.Math.toDegrees(ctg.longitude);
        var height = ctg.height;
        var newCtg1 = Cesium.Cartographic.fromDegrees(lng, lat + random);
        var newCtg2 = Cesium.Cartographic.fromDegrees(lng + random, lat);
        var that = this;
        Cesium.when(Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, [newCtg1, newCtg2]), function (updateLnglats) {
            for (var i = 0; i < updateLnglats.length; i++) {
                var item = updateLnglats[i];
                item.height = item.height ? item.height : height;
            }
            var raisedPositions = that.viewer.scene.globe.ellipsoid.cartographicArrayToCartesianArray(updateLnglats); //转为世界坐标数组
            var newPosition1 = raisedPositions[0];
            var newPosition2 = raisedPositions[1];
            var mtx = Cesium.Transforms.eastNorthUpToFixedFrame(position);
            var mtx_inverse = Cesium.Matrix4.inverse(mtx, new Cesium.Matrix4());

            position = Cesium.Matrix4.multiplyByPoint(mtx_inverse, position, new Cesium.Cartesian3());
            newPosition1 = Cesium.Matrix4.multiplyByPoint(mtx_inverse, newPosition1, new Cesium.Cartesian3());
            newPosition2 = Cesium.Matrix4.multiplyByPoint(mtx_inverse, newPosition2, new Cesium.Cartesian3());

            var v1 = Cesium.Cartesian3.subtract(newPosition1, position, new Cesium.Cartesian3());
            var v2 = Cesium.Cartesian3.subtract(newPosition2, position, new Cesium.Cartesian3());
            var cross = Cesium.Cartesian3.cross(v1, v2, new Cesium.Cartesian3());
            cross = Cesium.Cartesian3.normalize(cross, new Cesium.Cartesian3());
            var z = new Cesium.Cartesian3(0, 0, 1);
            var arc = Cesium.Cartesian3.dot(cross, z);
            var radians_north = Math.acos(arc);
            var dg = Cesium.Math.toDegrees(radians_north);
            dg = dg > 90 ? (180 - dg) : dg;
            if (callback) callback(dg);
        });
    }

    getLength(c1, c2) {
        if (!c1 || !c2) return 0;
        return Cesium.Cartesian3.distance(c1, c2) || 0;
    }

    //调用第三方插件计算面积 turf
    getAreaAndCenter(positions) {
        if (!positions || positions.length < 1) return;
        var cartographics = [];
        var turfPoints = [];
        for (var i = 0; i < positions.length; i++) {
            var cartesian3 = positions[i];
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
            cartographics.push([Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude)]);
            turfPoints.push(turf.point([Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude)]));
        }
        if (!cartographics.length) return;
        cartographics = cartographics.concat([cartographics[0]]);
        var polygon = turf.polygon([cartographics]);
        var area = turf.area(polygon);
        //获取当前范围的中心点
        var features = turf.featureCollection(turfPoints);
        var turfCenter = turf.center(features);
        var center = turfCenter.geometry.coordinates;

        return {
            area: area,
            center: Cesium.Cartesian3.fromDegrees(center[0], center[1])
        };
    }

    // 构建控制点
    createPoint(position) {
        if (!position) return;
        this.pointStyle.color = this.pointStyle.color || Cesium.Color.AQUA;
        this.pointStyle.outlineColor = this.pointStyle.color || Cesium.Color.WHITE;

        let color = this.pointStyle.color instanceof Cesium.Color ? this.pointStyle.color : Cesium.Color.fromCssColorString(this.pointStyle.color);
        color = color.withAlpha(this.pointStyle.colorAlpha || 0.8);

        let outlineColor = this.pointStyle.outlineColor instanceof Cesium.Color ? this.pointStyle.outlineColor : Cesium.Color.fromCssColorString(this.pointStyle.outlineColor);
        outlineColor = outlineColor.withAlpha(this.pointStyle.outlineColorAlpha || 0.8);

        return this.viewer.entities.add({
            position: position,
            point: {
                pixelSize: this.pointStyle.pixelSize || 6,
                color: color,
                outlineWidth: this.pointStyle.outlineWidth || 1,
                outlineColor: outlineColor,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            show: false
        });
    }



}

export default BaseMeasure;