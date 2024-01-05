// 绕点旋转
const viewPoint = {
    removeEventLis: null,
    initHeading: 0,
    isStop: false, // 是否暂停
    center: null,
    startTime: null,
    viewer: undefined,
    start: function (viewer,opt) {
        this.viewer = viewer || window.viewer;
        if (!this.viewer) {
            console.log("绕点旋转缺少viewer对象");
            return;
        }
        this.end();
        let { center, speed, range } = opt || {};

        this.angle = speed || 5;
        this.range = range || 5000;

        this.viewer.clock.shouldAnimate = true; //自动播放
        this.center = center;
        if (!this.center) return;
        if (!(this.center instanceof Cesium.Cartesian3)) {
            this.center = Cesium.Cartesian3.fromDegrees(this.center[0], this.center[1], this.center[2] || 0)
        }
        this.startTime = this.viewer.clock.currentTime;
        this.isStop = false;
        var that = this;
        if (!this.removeEventLis) {
            this.removeEventLis = that.viewer.clock.onTick.addEventListener(function () {
                if (that.isStop) return;
                var delTime = Cesium.JulianDate.secondsDifference(that.viewer.clock.currentTime, that
                    .startTime);
                var heading = that.initHeading + delTime * that.angle;
                var hpr = that.getHpr({
                    heading: heading
                })
                console.log(heading);
                that.viewer.camera.lookAt(that.center, hpr);
            });
        }
    },
    stop: function () {
        this.isStop = true;
    },
    goon: function () {
        this.startTime = this.viewer.clock.startTime;
        this.isStop = false;
    },
    end: function () {
        if (this.removeEventLis) {
            this.removeEventLis();
            this.removeEventLis = null;
        }
        this.initHeading = 0;
        this.isStop = false;
        this.center = null;
        this.startTime = null;
    },
    setSpeed: function (speed) {
        this.angle = speed;
    },
    getHpr: function (opt) {
        var heading = Cesium.Math.toRadians(opt.heading || 0);
        var pitch = Cesium.Math.toRadians(opt.pitch || -60);
        var range = opt.range || this.range || 5000;
        return new Cesium.HeadingPitchRange(heading, pitch, range);
    },
    setCenter: function (center) {
        this.center = center;
    }
}

export default viewPoint;