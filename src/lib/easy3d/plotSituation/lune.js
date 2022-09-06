//弓形面
import PlotUtil from "./plotUtil.js";
class Lune {
    constructor(opt) {
        if (!opt) opt = {};
        //影响因素
        this.positions = null;
        this.plotUtil = new PlotUtil(opt);
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

export default Lune