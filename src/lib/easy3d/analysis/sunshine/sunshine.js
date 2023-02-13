
/**
 * 日照分析
 * @class
 */
class Sunshine {
    /**
     * @param {Cesium.Viewer} viewer 地图viewer对象 
     * @param {Object} opt 基础参数
     * @param {Date|Cesium.JulianDate} opt.startTime 开始时间
     * @param {Date|Cesium.JulianDate} opt.endTime 结束时间
     * @param {Number} [opt.topHeight=Number.MAX_VALUE] 最大高度
     * @param {String} [opt.color='#ff0000'] 颜色
     * @param {Number} [opt.alpha=0.8] 颜色透明度
     */
    constructor(viewer, opt) {
        this.viewer = viewer;
        this.opt = opt || {};
        /**
         * @property {Cesium.JulianDate} _startTime 开始时间
         */
        this._startTime = opt.startTime || Cesium.JulianDate.fromDate(new Date().setHours(8), new Cesium.JulianDate());
        if (this._startTime instanceof Date) this._startTime = Cesium.JulianDate.fromDate(this._startTime, new Cesium.JulianDate());

        /**
         * @property {Cesium.JulianDate} _endTime 结束时间
         */
        this._endTime = opt.endTime;
        if (this._endTime instanceof Date) this._endTime = Cesium.JulianDate.fromDate(this._endTime, new Cesium.JulianDate());
        this.oldShouldAnimate = this.viewer.clock.shouldAnimate;
        this.multiplier = opt.multiplier || 60;
        this.oldenableLighting = this.viewer.scene.globe.enableLighting;
        this.oldshadows = this.viewer.shadows;
    }

    /**
     * 开始
     */
    start() {
        this.viewer.clock.currentTime = this._startTime.clone();
        this.viewer.clock.startTime = this._startTime.clone();
        this.viewer.clock.shouldAnimate = true;
        this.viewer.clock.multiplier = this.multiplier;
        this.viewer.scene.globe.enableLighting = true;
        this.viewer.shadows = true;
        this.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
        if (this._endTime) this.viewer.clock.endTime = this._endTime.clone();
    }

    /**
     * 结束
     */
    end() {
        this.viewer.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
        this.viewer.clock.shouldAnimate = this.oldShouldAnimate;
        this.viewer.clock.multiplier = 1;
        this.viewer.scene.globe.enableLighting = this.oldenableLighting;
        this.viewer.shadows = this.oldshadows;
    }

    /**
     * 销毁
     */
    destroy() {
        this.viewer.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
        this.viewer.clock.shouldAnimate = this.oldShouldAnimate;
        this.viewer.clock.multiplier = 1;
        this.viewer.scene.globe.enableLighting = this.oldenableLighting;
    }

    /**
     * 暂停/继续
     */
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