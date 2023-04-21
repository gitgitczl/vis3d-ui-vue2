// 四周旋转
const viewAround = {
    initView: undefined,
    removeEventHdl: undefined,
    startTime: undefined,
    isStop: false,
    initHeading: undefined,
    viewer: undefined,
    start: function (viewer,opt) {
        this.viewer = viewer || window.viewer;
        let { speed } = opt;
        speed = speed || 5;
        if (!this.viewer) {
            console.log("绕点旋转缺少viewer对象");
            return;
        }
        this.end();
        viewer.clock.shouldAnimate = true; //自动播放
        this.isStop = false;
        this.initView = this.getCameraView();
        this.initHeading = this.initView.heading;
        this.startTime = viewer.clock.currentTime;
        var that = this;
        if (!this.removeEventHdl) {
            this.removeEventHdl = viewer.clock.onTick.addEventListener(function () {
                if (that.isStop) return;
                var delTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, that
                    .startTime);
                that.initView.heading = that.initHeading + delTime * speed;
                that.initView.duration = 0;
                that.setCameraView(that.initView);
            });
        }
    },
    end: function () {
        if (this.removeEventHdl) {
            this.removeEventHdl();
            this.removeEventHdl = undefined;
        }
        this.initView = undefined;
        this.startTime = undefined;
        this.isStop = false;
        this.initHeading = undefined;
    },
    stop: function () {
        this.isStop = true;
    },
    goon: function () {
        this.initView = this.getCameraView();
        this.startTime = viewer.clock.startTime;
        this.initHeading = this.initView.heading;
        this.isStop = false;
    },
    setSpeed: function (speed) {
        this.speed = speed;
    },
    getCameraView() {
        var camera = this.viewer.camera;
        var position = camera.position;
        var heading = camera.heading;
        var pitch = camera.pitch;
        var roll = camera.roll;
        var lnglat = Cesium.Cartographic.fromCartesian(position);
        return {
            x: Cesium.Math.toDegrees(lnglat.longitude),
            y: Cesium.Math.toDegrees(lnglat.latitude),
            z: lnglat.height,
            heading: Cesium.Math.toDegrees(heading),
            pitch: Cesium.Math.toDegrees(pitch),
            roll: Cesium.Math.toDegrees(roll)
        }

    },

    setCameraView(obj) {
        if (!obj) return;
        var position = Cesium.Cartesian3.fromDegrees(obj.x, obj.y, obj.z);
        this.viewer.camera.flyTo({
            destination: position,
            orientation: {
                heading: Cesium.Math.toRadians(obj.heading || 0),
                pitch: Cesium.Math.toRadians(obj.pitch || 0),
                roll: Cesium.Math.toRadians(obj.roll || 0)
            },
            duration: obj.duration === undefined ? 3 : obj.duration,
            complete: obj.complete
        });
    }
}

export default viewAround;