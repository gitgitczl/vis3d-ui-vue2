//三角测量js
import BaseMeasure from "./baseMeasure";
import '../prompt/prompt.css'
import Prompt from '../prompt/prompt.js'
class MeasureTriangle extends BaseMeasure {
    constructor(viewer, opt) {
        super(viewer, opt);
        if (!opt) opt = {};
        this.unitType = "length";
        this.style = opt.style || {};
        //线
        this.heightfloatLabel = null;
        this.spaceDistancefloatLabel = null;
        this.horizonDistancefloatLabel = null;
        this.heightLine = null;
        this.spaceLine = null;
        this.horizonLine = null;
        this.firstPosition = null;
        this.endPosition = null;

        this.midPosition = undefined; // 直角坐标
        this.lowPosition = undefined;
        this.highPosition = undefined;

    }

    //开始测量
    start(callback) {
        if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt(this.viewer, this.promptStyle);
        var that = this;
        this.state = 1;
        this.handler.setInputAction(function (evt) { //单击开始绘制
            var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
            if (!cartesian) return;
            if (!that.firstPosition) {
                that.firstPosition = cartesian.clone();
                that.heightfloatLabel = that.createLabel(cartesian, "");
                that.spaceDistancefloatLabel = that.createLabel(cartesian, "");
                that.horizonDistancefloatLabel = that.createLabel(cartesian, "");

                let point = that.createPoint(cartesian.clone());
                point.wz = 0;
                that.controlPoints.push(point);

            } else {
                that.endPosition = cartesian;
                that.computerPosition(that.firstPosition, that.endPosition);

                let point = that.createPoint(cartesian.clone());
                point.wz = 1;
                that.controlPoints.push(point);

                if (that.handler) {
                    that.handler.destroy();
                    that.handler = null;
                }

                if (that.prompt) {
                    that.prompt.destroy();
                    that.prompt = null;
                }
                that.state = "endCreate";
                if (callback) callback();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.setInputAction(function (evt) {
            that.state = "creating";
            if (!that.firstPosition) {
                that.prompt.update(evt.endPosition, "单击开始测量");
                return;
            }
            that.prompt.update(evt.endPosition, "单击结束");

            var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
            if (!cartesian) return;
            that.endPosition = cartesian;
            that.computerPosition(that.firstPosition, that.endPosition);

            if (that.firstPosition && that.endPosition && !that.spaceLine) {
                that.spaceLine = that.viewer.entities.add({
                    polyline: {
                        positions: new Cesium.CallbackProperty(function () {
                            return [that.firstPosition, that.endPosition]
                        }, false),
                        show: true,
                        material: new Cesium.PolylineOutlineMaterialProperty({
                            color: Cesium.Color.GOLD,
                            outlineWidth: 2,
                            outlineColor: Cesium.Color.BLACK,
                        }),
                        width: 3,
                    }
                });
                that.spaceLine.objId = that.objId;

                that.heightLine = that.viewer.entities.add({
                    polyline: {
                        positions: new Cesium.CallbackProperty(function () {
                            return [that.lowPosition, that.midPosition]
                        }, false),
                        show: true,
                        material: new Cesium.PolylineOutlineMaterialProperty({
                            color: Cesium.Color.GOLD,
                            outlineWidth: 2,
                            outlineColor: Cesium.Color.BLACK,
                        }),
                        width: 3,
                    }
                });
                that.heightLine.objId = that.objId;

                that.horizonLine = that.viewer.entities.add({
                    polyline: {
                        positions: new Cesium.CallbackProperty(function () {
                            return [that.highPosition, that.midPosition]
                        }, false),
                        show: true,
                        material: new Cesium.PolylineOutlineMaterialProperty({
                            color: Cesium.Color.GOLD,
                            outlineWidth: 2,
                            outlineColor: Cesium.Color.BLACK,
                        }),
                        width: 3,
                    }
                });
                that.horizonLine.objId = that.objId;
            }
            if (that.spaceLine) that.createLabels();
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    //计算正上方的点
    computerPosition(p1, p2) {
        const cartographic1 = Cesium.Cartographic.fromCartesian(p1.clone());
        const cartographic2 = Cesium.Cartographic.fromCartesian(p2.clone());
        if (cartographic1.height > cartographic2.height) {
            this.highPosition = p1.clone();
            this.lowPosition = p2.clone();
            this.midPosition = Cesium.Cartesian3.fromRadians(cartographic2.longitude, cartographic2.latitude, cartographic1.height);
        } else {
            this.lowPosition = p1.clone();
            this.highPosition = p2.clone();
            this.midPosition = Cesium.Cartesian3.fromRadians(cartographic1.longitude, cartographic1.latitude, cartographic2.height);
        }
    }

    startEdit(callback) {
        if (!(this.state == "endCrerate" || this.state == "endEdit")) return;
        this.state = "startEdit";;
        if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        let that = this;

        for (let i = 0; i < that.controlPoints.length; i++) {
            let point = that.controlPoints[i];
            if (point) point.show = true;
        }
        this.modifyHandler.setInputAction(function (evt) {
            let pick = that.viewer.scene.pick(evt.position);
            if (Cesium.defined(pick) && pick.id) {
                if (!pick.id.objId)
                    that.modifyPoint = pick.id;
                that.forbidDrawWorld(true);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        this.modifyHandler.setInputAction(function (evt) {
            if (!that.modifyPoint) return;
            let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
            if (!cartesian) return;
            that.modifyPoint.position.setValue(cartesian.clone());

            if (that.modifyPoint.wz == 0) {
                that.firstPosition = cartesian.clone()
            } else {
                that.endPosition = cartesian.clone()
            }

            that.computerPosition(that.firstPosition, that.endPosition);
            that.createLabels();

        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.modifyHandler.setInputAction(function (evt) {
            if (!that.modifyPoint) return;
            that.modifyPoint = null;
            that.forbidDrawWorld(false);
            that.state = "endEdit";
            if (callback) callback();
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
    }

    endEdit() {
        let that = this;
        this.state = "endEdit";;
        if (this.modifyHandler) {
            this.modifyHandler.destroy();
            this.modifyHandler = null;
        }
        for (let i = 0; i < that.controlPoints.length; i++) {
            let point = that.controlPoints[i];
            if (point) point.show = false;
        }
    }

    createLabels() {
        let that = this;
        //高度差
        var height = Math.abs(Cesium.Cartographic.fromCartesian(that.highPosition).height - Cesium.Cartographic.fromCartesian(that.lowPosition).height);
        var height_mid = Cesium.Cartesian3.midpoint(that.lowPosition, that.midPosition, new Cesium.Cartesian3());
        that.heightfloatLabel.show = true;
        that.heightfloatLabel.position.setValue(height_mid);
        let text1 = that.formateLength(height, that.unit);
        that.heightfloatLabel.label.text = "高度差：" + text1;
        that.heightfloatLabel.length = height;
        //水平距离
        var horizonDistance = Cesium.Cartesian3.distance(that.highPosition, that.midPosition);
        var horizon_mid = Cesium.Cartesian3.midpoint(that.highPosition, that.midPosition, new Cesium.Cartesian3());
        that.horizonDistancefloatLabel.show = true;
        that.horizonDistancefloatLabel.position.setValue(horizon_mid);
        let text2 = that.formateLength(horizonDistance, that.unit);
        that.horizonDistancefloatLabel.label.text = "水平距离：" + text2;
        that.horizonDistancefloatLabel.length = horizonDistance;
        //空间距离
        var spaceDistance = Cesium.Cartesian3.distance(that.endPosition, that.firstPosition);
        var space_mid = Cesium.Cartesian3.midpoint(that.endPosition, that.firstPosition, new Cesium.Cartesian3());
        that.spaceDistancefloatLabel.show = true;
        that.spaceDistancefloatLabel.position.setValue(space_mid);
        let text3 = that.formateLength(spaceDistance, that.unit);
        that.spaceDistancefloatLabel.label.text = "空间距离：" + text3;
        that.spaceDistancefloatLabel.length = spaceDistance;
    }

    //清除测量结果
    destroy() {
        this.state = "no";
        if (this.heightLine) {
            this.viewer.entities.remove(this.heightLine);
            this.heightLine = null;
        }
        if (this.spaceLine) {
            this.viewer.entities.remove(this.spaceLine);
            this.spaceLine = null;
        }
        if (this.horizonLine) {
            this.viewer.entities.remove(this.horizonLine);
            this.horizonLine = null;
        }
        if (this.heightfloatLabel) {
            this.viewer.entities.remove(this.heightfloatLabel);
            this.heightfloatLabel = null;
        }
        this.heightfloatLabel = null;
        if (this.spaceDistancefloatLabel) {
            this.viewer.entities.remove(this.spaceDistancefloatLabel);
            this.spaceDistancefloatLabel = null;
        }
        this.spaceDistancefloatLabel = null;
        if (this.horizonDistancefloatLabel) {
            this.viewer.entities.remove(this.horizonDistancefloatLabel);
            this.horizonDistancefloatLabel = null;
        }
        this.horizonDistancefloatLabel = null;
        if (this.prompt) {
            this.prompt.destroy();
            this.prompt = null;
        }
        if (this.handler) {
            this.handler.destroy();
            this.handler = null;
        }
    }


    setUnit(unit) {
        debugger

        if (this.heightfloatLabel) {
            let text1 = this.formateLength(this.heightfloatLabel.length, unit);
            this.heightfloatLabel.label.text = "高度差：" + text1;
        }

        if (this.horizonDistancefloatLabel) {
            let text2 = this.formateLength(this.horizonDistancefloatLabel.length, unit);
            this.horizonDistancefloatLabel.label.text = "水平距离：" + text2;
        }

        if (this.spaceDistancefloatLabel) {
            let text3 = this.formateLength(this.spaceDistancefloatLabel.length, unit);
            this.spaceDistancefloatLabel.label.text = "空间距离：" + text3;
        }


        this.unit = unit;
    }
}

export default MeasureTriangle;