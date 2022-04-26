//计算钳击箭头坐标
import PlotUtil from "./plotUtil.js";
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
    this.plotUtil = new PlotUtil(opt);
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

export default DoubleArrow