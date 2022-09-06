// 曲线旗
import PlotUtil from "./plotUtil.js";
class LineStraightArrow {
  constructor(arg) {
    var opt = {}
    //影响因素
    this.typeName = "LineStraightArrow";
    this.plotUtil = new PlotUtil(opt);
    this.fixPointCount = 2;
    this.maxArrowLength = 3000000;
    this.arrowLengthScale = 5;
  }
  startCompute (positions) {
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

export default LineStraightArrow