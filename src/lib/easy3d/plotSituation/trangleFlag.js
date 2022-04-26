// 三角旗
import PlotUtil from "./plotUtil.js";
class TrangleFlag {
  constructor(arg) {
    var opt = {}
    //影响因素
    this.typeName = "TrangleFlag";
    this.plotUtil = new PlotUtil(opt);
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


export default TrangleFlag