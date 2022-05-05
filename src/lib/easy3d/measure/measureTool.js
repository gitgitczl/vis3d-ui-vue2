import MeasureSpaceDistance from './measureSpaceDistance';
import MeasureGroundDistance from './measureGroundDistance';
import MeasureSpaceArea from './measureSpaceArea';
import MeasureHeight from './measureHeight';
import MeasureTriangle from './measureTriangle';
import MeasureLnglat from './measureLnglat';
import MeasureAzimutht from './measureAzimuth';
import MeasureSection from './measureSection';
import MeasureSlope from './measureSlope';

class MeasureTool {
	constructor(viewer, obj) {
		if (!viewer) {
			console.warn("缺少必要参数！--viewer");
			return;
		}
		this.viewer = viewer;
		this.nowMeasureObj = null; // 当前测量对象
		this.measureLnglatArr = [];
	
	}

	// 事件绑定
	on(type, fun) {
		if (type == "endMeasure") {
			this.endMeasureFun = fun;
		}

		if (type == "startEdit") {
			this.startEditFun = fun;
		}

		if (type == "endEdit") {
			this.endEditFun = fun;
		}

	}

	start(opt) {
		opt = opt || {};
		if (!opt.type) return;
		let ms;
		if (this.nowMeasureObj && this.nowMeasureObj.status != "endCreate") this.nowMeasureObj.destroy(); // 结束上一次的绘制
		switch (Number(opt.type)) {
			case 1: // 空间距离测量
				ms = new MeasureSpaceDistance(this.viewer, opt);
				break;
			case 2: // 贴地距离测量
				ms = new MeasureGroundDistance(this.viewer, opt);
				break;
			case 3: // 空间面积测量
				ms = new MeasureSpaceArea(this.viewer, opt);
				break;
			case 4: // 高度测量
				ms = new MeasureHeight(this.viewer, opt);
				break;
			case 5: // 三角测量
				ms = new MeasureTriangle(this.viewer, opt);
				break;
			case 6: // 坐标量算
				ms = new MeasureLnglat(this.viewer, opt);
				break;
			case 7: // 方位角测量
				ms = new MeasureAzimutht(this.viewer, opt);
				break;
			case 8: // 剖面测量
				ms = new MeasureSection(this.viewer, opt);
				break;
			case 9: // 单点坡度
				ms = new MeasureSlope(this.viewer, opt);
				break;
			/* 	case 10: //贴模型距离
					ms = new MeasureTilesetDistance(this.viewer);
					break; */
			case 11: // 单点坡度
				ms = new MeasureSlopePolygon(this.viewer);
				break;
			default:
				break;
		}
		this.nowMeasureObj = ms;
		let that = this;
		if (ms) {
			ms.start(function (res) {
				if (opt.success) opt.success(ms, res)
				if (that.endMeasureFun) that.endMeasureFun(ms, res);
			});
			this.measureLnglatArr.push(ms);
		}
	}
	clear() {
		for (var i = 0; i < this.measureLnglatArr.length; i++) {
			if (this.measureLnglatArr[i]) this.measureLnglatArr[i].destroy();
		}
		this.measureLnglatArr = [];
		this.nowMeasureObj = null; // 当前编辑对象
	}
	destroy() {
		this.clear();
	}

	// 设置单位
	setUnit(unit) {
		if (!unit) return;
		this.nowMeasureObj.setUnit(unit);
	}

}

export default MeasureTool;