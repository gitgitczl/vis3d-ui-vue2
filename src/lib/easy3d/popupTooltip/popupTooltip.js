// 绑定所有entity的气泡窗
class PopupTooltipTool {
    constructor(viewer, opt) {
        this.viewer = viewer;
        this.opt = opt || {};
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
    autoBindPopup() {
        let that = this;
        this.popupHandler.setInputAction(function (evt) { //单击开始绘制
            if (!that.toolOpen) return;
            const pick = that.viewer.scene.pick(evt.position);
            if (!Cesium.defined(pick)) {
                return;
            }
            let ent;
            if (pick.primitive) { // 拾取图元
                ent = pick.primitive;
            }
            if (pick.id && pick.id instanceof Cesium.Entity) {
                ent = pick.id;
            }

            /* 如果当前实体绑定了点击事件 则执行点击事件*/
            /* if (ent.click) ent.click(ent); */
            // 如果当前实体绑定了气泡窗 则弹出气泡窗
            if (ent.popup == undefined) return;
            if (!ent.popupPrompt) {
                ent.popupPrompt = that.createPrompt(ent, ent.popup);
                ent.popupPrompt.ent = ent; // 双向绑定
            }
            if (ent.position) ent.popupPrompt.update(evt.position); // 除点状坐标外

            let isvisible;
            if (ent.popup.constructor == String) {
                isvisible = true;
            } else { // 可通过改变属性改变显示隐藏
                isvisible = ent.popup.show == undefined ? true : ent.popup.show;
            }

            ent.popupPrompt.setVisible(isvisible);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    // 鼠标移入气泡窗
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
                if (that.lastTooltipPromptEnt) {
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
                if (ent.position) ent.tooltipPrompt.update(evt.endPosition); // 除点状坐标外 点状坐标的锚点 为创建时的位置
            } else {// 重新构建
                ent.tooltipPrompt = that.createPrompt(ent, ent.tooltip);
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
    createPrompt(ent, promptAttr) {
        let position = promptAttr.position;
        /*  if (ent.billboard || ent.point || ent.model) {
             position = ent.position.getValue();
             // 计算贴地坐标
             if (ent instanceof Cesium.Billboard || 
                 (ent.billboard && ent.billboard.heightReference.getValue() == 1) || 
                 ent.point && ent.point.heightReference.getValue() == 1 || 
                 ent.model && ent.model.heightReference.getValue() == 1
                 ) {
                 let ctgc = Cesium.Cartographic.fromCartesian(position);
                 const height = viewer.scene.sampleHeight(ctgc);
                 ctgc.height = height;
                 position = Cesium.Cartographic.toCartesian(ctgc);
             }
        } */
        let defaultVal = JSON.parse(JSON.stringify(this.defaultVal));

        if (ent.tooltip) {
            defaultVal.closeBtn = false;
        }

        if (promptAttr.constructor == String) {  // 支持两种传参 字符串 / 对象
            defaultVal.position = position;
            defaultVal.content = promptAttr;
        } else {
            promptAttr.position = position;
            var promptAttrClone = JSON.parse(JSON.stringify(promptAttr));
            defaultVal = Object.assign(defaultVal,promptAttrClone);
        }
        return new Prompt(this.viewer, defaultVal);
    }
    // 关闭
    close() {
        this.toolOpen = false;
    }
    open() {
        this.toolOpen = true;
    }
}

export default PopupTooltipTool;