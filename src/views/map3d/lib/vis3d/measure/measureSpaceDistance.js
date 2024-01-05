//空间距离量算js
import MeasureGroundDistance from "./measureGroundDistance";
import BaseMeasure from "./baseMeasure";
import '../prompt/prompt.css'
import Prompt from '../prompt/prompt.js'

/**
 * 空间距离测量类
 * @class
 * @augments BaseMeasure
 * @alias BaseMeasure.MeasureSpaceDistance 
 */
class MeasureSpaceDistance extends BaseMeasure {
	constructor(viewer, opt) {
		super(viewer, opt);
		this.unitType = "length";
		this.type = "spaceDistance";

		/**
		 * @property {Number} allDistance 总长度
		 */
		this.allDistance = 0;
		this.labels = [];
		this.positions = [];
		//线
		this.polyline = null;
		this.nowLabel = null; // 编辑时  当前点的label
		this.nextlabel = null; // 编辑时  下一个点的label
		this.lastPosition = null;// 编辑时   上一个点的坐标
		this.nextPosition = null;// 编辑时   下一个点的坐标
	}

	//开始测量
	start(callback) {
		if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt(this.viewer, this.promptStyle);
		let that = this;
		this.state = "startCreate";
		this.handler.setInputAction(function (evt) { //单击开始绘制
			that.state = "creating";
			let cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
			if (!cartesian) return;
			if (that.movePush) {
				that.positions.pop();
				that.movePush = false;
			}
			let label;
			if (that.positions.length == 0) {
				label = that.createLabel(cartesian, "起点");
				that.floatLable = that.createLabel(cartesian, "");
				that.floatLable.wz = 0;
				that.floatLable.show = false;
			} else {
				let distance = that.getLength(cartesian, that.lastCartesian);
				that.lastDistance = distance;
				that.allDistance += distance;
				let text = that.formateLength(distance, that.unit);
				label = that.createLabel(cartesian, text);
				label.wz = that.positions.length;// 和坐标点关联
				label.distance = distance;
			}
			that.labels.push(label);
			let point = that.createPoint(cartesian.clone());
			point.wz = that.positions.length; // 和坐标点关联
			that.controlPoints.push(point);
			that.positions.push(cartesian);
			that.lastCartesian = cartesian.clone();
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

		this.handler.setInputAction(function (evt) {
			let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
			if (!cartesian) return;
			that.state = "creating";
			if (that.positions.length < 1) {
				that.prompt.update(evt.endPosition, "单击开始测量");
				return;
			} else {
				that.prompt.update(evt.endPosition, "双击结束，右键取消上一步");
				that.floatLable.show = true;

				if (!that.movePush) {
					that.positions.push(cartesian);
					that.movePush = true;
				} else {
					that.positions[that.positions.length - 1] = cartesian;
				}

				if (!Cesium.defined(that.polyline)) {
					that.polyline = that.createLine(that.positions, false);
					that.polyline.objId = that.objId;
				}
				if (!that.lastCartesian) return;
				let distance = that.getLength(cartesian, that.lastCartesian);
				that.floatLable.show = true;
				that.floatLable.label.text = that.formateLength(distance, that.unit);
				that.floatLable.distance = distance;
				that.floatLable.position.setValue(cartesian);
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		this.handler.setInputAction(function (evt) {
			that.state = "creating";
			if (!that.polyline) return;
			if (that.positions.length <= 2) return; // 默认第一个不给删除
			that.positions.splice(that.positions.length - 2, 1);
			that.viewer.entities.remove(that.labels.pop());
			that.viewer.entities.remove(that.controlPoints.pop());  // 移除最后一个
			that.allDistance = that.allDistance - that.lastDistance;
			if (that.positions.length == 1) {
				if (that.polyline) {
					that.viewer.entities.remove(that.polyline);
					that.polyline = null;
				}
				that.prompt.update(evt.endPosition, "单击开始测量");
				that.movePush = false;
				that.floatLable.show = false;
				that.positions = [];
			}
			let cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
			if (!cartesian) return;
			let distance = that.getLength(cartesian, that.positions[that.positions.length - 2]);
			that.floatLable.show = true;
			that.floatLable.label.text = that.formateLength(distance, that.unit);
			that.floatLable.distance = distance;
			that.floatLable.position.setValue(cartesian);

			if (!that.movePush) {
				that.lastCartesian = that.positions[that.positions.length - 1];
			} else {
				that.lastCartesian = that.positions[that.positions.length - 2];
			}

		}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

		this.handler.setInputAction(function (evt) { //双击结束绘制
			if (!that.polyline) return;

			that.positions.pop();
			that.viewer.entities.remove(that.labels.pop());
			that.viewer.entities.remove(that.controlPoints.pop()); // 移除最后一个

			that.movePush = false;
			that.endCreate();
			if (callback) callback();
		}, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
	}


	endCreate() {
		let that = this;
		if (!that.polyline) return;
		that.floatLable.show = false;
		that.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
		that.viewer.trackedEntity = undefined;

		let allDistance = that.formateLength(that.allDistance, that.unit);
		that.labels[that.labels.length - 1].label.text = "总长：" + allDistance;

		if (that.prompt) {
			that.prompt.destroy();
			that.prompt = null;
		}

		if (that.handler) {
			that.handler.destroy();
			that.handler = null;
		}
		that.state = "endCreate";
	}

	done() {
		if (this.state == "startCreate") {
			this.destroy();
		} else if (this.state == "creating") {
			if (this.positions.length <= 2 && this.movePush == true) {
				this.destroy();
			} else {
				this.endCreate();
			}
		} else if (this.state == "startEdit" || this.state == "editing") {
			this.endEdit();
		} else {

		}
	}

	// 开始编辑
	startEdit(callback) {
		if (!((this.state == "endCrerate" || this.state == "endEdit") && this.polyline)) return;
		this.state = "startEdit";;
		if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		let that = this;
		for (let i = 0; i < that.controlPoints.length; i++) {
			let point = that.controlPoints[i];
			if (point) point.show = true;
		}
		this.modifyHandler.setInputAction(function (evt) {
			let pick = that.viewer.scene.pick(evt.position);
			if (Cesium.defined(pick) && pick.id) {
				if (!pick.id.objId)
					that.modifyPoint = pick.id;
				that.forbidDrawWorld(true);
				let wz = that.modifyPoint.wz;
				// 重新计算左右距离
				let nextIndex = wz + 1;
				let lastIndex = wz - 1;
				that.nowLabel = that.labels[wz];
				if (lastIndex >= 0) {
					that.lastPosition = that.positions[lastIndex];
				}
				if (nextIndex <= that.positions.length - 1) {
					that.nextPosition = that.positions[nextIndex];
					that.nextlabel = that.labels[nextIndex];
				}
			}
		}, Cesium.ScreenSpaceEventType.LEFT_DOWN);
		this.modifyHandler.setInputAction(function (evt) {
			if (that.positions.length < 1 || !that.modifyPoint) return;
			let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);

			if (!cartesian) return;
			that.modifyPoint.position.setValue(cartesian);

			let wz = that.modifyPoint.wz;
			that.positions[wz] = cartesian.clone();
			that.state = "editing";
			that.nowLabel.position.setValue(cartesian.clone());

			let changeDis1 = 0;
			if (that.nowLabel && that.lastPosition) {
				let distance = that.getLength(cartesian.clone(), that.lastPosition.clone());
				that.nowLabel.label.text = that.formateLength(distance, that.unit);
				changeDis1 = distance - that.nowLabel.distance;
				that.nowLabel.distance = distance;
			}

			let changeDis2 = 0;
			if (that.nextPosition && that.nextlabel) {
				let distance = that.getLength(cartesian.clone(), that.nextPosition.clone());
				that.nextlabel.label.text = that.formateLength(distance, that.unit);
				changeDis2 = distance - that.nextlabel.distance;
				that.nextlabel.distance = distance;
			}

			// 计算总长
			that.allDistance = that.allDistance + changeDis1 + changeDis2;
			let allDistance = that.formateLength(that.allDistance, that.unit);
			that.labels[that.labels.length - 1].label.text = "总长：" + allDistance;

		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		this.modifyHandler.setInputAction(function (evt) {
			if (!that.modifyPoint) return;
			that.modifyPoint = null;
			that.lastPosition = null;
			that.nextPosition = null;
			that.forbidDrawWorld(false);
			if (callback) callback();
			that.state = "endEdit";
		}, Cesium.ScreenSpaceEventType.LEFT_UP);
	}




	endEdit() {
		let that = this;
		this.state = "endEdit";;
		if (this.modifyHandler) {
			this.modifyHandler.destroy();
			this.modifyHandler = null;
		}
		for (let i = 0; i < that.controlPoints.length; i++) {
			let point = that.controlPoints[i];
			if (point) point.show = false;
		}
	}

	//清除测量结果
	destroy() {
		if (this.polyline) {
			this.viewer.entities.remove(this.polyline);
			this.polyline = null;
		}
		for (let i = 0; i < this.labels.length; i++) {
			this.viewer.entities.remove(this.labels[i]);
		}
		this.labels = [];
		for (let ind = 0; ind < this.controlPoints.length; ind++) {
			this.viewer.entities.remove(this.controlPoints[ind]);
		}
		this.controlPoints = [];
		this.modifyPoint = null;
		if (this.floatLable) {
			this.viewer.entities.remove(this.floatLable);
			this.floatLable = null;
		}
		this.floatLable = null;

		if (this.prompt) {
			this.prompt.destroy();
			this.prompt = null;
		}
		if (this.handler) {
			this.handler.destroy();
			this.handler = null;
		}
		if (this.modifyHandler) {
			this.modifyHandler.destroy();
			this.modifyHandler = null;
		}
		this.movePush = false;
		this.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
		this.viewer.trackedEntity = undefined;
		this.state = "no";
	}

	// 设置单位
	setUnit(unit) {
		for (let i = 1; i < this.labels.length; i++) {
			let labelEnt = this.labels[i];
			let distance = labelEnt.distance;
			let label = labelEnt.label;
			if (!label) continue;
			if (i == this.labels.length - 1) {
				label.text = "总长：" + this.formateLength(distance, unit);
			} else {
				label.text = this.formateLength(distance, unit);
			}
		}
		this.unit = unit;
	}
}

export default MeasureSpaceDistance;

