// 曲线旗
import PlotUtil from "./plotUtil.js";
class Curve {
  constructor(arg) {
    var opt = {}
    //影响因素
    this.typeName = "Curve";
    this.plotUtil = new PlotUtil(opt);
    this.t = 0.3;
  }
  startCompute (positions) {
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

export default Curve