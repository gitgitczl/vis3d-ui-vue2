//贴地距离量算js
import BaseMeasure from "./baseMeasure";
import '../prompt/prompt.css'
import Prompt from '../prompt/prompt.js'
class MeasureGroundDistance extends BaseMeasure {
	constructor(viewer, opt) {
		super(viewer, opt);
		this.unitType = "length";
		if (!opt) opt = {};
		this.style = opt.style || {};
		this.viewer = viewer;
		//线
		this.polyline = null;
		//线坐标
		this.positions = [];
		//标签数组
		this.labels = [];
		this.lastCartesian = null;
		this.allDistance = 0;
		this.movePush = false;
		this.prompt;
	}

	//开始测量
	start(fun) {
		if (!this.prompt) this.prompt = new Prompt(viewer, { offset: { x: 30, y: 30 } });
		let that = this;
		this.state = "startCreate";
		this.handler.setInputAction(function (evt) { //单击开始绘制
			that.state = "creating";
			let cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
			if (!cartesian) return;
			let label;
			if (that.positions.length == 0) {
				label = that.createLabel(cartesian, "起点");
				that.floatLable = that.createLabel(cartesian, "");
				that.floatLable.show = false;
				if (that.movePush) {
					that.positions.pop();
					that.movePush = false;
				}
				that.labels.push(label);
			} else {
				that.getGroundLength([cartesian, that.lastCartesian], function (distance) {
					that.lastDistance = distance;
					that.allDistance += distance;
					let text = that.formateLength(distance);
					label = that.createLabel(cartesian, text);
					label.length = distance;
					that.labels.push(label);
				});
			}

			that.positions.push(cartesian);
			that.lastCartesian = cartesian;
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		this.handler.setInputAction(function (evt) {
			that.state = "creating";
			if (that.positions.length < 1) {
				that.prompt.update(evt.endPosition, "单击开始测量");
				return;
			} else {
				that.prompt.update(evt.endPosition, "双击结束，右键取消上一步");
				that.floatLable.show = true;
				let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
				if (!cartesian) return;
				if (!that.movePush) {
					that.positions.push(cartesian);
					that.movePush = true;
				} else {
					that.positions[that.positions.length - 1] = cartesian;
				}

				if (!Cesium.defined(that.polyline)) {
					that.polyline = that.createLine(that.positions, true);
				}
				if (!that.lastCartesian) return;
				that.getGroundLength([cartesian, that.lastCartesian], function (distance) {
					that.floatLable.show = true;
					that.floatLable.label.text = that.formateLength(distance,that.unit);
					that.floatLable.position.setValue(cartesian);
					that.floatLable.length = distance;
					if (that.fun) that.fun(distance);
				});
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		this.handler.setInputAction(function (evt) {
			that.state = "creating";
			if (!that.polyline) return;
			that.positions.splice(that.positions.length - 2, 1);
			that.viewer.entities.remove(that.labels.pop());

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
			if (that.positions.length < 1) return;
			let cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
			if (!cartesian) return;
			that.getGroundLength([cartesian, that.positions[that.positions.length - 2]], function (distance) {
				that.floatLable.show = true;
				that.floatLable.label.text = that.formateLength(distance,that.unit);
				that.floatLable.length = distance;
				that.floatLable.position.setValue(cartesian);
			});
		}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

		this.handler.setInputAction(function (evt) { //双击结束绘制

			if (!that.polyline) {
				return;
			}
			that.floatLable.show = false;
			that.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
			that.viewer.trackedEntity = undefined;

			that.positions.pop();
			that.viewer.entities.remove(that.labels.pop());

			let allDistance = that.formateLength(that.allDistance);
			that.labels[that.labels.length - 1].label.text = "总长：" + allDistance;
			that.labels[that.labels.length - 1].length = that.allDistance;

			if (that.handler) {
				that.handler.destroy();
				that.handler = null;
			}
			that.movePush = false;
			if (that.prompt) {
				that.prompt.destroy();
				that.prompt = null;
			}
			that.state = "endCreate";
		}, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
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
		this.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
		this.viewer.trackedEntity = undefined;
		this.state = "no";
	}

	// 设置单位
	setUnit(unit) {
		for (let i = 0; i < this.labels.length; i++) {
			let label = this.labels[i];
			let length = label.length;
			if (i == this.labels.length - 1) {
				label.text = "总长：" + this.formateLength(length, unit);
			} else {
				label.text = this.formateLength(length, unit);
			}
		}
		this.unit = unit;
	}

}
export default MeasureGroundDistance;