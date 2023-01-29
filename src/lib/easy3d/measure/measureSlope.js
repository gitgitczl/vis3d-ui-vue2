// 坡度测量
import BaseMeasure from "./baseMeasure";

/**
 * 坡度测量类
 * @class
 * @augments BaseMeasure
 * @alias BaseMeasure.MeasureSlope 
 */
class MeasureSlope extends BaseMeasure {
    constructor(viewer, opt) {
        if (!opt) opt = {};
        super(viewer, opt);
        this.style = opt.style || {};
        this.viewer = viewer;
        this.label = null;
        this.point = null;
    }

    //开始测量
    start() {
        this.state = "startCreate";
        var that = this;
        this.handler.setInputAction(function (evt) { //单击开始绘制
            if (that.handler) {
                that.handler.destroy();
                that.handler = null;
                that.state = "endCreate";
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.setInputAction(function (evt) {
            that.state = "creating";
            var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
            if (!cartesian) return;
            if (!that.point) {
                that.point = that.createPoint(cartesian);
            }
            that.point.position.setValue(cartesian);
            that.getSlope(cartesian, function (slop) {
                if (!that.label) that.label = that.createLabel(cartesian, "");
                that.label.position.setValue(cartesian);
                that.label.label.text = "坡度：" + slop.toFixed(2) + "°";
            });
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    endCreate() {
        let that = this;
        if (that.handler) {
            that.handler.destroy();
            that.handler = null;
        }
        that.state = "endCreate";
    }
    
    done() {
        if (this.state == "startCreate") {
            this.destroy();
        } else if (this.state == "startEdit" || this.state == "editing") {
            this.endEdit();
        } else {
            this.endCreate();
        }
    }

    //清除测量结果
    destroy() {
        this.state = "no";
        if (this.label) {
            this.viewer.entities.remove(this.label);
            this.label = null;
        }
        if (this.point) {
            this.viewer.entities.remove(this.point);
            this.point = null;
        }
        if (this.handler) {
            this.handler.destroy();
            this.handler = null;
        }
    }

    createPoint(position) {
        return this.viewer.entities.add({
            position: position,
            point: {
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                show: true,
                fillColor: Cesium.Color.WHITE,
                outlineColor: Cesium.Color.RED,
                outlineWidth: 2,
                pixelSize: 6,
                outlineWidth: 3,
                disableDepthTestDistance: Number.MAX_VALUE
            }
        });
    }
}

export default MeasureSlope;