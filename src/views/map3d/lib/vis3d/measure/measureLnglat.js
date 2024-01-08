//经纬度 测量js
import BaseMeasure from "./baseMeasure";
import util from "../util";

/**
 * 坐标测量类
 * @class
 * @augments BaseMeasure
 * @alias BaseMeasure.MeasureLnglat 
 */
class MeasureLnglat extends BaseMeasure {
    constructor(viewer, opt) {
        super(viewer, opt);
        if (!opt) opt = {};
        this.style = opt.style || {};
        this.point = null;
        this.position = null;
        this.state = 0;
    }

    start(callback) {
        this.state = "startCreate";
        var that = this;
        this.handler.setInputAction(function (evt) { //单击开始绘制
            if (that.handler) {
                that.handler.destroy();
                that.handler = null;
            }
            that.state = "endCreate";
            if (callback) callback();
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.setInputAction(function (evt) {
            that.state = "creating";
            var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
            if (!cartesian) return;
            that.position = cartesian.clone();
            if (!Cesium.defined(that.point)) {
                that.point = that.createPoint();
                that.point.objId = that.objId;
            }
            var lnglat = util.cartesianToLnglat(cartesian,that.viewer);
            that.point.label.text = "经度：" + lnglat[0].toFixed(6) + "\n纬度：" + lnglat[1].toFixed(6) + "\n高度：" + lnglat[2].toFixed(2) + " m";
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

    startEdit() {
        if (!((this.state == "endCreate" || this.state == "endEdit") && this.point)) return;
        this.state = "startEdit";;
        if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.modifyHandler.setInputAction(function (evt) {
            let pick = that.viewer.scene.pick(evt.position);
            if (Cesium.defined(pick) && pick.id) {
                if (!pick.id.objId)
                    that.modifyPoint = pick.id;
                that.forbidDrawWorld(true);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        this.modifyHandler.setInputAction(function (evt) {
            if (that.positions.length < 1 || !that.modifyPoint) return;
            let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
            if (!cartesian) return;
            that.modifyPoint.position.setValue(cartesian.clone());

            that.positions[that.modifyPoint.wz] = cartesian.clone();
            let heightAndCenter = that.getHeightAndCenter(that.positions[0], that.positions[1]);
            let text = that.formateLength(heightAndCenter.height, that.unit);
            that.floatLabel.label.text = "高度差：" + text;
            that.floatLabel.length = heightAndCenter.height;
            if (heightAndCenter.center) that.floatLabel.position.setValue(heightAndCenter.center);

        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.modifyHandler.setInputAction(function (evt) {
            if (!that.modifyPoint) return;
            that.modifyPoint = null;
            that.lastPosition = null;
            that.nextPosition = null;
            that.forbidDrawWorld(false);
            if (callback) callback();
            that.state = "endEdit";
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
    }

    endEdit() {

    }

    //清除测量结果
    destroy() {
        this.state = "no";
        if (this.point) {
            this.viewer.entities.remove(this.point);
            this.point = null;
        }

        if (this.handler) {
            this.handler.destroy();
            this.handler = null;
        }
    }

    createPoint() {
        var that = this;
        var point = this.viewer.entities.add({
            position: new Cesium.CallbackProperty(function () {
                return that.position
            }, false),
            point: {
                show: true,
                outlineColor: Cesium.Color.YELLOW,
                outlineColor: Cesium.Color.WHITE,
                pixelSize: 6,
                outlineWidth: 2,
                disableDepthTestDistance: Number.MAX_VALUE
            },
            label: {
                font: '18px Helvetica',
                fillColor: Cesium.Color.WHITE,
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