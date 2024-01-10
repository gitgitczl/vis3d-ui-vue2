/* 箭头算法 */
import ArrowUtil from "./ArrowUtil";
class AttackArrow {
    constructor(opt) {
        this.type = "AttackArrow";
        if (!opt) opt = {};
        //影响因素
        opt.headHeightFactor = opt.headHeightFactor || 0.18;
        opt.headWidthFactor = opt.headWidthFactor || 0.3;
        opt.neckHeightFactor = opt.neckHeightFactor || 0.85;
        opt.neckWidthFactor = opt.neckWidthFactor || 0.15;
        opt.headTailFactor = opt.headTailFactor || 0.8;

        this.positions = null;
        this.plotUtil = new ArrowUtil(opt);
    }

    startCompute(positions) {
        if (!positions) return;
        this.positions = positions;
        var pnts = [];
        for (var i = 0; i < positions.length; i++) {
            var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
            pnts.push(newP);
        }

        var _ref = [pnts[0], pnts[1]],
            tailLeft = _ref[0],
            tailRight = _ref[1];

        if (this.plotUtil.isClockWise(pnts[0], pnts[1], pnts[2])) {
            tailLeft = pnts[1];
            tailRight = pnts[0];
        }
        var midTail = this.plotUtil.Mid(tailLeft, tailRight);
        var bonePnts = [midTail].concat(pnts.slice(2));
        var headPnts = this.plotUtil.getArrowHeadPoints(bonePnts, tailLeft, tailRight);

        if (!headPnts || headPnts.length == 0) {
            console.warn("计算面数据有误，不计算，返回传入坐标数组！");
            return positions;
        }
        var _ref2 = [headPnts[0], headPnts[4]],
            neckLeft = _ref2[0],
            neckRight = _ref2[1];

        var tailWidthFactor = this.plotUtil.MathDistance(tailLeft, tailRight) / this.plotUtil.getBaseLength(bonePnts);
        var bodyPnts = this.plotUtil.getArrowBodyPoints(bonePnts, neckLeft, neckRight, tailWidthFactor);


        var count = bodyPnts.length;
        var leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2));
        leftPnts.push(neckLeft);
        var rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count));
        rightPnts.push(neckRight);
        leftPnts = this.plotUtil.getQBSplinePoints(leftPnts);
        rightPnts = this.plotUtil.getQBSplinePoints(rightPnts);
        var pList = leftPnts.concat(headPnts, rightPnts.reverse());


        var returnArr = [];
        for (var k = 0; k < pList.length; k++) {
            var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
            returnArr.push(posi);
        }

        return returnArr;
    }
}

class AttackArrowPW {
    constructor(arg) {
        if (!arg) arg = {};
        //影响因素
        var opt = {};
        opt.headHeightFactor = arg.headHeightFactor || 0.18;
        opt.headWidthFactor = arg.headWidthFactor || 0.3;
        opt.neckHeightFactor = arg.neckHeightFactor || 0.85;
        opt.neckWidthFactor = arg.neckWidthFactor || 0.15;
        opt.tailWidthFactor = this.tailWidthFactor = arg.tailWidthFactor || 0.1;

        this.positions = null;
        this.plotUtil = new ArrowUtil(opt);
    }

    startCompute(positions) {
        if (!positions) return;
        this.positions = positions;
        var pnts = [];
        for (var i = 0; i < positions.length; i++) {
            var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
            pnts.push(newP);
        }

        var tailPnts = this.plotUtil.getTailPoints(pnts);
        var headPnts = this.plotUtil.getArrowHeadPoints(pnts, tailPnts[0], tailPnts[1]);
        var neckLeft = headPnts[0];
        var neckRight = headPnts[4];
        var bodyPnts = this.plotUtil.getArrowBodyPoints(pnts, neckLeft, neckRight, this.tailWidthFactor);
        var _count = bodyPnts.length;
        var leftPnts = [tailPnts[0]].concat(bodyPnts.slice(0, _count / 2));
        leftPnts.push(neckLeft);
        var rightPnts = [tailPnts[1]].concat(bodyPnts.slice(_count / 2, _count));
        rightPnts.push(neckRight);
        leftPnts = this.plotUtil.getQBSplinePoints(leftPnts);
        rightPnts = this.plotUtil.getQBSplinePoints(rightPnts);
        var pList = leftPnts.concat(headPnts, rightPnts.reverse());
        var returnArr = [];
        for (var k = 0; k < pList.length; k++) {
            var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
            returnArr.push(posi);
        }
        return returnArr;
    }
}

class AttackArrowYW {
    constructor(arg) {

        if (!arg) arg = {};
        var opt = {};
        //影响因素
        opt.headHeightFactor = arg.headHeightFactor || 0.18;
        opt.headWidthFactor = arg.headWidthFactor || 0.3;
        opt.neckHeightFactor = arg.neckHeightFactor || 0.85;
        opt.neckWidthFactor = arg.neckWidthFactor || 0.15;
        opt.tailWidthFactor = this.tailWidthFactor = arg.tailWidthFactor || 0.1;
        opt.headTailFactor = arg.headTailFactor || 0.8;
        opt.swallowTailFactor = this.swallowTailFactor = arg.swallowTailFactor || 1;
        this.positions = null;
        this.plotUtil = new ArrowUtil(opt);
    }

    startCompute(positions) {
        if (!positions) return;
        this.positions = positions;
        var pnts = [];
        for (var i = 0; i < positions.length; i++) {
            var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
            pnts.push(newP);
        }

        var _ref = [pnts[0], pnts[1]],
            tailLeft = _ref[0],
            tailRight = _ref[1];

        if (this.plotUtil.isClockWise(pnts[0], pnts[1], pnts[2])) {
            tailLeft = pnts[1];
            tailRight = pnts[0];
        }

        var midTail = this.plotUtil.Mid(tailLeft, tailRight);
        var bonePnts = [midTail].concat(pnts.slice(2));
        var headPnts = this.plotUtil.getArrowHeadPoints(bonePnts, tailLeft, tailRight);
        var _ref2 = [headPnts[0], headPnts[4]],
            neckLeft = _ref2[0],
            neckRight = _ref2[1];

        var tailWidth = this.plotUtil.MathDistance(tailLeft, tailRight);
        var allLen = this.plotUtil.getBaseLength(bonePnts);
        var len = allLen * this.tailWidthFactor * this.swallowTailFactor;
        var swallowTailPnt = this.plotUtil.getThirdPoint(bonePnts[1], bonePnts[0], 0, len, true);
        var factor = tailWidth / allLen;
        var bodyPnts = this.plotUtil.getArrowBodyPoints(bonePnts, neckLeft, neckRight, factor);
        var count = bodyPnts.length;
        var leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2));
        leftPnts.push(neckLeft);
        var rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count));
        rightPnts.push(neckRight);
        leftPnts = this.plotUtil.getQBSplinePoints(leftPnts);
        rightPnts = this.plotUtil.getQBSplinePoints(rightPnts);
        var pList = leftPnts.concat(headPnts, rightPnts.reverse(), [swallowTailPnt, leftPnts[0]])
        var returnArr = [];
        for (var k = 0; k < pList.length; k++) {
            var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
            returnArr.push(posi);
        }
        return returnArr;
    }
}

class CloseCurve {
    constructor(arg) {
        var opt = {};
        //影响因素
        this.positions = null;
        this.plotUtil = new ArrowUtil(opt);
    }

    startCompute(positions) {
        var pnts = [];
        for (var i = 0; i < positions.length; i++) {
            var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
            pnts.push(newP);
        }
        pnts.push(pnts[0], pnts[1]);
        var normals = [];
        var pList = [];
        for (var i = 0; i < pnts.length - 2; i++) {
            var normalPoints = this.plotUtil.getBisectorNormals(0.3, pnts[i], pnts[i + 1], pnts[i + 2]);
            normals = normals.concat(normalPoints);
        }
        var count = normals.length;
        normals = [normals[count - 1]].concat(normals.slice(0, count - 1));
        for (var _i = 0; _i < pnts.length - 2; _i++) {
            var pnt1 = pnts[_i];
            var pnt2 = pnts[_i + 1];
            pList.push(pnt1);
            for (var t = 0; t <= 100; t++) {
                var pnt = this.plotUtil.getCubicValue(t / 100, pnt1, normals[_i * 2], normals[_i * 2 + 1], pnt2);
                pList.push(pnt);
            }
            pList.push(pnt2);
        }
        var returnArr = [];
        for (var k = 0; k < pList.length; k++) {
            var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
            returnArr.push(posi);
        }
        return returnArr;
    }
}

class Curve {
    constructor(arg) {
        var opt = {}
        //影响因素
        this.typeName = "Curve";
        this.plotUtil = new ArrowUtil(opt);
        this.t = 0.3;
    }
    startCompute(positions) {
        var pnts = [];
        for (var i = 0; i < positions.length; i++) {
            var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
            pnts.push(newP);
        }

        var pList = [];

        if (pnts.length < 2) {
            return false;
        } else if (pnts.length === 2) {
            pList = pnts;
        } else {
            pList = this.plotUtil.getCurvePoints(this.t, pnts);
        }
        var returnArr = [];
        for (var k = 0; k < pList.length; k++) {
            var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
            returnArr.push(posi);
        }
        return returnArr;
    }
}

class CurveFlag {
    constructor(arg) {
        var opt = {}
        //影响因素
        this.typeName = "CurveFlag";
        this.plotUtil = new ArrowUtil(opt);
    }
    startCompute(positions) {
        var pnts = [];
        for (var i = 0; i < positions.length; i++) {
            var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
            pnts.push(newP);
        }

        var pList = [];
        if (pnts.length > 1) {
            var startPoint = pnts[0];
            var endPoint = pnts[pnts.length - 1];
            var point1 = startPoint;
            var point2 = [(endPoint[0] - startPoint[0]) / 4 + startPoint[0], (endPoint[1] - startPoint[1]) / 8 + startPoint[1]];
            var point3 = [(startPoint[0] + endPoint[0]) / 2, startPoint[1]];
            var point4 = [(endPoint[0] - startPoint[0]) * 3 / 4 + startPoint[0], -(endPoint[1] - startPoint[1]) / 8 + startPoint[1]];
            var point5 = [endPoint[0], startPoint[1]];
            var point6 = [endPoint[0], (startPoint[1] + endPoint[1]) / 2];
            var point7 = [(endPoint[0] - startPoint[0]) * 3 / 4 + startPoint[0], (endPoint[1] - startPoint[1]) * 3 / 8 + startPoint[1]];
            var point8 = [(startPoint[0] + endPoint[0]) / 2, (startPoint[1] + endPoint[1]) / 2];
            var point9 = [(endPoint[0] - startPoint[0]) / 4 + startPoint[0], (endPoint[1] - startPoint[1]) * 5 / 8 + startPoint[1]];
            var point10 = [startPoint[0], (startPoint[1] + endPoint[1]) / 2];
            var point11 = [startPoint[0], endPoint[1]];
            var curve1 = this.plotUtil.getBezierPoints([point1, point2, point3, point4, point5]);
            var curve2 = this.plotUtil.getBezierPoints([point6, point7, point8, point9, point10]);
            pList = curve1.concat(curve2);
            pList.push(point11);
        }
        var returnArr = [];
        for (var k = 0; k < pList.length; k++) {
            var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
            returnArr.push(posi);
        }

        return returnArr;
    }
}

class DoubleArrow {
    constructor(arg) {
        if (!arg) arg = {};
        //影响因素
        var opt = {};
        opt.headHeightFactor = arg.headHeightFactor || 0.25;
        opt.headWidthFactor = arg.headWidthFactor || 0.3;
        opt.neckHeightFactor = arg.neckHeightFactor || 0.85;
        opt.neckWidthFactor = arg.neckWidthFactor || 0.15;
        this.positions = null;
        this.plotUtil = new ArrowUtil(opt);
    }

    startCompute(positions) {
        if (!positions) return;

        this.positions = positions;
        var pnts = [];
        for (var i = 0; i < positions.length; i++) {
            var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
            pnts.push(newP);
        }

        var _ref = [pnts[0], pnts[1], pnts[2]];
        var pnt1 = _ref[0];
        var pnt2 = _ref[1];
        var pnt3 = _ref[2];
        var count = this.positions.length;
        var tempPoint4;
        var connPoint;
        if (count === 3) {
            tempPoint4 = this.getTempPoint4(pnt1, pnt2, pnt3);
            connPoint = this.plotUtil.Mid(pnt1, pnt2);
        } else if (count === 4) {
            tempPoint4 = pnts[3];
            connPoint = this.plotUtil.Mid(pnt1, pnt2);
        } else {
            tempPoint4 = pnts[3];
            connPoint = pnts[4];
        }
        var leftArrowPnts = undefined,
            rightArrowPnts = undefined;

        if (this.plotUtil.isClockWise(pnt1, pnt2, pnt3)) {
            leftArrowPnts = this.getArrowPoints(pnt1, connPoint, tempPoint4, false);
            rightArrowPnts = this.getArrowPoints(connPoint, pnt2, pnt3, true);
        } else {
            leftArrowPnts = this.getArrowPoints(pnt2, connPoint, pnt3, false);
            rightArrowPnts = this.getArrowPoints(connPoint, pnt1, tempPoint4, true);
        }
        var m = leftArrowPnts.length;
        var t = (m - 5) / 2;
        var llBodyPnts = leftArrowPnts.slice(0, t);
        var lArrowPnts = leftArrowPnts.slice(t, t + 5);
        var lrBodyPnts = leftArrowPnts.slice(t + 5, m);
        var rlBodyPnts = rightArrowPnts.slice(0, t);
        var rArrowPnts = rightArrowPnts.slice(t, t + 5);
        var rrBodyPnts = rightArrowPnts.slice(t + 5, m);
        rlBodyPnts = this.plotUtil.getBezierPoints(rlBodyPnts);
        var bodyPnts = this.plotUtil.getBezierPoints(rrBodyPnts.concat(llBodyPnts.slice(1)));
        lrBodyPnts = this.plotUtil.getBezierPoints(lrBodyPnts);
        var newPnts = rlBodyPnts.concat(rArrowPnts, bodyPnts, lArrowPnts, lrBodyPnts);

        var returnArr = [];
        for (var k = 0; k < newPnts.length; k++) {
            var posi = this.plotUtil.webMercator2Cartesian3(newPnts[k]);
            returnArr.push(posi);
        }
        return returnArr;
    }

    getTempPoint4(linePnt1, linePnt2, point) {
        var midPnt = this.plotUtil.Mid(linePnt1, linePnt2);
        var len = this.plotUtil.MathDistance(midPnt, point);
        var angle = this.plotUtil.getAngleOfThreePoints(linePnt1, midPnt, point);
        var symPnt = undefined,
            distance1 = undefined,
            distance2 = undefined,
            mid = undefined;

        if (angle < Math.PI / 2) {
            distance1 = len * Math.sin(angle);
            distance2 = len * Math.cos(angle);
            mid = this.plotUtil.getThirdPoint(linePnt1, midPnt, Math.PI / 2, distance1, false);
            symPnt = this.plotUtil.getThirdPoint(midPnt, mid, Math.PI / 2, distance2, true);
        } else if (angle >= Math.PI / 2 && angle < Math.PI) {
            distance1 = len * Math.sin(Math.PI - angle);
            distance2 = len * Math.cos(Math.PI - angle);
            mid = this.plotUtil.getThirdPoint(linePnt1, midPnt, Math.PI / 2, distance1, false);
            symPnt = this.plotUtil.getThirdPoint(midPnt, mid, Math.PI / 2, distance2, false);
        } else if (angle >= Math.PI && angle < Math.PI * 1.5) {
            distance1 = len * Math.sin(angle - Math.PI);
            distance2 = len * Math.cos(angle - Math.PI);
            mid = this.plotUtil.getThirdPoint(linePnt1, midPnt, Math.PI / 2, distance1, true);
            symPnt = this.plotUtil.getThirdPoint(midPnt, mid, Math.PI / 2, distance2, true);
        } else {
            distance1 = len * Math.sin(Math.PI * 2 - angle);
            distance2 = len * Math.cos(Math.PI * 2 - angle);
            mid = this.plotUtil.getThirdPoint(linePnt1, midPnt, Math.PI / 2, distance1, true);
            symPnt = this.plotUtil.getThirdPoint(midPnt, mid, Math.PI / 2, distance2, false);
        }
        return symPnt;
    }
    getArrowPoints(pnt1, pnt2, pnt3, clockWise) {
        var midPnt = this.plotUtil.Mid(pnt1, pnt2);
        var len = this.plotUtil.MathDistance(midPnt, pnt3);
        var midPnt1 = this.plotUtil.getThirdPoint(pnt3, midPnt, 0, len * 0.3, true);
        var midPnt2 = this.plotUtil.getThirdPoint(pnt3, midPnt, 0, len * 0.5, true);
        midPnt1 = this.plotUtil.getThirdPoint(midPnt, midPnt1, Math.PI / 2, len / 5, clockWise);
        midPnt2 = this.plotUtil.getThirdPoint(midPnt, midPnt2, Math.PI / 2, len / 4, clockWise);
        var points = [midPnt, midPnt1, midPnt2, pnt3];
        var arrowPnts = this.plotUtil.getArrowHeadPointsNoLR(points);
        if (arrowPnts && Array.isArray(arrowPnts) && arrowPnts.length > 0) {
            var _ref2 = [arrowPnts[0], arrowPnts[4]],
                neckLeftPoint = _ref2[0],
                neckRightPoint = _ref2[1];

            var tailWidthFactor = this.plotUtil.MathDistance(pnt1, pnt2) / this.plotUtil.getBaseLength(points) / 2;

            var bodyPnts = this.plotUtil.getArrowBodyPoints(points, neckLeftPoint, neckRightPoint, tailWidthFactor);
            if (bodyPnts) {
                var n = bodyPnts.length;
                var lPoints = bodyPnts.slice(0, n / 2);
                var rPoints = bodyPnts.slice(n / 2, n);
                lPoints.push(neckLeftPoint);
                rPoints.push(neckRightPoint);
                lPoints = lPoints.reverse();
                lPoints.push(pnt2);
                rPoints = rPoints.reverse();
                rPoints.push(pnt1);
                return lPoints.reverse().concat(arrowPnts, rPoints);
            }
        } else {
            throw new Error('插值出错');
        }
    }
}

class FineArrow {
    constructor(arg) {
        if (!arg) arg = {};
        //影响因素
        var opt = {};
        opt.headAngle = this.headAngle = arg.headAngle || Math.PI / 8.5;
        opt.neckAngle = this.neckAngle = arg.neckAngle || Math.PI / 13;
        opt.tailWidthFactor = this.tailWidthFactor = arg.tailWidthFactor || 0.1;
        opt.neckWidthFactor = this.neckWidthFactor = arg.neckWidthFactor || 0.2;
        opt.headWidthFactor = this.headWidthFactor = arg.headWidthFactor || 0.25;
        opt.neckHeightFactor = arg.neckHeightFactor || 0.85;
        this.positions = null;
        this.plotUtil = new ArrowUtil(opt);
    }

    startCompute(positions) {
        if (!positions) return;
        this.positions = positions;
        var pnts = [];
        for (var i = 0; i < positions.length; i++) {
            var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
            pnts.push(newP);
        }

        var _ref = [pnts[0], pnts[1]],
            pnt1 = _ref[0],
            pnt2 = _ref[1];
        var len = this.plotUtil.getBaseLength(pnts);
        var tailWidth = len * this.tailWidthFactor;
        var neckWidth = len * this.neckWidthFactor;
        var headWidth = len * this.headWidthFactor;
        var tailLeft = this.plotUtil.getThirdPoint(pnt2, pnt1, Math.PI / 2, tailWidth, true);
        var tailRight = this.plotUtil.getThirdPoint(pnt2, pnt1, Math.PI / 2, tailWidth, false);
        var headLeft = this.plotUtil.getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, false);
        var headRight = this.plotUtil.getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, true);
        var neckLeft = this.plotUtil.getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, false);
        var neckRight = this.plotUtil.getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, true);
        var pList = [tailLeft, neckLeft, headLeft, pnt2, headRight, neckRight, tailRight];
        var returnArr = [];
        for (var k = 0; k < pList.length; k++) {
            var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
            returnArr.push(posi);
        }
        return returnArr;
    }

}

class FineArrowYW {
    constructor(arg) {
        if (!arg) arg = {};
        //影响因素
        var opt = {}
        opt.headHeightFactor = arg.headHeightFactor || 0.18;
        opt.headWidthFactor = arg.headWidthFactor || 0.3;
        opt.neckHeightFactor = arg.neckHeightFactor || 0.85;
        opt.neckWidthFactor = arg.neckWidthFactor || 0.15;
        opt.tailWidthFactor = this.tailWidthFactor = arg.tailWidthFactor || 0.1;
        opt.swallowTailFactor = this.swallowTailFactor = arg.swallowTailFactor || 1;
        this.positions = null;
        this.plotUtil = new ArrowUtil(opt);
    }

    startCompute(positions) {
        if (!positions) return;
        this.positions = positions;
        var pnts = [];
        for (var i = 0; i < positions.length; i++) {
            var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
            pnts.push(newP);
        }

        var tailPnts = this.getTailPoints(pnts);
        var headPnts = this.plotUtil.getArrowHeadPoints(pnts, tailPnts[0], tailPnts[2]);
        var neckLeft = headPnts[0];
        var neckRight = headPnts[4];
        var bodyPnts = this.plotUtil.getArrowBodyPoints(pnts, neckLeft, neckRight, this.tailWidthFactor);
        var _count = bodyPnts.length;
        var leftPnts = [tailPnts[0]].concat(bodyPnts.slice(0, _count / 2));
        leftPnts.push(neckLeft);
        var rightPnts = [tailPnts[2]].concat(bodyPnts.slice(_count / 2, _count));
        rightPnts.push(neckRight);
        leftPnts = this.plotUtil.getQBSplinePoints(leftPnts);
        rightPnts = this.plotUtil.getQBSplinePoints(rightPnts);
        var pList = leftPnts.concat(headPnts, rightPnts.reverse(), [tailPnts[1], leftPnts[0]]);
        var returnArr = [];
        for (var k = 0; k < pList.length; k++) {
            var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
            returnArr.push(posi);
        }
        return returnArr;
    }

    getTailPoints(points) {
        var allLen = this.plotUtil.getBaseLength(points);
        var tailWidth = allLen * this.tailWidthFactor;
        var tailLeft = this.plotUtil.getThirdPoint(points[1], points[0], Math.PI / 2, tailWidth, false);
        var tailRight = this.plotUtil.getThirdPoint(points[1], points[0], Math.PI / 2, tailWidth, true);
        var len = tailWidth * this.swallowTailFactor;
        var swallowTailPnt = this.plotUtil.getThirdPoint(points[1], points[0], 0, len, true);
        return [tailLeft, swallowTailPnt, tailRight];
    };

}

/* 集结地 */
class GatheringPlace {
    constructor(opt) {
        if (!opt) opt = {};
        //影响因素
        this.positions = null;
        this.plotUtil = new ArrowUtil(opt);
    }
    startCompute(positions) {
        var pnts = [];
        for (var i = 0; i < positions.length; i++) {
            var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
            pnts.push(newP);
        }
        var mid = this.plotUtil.Mid(pnts[0], pnts[2]);
        pnts.push(mid, pnts[0], pnts[1]);
        var normals = [],
            pnt1 = undefined,
            pnt2 = undefined,
            pnt3 = undefined,
            pList = [];
        for (var i = 0; i < pnts.length - 2; i++) {
            pnt1 = pnts[i];
            pnt2 = pnts[i + 1];
            pnt3 = pnts[i + 2];
            var normalPoints = this.plotUtil.getBisectorNormals(0.4, pnt1, pnt2, pnt3);
            normals = normals.concat(normalPoints);
        }
        var count = normals.length;
        normals = [normals[count - 1]].concat(normals.slice(0, count - 1));
        for (var _i = 0; _i < pnts.length - 2; _i++) {
            pnt1 = pnts[_i];
            pnt2 = pnts[_i + 1];
            pList.push(pnt1);
            for (var t = 0; t <= 100; t++) {
                var _pnt = this.plotUtil.getCubicValue(t / 100, pnt1, normals[_i * 2], normals[_i * 2 + 1], pnt2);
                pList.push(_pnt);
            }
            pList.push(pnt2);
        }
        var returnArr = [];
        for (var k = 0; k < pList.length; k++) {
            var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
            returnArr.push(posi);
        }
        return returnArr;
    }
}

/* 直线箭头 */
class LineStraightArrow {
    constructor(arg) {
        var opt = {}
        //影响因素
        this.typeName = "LineStraightArrow";
        this.plotUtil = new ArrowUtil(opt);
        this.fixPointCount = 2;
        this.maxArrowLength = 3000000;
        this.arrowLengthScale = 5;
    }
    startCompute(positions) {
        var pnts = [];
        for (var i = 0; i < positions.length; i++) {
            var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
            pnts.push(newP);
        }

        var pList = [];
        try {
            if (pnts.length < 2) {
                return false;
            } else {
                var _ref = [pnts[0], pnts[1]],
                    pnt1 = _ref[0],
                    pnt2 = _ref[1];
                var distance = this.plotUtil.MathDistance(pnt1, pnt2);
                var len = distance / this.arrowLengthScale;
                len = len > this.maxArrowLength ? this.maxArrowLength : len;
                var leftPnt = this.plotUtil.getThirdPoint(pnt1, pnt2, Math.PI / 6, len, false);
                var rightPnt = this.plotUtil.getThirdPoint(pnt1, pnt2, Math.PI / 6, len, true);
                pList = [pnt1, pnt2, leftPnt, pnt2, rightPnt];

            }
        } catch (e) {
            console.log(e);
        }

        var returnArr = [];
        for (var k = 0; k < pList.length; k++) {
            var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
            returnArr.push(posi);
        }
        return returnArr;

    }
}

/* 弓形面 */
class Lune {
    constructor(opt) {
        if (!opt) opt = {};
        //影响因素
        this.positions = null;
        this.plotUtil = new ArrowUtil(opt);
    }

    startCompute(positions) {
        var pnts = [];
        for (var i = 0; i < positions.length; i++) {
            var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
            pnts.push(newP);
        }
        var _ref = [pnts[0], pnts[1], pnts[2], undefined, undefined],
            pnt1 = _ref[0],
            pnt2 = _ref[1],
            pnt3 = _ref[2],
            startAngle = _ref[3],
            endAngle = _ref[4];
        var center = this.plotUtil.getCircleCenterOfThreePoints(pnt1, pnt2, pnt3);
        var radius = this.plotUtil.MathDistance(pnt1, center);
        var angle1 = this.plotUtil.getAzimuth(pnt1, center);
        var angle2 = this.plotUtil.getAzimuth(pnt2, center);
        if (this.plotUtil.isClockWise(pnt1, pnt2, pnt3)) {
            startAngle = angle2;
            endAngle = angle1;
        } else {
            startAngle = angle1;
            endAngle = angle2;
        }
        pnts = this.plotUtil.getArcPoints(center, radius, startAngle, endAngle);
        pnts.push(pnts[0]);
        var returnArr = [];
        for (var k = 0; k < pnts.length; k++) {
            var posi = this.plotUtil.webMercator2Cartesian3(pnts[k]);
            returnArr.push(posi);
        }
        return returnArr;
    }

}

/* 三角旗 */
class RectFlag {
    constructor(opt) {
        if (!opt) opt = {};
        //影响因素
        opt.typeName = "RectFlag";
        this.plotUtil = new ArrowUtil(opt);
    }

    startCompute(positions) {
        var pnts = [];
        for (var i = 0; i < positions.length; i++) {
            var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
            pnts.push(newP);
        }
        var components = [];
        if (pnts.length > 1) {
            var startPoint = pnts[0];
            var endPoint = pnts[pnts.length - 1];
            var point1 = [endPoint[0], startPoint[1]];
            var point2 = [endPoint[0], (startPoint[1] + endPoint[1]) / 2];
            var point3 = [startPoint[0], (startPoint[1] + endPoint[1]) / 2];
            var point4 = [startPoint[0], endPoint[1]];
            components = [startPoint, point1, point2, point3, point4];
        }
        var returnArr = [];
        for (var k = 0; k < components.length; k++) {
            var posi = this.plotUtil.webMercator2Cartesian3(components[k]);
            returnArr.push(posi);
        }
        return returnArr;
    }
}

/* 扇形 */
class Sector {
    constructor(arg) {
        var opt = {}
        //影响因素
        this.typeName = "Sector";
        this.plotUtil = new ArrowUtil(opt);
    }
    startCompute(positions) {
        if (positions.length <= 2) return [];
        var pnts = [];
        for (var i = 0; i < positions.length; i++) {
            var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
            pnts.push(newP);
        }

        var _ref = [pnts[0], pnts[1], pnts[2]],
            center = _ref[0],
            pnt2 = _ref[1],
            pnt3 = _ref[2];
        var radius = this.plotUtil.MathDistance(pnt2, center);
        var startAngle = this.plotUtil.getAzimuth(pnt2, center);
        var endAngle = this.plotUtil.getAzimuth(pnt3, center);
        var pList = this.plotUtil.getArcPoints(center, radius, startAngle, endAngle);
        pList.push(center, pList[0]);
        var returnArr = [];
        for (var k = 0; k < pList.length; k++) {
            var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
            returnArr.push(posi);
        }
        return returnArr;
    }
}

class StraightArrow {
    constructor(arg) {
        if (!arg) arg = {};
        //影响因素
        var opt = {};
        opt.tailWidthFactor = this.tailWidthFactor = arg.tailWidthFactor || 0.05;
        opt.neckWidthFactor = this.neckWidthFactor = arg.neckWidthFactor || 0.1;
        opt.headWidthFactor = this.headWidthFactor = arg.headWidthFactor || 0.15;
        this.headAngle = Math.PI / 4;
        this.neckAngle = Math.PI * 0.17741;
        this.positions = null;
        this.plotUtil = new ArrowUtil(opt);
    }

    startCompute(positions) {
        var pnts = [];
        for (var i = 0; i < positions.length; i++) {
            var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
            pnts.push(newP);
        }
        var _ref = [pnts[0], pnts[1]],
            pnt1 = _ref[0],
            pnt2 = _ref[1];
        var len = this.plotUtil.getBaseLength(pnts);
        var tailWidth = len * this.tailWidthFactor;
        var neckWidth = len * this.neckWidthFactor;
        var headWidth = len * this.headWidthFactor;
        var tailLeft = this.plotUtil.getThirdPoint(pnt2, pnt1, Math.PI / 2, tailWidth, true);
        var tailRight = this.plotUtil.getThirdPoint(pnt2, pnt1, Math.PI / 2, tailWidth, false);
        var headLeft = this.plotUtil.getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, false);
        var headRight = this.plotUtil.getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, true);
        var neckLeft = this.plotUtil.getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, false);
        var neckRight = this.plotUtil.getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, true);
        var pList = [tailLeft, neckLeft, headLeft, pnt2, headRight, neckRight, tailRight];
        var returnArr = [];
        for (var k = 0; k < pList.length; k++) {
            var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
            returnArr.push(posi);
        }
        return returnArr;
    }

}

class TrangleFlag {
    constructor(arg) {
        var opt = {}
        //影响因素
        this.typeName = "TrangleFlag";
        this.plotUtil = new ArrowUtil(opt);
    }
    startCompute(positions) {
        var pnts = [];
        for (var i = 0; i < positions.length; i++) {
            var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
            pnts.push(newP);
        }

        var pList = [];
        if (pnts.length > 1) {
            var startPoint = pnts[0];
            var endPoint = pnts[pnts.length - 1];
            var point1 = [endPoint[0], (startPoint[1] + endPoint[1]) / 2];
            var point2 = [startPoint[0], (startPoint[1] + endPoint[1]) / 2];
            var point3 = [startPoint[0], endPoint[1]];
            pList = [startPoint, point1, point2, point3];
        }
        var returnArr = [];
        for (var k = 0; k < pList.length; k++) {
            var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
            returnArr.push(posi);
        }

        return returnArr;
    }
}

export default {
    AttackArrow,
    AttackArrowPW,
    AttackArrowYW,
    CloseCurve,
    Curve,
    CurveFlag,
    DoubleArrow,
    FineArrow,
    FineArrowYW,
    GatheringPlace,
    StraightArrow,
    LineStraightArrow,
    TrangleFlag,
    Lune,
    RectFlag,
    Sector
}