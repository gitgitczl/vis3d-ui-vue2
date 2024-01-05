// 视图控制
import util from "../util"
let viewControl = {
    viewer: undefined,
    views: [],
    step: 0,
    isReset: false,
    viewOpt: {},
    activate(viewer, opt) {
        this.viewer = viewer;
        this.viewOpt = opt || {};
        this.viewOpt.duration = this.viewOpt.duration || 3;
        // 默认给个初始视角
        this.viewOpt.initView = this.viewOpt.initView || util.getCameraView(this.viewer);
        this.views = this.viewOpt.views || [this.viewOpt.initView];
        this.viewer.camera.moveStart.addEventListener(this.cameraMoveStartHandler, this)
        this.viewer.camera.moveEnd.addEventListener(this.cameraMoveEndHandler, this)
    },
    addView(view) {
        if (!view) return;
        this.views.push(view);
    },
    disable() {
        this.viewer.camera.moveEnd.removeEventListener(this.cameraMoveEndHandler, this)
        this.views = [];
        this.step = 0;
        this.isReset = false;
    },

    cameraMoveStartHandler(){
        console.log("cameraMoveStartHandler");
    },
    
    cameraMoveEndHandler() {
        console.log("cameraMoveEndHandler");
        if (this.isReset) return;
        let cameraV = util.getCameraView(this.viewer);
        this.views.push(cameraV);
    },

    // 下一个
    goNext() {
        this.step++;
        if (this.step == this.views.length - 1) {
            console.log("当前已为最后一个视角！");
            return;
        }
        let view = this.views[this.step];
        this.flyTo(view);
    },

    // 上一个
    goPrev() {
        this.step--;
        if (this.step == 0) {
            console.log("当前已为第一个视角！");
            return;
        }
        let view = this.views[this.step];
        this.flyTo(view);
    },

    // 第一个
    goFirst() {
        this.step = 0;
        let view = this.views[0];
        this.flyTo(view);
    },

    // 最后一个
    goLast() {
        this.step = this.views.length -1;
        let view = this.views[this.views.length - 1];
        this.flyTo(view);
    },

    flyTo(view) {
        if (!view) return;
        view.duration = this.viewOpt.duration;
        let that = this;
        this.isReset = true;
        view.complete = function () {
            console.log("flyTo");
            that.isReset = false;
        }
        util.setCameraView(view,this.viewer);
    }
}

export default viewControl;