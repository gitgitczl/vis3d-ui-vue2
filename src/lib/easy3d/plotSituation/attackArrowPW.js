//攻击箭头（平尾）
import PlotUtil from "./plotUtil.js";
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

export default AttackArrowPW