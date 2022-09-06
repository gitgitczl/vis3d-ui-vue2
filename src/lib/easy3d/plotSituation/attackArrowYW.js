//攻击箭头（燕尾）
import PlotUtil from "./plotUtil.js";
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


export default AttackArrowYW