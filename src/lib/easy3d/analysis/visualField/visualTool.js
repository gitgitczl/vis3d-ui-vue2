import VisualField from "./visualField";
class VisualTool {
    constructor(viewer, opt) {
        if (!Cesium.defined(viewer)) {
            throw new Cesium.DeveloperError('缺少地图对象！');
        }
        this.viewer = viewer;
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.positions = [];
        this.prompt = null;

        this.startPosition = null;
        this.endPosition = null;
        this.vfPrimitive = null;

        let defaultStyle = {
            visibleAreaColor: "#00FF00",
            hiddenAreaColor: "#FF0000",
        }
        this.opt = Object.assign(defaultStyle, opt || {});

        this.visibleAreaColor = this.opt.visibleAreaColor;
        this.hiddenAreaColor = this.opt.hiddenAreaColor;
        this.heading = this.opt.heading || 0;
        this.pitch = this.opt.pitch || 0;
    }

    startDraw() {
        let that = this;
        if (!this.prompt) this.prompt = new Prompt(this.viewer, this.promptStyle);
        this.handler.setInputAction(function (evt) {
            // 单击开始绘制
            let cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
            if (!cartesian) return;
            if (!this.startPosition) {
                this.startPosition = cartesian.clone();
            } else {
                this.endPosition = cartesian.clone();
                if (that.handler) {
                    that.handler.destroy();
                    that.handler = null;
                }
                if (that.prompt) {
                    that.prompt.destroy();
                    that.prompt = null;
                }
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
                        hiddenAreaColor: that.hiddenAreaColor
                    }
                });
                that.viewer.scene.primitives.add(that.vfPrimitive);
            }

            let c1 = Cesium.Cartographic.fromCartesian(that.startPosition.clone());
            let c2 = Cesium.Cartographic.fromCartesian(cartesian.clone());
            let angle = that.computeAngle(c1, c2);
            that.vfPrimitive.heading = angle;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    // 设置可视区域颜色
    setVisibleAreaColor(val) {
        if (!val) return;
        this.visibleAreaColor = val;
        if (this.vfPrimitive) this.vfPrimitive.visibleAreaColor = val;
    }

    // 设置不可视区域颜色
    setHiddenAreaColor(val) {
        if (!val) return;
        this.hiddenAreaColor = val;
        if (this.vfPrimitive) this.vfPrimitive.hiddenAreaColor = val;
    }

    // 设置锥体长度
    setDistance(val) {
        if (!val) return;
        if (this.vfPrimitive) this.vfPrimitive.distance = Number(val);
    }

    // 设置垂直张角
    setVerticalFov(val) {
        if (!val) return;
        if (this.vfPrimitive) this.vfPrimitive.verticalFov = Number(val);
    }

    // 设置水平张角
    setHorizontalFov() {
        if (!val) return;
        if (this.vfPrimitive) this.vfPrimitive.horizontalFov = Number(val);
    }

    // 设置锥体姿态 -- 偏转角
    setHeading(val) {
        if (!val) return;
        if (this.vfPrimitive) this.vfPrimitive.heading = Number(val);
    }

    // 设置锥体姿态 -- 仰俯角
    setPitch(val) {
        if (!val) return;
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

    destroy() {
        if (this.vfPrimitiv) {
            this.viewer.scene.primitives.remove(this.vfPrimitive);
            this.vfPrimitive = null;
        }
    }
}

export default VisualTool;