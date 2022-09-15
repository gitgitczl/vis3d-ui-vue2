// 绘制线
import BasePlot from "./basePlot";
import '../prompt/prompt.css'
import Prompt from '../prompt/prompt.js'
class CreatePolyline extends BasePlot {
    constructor(viewer, opt) {
        super(viewer, opt);
        opt = opt || {};
        super(viewer, opt);
        this.movePush = false;
        this.type = "polyline";
        this.maxPointNum = opt.maxPointNum || Number.MAX_VALUE; // 最多点数
    }

    start(callBack) {
        if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt(this.viewer, this.promptStyle);
        this.state = "startCreate";
        let that = this;
        this.handler.setInputAction(function (evt) { //单击开始绘制
            let cartesian = that.getCatesian3FromPX(evt.position, that.viewer, [that.entity]);
            if (!cartesian) return;
            if (that.movePush) {
                that.positions.pop();
                that.movePush = false;
            }
            that.positions.push(cartesian);
            let point = that.createPoint(cartesian);
            point.wz = that.positions.length - 1;
            that.controlPoints.push(point);

            // 达到最大数量 结束绘制
            if (that.positions.length == that.maxPointNum) {
                that.state = "endCreate";
                if (that.handler) {
                    that.handler.destroy();
                    that.handler = null;
                }
                if (that.prompt) {
                    that.prompt.destroy();
                    that.prompt = null;
                }
                that.viewer.trackedEntity = undefined;
                that.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
                if (callBack) callBack(that.entity);
            }

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this.handler.setInputAction(function (evt) { //移动时绘制线
            that.state = "creating";
            if (that.positions.length < 1) {
                that.prompt.update(evt.endPosition, "单击开始绘制");
                that.state = "startCreate";
                return;
            }
            that.prompt.update(evt.endPosition, "右键取消上一步，双击结束");
            let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer, [that.entity]);
            if (!cartesian) return;

            if (!that.movePush) {
                that.positions.push(cartesian);
                that.movePush = true;
            } else {
                that.positions[that.positions.length - 1] = cartesian;
            }

            if (that.positions.length == 2) {
                if (!Cesium.defined(that.entity)) {
                    that.entity = that.createPolyline();
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.handler.setInputAction(function (evt) { //右键取消上一步
            if (!that.entity) {
                return;
            }
            that.positions.splice(that.positions.length - 2, 1);
            that.viewer.entities.remove(that.controlPoints.pop())
            if (that.positions.length == 1) {
                if (that.entity) {
                    that.viewer.entities.remove(that.entity);
                    that.entity = null;
                }
                that.prompt.update(evt.endPosition, "单击开始绘制");
                that.movePush = false;
                that.positions = [];
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        this.handler.setInputAction(function (evt) { //双击结束绘制
            if (!that.entity) {
                return;
            }
            that.state = "endCreate";
            if (that.handler) {
                that.handler.destroy();
                that.handler = null;
            }
            that.positions.pop();
            that.viewer.entities.remove(that.controlPoints.pop())
            if (that.prompt) {
                that.prompt.destroy();
                that.prompt = null;
            }
            that.viewer.trackedEntity = undefined;
            that.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);

            if (callBack) callBack(that.entity);
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }

    createByPositions(lnglatArr, callBack) { //通过传入坐标数组创建面
        if (!lnglatArr || lnglatArr.length < 1) return;
        this.state = "startCreate";
        let positions = (lnglatArr[0] instanceof Cesium.Cartesian3) ? lnglatArr : cUtil.lnglatsToCartesians(lnglatArr);
        if (!positions) return;
        this.entity = this.createPolyline(this.style);
        this.positions = positions;
        if (callBack) callBack(this.entity);
        for (let i = 0; i < positions.length; i++) {
            let newP = positions[i];
            if (this.style.clampToGround) {
                let ctgc = Cesium.Cartographic.fromCartesian(positions[i]);
                ctgc.height = this.viewer.scene.sampleHeight(ctgc);
                newP = Cesium.Cartographic.toCartesian(ctgc);
            }
            let point = this.createPoint(newP);
            point.wz = this.controlPoints.length;
            this.controlPoints.push(point);
        }
        this.state = "endCreate";
    }

    setStyle(style) {
        if (!style) return;
        let material = undefined;
        if (style.lineType) {
            material = this.getMaterial(style.lineType, style);
        } else {
            let color = style.color instanceof Cesium.Color ? style.color : Cesium.Color.fromCssColorString(style.color || "#000000");
            material = color.withAlpha(style.colorAlpha || 1);
        }

        this.entity.polyline.material = material;
        this.entity.polyline.clampToGround = Boolean(style.clampToGround);
        if (style.width) this.entity.polyline.width = style.width || 3;
        this.style = Object.assign(this.style, style);
    }
    // 获取相关样式
    getStyle() {
        if (!this.entity) return;
        let obj = {};
        let polyline = this.entity.polyline;
        if (this.style.lineType != undefined) {
            obj.lineType = this.style.lineType;
            obj.image = this.style.image;
            obj.duration = this.style.duration;
        }

        if (polyline.material instanceof Cesium.ColorMaterialProperty) {
            obj.material = "common";
        } else {
            if (polyline.material instanceof FlowLineMaterial) {
                obj.material = "flowLine";
            }
            if (polyline.material instanceof FlyLineMaterial) {
                obj.material = "flyLine";
            }
            obj.duration = polyline.material.duration;
        }

        let color = polyline.material.color.getValue();
        obj.colorAlpha = color.alpha;
        obj.color = new Cesium.Color(color.red, color.green, color.blue, 1).toCssHexString();
        obj.width = polyline.width._value;
        let clampToGround = polyline.clampToGround ? polyline.clampToGround.getValue() : false;
        obj.clampToGround = Boolean(clampToGround);
        return obj;
    }

    createPolyline() {
        let that = this;

        let polyline = this.viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(function () {
                    return that.positions
                }, false),
                show: true,
                material: this.getMaterial(this.style.lineType, this.style),
                width: this.style.width || 3,
                clampToGround: this.style.clampToGround
            }
        });
        polyline.objId = this.objId;
        return polyline;
    }

    getMaterial(lineType, style) {
        // 构建多种材质的线
        style = style || {};
        let material = null;
        if (lineType == "flowLine") {
            material = new FlowLineMaterial({
                color: style.color || Cesium.Color.RED, // 默认颜色
                image: style.image || "../img/texture/lineClr.png",
                duration: style.duration || 5000
            })
        } else if (lineType == "rainbowLine") {
            material = new FlowLineMaterial({
                image: style.image || "../img/texture/lineClr2.png",
                duration: style.duration || 5000
            })
        } else if (lineType == "flyLine") {
            material = new FlyLineMaterial({ //动画线材质
                color: style.color || Cesium.Color.RED,
                duration: style.duration || 3000,
                image: style.image || "../img/texture/glow.png",
                repeat: new Cesium.Cartesian2(1, 1) //平铺
            })
        } else {
            material = style.color instanceof Cesium.Color ? style.color : (style.color ? Cesium.Color.fromCssColorString(style.color).withAlpha(style.colorAlpha || 1) : Cesium.Color.WHITE);
        }
        return material;
    }

}
export default CreatePolyline;