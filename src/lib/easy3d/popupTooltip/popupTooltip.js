/**
 * 弹窗类
 * @class
 * @example 
 * let popupTooltip = new easy3d.PopupTooltipTool(viewer);
popupTooltip.autoBindTooltip();
popupTooltip.autoBindPopup();
 */
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
        this.lastTooltipPromptEnt = undefined;
        this.defaultVal = {
            type: 2,
            show: true
        }
    }

    // 点击气泡窗
    /**
     * 绑定点击弹出气泡窗
     */
    autoBindPopup() {
        let that = this;
        this.popupHandler.setInputAction(function (evt) { //单击开始绘制
            let picks = that.viewer.scene.drillPick(evt.position);
            if (!picks || picks.length < 1) return;

            let pick = picks.filter(pick => {
                return pick.id.ispick; // 用于过滤 
            });
            if (!pick) return;
            let ent = pick[0].id;
            /* 如果当前实体绑定了点击事件 则执行点击事件*/
            if (ent.click) ent.click(ent);
            // 如果当前实体绑定了气泡窗 则弹出气泡窗
            if (ent.popup == undefined) return;
            if (!ent.popupPrompt) {
                let popup = {};
                if (typeof (ent.popup) == "string") {
                    popup.content = ent.popup;
                } else {
                    popup = Object.assign(popup, ent.popup);
                }
                popup.type = popup.type || 2; // 点击弹窗默认为固定点位弹窗
                ent.popupPrompt = that.createPrompt(ent, popup, evt.position);
                ent.popupPrompt.ent = ent; // 双向绑定
            }
            if (!ent.position) ent.popupPrompt.update(evt.position); // 除点状坐标外

            let isvisible;
            if (ent.popup.constructor == String) {
                isvisible = true;
            } else { // 可通过改变属性改变显示隐藏
                isvisible = ent.popup.show == undefined ? true : ent.popup.show;
            }
            ent.popupPrompt.setVisible(isvisible);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    /**
     * 绑定鼠标移入气泡窗
     */
    autoBindTooltip() {
        let that = this;
        this.popupHandler.setInputAction(function (evt) { //单击开始绘制
            if (!that.toolOpen) return;
            const pick = that.viewer.scene.pick(evt.endPosition);
            let ent;
            if (pick && pick.primitive) { // 拾取图元
                ent = pick.primitive;
            }
            if (pick && pick.id && pick.id instanceof Cesium.Entity) {
                ent = pick.id;
            }

            /* 以下几种形式销毁弹窗
            1、未拾取到对象
            2、拾取到的对象不是上一个对象 */
            if (!ent) {
                if (that.lastTooltipPromptEnt && that.lastTooltipPromptEnt.tooltipPrompt) {
                    that.lastTooltipPromptEnt.tooltipPrompt.destroy();
                    that.lastTooltipPromptEnt.tooltipPrompt = null;
                }
                return;
            } else {
                if (that.lastTooltipPromptEnt && that.lastTooltipPromptEnt.tooltipPrompt && ent.id != that.lastTooltipPromptEnt.id) {
                    that.lastTooltipPromptEnt.tooltipPrompt.destroy();
                    that.lastTooltipPromptEnt.tooltipPrompt = null;
                }
            }

            if (ent.tooltip == undefined || ent.tooltip == "") return;
            // 修改位置   
            if (ent.tooltipPrompt) {
                ent.tooltipPrompt.update(evt.endPosition); // 除点状坐标外 点状坐标的锚点 为创建时的位置
            } else {// 重新构建
                ent.tooltipPrompt = that.createPrompt(ent, ent.tooltip, evt.endPosition);
            }

            let isvisible;
            if (ent.tooltip.constructor == String) {
                isvisible = true;
            } else { // 可通过改变属性改变显示隐藏
                isvisible = ent.tooltip.show == undefined ? true : ent.tooltip.show;
            }

            ent.tooltipPrompt.setVisible(isvisible);
            that.lastTooltipPromptEnt = ent;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    createPrompt(ent, promptAttr, px) {
        let position;
        let defaultVal = JSON.parse(JSON.stringify(this.defaultVal));
        if (ent.billboard || ent.point || ent.model) {
            position = ent.position.getValue(this.viewer.clock.currentTime);
        } else {
            position = px;
        }

        if (ent.tooltip) {
            this.defaultVal.closeBtn = false;
        }
        defaultVal.position = position;
        if (promptAttr.constructor == String) {  // 支持两种传参 字符串 / 对象
            defaultVal.content = promptAttr;
        } else {
            defaultVal = Object.assign(defaultVal, promptAttr);
        }
        return new window.easy3d.Prompt(this.viewer, defaultVal);
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