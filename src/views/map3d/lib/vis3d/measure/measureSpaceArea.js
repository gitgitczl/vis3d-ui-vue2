//空间面积测量js
import BaseMeasure from "./baseMeasure";
import '../prompt/prompt.css'
import Prompt from '../prompt/prompt.js'

/**
 * 空间面积测量类
 * @class
 * @augments BaseMeasure
 * @alias BaseMeasure.MeasureSpaceArea 
 */
class MeasureSpaceArea extends BaseMeasure {
	constructor(viewer, opt) {
		super(viewer, opt);
		if (!opt) opt = {};
		this.unitType = "area";
		this.style = opt.style || {};
		this.viewer = viewer;
		this.polyline = null;
		this.polygon = null;
		//面积标签
		this.positions = [];
		this.movePush = false;
		this.prompt = undefined;
	}

	//开始测量
	start(callback) {
		if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt(this.viewer, this.promptStyle);
		var that = this;
		this.state = "startCreate";
		this.handler.setInputAction(function (evt) {
			that.state = "creating";
			var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
			if (!cartesian) return;
			if (that.movePush) {
				that.positions.pop();
				that.movePush = false;
			}
			let point = that.createPoint(cartesian.clone());
			point.wz = that.positions.length; // 和坐标点关联
			that.controlPoints.push(point);
			that.positions.push(cartesian);
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

		this.handler.setInputAction(function (evt) {
			that.state = "creating";
			if (that.positions.length < 1) {
				that.prompt.update(evt.endPosition, "单击开始绘制");
				return;
			}
			that.prompt.update(evt.endPosition, "双击结束，右键取消上一步");
			var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
			if (that.positions.length >= 1) {
				if (!that.movePush) {
					that.positions.push(cartesian);
					that.movePush = true;
				} else {
					that.positions[that.positions.length - 1] = cartesian;
				}
				if (that.positions.length == 2) {
					if (!Cesium.defined(that.polyline)) {
						that.polyline = that.createPolyline();
					}
				}
				if (that.positions.length == 3) {
					if (!Cesium.defined(that.polygon)) {
						that.polygon = that.createPolygon();
						that.polygon.isFilter = true;
						that.polygon.objId = that.objId;
						/* if (that.polyline) that.polyline.show = false; */
					}
					if (!that.floatLabel) {
						that.floatLabel = that.createLabel(cartesian, "");
						that.floatLabel.label.heightReference = 1;
					}
				}
				if (that.polygon) {
					let areaCenter = that.getAreaAndCenter(that.positions)
					var area = areaCenter.area;
					var center = areaCenter.center;

					var text = that.formateArea(area, that.unit);
					that.floatLabel.label.text = "面积：" + text;
					that.floatLabel.area = area;
					if (center) that.floatLabel.position.setValue(center);
					that.floatLabel.show = true;
				}
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		this.handler.setInputAction(function (evt) {
			that.state = "creating";
			if (!that.polyline && !that.polygon) return;
			that.positions.splice(that.positions.length - 2, 1);
			that.viewer.entities.remove(that.controlPoints.pop());
			if (that.positions.length == 2) {
				if (that.polygon) {
					that.viewer.entities.remove(that.polygon);
					that.polygon = null;
					if (that.polyline) that.polyline.show = true;
				}
				that.floatLabel.show = false;
			}

			if (that.positions.length == 1) {
				if (that.polyline) {
					that.viewer.entities.remove(that.polyline);
					that.polyline = null;
				}
				that.prompt.update(evt.endPosition, "单击开始测量");
				that.positions = [];
				that.movePush = false;
			}

			if (that.positions.length > 2) {
				var areaCenter = that.getAreaAndCenter(that.positions);
				var area = areaCenter.area;
				var center = areaCenter.center;
				var text = that.formateArea(area, that.unit);
				that.floatLabel.label.text = "面积：" + text;
				if (center) that.floatLabel.position.setValue(center);
				that.floatLabel.area = area;
				that.floatLabel.show = true;
			}
		}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

		this.handler.setInputAction(function (evt) { //双击结束绘制
			if (!that.polygon) {
				return;
			}

			that.positions.pop();
			that.viewer.entities.remove(that.controlPoints.pop()); // 移除最后一个

			that.movePush = false;
			that.endCreate();
			if (callback) callback(that.polyline);
		}, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
	}

	endCreate() {
		let that = this;
		that.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
		that.viewer.trackedEntity = undefined;

		const areaCenter = that.getAreaAndCenter(that.positions)
		let area = areaCenter.area;
		let center = areaCenter.center;
		let text = that.formateArea(area, that.unit);
		that.floatLabel.label.text = "面积：" + text;
		that.floatLabel.area = area;
		if (center) that.floatLabel.position.setValue(center);

		if (that.handler) {
			that.handler.destroy();
			that.handler = null;
		}

		if (that.prompt) {
			that.prompt.destroy();
			that.prompt = null;
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

	startEdit(callback) {
		if (!((this.state == "endCrerate" || this.state == "endEdit") && this.polygon)) return;
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

			}
		}, Cesium.ScreenSpaceEventType.LEFT_DOWN);
		this.modifyHandler.setInputAction(function (evt) {
			if (that.positions.length < 1 || !that.modifyPoint) return;
			let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);

			if (!cartesian) return;
			that.modifyPoint.position.setValue(cartesian);

			let wz = that.modifyPoint.wz;
			that.positions[wz] = cartesian.clone();

			var areaCenter = that.getAreaAndCenter(that.positions);
			var area = areaCenter.area;
			var center = areaCenter.center;
			var text = that.formateArea(area, that.unit);
			that.floatLabel.label.text = "面积：" + text;
			that.floatLabel.area = area;
			if (center) that.floatLabel.position.setValue(center);

		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		this.modifyHandler.setInputAction(function (evt) {
			if (!that.modifyPoint) return;
			that.modifyPoint = null;
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
		this.state = "no";
		if (this.polyline) {
			this.viewer.entities.remove(this.polyline);
			this.polyline = null;
		}
		if (this.polygon) {
			this.viewer.entities.remove(this.polygon);
			this.polygon = null;
		}
		if (this.floatLabel) {
			this.viewer.entities.remove(this.floatLabel);
			this.floatLabel = null;
		}
		if (this.handler) {
			this.handler.destroy();
			this.handler = null;
		}
		for (let i = 0; i < this.controlPoints.length; i++) {
			let point = this.controlPoints[i];
			this.viewer.entities.remove(point);
		}

		this.floatLable = null;
	}

	createPolyline() {
		var that = this;
		var polyline = this.viewer.entities.add({
			polyline: {
				positions: new Cesium.CallbackProperty(function () {
					let linePositions = that.positions.concat([that.positions[0]]);
					return linePositions
				}, false),
				material: Cesium.Color.GOLD,
				width: 2,
				clampToGround: false
			}
		});
		return polyline;
	}
	createPolygon() {
		var that = this;
		var polygon = this.viewer.entities.add({
			polygon: new Cesium.PolygonGraphics({
				hierarchy: new Cesium.CallbackProperty(function () {
					return new Cesium.PolygonHierarchy(that.positions);
				}, false),
				material: this.style.material || Cesium.Color.WHITE.withAlpha(0.6),
				fill: true
			})
		});
		return polygon;
	}
	setUnit(unit) {
		this.unit = unit;
		var text = this.formateArea(this.floatLabel.area, unit);
		this.floatLabel.label.text = "面积：" + text;
	}
}



export default MeasureSpaceArea;