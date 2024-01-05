class CustomHandler {
    constructor(viewer) {
        this.viewer = viewer;
        this.clickHandler = undefined;
        this.mouseMoveHandler = undefined;
        this.rightClickHandler = undefined;

        this.lastobj_click = undefined;
        this.lastobj_mouseMove = undefined;
        this.lastobj_rightClick = undefined;
    }

    click() {
        if (!this.clickHandler) this.clickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.clickHandler.setInputAction((evt) => {
            let res = this.getPickobj(evt.position);
            if (!res) {
                // 未拾取到对象
                this.pickNull(evt, this.lastobj_click, 'unClick');
                this.lastobj_click = undefined;
                return;
            } else {
                // 拾取到对象
                this.pickDiff(evt, res, this.lastobj_click, 'click', 'unClick')
                this.lastobj_click = res;
            }

        }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
    }

    mouseMove() {
        if (!this.mouseMoveHandler) this.mouseMoveHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.mouseMoveHandler.setInputAction((evt) => {
            let res = this.getPickobj(evt.endPosition);
            if (!res) {
                // 未拾取到对象
                this.pickNull(evt, this.lastobj_mouseMove, 'unMouseMove');
                this.lastobj_mouseMove = undefined;
                return;
            } else {
                // 拾取到对象
                this.pickDiff(evt, res, this.lastobj_mouseMove, 'mouseMove', 'unMouseMove')
                this.lastobj_mouseMove = res;
            }

        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    }

    rightClick() {
        if (!this.rightClickHandler) this.rightClickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.rightClickHandler.setInputAction((evt) => {
            let res = this.getPickobj(evt.position);
            if (!res) {
                // 未拾取到对象
                this.pickNull(evt, this.lastobj_rightClick, 'unRightClick');
                this.lastobj_rightClick = undefined;
                return;
            } else {
                // 拾取到对象
                this.pickDiff(evt, res, this.lastobj_rightClick, 'rightClick', 'unRightClick')
                this.lastobj_rightClick = res;
            }
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }

    /**
     * 销毁
     */
    destroy() {
        if (this.clickHandler) {
            this.clickHandler.destroy();
            this.clickHandler = undefined;
        }

        if (this.mouseMoveHandler) {
            this.mouseMoveHandler.destroy();
            this.mouseMoveHandler = undefined;
        }

        if (this.rightClickHandler) {
            this.rightClickHandler.destroy();
            this.rightClickHandler = undefined;
        }

        this.lastobj_click = undefined;
        this.lastobj_mouseMove = undefined;
        this.lastobj_rightClick = undefined;
    }

    /**
     * 根据像素坐标拾取对象
     * @param {Cesium.Cartesian2} px 
     * @returns {Object} 
     */
    getPickobj(px) {
        const pick = this.viewer.scene.pick(px);
        if (!pick) return undefined;
        // 目前点击对象时  分为多个类型 
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

        obj.randomId = this.getRandomId();
        return { obj, tileFeature } // 如果拾取的是3dtiles单个瓦片 则返回当前点击的瓦片 否则为空
    }

    /**
     * 当前拾取为空
     */
    pickNull(evt, lastpick, pickType) {
        // 未拾取到对象
        if (lastpick && lastpick.obj.unClick)
            lastpick.obj[pickType](evt, lastpick)
    }

    /**
     * 拾取前后对象不同
     */
    pickDiff(evt, res, lastpick, pickType, unpickType) {
        if (lastpick) { // 存在上一个对象 先执行上一个对象的相关操作
            if (lastpick.obj.randomId != res.obj.randomId) { // 1、拾取到的对象不同
                if (lastpick && lastpick.obj[unpickType])
                    lastpick.obj[unpickType](evt, lastpick)
            } else { // 2、拾取到的对象相同 但拾取的是同一个对象的不同瓦片
                if (res.tileFeature && lastpick.tileFeature && res.tileFeature._batchId != lastpick.tileFeature._batchId) {
                    lastpick.obj[unpickType](evt, lastpick)
                }
            }
        }
        if (res.obj[pickType]) res.obj[pickType](evt, res);
    }

    /**
     * 随机生成id
     */
    getRandomId() {
        return new Date().getTime() + "" + Math.floor(Math.random() * 10000) + "" + Math.floor(Math.random() * 10000);
    }
}

export default CustomHandler