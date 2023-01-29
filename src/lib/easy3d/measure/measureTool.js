import MeasureSpaceDistance from './measureSpaceDistance';
import MeasureGroundDistance from './measureGroundDistance';
import MeasureSpaceArea from './measureSpaceArea';
import MeasureHeight from './measureHeight';
import MeasureTriangle from './measureTriangle';
import MeasureLnglat from './measureLnglat';
import MeasureAzimutht from './measureAzimuth';
import MeasureSection from './measureSection';
import MeasureSlope from './measureSlope';

/**
 * 量算控制类
 * @description 量算控制类，通过此类对象，可进行不同类型的量算操作，而不用多次new 不同类型的量算对象。
 * @class
 */
class MeasureTool {
	/**
	 * @param {Cesium.viewer} viewer 地图viewer对象
	 * @param {Object} obj 基础配置 
	 */
	constructor(viewer, obj) {
		if (!viewer) {
			console.warn("缺少必要参数！--viewer");
			return;
		}
		obj = obj || {};
		this.viewer = viewer;

		/**
		 * @property {Object} nowMeasureObj 当前测量对象
		 */
		this.nowMeasureObj = null;

		/**
		 * @property {Array} measureObjArr 测量对象数组
		 */
		this.measureObjArr = [];
		this.lastMeasureObj = null;
		this.handler = null;

		/**
		 * @property {Boolean} [canEdit=true] 测量对象是否可编辑
		 */
		this.canEdit = obj.canEdit == undefined ? true : obj.canEdit;

		/**
		 * @property {Boolean} [intoEdit=true] 绘制完成后，是否进入编辑状态（当canEdit==true，才起作用）
		 */
		this.intoEdit = obj.intoEdit == undefined ? true : obj.intoEdit;
		this.bindEdit();
	}

	/** 
	 * 事件绑定
	 * @param {String} type 事件类型（startEdit 开始编辑时 / endEdit 编辑结束时 / end 创建完成后）
	 * @param {Function} fun 绑定函数
	 */
	on(type, fun) {
		if (type == "endCreate") {
			this.endCreateFun = fun;
		}

		if (type == "startEdit") {
			this.startEditFun = fun;
		}

		if (type == "endEdit") {
			this.endEditFun = fun;
		}

	}

	/**
	 * 开始量算
	 * @param {Object} opt 
	 * @param {Number} opt.type 量算类型（1~空间距离测量/2~贴地距离测量/3~空间面积测量/4~高度测量/5~三角测量/6~坐标量算/7~方位角测量/8~剖面测量/9~单点坡度）
	 */
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
				if (that.endCreateFun) that.endCreateFun(ms, res);
			});
			this.measureObjArr.push(ms);
		}
	}

	/**
	 * 绑定编辑
	 */
	bindEdit() {
		let that = this;
		// 如果是线 面 则需要先选中
		if (!this.handler) this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		this.handler.setInputAction(function (evt) {
			//单击开始绘制
			if (!that.canEdit) return;
			let pick = that.viewer.scene.pick(evt.position);
			if (Cesium.defined(pick) && pick.id && pick.id.objId) {
				// 选中实体
				for (let i = 0; i < that.measureObjArr.length; i++) {
					if (
						pick.id.objId == that.measureObjArr[i].objId &&
						(that.measureObjArr[i].state == "endCreate" ||
							that.measureObjArr[i].state == "endEdit")
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

						that.measureObjArr[i].startEdit();
						that.nowEditObj = that.measureObjArr[i];
						if (that.startEditFun) that.startEditFun(that.nowEditObj); // 开始编辑
						that.lastMeasureObj = that.measureObjArr[i];
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

	/**
	 * 结束编辑
	 */
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
		for (let i = 0; i < this.measureObjArr.length; i++) {
			this.measureObjArr[i].endEdit();
		}
	}

	/**
	 * 清除
	 */
	clear() {
		for (var i = 0; i < this.measureObjArr.length; i++) {
			if (this.measureObjArr[i]) {
				this.measureObjArr[i].endEdit();
				this.measureObjArr[i].destroy();
			}
		}
		this.measureObjArr = [];
		if (this.nowMeasureObj) {
			this.nowMeasureObj.destroy();
			this.nowMeasureObj = null; // 当前编辑对象
		}
		that.changeCursor(false);
	}

	/**
	 * 销毁
	*/
	destroy() {
		this.clear();
		if (this.handler) {
			this.handler.destroy();
			this.handler = null;
		}

	}

	/**
	 * 设置单位
	*/
	setUnit(unit) {
		if (!unit) return;
		this.nowMeasureObj.setUnit(unit);
	}

	/**
	 * 修改鼠标样式
	 * @param {Boolean} isopen false为默认鼠标样式
	*/
	changeCursor(isopen) {
		let body = document.getElementsByTagName("body");
		body[0].style.cursor = isopen ? "crosshair" : "default";
	}
}

export default MeasureTool;