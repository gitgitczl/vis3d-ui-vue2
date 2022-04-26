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
        this.objId = Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
        this.viewer = viewer;
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.ts_handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        //线
        this.heightfloatLabel = null;
        this.spaceDistancefloatLabel = null;
        this.horizonDistancefloatLabel = null;

        this.heightLine = null;
        this.spaceLine = null;
        this.horizonLine = null;
        this.firstPoint = null;
        this.endPoint = null;
        this.midPoint = null;
        this.prompt;
    }

    //开始测量
    start() {
        if (!this.prompt) this.prompt = new Prompt(viewer, { offset: { x: 30, y: 30 } });
        var that = this;
        this.status = 1;
        this.handler.setInputAction(function (evt) { //单击开始绘制
            var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
            if (!cartesian) return;
            if (!that.firstPoint) {
                that.firstPoint = cartesian;
                that.heightfloatLabel = that.createLabel(cartesian, "");
                that.spaceDistancefloatLabel = that.createLabel(cartesian, "");
                that.horizonDistancefloatLabel = that.createLabel(cartesian, "");
            } else {
                that.endPoint = cartesian;
                that.midPoint = that.computerPoint(that.firstPoint, that.endPoint);
                if (that.handler) {
                    that.handler.destroy();
                    that.handler = null;
                }

                if (that.ts_handler) {
                    that.ts_handler.destroy();
                    that.ts_handler = null;
                }
                if (that.prompt) {
                    that.prompt.destroy();
                    that.prompt = null;
                }
                that.status = "endCreate";
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.setInputAction(function (evt) {
            that.status = "creating";
            if (that.firstPoint < 1) {
                that.prompt.update(evt.endPosition, "单击开始测量");
                return;
            } else {
                that.prompt.update(evt.endPosition, "单击结束");
                var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
                if (!cartesian) return;
                that.endPoint = cartesian;
                that.midPoint = that.computerPoint(that.firstPoint, that.endPoint);

                if (that.firstPoint && that.endPoint && !that.spaceLine) {
                    that.spaceLine = that.viewer.entities.add({
                        polyline: {
                            positions: new Cesium.CallbackProperty(function () {
                                return [that.firstPoint, that.endPoint]
                            }, false),
                            show: true,
                            disableDepthTestDistance: Number.POSITIVE_INFINITY,
                            material: Cesium.Color.YELLOW,
                            width: 3,
                            depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.YELLOW)
                        }
                    });
                    that.heightLine = that.viewer.entities.add({
                        polyline: {
                            positions: new Cesium.CallbackProperty(function () {
                                return [that.firstPoint, that.midPoint]
                            }, false),
                            show: true,
                            disableDepthTestDistance: Number.POSITIVE_INFINITY,
                            material: Cesium.Color.YELLOW,
                            width: 3,
                            depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.YELLOW)
                        }
                    });
                    that.horizonLine = that.viewer.entities.add({
                        polyline: {
                            positions: new Cesium.CallbackProperty(function () {
                                return [that.endPoint, that.midPoint]
                            }, false),
                            show: true,
                            disableDepthTestDistance: Number.POSITIVE_INFINITY,
                            material: Cesium.Color.YELLOW,
                            width: 3,
                            depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.YELLOW)
                        }
                    });
                }
            }
            if (that.spaceLine) {
                //高度差
                var height = Math.abs(Cesium.Cartographic.fromCartesian(that.firstPoint).height - Cesium.Cartographic.fromCartesian(that.endPoint).height);
                var height_mid = Cesium.Cartesian3.midpoint(that.firstPoint, that.midPoint, new Cesium.Cartesian3());
                that.heightfloatLabel.show = true;
                that.heightfloatLabel.position.setValue(height_mid);
                let text1 = that.formateLength(height, that.unit);
                that.heightfloatLabel.label.text = "高度差：" + text1;
                that.heightfloatLabel.length = height;
                //水平距离
                var horizonDistance = Cesium.Cartesian3.distance(that.endPoint, that.midPoint);
                var horizon_mid = Cesium.Cartesian3.midpoint(that.endPoint, that.midPoint, new Cesium.Cartesian3());
                that.horizonDistancefloatLabel.show = true;
                that.horizonDistancefloatLabel.position.setValue(horizon_mid);
                let text2 = that.formateLength(horizonDistance, that.unit);
                that.horizonDistancefloatLabel.label.text = "水平距离：" + text2;
                that.horizonDistancefloatLabel.length = horizonDistance;
                //空间距离
                var spaceDistance = Cesium.Cartesian3.distance(that.endPoint, that.firstPoint);
                var space_mid = Cesium.Cartesian3.midpoint(that.endPoint, that.firstPoint, new Cesium.Cartesian3());
                that.spaceDistancefloatLabel.show = true;
                that.spaceDistancefloatLabel.position.setValue(space_mid);
                let text3 = that.formateLength(spaceDistance, that.unit);
                that.spaceDistancefloatLabel.label.text = "空间距离：" + text3;
                that.spaceDistancefloatLabel.length = spaceDistance;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    //清除测量结果
    destroy() {
        this.status = "no";
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
    createLine(p1, p2) {
        if (!p1 || !p2) return;
        var polyline = this.viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(function () {
                    return [p1, p2]
                }, false),
                show: true,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                material: Cesium.Color.YELLOW,
                width: 3,
                depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.YELLOW)
            }
        });
        return polyline;
    }
    //计算正上方的点
    computerPoint(p1, p2) {
        var cartographic1 = Cesium.Cartographic.fromCartesian(p1);
        var cartographic2 = Cesium.Cartographic.fromCartesian(p2);
        var c = null;
        if (cartographic1.height > cartographic2.height) {
            c = Cesium.Cartesian3.fromRadians(cartographic2.longitude, cartographic2.latitude, cartographic1.height);
        } else {
            c = Cesium.Cartesian3.fromRadians(cartographic1.longitude, cartographic1.latitude, cartographic2.height);
        }
        return c;
    }

    setUnit(unit) {
        let text1 = that.formateLength(this.heightfloatLabel.length, unit);
        this.heightfloatLabel.label.text = "高度差：" + text1;

        let text2 = that.formateLength(this.horizonDistancefloatLabel.length, unit);
        this.horizonDistancefloatLabel.label.text = "水平距离：" + text2;

        let text3 = that.formateLength(this.spaceDistancefloatLabel.length, unit);
        this.spaceDistancefloatLabel.label.text = "空间距离：" + text3;
        this.unit = unit;
    }

}

export default MeasureTriangle;