// 曲线旗
import PlotUtil from "./plotUtil.js";
class CurveFlag {
  constructor(arg) {
    var opt = {}
    //影响因素
    this.typeName = "CurveFlag";
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

export default CurveFlag