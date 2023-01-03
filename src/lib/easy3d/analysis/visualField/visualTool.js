import VisualField from "./visualField";
import Prompt from "../../prompt/prompt";
import "../../prompt/prompt.css";

/**
 * 可视域控制类
 * @description 可视域控制类，通过此类对象，可直接添加可视域，并对添加的可视域进行控制，而不用单独创建可视域。
 * @class 
 */
class VisualTool {

    /**
     * @param {Cesium.Viewer} viewer 地图viewer对象
     
     * 
     */
    constructor(viewer, opt) {
        if (!Cesium.defined(viewer)) {
            throw new Cesium.DeveloperError('缺少地图对象！');
        }
        this.viewer = viewer;
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

        this.prompt = null;

        this.vfPrimitive = null;

        /**
         * @property {Array} vfPrimitiveArr 可视域对象数组
         */
        this.vfPrimitiveArr = [];
    }

    /**
     * 绘制可视域
     * @param {Object} opt 当前可视域的配置 
     * @param {String} [opt.visibleAreaColorAlpha="#00FF00"] 可见区域颜色
     * @param {Number} [opt.visibleAreaColorAlpha=1] 可见区域颜色透明度
     * @param {String} [opt.hiddenAreaColorAlpha="#FF0000"] 不可见区域颜色
     * @param {Number} [opt.hiddenAreaColorAlpha=1] 不可见区域颜色透明度
     * @param {Number} [opt.verticalFov=60] 视锥体水平张角
    *  @param {Number} [opt.horizontalFov=120] 视锥体垂直张角
     * @param {Function} fun 绘制成功后的回调函数fun(vfPrimitive)
     */
    startDraw(opt, fun) {
        let that = this;
        // 默认样式
        let defaultStyle = {
            visibleAreaColor: "#00FF00",
            visibleAreaColorAlpha: 1,
            hiddenAreaColor: "#FF0000",
            hiddenAreaColorAlpha: 1,
            verticalFov: 60,
            horizontalFov: 120
        }
        opt = Object.assign(defaultStyle, opt || {});
        opt.id = opt.id || Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0)); // 给个默认id

        let visibleAreaColor = this.opt.visibleAreaColor;
        let hiddenAreaColor = this.opt.hiddenAreaColor;
        let visibleAreaColorAlpha = this.opt.visibleAreaColorAlpha;
        let hiddenAreaColorAlpha = this.opt.hiddenAreaColorAlpha;
        let verticalFov = this.opt.verticalFov;
        let horizontalFov = this.opt.horizontalFov;
        let startPosition = undefined;
        let endPosition = undefined;

        let vfPrimitive = undefined; // 当前绘制的视锥体

        if (!this.prompt) this.prompt = new Prompt(this.viewer, this.promptStyle);

        this.handler.setInputAction(function (evt) {
            // 单击开始绘制
            let cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
            if (!cartesian) return;
            if (!startPosition) {
                startPosition = cartesian.clone();
            } else {
                endPosition = cartesian.clone();
                if (that.handler) {
                    that.handler.destroy();
                    that.handler = null;
                }
                if (that.prompt) {
                    that.prompt.destroy();
                    that.prompt = null;
                }
                let c1 = Cesium.Cartographic.fromCartesian(startPosition.clone());
                let c2 = Cesium.Cartographic.fromCartesian(endPosition.clone());
                let angle = that.computeAngle(c1, c2);
                vfPrimitive.heading = angle;
                vfPrimitive.attr.heading = angle;

                let distance = Cesium.Cartesian3.distance(startPosition.clone(), endPosition.clone());
                vfPrimitive.distance = distance;
                vfPrimitive.attr.distance = distance;

                // 绘制完成后 置为空
                startPosition = undefined;
                endPosition = undefined;

                if (fun) fun(vfPrimitive);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        this.handler.setInputAction(function (evt) {
            // 移动时绘制线
            if (!startPosition) {
                that.prompt.update(evt.endPosition, "单击开始绘制");
                return;
            }
            that.prompt.update(evt.endPosition, "再次单击结束");
            let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
            if (!cartesian) return;
            if (!vfPrimitive) {
                vfPrimitive = new VisualField(that.viewer, {
                    cameraOptions: {
                        viewerPosition: startPosition.clone(),
                        visibleAreaColor: visibleAreaColor,
                        visibleAreaColorAlpha: visibleAreaColorAlpha,
                        hiddenAreaColor: hiddenAreaColor,
                        hiddenAreaColorAlpha: hiddenAreaColorAlpha,
                        horizontalFov: horizontalFov,
                        verticalFov: verticalFov
                    }
                });
                that.viewer.scene.primitives.add(vfPrimitive);
                that.vfPrimitiveArr.push(vfPrimitive);

                vfPrimitive.attr = opt; // 属性绑定
            }

            let c1 = Cesium.Cartographic.fromCartesian(startPosition.clone());
            let c2 = Cesium.Cartographic.fromCartesian(cartesian.clone());
            let angle = that.computeAngle(c1, c2);
            vfPrimitive.heading = angle;
            vfPrimitive.attr.heading = angle;

            let distance = Cesium.Cartesian3.distance(startPosition.clone(), cartesian.clone());
            vfPrimitive.distance = distance;
            vfPrimitive.attr.distance = distance;


        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    /**
     * 设置可视区域颜色 
     * @param {Object} vfPrimitive 可视域对象 
     * @param {String} val 可视区域颜色
     */
    setVisibleAreaColor(vfPrimitive, val) {
        if (!val) return;
        this.visibleAreaColor = val;
        if (vfPrimitive) vfPrimitive.visibleAreaColor = val;
    }

    /**
     * 设置可视区域颜色透明度
     * @param {Object} vfPrimitive 可视域对象 
     * @param {Number} val 可视区域颜色透明度
     */
    setVisibleAreaColorAlpha(vfPrimitive, val) {
        if (!val) return;
        this.visibleAreaColorAlpha = Number(val);
        if (vfPrimitive) vfPrimitive.visibleAreaColorAlpha = Number(val);
    }

    /**
     * 设置不可视区域颜色
     * @param {Object} vfPrimitive 可视域对象 
     * @param {String} val 不可视区域颜色
     */
    setHiddenAreaColor(vfPrimitive, val) {
        if (!val) return;
        this.hiddenAreaColor = val;
        if (vfPrimitive) vfPrimitive.hiddenAreaColor = val;
    }

    /**
     * 设置不可视区域颜色透明度
     * @param {Object} vfPrimitive 可视域对象 
    * @param {Number} val 不可视区域颜色透明度
    */
    setHiddenAreaColorAlpha(vfPrimitive, val) {
        if (!val) return;
        this.hiddenAreaColorAlpha = Number(val);
        if (vfPrimitive) vfPrimitive.hiddenAreaColorAlpha = Number(val);
    }

    /**
     * 设置设置锥体长度
     * @param {Object} vfPrimitive 可视域对象 
    * @param {Number} val 锥体长度
    */
    setDistance(vfPrimitive, val) {
        if (!val) return;
        this.distance = Number(val);
        if (vfPrimitive) vfPrimitive.distance = Number(val);
    }

    /**
     * 设置垂直张角
     * @param {Object} vfPrimitive 可视域对象 
    * @param {Number} val 垂直张角
    */
    setVerticalFov(vfPrimitive, val) {
        if (!val) return;
        this.verticalFov = Number(val);
        if (vfPrimitive) vfPrimitive.verticalFov = Number(val);
    }

    /**
     * 设置水平张角
     * @param {Object} vfPrimitive 可视域对象 
    * @param {Number} val 水平张角
    */
    setHorizontalFov(vfPrimitive, val) {
        if (!val) return;
        let value = Number(val);
        value = value >= 180 ? 179 : value; // 水平张角不超过180
        this.horizontalFov = Number(value);
        if (vfPrimitive) vfPrimitive.horizontalFov = Number(value);
    }

    /**
    * 设置偏转角
    * @param {Object} vfPrimitive 可视域对象 
   * @param {Number} val 偏转角
   */
    setHeading(vfPrimitive, val) {
        if (!val) return;
        this.heading = 0;
        if (vfPrimitive) vfPrimitive.heading = Number(val);
    }

    /**
    * 设置仰俯角
    * @param {Object} vfPrimitive 可视域对象 
    * @param {Number} val 仰俯角
    */
    setPitch(vfPrimitive, val) {
        if (!val) return;
        this.pitch = Number(val);
        if (vfPrimitive) vfPrimitive.pitch = Number(val);
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

    /**
    * 清除可视域
    */
    clear() {
        for (let i = 0; i < this.vfPrimitiveArr.length; i++) {
            let vfPrimitive = this.vfPrimitiveArr[i];
            this.viewer.scene.primitives.remove(vfPrimitive);
            vfPrimitive = null;
        }
        this.vfPrimitiveArr = [];
    }

    /**
    * 清除可视域 同clear，方法兼容
    */
    removeAll() {
        for (let i = 0; i < this.vfPrimitiveArr.length; i++) {
            let vfPrimitive = this.vfPrimitiveArr[i];
            this.viewer.scene.primitives.remove(vfPrimitive);
            vfPrimitive = null;
        }
        this.vfPrimitiveArr = [];
    }

    /**
     * 销毁
    */
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

    /**
     * 根据startDraw中传入的字段属性来获取对应vfPrimitives
     * @param {String} [fieldName='id'] 字段名 
     * @param {String} fieldVlue 字段值
     * @returns {Array} vfprimitives 可视域对象数组
     */
    getVfPrimitiveByField(fieldName, fieldVlue) {
        fieldName = fieldName || 'id';
        let vfprimitives = this.vfPrimitiveArr.filter(item => {
            return item.attr[fieldName] = fieldVlue;
        });
        return vfprimitives;
    }

    /**
     * 根据id属性来获取对应vfPrimitive
     * @param {String} id 唯一id 
     * @returns {Object} vpObj vpObj.vfPrimitive 可视域 / vpObj.index 在数组中位置
     */
    getVfPrimitiveById(id) {
        let vpObj = {};
        for (let i = 0; i < this.vfPrimitiveArr.length; i++) {
            let vp = this.vfPrimitiveArr[i];
            if (vp.attr.id == id) {
                vpObj.vfPrimitive = vp;
                vpObj.index = i;
                break;
            }
        }
        return vpObj;
    }

    /**
     * 根据id属性删除vfPrimitive
     * @param {String} id 唯一id 
     * @returns {Object} vpObj vpObj.vfPrimitive 可视域 / vpObj.index 在数组中位置
     */
    removeVfPrimitiveById(id) {
        if (!id) return;
        let vpObj = this.getVfPrimitiveById(id);
        if (vpObj.vfPrimitive) this.viewer.scene.primitives.remove(vpObj.vfPrimitive);
        this.vfPrimitiveArr.splice(vpObj.index, 1);
    }

}

export default VisualTool;