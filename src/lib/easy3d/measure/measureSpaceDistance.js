//空间距离量算js
import MeasureGroundDistance from "./measureGroundDistance";
import '../prompt/prompt.css'
import Prompt from '../prompt/prompt.js'
class MeasureSpaceDistance extends MeasureGroundDistance {
	constructor(viewer, opt) {
		super(viewer, opt);
		this.unitType = "length";
		this.type = "spaceDistance"
		this.allDistance = 0;
		this.labels = [];

	}

	//开始测量
	start() {
		if (!this.prompt) this.prompt = new Prompt(viewer, { offset: { x: 30, y: 30 } });
		let that = this;
		this.status = "startCreate";
		this.handler.setInputAction(function (evt) { //单击开始绘制
			that.status = "creating";
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
			} else {
				let distance = that.getLength(cartesian, that.lastCartesian);
				that.lastDistance = distance;
				that.allDistance += distance;
				let text = that.formateLength(distance, that.unit);
				label = that.createLabel(cartesian, text);
				label.length = distance;
			}
			that.labels.push(label);
			let point = that.createPoint(cartesian.clone());
			that.points.push(point);	
			that.positions.push(cartesian);
			that.lastCartesian = cartesian.clone();


		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

		this.handler.setInputAction(function (evt) {
			let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
			if (!cartesian) return;
			that.status = "creating";
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
				}
				if (!that.lastCartesian) return;
				let distance = that.getLength(cartesian, that.lastCartesian);
				that.floatLable.show = true;
				that.floatLable.label.text = that.formateLength(distance, that.unit);
				that.floatLable.length = distance;
				that.floatLable.position.setValue(cartesian);
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		this.handler.setInputAction(function (evt) {
			that.status = "creating";
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
			let distance = that.getLength(cartesian, that.positions[that.positions.length - 2]);
			that.floatLable.show = true;
			that.floatLable.label.text = that.formateLength(distance, that.unit);
			that.floatLable.length = distance;
			that.floatLable.position.setValue(cartesian);
		}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

		this.handler.setInputAction(function (evt) { //双击结束绘制

			if (!that.polyline) return;
			that.floatLable.show = false;
			that.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
			that.viewer.trackedEntity = undefined;
			that.positions.pop();
			that.viewer.entities.remove(that.labels.pop());
			let allDistance = that.formateLength(that.allDistance, that.unit);
			that.labels[that.labels.length - 1].label.text = "总长：" + allDistance;
			that.labels[that.labels.length - 1].length = allDistance;

			if (that.handler) {
				that.handler.destroy();
				that.handler = null;
			}

			that.movePush = false;
			if (that.prompt) {
				that.prompt.destroy();
				that.prompt = null;
			}

			that.status = "endCreate";

		}, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
	}

	// 设置单位
	setUnit(unit) {
		for (let i = 0; i < this.labels.length; i++) {
			let label = this.labels[i];
			let length = label.length;
			if (i == this.labels.length - 1) {
				label.text = "总长：" + that.formateLength(length, unit);
			} else {
				label.text = that.formateLength(length, unit);
			}
		}
		this.unit = unit;
	}

}

export default MeasureSpaceDistance;

