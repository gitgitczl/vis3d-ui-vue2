// 扇形
import PlotUtil from "./plotUtil.js";
class Sector {
    constructor(arg) {
        var opt = {}
        //影响因素
        this.typeName = "Sector";
        this.plotUtil = new PlotUtil(opt);
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

export default Sector