import VisualField from "./visualField";
import Prompt from "../../prompt/prompt";
import "../../prompt/prompt.css";
class VisualTool {
    constructor(viewer, opt) {
        if (!Cesium.defined(viewer)) {
            throw new Cesium.DeveloperError('缺少地图对象！');
        }
        this.viewer = viewer;
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.prompt = null;

        this.startPosition = null;
        this.endPosition = null;
        this.vfPrimitive = null;

        // 默认样式
        let defaultStyle = {
            visibleAreaColor: "#00FF00",
            visibleAreaColorAlpha: 1,
            hiddenAreaColor: "#FF0000",
            hiddenAreaColorAlpha: 1,
            verticalFov: 60,
            horizontalFov: 120
        }
        this.opt = Object.assign(defaultStyle, opt || {});

        this.visibleAreaColor = this.opt.visibleAreaColor;
        this.hiddenAreaColor = this.opt.hiddenAreaColor;
        this.visibleAreaColorAlpha = this.opt.visibleAreaColorAlpha;
        this.hiddenAreaColorAlpha = this.opt.hiddenAreaColorAlpha;

        this.heading = this.opt.heading || 0;
        this.pitch = this.opt.pitch || 0;
        this.verticalFov = this.opt.verticalFov;
        this.horizontalFov = this.opt.horizontalFov;
        this.distance = 0;
    }

    startDraw(fun) {
        let that = this;
        if (!this.prompt) this.prompt = new Prompt(this.viewer, this.promptStyle);
        this.handler.setInputAction(function (evt) {
            // 单击开始绘制
            let cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
            if (!cartesian) return;
            if (!that.startPosition) {
                that.startPosition = cartesian.clone();
            } else {
                that.endPosition = cartesian.clone();
                if (that.handler) {
                    that.handler.destroy();
                    that.handler = null;
                }
                if (that.prompt) {
                    that.prompt.destroy();
                    that.prompt = null;
                }
                let c1 = Cesium.Cartographic.fromCartesian(that.startPosition.clone());
                let c2 = Cesium.Cartographic.fromCartesian(that.endPosition.clone());
                let angle = that.computeAngle(c1, c2);
                that.heading = angle;
                that.vfPrimitive.heading = angle;

                let distance = Cesium.Cartesian3.distance(that.startPosition.clone(), that.endPosition.clone());
                that.distance = distance;
                that.vfPrimitive.distance = distance;
                if (fun) fun(angle, distance);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.setInputAction(function (evt) {
            // 移动时绘制线
            if (!that.startPosition) {
                that.prompt.update(evt.endPosition, "单击开始绘制");
                return;
            }
            that.prompt.update(evt.endPosition, "再次单击结束");
            let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
            if (!cartesian) return;
            if (!that.vfPrimitive) {
                that.vfPrimitive = new VisualField(that.viewer, {
                    cameraOptions: {
                        viewerPosition: that.startPosition.clone(),
                        visibleAreaColor: that.visibleAreaColor,
                        visibleAreaColorAlpha: that.visibleAreaColorAlpha,
                        hiddenAreaColor: that.hiddenAreaColor,
                        hiddenAreaColorAlpha: that.hiddenAreaColorAlpha,
                        horizontalFov: that.horizontalFov,
                        verticalFov: that.verticalFov
                    }
                });
                that.viewer.scene.primitives.add(that.vfPrimitive);
            }

            let c1 = Cesium.Cartographic.fromCartesian(that.startPosition.clone());
            let c2 = Cesium.Cartographic.fromCartesian(cartesian.clone());
            let angle = that.computeAngle(c1, c2);
            that.heading = angle;
            that.vfPrimitive.heading = angle;

            let distance = Cesium.Cartesian3.distance(that.startPosition.clone(), cartesian.clone());
            that.distance = distance;
            that.vfPrimitive.distance = distance;


        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    // 设置可视区域颜色
    setVisibleAreaColor(val) {
        if (!val) return;
        this.visibleAreaColor = val;
        if (this.vfPrimitive) this.vfPrimitive.visibleAreaColor = val;
    }
    // 设置可视区域颜色透明度
    setVisibleAreaColorAlpha(val) {
        if (!val) return;
        this.visibleAreaColorAlpha = Number(val);
        if (this.vfPrimitive) this.vfPrimitive.visibleAreaColorAlpha = Number(val);
    }

    // 设置不可视区域颜色
    setHiddenAreaColor(val) {
        if (!val) return;
        this.hiddenAreaColor = val;
        if (this.vfPrimitive) this.vfPrimitive.hiddenAreaColor = val;
    }

    // 设置不可视区域颜色透明度
    setHiddenAreaColorAlpha(val) {
        if (!val) return;
        this.hiddenAreaColorAlpha = Number(val);
        if (this.vfPrimitive) this.vfPrimitive.hiddenAreaColorAlpha = Number(val);
    }

    // 设置锥体长度
    setDistance(val) {
        if (!val) return;
        this.distance = Number(val);
        if (this.vfPrimitive) this.vfPrimitive.distance = Number(val);
    }

    // 设置垂直张角
    setVerticalFov(val) {
        if (!val) return;
        this.verticalFov = Number(val);
        if (this.vfPrimitive) this.vfPrimitive.verticalFov = Number(val);
    }

    // 设置水平张角
    setHorizontalFov(val) {
        if (!val) return;
        let value = Number(val);
        value = value >= 180 ? 179 : value; // 水平张角不超过180
        this.horizontalFov = Number(value);
        if (this.vfPrimitive) this.vfPrimitive.horizontalFov = Number(value);
    }

    // 设置锥体姿态 -- 偏转角
    setHeading(val) {
        if (!val) return;
        this.heading = 0;
        if (this.vfPrimitive) this.vfPrimitive.heading = Number(val);
    }

    // 设置锥体姿态 -- 仰俯角
    setPitch(val) {
        if (!val) return;
        this.pitch = Number(val);
        if (this.vfPrimitive) this.vfPrimitive.pitch = Number(val);
    }

    // 计算两点朝向
    computeAngle(p1, p2) {
        if (!p1 || !p2) return;
        var lng_a = p1.longitude;
        var lat_a = p1.latitude;
        var lng_b = p2.longitude;
        var lat_b = p2.latitude;
        var y = Math.sin(lng_b - lng_a) * Math.cos(lat_b);
        var x = Math.cos(lat_a) * Math.sin(lat_b) - Math.sin(lat_a) * Math.cos(lat_b) * Math.cos(lng_b - lng_a);
        var bearing = Math.atan2(y, x);

        bearing = bearing * 180.0 / Math.PI;
        if (bearing < -180) {
            bearing = bearing + 360;
        }
        bearing = bearing % 360;
        return bearing;
    }

    // 坐标拾取
    getCatesian3FromPX(px) {
        let picks = this.viewer.scene.drillPick(px);
        this.viewer.scene.render();
        let cartesian;
        let isOn3dtiles = false;
        for (let i = 0; i < picks.length; i++) {
            if ((picks[i] && picks[i].primitive) && picks[i].primitive instanceof Cesium.Cesium3DTileset) { //模型上拾取
                isOn3dtiles = true;
                break;
            }
        }
        if (isOn3dtiles) {
            cartesian = this.viewer.scene.pickPosition(px);
        } else {
            let ray = this.viewer.camera.getPickRay(px);
            if (!ray) return null;
            cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        }
        return cartesian;
    }

    clear() {
        if (this.vfPrimitive) {
            this.viewer.scene.primitives.remove(this.vfPrimitive);
            this.vfPrimitive = null;
        }
    }
    destroy() {
        this.clear();
        if (this.handler) {
            this.handler.destroy();
            this.handler = null;
        }
        if (this.prompt) {
            this.prompt.destroy();
            this.prompt = null;
        }
    }
}

export default VisualTool;