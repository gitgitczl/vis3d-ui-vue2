//剖面分析js
import BaseMeasure from "./baseMeasure";

/**
 * 剖面测量类
 * @class
 * @augments BaseMeasure
 * @alias BaseMeasure.MeasureSection 
 */
class MeasureSection extends BaseMeasure {
	constructor(viewer, opt) {
		super(viewer, opt);
		this.style = opt.style || {};
		this.viewer = viewer;
		//线
		this.polyline = null;
		//线坐标
		this.positions = [];
		//标签数组
		this.movePush = false;
		this.prompt;
		this.isStart = false;
		this.firstPosition = null;
		this.state = "no";
	}

	//开始测量
	start(callback) {
		if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt(this.viewer,this.promptStyle);
		var that = this;
		that.state = "startCreate";
		this.handler.setInputAction(function (evt) { //单击开始绘制
			var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
			if (!cartesian) return;
			if (!that.isStart) {
				that.isStart = true;
				that.firstPosition = cartesian;
			} else {
				if (that.handler) {
					that.handler.destroy();
					that.handler = null;
				}
				if (that.prompt) {
					that.prompt.destroy();
					that.prompt = null;
				}

				// 生成剖面图数据
				that.getHeight(that.positions, function (data) {
					callback(data);
				});
				that.state = "endCreate";
			}

		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		this.handler.setInputAction(function (evt) { //移动时绘制线
			that.state = "creating";
			if (!that.isStart) {
				that.prompt.update(evt.endPosition, "单击开始");
				return;
			}
			that.prompt.update(evt.endPosition, "再次单击结束");
			var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
			that.positions = [that.firstPosition, cartesian];
			if (!that.polyline) {
				that.polyline = that.viewer.entities.add({
					polyline: {
						show: true,
						positions: new Cesium.CallbackProperty(function () {
							return that.positions
						}, false),
						material: Cesium.Color.GREEN,
						width: 3,
						clampToGround: true
					}
				});
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	}
	//清除测量结果
	destroy() {
		if (this.polyline) {
			this.viewer.entities.remove(this.polyline);
			this.polyline = null;
		}
		
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

	getHeight(positions, callback) {
		if (!positions || positions.length < 1) return;
		// 求出该点周围两点的坐标 构建平面
		positions = cUtil.lerpPositions(positions);
		var ctgs = [];
		positions.forEach(function (item) {
			ctgs.push(Cesium.Cartographic.fromCartesian(item));
		});
		if (!ctgs || ctgs.length < 1) return;
		var first = Cesium.Cartographic.fromCartesian(positions[0]);
		var height = first.height;
		Cesium.when(Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, ctgs), function (updateLnglats) {
			for (var i = 0; i < updateLnglats.length; i++) {
				var item = updateLnglats[i];
				item.height = item.height ? item.height : height;
			}
			if (callback) callback({
				positions: positions,
				lnglats: updateLnglats
			})
		});
	}
}


export default MeasureSection;