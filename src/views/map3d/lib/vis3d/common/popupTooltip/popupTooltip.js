/**
 * 弹窗类
 * @class
 * @example 
 * let popupTooltip = new vis3d.PopupTooltipTool(viewer);
    popupTooltip.bindTooltip();
    popupTooltip.bindPopup();
 */
import "../../prompt/prompt.css"
import Prompt from "../../prompt/prompt"

class PopupTooltipTool {
    /**
     * @param {Cesium.Viewer} viewer 
     */
    constructor(viewer) {
        this.viewer = viewer;
        /**
         * @property {Boolean} [toolOpen=true] 是否开启弹窗工具
         */
        this.toolOpen = true;
        this.popupHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.tooltipHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.defaultVal = {
            type: 2,
            show: true
        }

        this.lastTooltipObj = undefined;

    }

    /**
     * 根据像素坐标拾取对象
     * @param {Cesium.Cartesian2} px 
     * @returns {Object} 
     */
    getPickobj(px) {
        const pick = this.viewer.scene.pick(px);
        if (!pick) return undefined;
        let tileFeature, obj;
        if (pick.id && pick.id instanceof Cesium.Entity) { // entity
            obj = pick.id;
        } else if (pick.primitive && !(pick.primitive instanceof Cesium.Cesium3DTileset)) { // 普通primitive
            obj = pick.primitive;
        } else if (pick.primitive && pick.primitive instanceof Cesium.Cesium3DTileset) { // 拾取3dtiles模型
            if (pick instanceof Cesium.Cesium3DTileFeature) { // 3dtiles，精细化模型
                tileFeature = pick
            }
            obj = pick.primitive;
        }

        return { obj, tileFeature } // 如果拾取的是3dtiles单个瓦片 则返回当前点击的瓦片 否则为空
    }


    /**
     * 绑定点击弹出气泡窗
     */
    bindPopup() {
        this.popupHandler.setInputAction((evt) => { //单击开始绘制
            if (!this.toolOpen) return;
            let res = this.getPickobj(evt.position);
            if (!res || !res.obj) return;
            const obj = res.obj;
            if (!obj || !obj.popup) return;
            if (!obj.popupPrompt) { // 未创建气泡窗 则创建
                // 当前对象未创建气泡窗
                let popup = {};
                if (typeof (obj.popup) == "string") {
                    popup.content = obj.popup;
                } else {
                    popup = Object.assign(popup, obj.popup);
                }
                popup.type = popup.type || 2; // 点击弹窗默认为固定点位弹窗
                obj.popupPrompt = this.createPrompt(obj, popup, evt.position);
            } else {
                if (obj.isPointType) {
                    // 点状 直接打开
                    obj.popupPrompt.setVisible(true);
                } else {
                    // 线状 先销毁原气泡窗 再在新位置重新构建气泡窗
                    obj.popupPrompt.destroy();
                    obj.popupPrompt = undefined;

                    let popup = {};
                    if (typeof (obj.popup) == "string") {
                        popup.content = obj.popup;
                    } else {
                        popup = Object.assign(popup, obj.popup);
                    }
                    popup.type = popup.type || 2; // 点击弹窗默认为固定点位弹窗
                    obj.popupPrompt = this.createPrompt(obj, popup, evt.position);
                }
            }

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    /**
     * 绑定鼠标移入气泡窗
     */
    bindTooltip() {
        this.popupHandler.setInputAction((evt) => { //单击开始绘制
            let res = this.getPickobj(evt.endPosition);
            if (!res || !res.obj) {
                // 移出对象后 删除
                if (this.lastTooltipObj && this.lastTooltipObj.tooltipPrompt) {
                    this.lastTooltipObj.tooltipPrompt.destroy();
                    this.lastTooltipObj.tooltipPrompt = undefined;
                    this.lastTooltipObj = undefined;
                }
                return;
            } else {
                // 移入对象 
                let obj = res.obj;
                // 前后两次移入的对象不一致时 清除上一次移入的对象气泡窗
                if (this.lastTooltipObj && obj.tooltipId != this.lastTooltipObj.tooltipId) {
                    if (this.lastTooltipObj.tooltipPrompt) {
                        this.lastTooltipObj.tooltipPrompt.destroy();
                        this.lastTooltipObj.tooltipPrompt = undefined;
                    }
                    this.lastTooltipObj = undefined;
                }

                if (!obj.tooltip) return;
                if (!obj.tooltipPrompt) {
                    let popup = {};
                    if (typeof (obj.tooltip) == "string") {
                        popup.content = obj.tooltip;
                    } else {
                        popup = Object.assign(popup, obj.tooltip);
                    }
                    popup.type = popup.type || 2; // 点击弹窗默认为固定点位弹窗
                    obj.tooltipPrompt = this.createPrompt(obj, popup, evt.endPosition);
                } else {
                    obj.tooltipPrompt.update({
                        x: evt.endPosition.x,
                        y: evt.endPosition.y - 4
                    });
                }
                obj.tooltipId = new Date().getTime() + "" + Math.floor(Math.random() * 10000) + "" + Math.floor(Math.random() * 10000);
                this.lastTooltipObj = obj;
            }

        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    /**
     * 创建气泡窗
     * @param {Cesium.Primitive} obj 
     * @param {Object} promptAttr 
     * @param {Cesium.Cartesian2} px 
     * @returns 
     */
    createPrompt(obj, promptAttr, px) {
        let position;
        let defaultVal = JSON.parse(JSON.stringify(this.defaultVal));
        if (obj instanceof Cesium.Entity) { // 实体
            if (obj.billboard || obj.point || obj.model) {  // 点状对象
                const ent = obj.billboard || obj.point || obj.model;
                position = obj.position.getValue(this.viewer.clock.currentTime);
                const isClamp = ent.heightReference.getValue();
                if (isClamp == 1) {
                    let ctgc = Cesium.Cartographic.fromCartesian(position);
                    let height = this.viewer.scene.sampleHeight(ctgc.clone());
                    if (height == undefined) {
                        // 自动计算值失败 通过拾取 重新计算高度，加个偏移参数，防止pickPosition拾取时undefined
                        const newPosition = this.viewer.scene.pickPosition({
                            x: px.x + 1,
                            y: px.y + 1
                        });
                        const newCtgc = Cesium.Cartographic.fromCartesian(newPosition);
                        height = newCtgc.height;
                    } else {
                        ctgc.height = height;
                    }
                    position = Cesium.Cartographic.toCartesian(ctgc);
                }
                obj.isPointType = true; // 点状对象
            }
            if (obj.polyline || obj.polygon || obj.rectangle || obj.ellipse || obj.plane || obj.path) { // 非点状对象
                // 1、重新根据px来拾取位置
                position = this.viewer.scene.pickPosition(px);
                obj.isPointType = false; // 点状对象
            }

        } else {

        }


        if (obj.tooltip) {
            this.defaultVal.closeBtn = false;
        }
        defaultVal.position = position;
        if (promptAttr.constructor == String) {  // 支持两种传参 字符串 / 对象
            defaultVal.content = promptAttr;
        } else {
            defaultVal = Object.assign(defaultVal, promptAttr);
        }
        return new Prompt(this.viewer, defaultVal);
    }



    /**
     * 关闭弹窗
     */
    close() {
        this.toolOpen = false;
    }

    /**
     * 打开弹窗
     */
    open() {
        this.toolOpen = true;
    }
}

export default PopupTooltipTool;