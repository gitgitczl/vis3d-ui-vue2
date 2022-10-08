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
		obj = obj || {};
		this.viewer = viewer;
		this.nowMeasureObj = null; // 当前测量对象
		this.toolArr = [];
		this.lastMeasureObj = null;
		this.handler = null;
		this.canEdit = obj.canEdit == undefined ? true : obj.canEdit;
		this.intoEdit = obj.intoEdit == undefined ? true : obj.intoEdit;
		this.bindEdit();
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

		if (this.nowMeasureObj && (
			this.nowMeasureObj.state != "endCreate" &&
			this.nowMeasureObj.state != "endEdit") &&
			measureTool.nowMeasureObj.state != "no") return;
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
			this.changeCursor(true);
			ms.start(function (res) {
				that.changeCursor(false);
				if (that.intoEdit) {
					ms.startEdit();
					if (that.startEditFun) that.startEditFun(ms);
					that.lastMeasureObj = ms;
				}
				if (opt.success) opt.success(ms, res)
				if (that.endMeasureFun) that.endMeasureFun(ms, res);
			});
			this.toolArr.push(ms);
		}
	}

	// 绑定编辑
	bindEdit() {
		let that = this;
		// 如果是线 面 则需要先选中
		if (!this.handler) this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		this.handler.setInputAction(function (evt) {
			//单击开始绘制
			if (!that.canEdit) return;
			let pick = that.viewer.scene.pick(evt.position);
			debugger
			if (Cesium.defined(pick) && pick.id && pick.id.objId) {
				// 选中实体
				for (let i = 0; i < that.toolArr.length; i++) {
					if (
						pick.id.objId == that.toolArr[i].objId &&
						(that.toolArr[i].state == "endCreate" ||
							that.toolArr[i].state == "endEdit")
					) {
						if (that.lastMeasureObj) {
							// 结束除当前选中实体的所有编辑操作
							that.lastMeasureObj.endEdit();
							if (that.endEditFun) {
								that.endEditFun(that.lastMeasureObj);
							}
							that.lastMeasureObj = null;
						}
						// 开始编辑

						that.toolArr[i].startEdit();
						that.nowEditObj = that.toolArr[i];
						if (that.startEditFun) that.startEditFun(that.nowEditObj); // 开始编辑
						that.lastMeasureObj = that.toolArr[i];
						break;
					}
				}
			} else {
				// 未选中实体 则结束全部绘制
				if (that.lastMeasureObj) {
					that.lastMeasureObj.endEdit();
					if (that.endEditFun) {
						that.endEditFun(that.lastMeasureObj); // 结束事件
					}
					that.lastMeasureObj = null;
				}
			}
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	}

	endEdit() {
		if (this.lastMeasureObj) {
			// 结束除当前选中实体的所有编辑操作
			this.lastMeasureObj.endEdit();
			if (this.endEditFun) {
				this.endEditFun(
					this.lastMeasureObj,
					this.lastMeasureObj.getEntity()
				); // 结束事件
			}
			this.lastMeasureObj = null;
		}
		for (let i = 0; i < this.toolArr.length; i++) {
			this.toolArr[i].endEdit();
		}
	}

	clear() {
		for (var i = 0; i < this.toolArr.length; i++) {
			if (this.toolArr[i]) {
				this.toolArr[i].endEdit();
				this.toolArr[i].destroy();
			}
		}
		this.toolArr = [];
		this.nowMeasureObj = null; // 当前编辑对象
	}
	destroy() {
		this.clear();
		if (this.handler) {
			this.handler.destroy();
			this.handler = null;
		}

	}

	// 设置单位
	setUnit(unit) {
		if (!unit) return;
		this.nowMeasureObj.setUnit(unit);
	}


	// 修改鼠标样式
	changeCursor(isopen) {
		let body = document.getElementsByTagName("body");
		body[0].style.cursor = isopen ? "crosshair" : "default";
	}
}

export default MeasureTool;