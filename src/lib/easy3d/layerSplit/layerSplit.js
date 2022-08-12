// 卷帘对比
class LayerSplit {
    constructor(viewer, opt) {
        this.viewer = viewer;
        this.slider = null;
        this.handler = null;
        this.moveActive = false;
        this.opt = opt || {};
        this.layer = this.opt.layer;
        /*   if (!this.layer) return; */
        if (this.layer) this.layer.splitDirection = window.Cesium.ImagerySplitDirection.RIGHT;
        this.mapContainer = this.viewer.container;
        this.init();
    }
    init() {
        let that = this;
        this.slider = window.document.createElement("div");
        this.slider.setAttribute("id", "layer-split");
        this.slider.style.height = "100%";
        this.slider.style.width = "5px";
        this.slider.style.position = "absolute";
        this.slider.style.left = "50%";
       /*  this.slider.style.zIndex = "999"; */
        this.slider.style.top = "0px";
        this.slider.style.background = "rgba(255,255,255,0.5)";
        this.mapContainer.appendChild(this.slider);
        this.handler = new window.Cesium.ScreenSpaceEventHandler(this.slider);

        this.viewer.scene.imagerySplitPosition = 0.5;

        this.handler.setInputAction(function () {
            that.moveActive = true;
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
        this.handler.setInputAction(function () {
            that.moveActive = true;
        }, Cesium.ScreenSpaceEventType.PINCH_START);

        this.handler.setInputAction(function(movement){
            that.move(movement)
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        this.handler.setInputAction(function(movement){
            that.move(movement)
        }, Cesium.ScreenSpaceEventType.PINCH_MOVE);

        this.handler.setInputAction(function () {
            that.moveActive = false;
        }, Cesium.ScreenSpaceEventType.LEFT_UP);
        this.handler.setInputAction(function () {
            that.moveActive = false;
        }, Cesium.ScreenSpaceEventType.PINCH_END);
    }

    move(movement) {
        if (!this.moveActive) {
            return;
        }
        var relativeOffset = movement.endPosition.x;
        var splitPosition = (this.slider.offsetLeft + relativeOffset) / this.slider.parentElement.offsetWidth;
        this.slider.style.left = 100.0 * splitPosition + '%';
        this.viewer.scene.imagerySplitPosition = splitPosition;
    }

    destroy() {
        if (this.slider) {
            this.mapContainer.removeChild(this.slider);
            this.slider = null;
        }
        if (this.handler) {
            this.handler.destroy();
            this.handler = null;
        }
        this.layer.splitDirection = window.Cesium.ImagerySplitDirection.NONE;
    }

    setLayer(layer) {
        if (!layer) return;
        this.layer.splitDirection = window.Cesium.ImagerySplitDirection.NONE;
        this.layer = layer;
        this.layer.splitDirection = window.Cesium.ImagerySplitDirection.LEFT;
    }
}

export default LayerSplit;