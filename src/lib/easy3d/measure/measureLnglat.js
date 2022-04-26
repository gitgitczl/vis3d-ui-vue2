//经纬度 测量js
import BaseMeasure from "./baseMeasure";
import cUtil from "../cUtil";
class MeasureLnglat extends BaseMeasure{
    constructor(viewer, opt){
        super(viewer, opt);
        if(!opt) opt = {};
        this.style = opt.style || {};
        this.point = null;
        this.position = null;
        this.status = 0;
    }

    start () {
        this.status = "startCreate";
        var that = this;
        this.handler.setInputAction(function (evt) { //单击开始绘制
            that.status = "endCreate";
            var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
            if (!cartesian) return;
            that.position = cartesian;
            if (that.handler) {
                that.handler.destroy();
                that.handler = null;
            }
            
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.setInputAction(function (evt) {
            that.status = "creating";
            var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
            if (!cartesian) return;
            that.position = cartesian.clone();
            if (!Cesium.defined(that.point)) that.point = that.createPoint();
            var lnglat = cUtil.cartesianToLnglat(cartesian);
            that.point.label.text = "经度：" + lnglat[0].toFixed(6) + "\n纬度：" + lnglat[1].toFixed(6) + "\n高度：" + lnglat[2].toFixed(2) + "米";
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
       
    }
    //清除测量结果
    destroy () {
        this.status = "no";
        if (this.point) {
            this.viewer.entities.remove(this.point);
            this.point = null;
        }
       
        if (this.handler) {
            this.handler.destroy();
            this.handler = null;
        }
    }
  
    createPoint () {
        var that = this;
        var point = this.viewer.entities.add({
            position: new Cesium.CallbackProperty(function () {
                return that.position
            }, false),
            point: {
                show: true,
                outlineColor: Cesium.Color.YELLOW,
                pixelSize: 6,
                outlineWidth: 3,
                disableDepthTestDistance: Number.MAX_VALUE
            },
            label:{
                font: '24px Helvetica',
                fillColor: Cesium.Color.SKYBLUE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset: new Cesium.Cartesian2(0, -60)
            }
        });
        return point;
    }
  
}


export default MeasureLnglat;