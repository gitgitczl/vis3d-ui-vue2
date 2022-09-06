// 所有标绘类的父类
import cUtil from "../cUtil";
class BasePlot {
    constructor(viewer, opt) {
        this.viewer = viewer;
        opt = opt || {};
        this.style = opt || {};
        this.objId = Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.positions = [];
        this.state = null;  // 标识当前状态 no startCreate creating endCreate startEdit endEdit editing
        this.prompt = null; // 初始化鼠标提示框
        this.controlPoints = []; // 控制点
        this.modifyPoint = null;
        this.entity = null;
        this.pointStyle = {};
        this.promptStyle = opt.prompt || {
            show: true,
            offset: {
                x: 30,
                y: 30
            }
        }
        this.properties = {};
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

    // 获取标绘对象
    getEntity() {
        return this.entity;
    }

    // 获取坐标数组
    getPositions(isWgs84) {
        return isWgs84 ? cUtil.cartesiansToLnglats(this.positions, this.viewer) : this.positions;
    }

    // 绑定自定义属性到entity上
    setOwnProp(prop) {
        if (this.entity) this.entity.ownProp = prop;
    }

    // 移除
    remove() {
        if (this.entity) {
            this.state = "no";
            this.viewer.entities.remove(this.entity);
            this.entity = null;
        }
    }

    // 显示隐藏
    setVisible(vis) {
        this.entity.show = vis;
    }

    // 操作控制
    forbidDrawWorld(isForbid) {
        this.viewer.scene.screenSpaceCameraController.enableRotate = !isForbid;
        this.viewer.scene.screenSpaceCameraController.enableTilt = !isForbid;
        this.viewer.scene.screenSpaceCameraController.enableTranslate = !isForbid;
        this.viewer.scene.screenSpaceCameraController.enableInputs = !isForbid;
    }

    // 销毁
    destroy() {
        if (this.handler) {
            this.handler.destroy();
            this.handler = null;
        }
        if (this.modifyHandler) {
            this.modifyHandler.destroy();
            this.modifyHandler = null;
        }
        if (this.entity) {
            this.viewer.entities.remove(this.entity);
            this.entity = null;
        }

        this.positions = [];
        this.style = null;
        for (var i = 0; i < this.controlPoints.length; i++) {
            var point = this.controlPoints[i];
            this.viewer.entities.remove(point);
        }
        this.controlPoints = [];
        this.modifyPoint = null;
        if (this.prompt) {
            this.prompt.destroy();
            this.prompt = null;
        }
        this.state = "no";
        this.forbidDrawWorld(false);
    }

    startEdit(callback) {
        if (this.state == "startEdit" || this.state == "editing" || !this.entity) return;
        this.state = "startEdit";;
        if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        let that = this;
        for (let i = 0; i < that.controlPoints.length; i++) {
            let point = that.controlPoints[i];
            if (point) point.show = true;
        }
        this.entity.show = true;

        this.modifyHandler.setInputAction(function (evt) {
            if (!that.entity) return;
            let pick = that.viewer.scene.pick(evt.position);
            if (Cesium.defined(pick) && pick.id) {
                if (!pick.id.objId)
                    that.modifyPoint = pick.id;
                that.forbidDrawWorld(true);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
        this.modifyHandler.setInputAction(function (evt) {
            if (that.positions.length < 1 || !that.modifyPoint) return;
            let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer, [that.entity, that.modifyPoint]);
            if (cartesian) {
                that.modifyPoint.position.setValue(cartesian);
                that.positions[that.modifyPoint.wz] = cartesian;
                that.state = "editing";
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this.modifyHandler.setInputAction(function (evt) {
            if (!that.modifyPoint) return;
            that.modifyPoint = null;
            that.forbidDrawWorld(false);
            that.state = "editing";
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
    }
    endEdit(callback) {
        for (let i = 0; i < this.controlPoints.length; i++) {
            let point = this.controlPoints[i];
            if (point) point.show = false;
        }
        if (this.modifyHandler) {
            this.modifyHandler.destroy();
            this.modifyHandler = null;
            if (callback) callback(this.entity);
        }
        this.forbidDrawWorld(false);
        this.state = "endEdit";
    }


    // 构建控制点
    createPoint(position) {
        if (!position) return;
        this.pointStyle.color = this.pointStyle.color || Cesium.Color.CORNFLOWERBLUE;
        this.pointStyle.outlineColor = this.pointStyle.color || Cesium.Color.CORNFLOWERBLUE;

        let color = this.pointStyle.color instanceof Cesium.Color ? this.pointStyle.color : Cesium.Color.fromCssColorString(this.pointStyle.color);
        color = color.withAlpha(this.pointStyle.colorAlpha || 1);

        let outlineColor = this.pointStyle.outlineColor instanceof Cesium.Color ? this.pointStyle.outlineColor : Cesium.Color.fromCssColorString(this.pointStyle.outlineColor);
        outlineColor = outlineColor.withAlpha(this.pointStyle.outlineColorAlpha || 1);

        return this.viewer.entities.add({
            position: position,
            point: {
                pixelSize: this.pointStyle.property || 10,
                color: color,
                outlineWidth: this.pointStyle.outlineWidth || 0,
                outlineColor: outlineColor,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            show: false
        });
    }

    // 获取当前标绘的样式
    /*  getStyle() {
        if (!this.entity) return;
        let graphic = this.entity[this.plotType];
        if (!graphic) return;
        let style = {};
        switch (this.plotType) {
            case 'polyline':
                style.clampToGround = graphic.clampToGround._value; // 是否贴地
                style.distanceDisplayCondition = graphic.distanceDisplayCondition._value; // 显示控制
                style.width = graphic.width._value; // 线宽
                let colorObj = this.transfromLineMaterial(graphic.material);
                style = Object.assign(style, colorObj);
                break;
            case "polygon":
                style.heightReference = graphic.heightReference.getValue();
                style.fill = graphic.fill._value;
                style.extrudedHeight = graphic.extrudedHeight._value;
                let gonColorObj = this.transfromGonMaterial(graphic.material);
                style = Object.assign(style, gonColorObj);

                style.outline = graphic.outline._value;
                let ocv = graphic.outlineColor.getValue();
                style.outlineColorAlpha = ocv.alpha;
                style.outlineColor = new Cesium.Color(ocv.red, ocv.green, ocv.blue, 1).toCssHexString();

                break;
            default:
                break;
        }
        return style;
    } */

    // 获取线的材质
    transfromLineMaterial(material) {
        if (!material) return;
        let colorObj = {};
        if (material instanceof Cesium.Color) {
            let colorVal = material.color.getValue();
            colorObj.colorAlpha = colorVal.alpha;
            // 转为hex
            colorObj.colorHex = new Cesium.Color(colorVal.red, colorVal.green, colorVal.blue, 1).toCssHexString();
        }
        return colorObj;
    }

    // 获取面材质
    transfromGonMaterial(material) {
        if (!material) return;
        let colorObj = {};
        if (material instanceof Cesium.Color) {
            let colorVal = material.color.getValue();
            colorObj.colorAlpha = colorVal.alpha;
            // 转为hex
            colorObj.colorHex = new Cesium.Color(colorVal.red, colorVal.green, colorVal.blue, 1).toCssHexString();
        }
        return colorObj;
    }

    // 设置实体的属性
    setAttr(attr) {
        this.properties.attr = attr || {};
    }

    zoomTo() {
        if (this.entity) {
            this.viewer.zoomTo(this.entity);
        }
    }


}

export default BasePlot;