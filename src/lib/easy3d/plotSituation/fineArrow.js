//计算粗单尖直箭头坐标
import PlotUtil from "./plotUtil.js";
class FineArrow {
    constructor(arg) {
        if (!arg) arg = {};
        //影响因素
        var opt = {};
        opt.headAngle = this.headAngle = arg.headAngle || Math.PI / 8.5;
        opt.neckAngle = this.neckAngle = arg.neckAngle || Math.PI / 13;
        opt.tailWidthFactor = this.tailWidthFactor = arg.tailWidthFactor || 0.1;
        opt.neckWidthFactor = this.neckWidthFactor = arg.neckWidthFactor || 0.2;
        opt.headWidthFactor = this.headWidthFactor = arg.headWidthFactor || 0.25;
        opt.neckHeightFactor = arg.neckHeightFactor || 0.85;
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

export default FineArrow