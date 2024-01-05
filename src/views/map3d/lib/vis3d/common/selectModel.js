// 点选3dtiles模型
import Prompt from "../prompt/prompt.js"
const selectModel = {
    isactivate: false,
    handler: undefined,
    prompt: undefined,
    activate(viewer, callback) {
        if (!viewer) {
            console.log("缺少地图对象--viewer");
            return;
        }
        this.viewer = viewer;
        if (!this.isactivate) {
            this.isactivate = true;
            if (!this.handler) this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
            if (!this.prompt) this.prompt = new Prompt(this.viewer, {});
            this.handler.setInputAction((evt) => {
                let pick = this.viewer.scene.pick(evt.position);
                this.prompt.destroy();
                this.prompt = undefined;
                debugger
                if (pick && pick.primitive instanceof Cesium.Cesium3DTileFeature) {
                    if (callback) callback(pick)
                }
                this.handler.destroy();
                this.handler = undefined;
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
            this.handler.setInputAction((evt) => {
                this.prompt.update(evt.endPosition, "左键拾取");
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        }
    },
    disable() {
        if (this.isactivate) {
            this.isactivate = false;
            if (this.handler) {
                this.handler.destroy();
                this.handler = undefined;
            }
            if (this.prompt) {
                this.prompt.destroy();
                this.prompt = undefined;
            }
        }
    }
}

export default selectModel;