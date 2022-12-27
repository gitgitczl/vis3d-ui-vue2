
let easy3dView = {
    viewAround: {
        initView: null,
        removeEventHdl: null,
        startTime: null,
        isStop: false,
        initHeading: null,
        start: function (initView) {
            viewer.clock.shouldAnimate = true; //自动播放
            this.isStop = false;
            this.initView = initView || cUtil.getCameraView();
            this.initHeading = this.initView.heading;
            this.startTime = viewer.clock.currentTime;
            var that = this;
            if (!this.removeEventHdl) {
                this.removeEventHdl = viewer.clock.onTick.addEventListener(function () {
                    if (that.isStop) return;
                    var delTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, that
                        .startTime);
                    that.initView.heading = that.initHeading + delTime * that.angle;
                    that.initView.duration = 0;
                    cUtil.setCameraView(that.initView);
                });
            }
        },
        end: function () {
            if (this.removeEventHdl) {
                this.removeEventHdl();
                this.removeEventHdl = null;
            }
            this.initView = null;
            this.startTime = null;
            this.isStop = false;
            this.initHeading = null;
            this.angle = 5;
        },
        stop: function () {
            this.isStop = true;
        },
        goon: function () {
            this.initView = cUtil.getCameraView();
            this.startTime = viewer.clock.startTime;
            this.initHeading = this.initView.heading;
            this.isStop = false;
        },
        angle: 5,
        setSpeed: function (angle) {
            this.angle = angle;
        }
    },
    
    viewPoint: {
        removeEventLis: null,
        initHeading: 0,
        isStop: false,
        position: null,
        startTime: null,
        start: function (position) {
            viewer.clock.shouldAnimate = true; //自动播放
            if (!position) {
                var lnglat = cUtil.getViewCenter();
                position = Cesium.Cartesian3.fromDegrees(lnglat[0], lnglat[1]);
            }
            this.position = position;
            this.startTime = viewer.clock.currentTime;
            this.isStop = false;
            var that = this;
            if (!this.removeEventLis) {
                this.removeEventLis = viewer.clock.onTick.addEventListener(function () {
                    if (that.isStop) return;
                    var delTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, that
                        .startTime);
                    var heading = that.initHeading + delTime * that.angle;
                    var hpr = that.setHpr({
                        heading: heading
                    })
                    viewer.camera.lookAt(position, hpr);
                });
            }
        },
        stop: function () {
            this.isStop = true;
        },
        goon: function () {
            this.startTime = viewer.clock.startTime;
            this.isStop = false;
        },
        end: function () {
            if (this.removeEventLis) {
                this.removeEventLis();
                this.removeEventLis = null;
            }
            this.initHeading = 0;
            this.isStop = false;
            this.position = null;
            this.startTime = null;
            this.angle = 5;
        },
        angle: 5,
        setSpeed: function (angle) {
            this.angle = angle;
        },
        setHpr: function (opt) {
            var heading = Cesium.Math.toRadians(opt.heading || 0);
            var pitch = Cesium.Math.toRadians(opt.pitch || -60);
            var range = opt.range || 5000;
            return new Cesium.HeadingPitchRange(heading, pitch, range);
        },
        setPosotion: function (position) {
            this.position = position;
        }
    },
    setRotate(obj, callback) { //传入所需定位的经纬度 及旋转的速度 旋转的圈数
        if (!obj.x || !obj.y) {
            console.log("设定地球旋转时，并未传入经纬度！");
            return;
        }
        var v = obj.v || 1;
        var i = 0;
        var q = obj.q || 2;
        var x = obj.x;
        var y = obj.y;
        var z = obj.z;
        var interVal = window.setInterval(function () {
            x = x + v;
            if (x >= 179) {
                x = -180;
                i++;
            }
            viewer.scene.camera.setView({
                destination: new Cesium.Cartesian3.fromDegrees(x, y, z || 20000000)
            });

            if (i == q) { //此处有瑕疵  未修改
                clearInterval(interVal);
                callback();
            }
        }, 16);
    }
};


export default easy3dView;