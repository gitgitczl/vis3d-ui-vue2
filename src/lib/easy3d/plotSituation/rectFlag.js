import PlotUtil from "./plotUtil.js";
class RectFlag {
    constructor(opt) {
        if (!opt) opt = {};
        //影响因素
        opt.typeName = "RectFlag";
        this.plotUtil = new PlotUtil(opt);
    }

    startCompute(positions) {
        var pnts = [];
        for (var i = 0; i < positions.length; i++) {
            var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
            pnts.push(newP);
        }
        var components = [];
        if (pnts.length > 1) {
            var startPoint = pnts[0];
            var endPoint = pnts[pnts.length - 1];
            var point1 = [endPoint[0], startPoint[1]];
            var point2 = [endPoint[0], (startPoint[1] + endPoint[1]) / 2];
            var point3 = [startPoint[0], (startPoint[1] + endPoint[1]) / 2];
            var point4 = [startPoint[0], endPoint[1]];
            components = [startPoint, point1, point2, point3, point4];
        }
        var returnArr = [];
        for (var k = 0; k < components.length; k++) {
            var posi = this.plotUtil.webMercator2Cartesian3(components[k]);
            returnArr.push(posi);
        }
        return returnArr;
    }
}

export default RectFlag