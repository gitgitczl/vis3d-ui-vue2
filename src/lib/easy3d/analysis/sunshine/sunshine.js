
// 日照分析
class Sunshine {
    constructor(viewer, opt) {
        this.viewer = viewer;
        this.opt = opt || {};
        this._startTime = opt.startTime || Cesium.JulianDate.fromDate(new Date().setHours(8), new Cesium.JulianDate());
        if (this._startTime instanceof Date) this._startTime = Cesium.JulianDate.fromDate(this._startTime, new Cesium.JulianDate());
        this._endTime = opt.endTime;
        if (this._endTime instanceof Date) this._endTime = Cesium.JulianDate.fromDate(this._endTime, new Cesium.JulianDate());
        this.oldShouldAnimate = this.viewer.clock.shouldAnimate;
        this.multiplier = opt.multiplier || 2400;
    }
    start() {
        this.viewer.clock.currentTime = this._startTime.clone();
        this.viewer.clock.shouldAnimate = true;
        this.viewer.clock.multiplier = this.multiplier;
        this.viewer.scene.globe.enableLighting = true;
        this.viewer.shadows = true;
        this.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
        if (this._endTime) this.viewer.clock.endTime = this._endTime.clone();

    }
    end() {
        this.viewer.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
        this.viewer.clock.shouldAnimate = this.oldShouldAnimate;
        this.viewer.clock.multiplier = 1;
    }

    destroy () {
        this.viewer.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
        this.viewer.clock.shouldAnimate = this.oldShouldAnimate;
        this.viewer.clock.multiplier = 1;
    }

    // 暂停继续
    pause() {
        this.viewer.clock.shouldAnimate = !this.viewer.clock.shouldAnimate;
    }

    get startTime() {
        return this._startTime
    }

    set startTime(time) {
        if (!time) return;
        if (this._startTime instanceof Date) {
            this._startTime = Cesium.JulianDate.fromDate(this._startTime, new Cesium.JulianDate());
        } else {
            this._startTime = time.clone();
        }
        this.start();
    }

    get endTime() {
        return this._endTime;
    }

    set endTime(time) {
        if (!time) return;
        if (this._endTime instanceof Date) {
            this._endTime = Cesium.JulianDate.fromDate(this._startTime, new Cesium.JulianDate());
        } else {
            this._endTime = time.clone();
        }
        this.start();
    }
}

export default Sunshine;