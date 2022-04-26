//计算粗直箭头坐标
import PlotUtil from "./plotUtil.js";
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
        this.plotUtil = new PlotUtil(opt);
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

export default StraightArrow