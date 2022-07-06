import VisualField from "./visualField";
class VisualTool {
    constructor(viewer, opt) {
        if (!Cesium.defined(viewer)) {
            throw new Cesium.DeveloperError('缺少地图对象！');
        }
        this.viewer = viewer;
        this.opt = opt || {};
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.positions = [];
        this.prompt = null;

        this.startPosition = null;
        this.endPosition = null;
        this.vfPrimitive = null;
        this.visibleAreaColor = null;
        this.hiddenAreaColor = null;
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

        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
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

    destroy(){
        if(this.vfPrimitiv){
            this.viewer.scene.primitives.remove(this.vfPrimitive);
            this.vfPrimitive = null;
        }
      
    }
}