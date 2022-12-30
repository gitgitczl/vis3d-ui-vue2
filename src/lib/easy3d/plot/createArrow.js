import '../prompt/prompt.css'
import Prompt from '../prompt/prompt.js'
import BasePlot from './basePlot'
import arrowAlgorithm from "./arrowAlgorithm";

/* 构建军事标绘 */
/**
 * 军事标绘类
 * @class
 * @augments BasePlot
 */
class CreateArrow extends BasePlot {
	constructor(viewer, situationType, style) {
		super(viewer, style);

		/**
		 * @property {String} type 标绘类型
		 */
		this.type = "arrow";
		if (!situationType) {
			console.log("缺少箭头类型")
			return;
		}
		/**
		 * @property {String} situationType 箭头类型（1~攻击箭头/2~攻击箭头平尾/3~攻击箭头燕尾/4~闭合曲面/5~钳击箭头/6~单尖直箭头/7~粗单尖直箭头/8~集结地/9~弓形面/10~粗直箭头/11~矩形棋/12~扇形/13~三角旗/14~曲线旗/15~曲线/16~单线箭头）
		 */
		this.situationType = situationType;


		this.arrowObj = getSituationByType(situationType);

		if (!this.arrowObj) return;
		this.minPointNum = this.arrowObj.minPointNum;
		if (this.minPointNum == 1) {
			console.warn("控制点有误！");
			return;
		}
		this.maxPointNum = this.arrowObj.maxPointNum == -1 ? this.minPointNum : this.arrowObj.maxPointNum;

		/**
		 * @property {Object} arrowPlot 箭头标绘对象
		 */
		this.arrowPlot = this.arrowObj.arrowPlot;
		if (!this.arrowPlot) {
			console.warn("计算坐标类有误！");
			return;
		}

		this.viewer = viewer;

		/**
		 * @property {Cesium.Entity} entity 箭头实体
		 */
		this.entity = null;

		this.polyline = null;
		let defaultStyle = {
			outlineColor: "#000000",
			outlineWidth: 2
		}

		/**
		 * @property {Object} style 样式
		*/
		this.style = Object.assign(defaultStyle, style || {});
		this.outline = null;
	}

	/**
	 * 开始绘制
	 * @param {Function} callback 绘制成功后回调函数
	*/
	start(callBack) {
		let that = this;
		if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt(this.viewer, this.promptStyle);
		this.state = "startCreate";
		this.handler.setInputAction(function (evt) { //单机开始绘制
			let cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
			if (!cartesian) return;
			if (that.positions.length > that.maxPointNum) return;
			if (that.movePush) {
				that.positions.pop();
				that.movePush = false;
			}
			that.positions.push(cartesian);
			let point = that.createPoint(cartesian);
			point.wz = that.controlPoints.length;
			that.controlPoints.push(point);
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

		this.handler.setInputAction(function (evt) { //移动时绘制面

			if (that.positions.length < 1) {
				that.prompt.update(evt.endPosition, "单击开始绘制");
				that.state = "startCreate";
				return;
			}
			if (that.positions.length == that.maxPointNum) {
				that.prompt.update(evt.endPosition, "双击结束");
			} else if (that.positions.length > that.maxPointNum) {
				that.end(callBack);
				return;
			} else {
				that.prompt.update(evt.endPosition, "单击新增，不少于" + that.minPointNum + "个点</br>" + "双击结束");
			}
			that.state = "creating"
			let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
			if (!cartesian) return;
			if (!that.movePush) {
				that.positions.push(cartesian);
				that.movePush = true;
			} else {
				that.positions[that.positions.length - 1] = cartesian;
			}

			if (that.positions.length >= 2 && !Cesium.defined(that.polyline)) that.polyline = that.createPolyline();

			if (that.positions.length >= that.minPointNum && !Cesium.defined(that.entity)) {
				that.entity = that.createEntity();
				that.entity.objId = that.objId;
				that.polyline.show = false;
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		this.handler.setInputAction(function (evt) {
			if (!that.entity) return;
			let cartesian = that.getCatesian3FromPX(evt.position, that.viewer, [that.entity]);
			if (!cartesian) return;
			if (that.positions.length >= that.minPointNum) that.end(callBack);
		}, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
	}

	/**
	 * 结束绘制
	 * @param {Function} callback 结束绘制后回调函数
	*/
	end(callBack) {
		let that = this;
		if (!that.movePush) { // 双击结束
			that.positions.pop();
			that.movePush = false;
			that.viewer.entities.remove(that.controlPoints[that.controlPoints.length - 1]);
			that.controlPoints.pop();
		}
		if (that.prompt) {
			that.prompt.destroy();
			that.prompt = null;
		}
		that.handler.destroy();
		that.state = "endCreate";
		if (callBack) callBack(that.entity);
	}

	/**
	 * 通过坐标数组构建
	 * @param {Array} lnglatArr 经纬度坐标数组
	 * @callback {Function} callBack 绘制成功后回调函数
	*/
	createByPositions(lnglatArr, callBack) { //通过传入坐标数组创建面
		if (!lnglatArr) return;
		this.state = "startCreate";
		let positions = (lnglatArr[0] instanceof Cesium.Cartesian3) ? lnglatArr : cUtil.lnglatsToCartesians(lnglatArr);
		if (!positions) return;
		this.entity = this.createEntity();
		this.positions = positions;
		for (let i = 0; i < positions.length; i++) {
			let newP = positions[i];
			let point = this.createPoint(newP);
			point.point.heightReference = this.style.heightReference;
			point.ctgc = ctgc;
			point.wz = this.controlPoints.length;
			this.controlPoints.push(point);
		}
		this.state = "endCreate";
		this.entity.objId = this.objId;

		if (callBack) callBack(this.entity);
	}

	/**
	 * 获取样式
	 * @returns {Object} 样式
	*/
	getStyle() {
		if (!this.entity) return;
		let obj = {};
		let entity = undefined;
		if (this.arrowPlot.onlyLine) {
			entity = this.entity.polyline;
		} else {
			entity = this.entity.polygon;
			obj.fill = entity.fill ? entity.fill.getValue() : false;
		}
		let color = entity.material.color.getValue();
		obj.colorAlpha = color.alpha;
		obj.color = new Cesium.Color(color.red, color.green, color.blue, 1).toCssHexString();

		if (this.arrowPlot.onlyLine) {
			let heightReference = entity.clampToGround.getValue();
			obj.heightReference = Number(heightReference);
		} else {
			let heightReference = entity.heightReference.getValue();
			obj.heightReference = Number(heightReference);
		}
		return obj;
	}

	/**
	 * 设置相关样式
	 * @param {Object} style 样式 
	 */
	setStyle(style) {
		if (!style) return;
		let color = style.color instanceof Cesium.Color ? style.color : Cesium.Color.fromCssColorString(style.color);
		let material = color.withAlpha(style.colorAlpha || 1);
		if (this.arrowPlot.onlyLine) {
			this.entity.polyline.material = material;
			this.entity.polyline.clampToGround = Boolean(style.heightReference);
		} else if (this.arrowPlot.hasLine) {
			this.entity.polyline.material = material;
			this.entity.polygon.material = material;
			this.entity.polyline.clampToGround = Boolean(style.heightReference);
			this.entity.polygon.heightReference = Number(style.heightReference);
		} else {
			if (style.fill != undefined) this.entity.polygon.fill = style.fill;
			this.entity.polygon.material = material;
			this.entity.polygon.heightReference = Number(style.heightReference);
		}
		this.style = Object.assign(this.style, style);
	}

	// 构建态势标绘面
	createEntity() {
		let that = this;
		this.style.color = this.style.color || Cesium.Color.WHITE;
		this.style.outlineColor = this.style.outlineColor || Cesium.Color.BLACK;
		let color = this.style.color instanceof Cesium.Color ? this.style.color : Cesium.Color.fromCssColorString(this.style.color).withAlpha(this.style.colorAlpha || 1);
		let entityObj = undefined;
		if (that.arrowPlot.hasLine) { // 线面混合
			entityObj = {
				polygon: {
					hierarchy: new Cesium.CallbackProperty(function () {
						var newPosition = that.arrowPlot.startCompute(that.positions);
						if (that.arrowPlot.spliceWZ !== null) {
							newPosition.splice(that.arrowPlot.spliceWZ - 1, 1);
						}
						return new Cesium.PolygonHierarchy(newPosition)
					}, false),
					heightReference: this.style.heightReference == undefined ? 0 : 1,
					material: color
				},
				polyline: {
					positions: new Cesium.CallbackProperty(function () {
						var newPosition = that.arrowPlot.startCompute(that.positions);
						if (that.arrowPlot.lineWZ && that.arrowPlot.lineWZ.length > 0) {
							var arr = [];
							for (var i = 0; i < that.arrowPlot.lineWZ.length; i++) {
								arr.push(newPosition[that.arrowPlot.lineWZ[i] - 1]);
							}
							return arr;
						} else {
							return newPosition;
						}
					}, false),
					material: color,
					clampToGround: this.style.heightReference == undefined ? false : true,
					width: 3
				}
			}
		} else if (that.arrowPlot.onlyLine) { // 只有线
			entityObj = {
				polyline: {
					positions: new Cesium.CallbackProperty(function () {
						var newPosition = that.arrowPlot.startCompute(that.positions);
						if (that.arrowPlot.lineWZ && that.arrowPlot.lineWZ.length > 0) {
							var arr = [];
							for (var i = 0; i < that.arrowPlot.lineWZ.length; i++) {
								arr.push(newPosition[that.arrowPlot.lineWZ[i] - 1]);
							}
							return arr;
						} else {
							return newPosition;
						}
					}, false),
					material: color,
					clampToGround: this.style.heightReference == undefined ? false : true,
					width: 3
				}
			}
		} else { // 只有面
			entityObj = {
				polygon: {
					hierarchy: new Cesium.CallbackProperty(function () {
						let newPosition = that.arrowPlot.startCompute(that.positions);
						if (that.arrowPlot.spliceWZ != undefined) {
							newPosition.splice(that.arrowPlot.spliceWZ - 1, 1);
						}
						return new Cesium.PolygonHierarchy(newPosition)
					}, false),
					heightReference: Number(this.style.heightReference),
					show: true,
					fill: this.style.fill || true,
					material: color
				}
			}
			/* if (!this.style.heightReference) {
					entityObj.polygon.height = 0; // 不贴地 必设
					entityObj.polygon.perPositionHeight = true; // 启用点的真实高度
				} */
		}

		return this.viewer.entities.add(entityObj);
	}
	createPolyline() {
		let that = this;
		return this.viewer.entities.add({
			polyline: {
				positions: new Cesium.CallbackProperty(function () {
					return that.positions
				}, false),
				clampToGround: Boolean(this.style.clampToGround),
				material: this.style.outlineColor instanceof Cesium.Color ? this.style.outlineColor : Cesium.Color.fromCssColorString(this.style.outlineColor).withAlpha(this.style.outlineColorAlpha || 1),
				width: this.style.outlineWidth || 1,
			}
		});
	}

	/**
	 * 销毁
	 */
	destroy() {
		if (this.handler) {
			this.handler.destroy();
			this.handler = null;
		}
		if (this.modifyHandler) {
			this.modifyHandler.destroy();
			this.modifyHandler = null;
		}
		if (this.entity) {
			this.viewer.entities.remove(this.entity);
			this.entity = null;
		}
		if (this.polyline) {
			this.viewer.entities.remove(this.polyline);
			this.polyline = null;
		}
		this.positions = [];
		this.style = null;
		if (this.modifyPoint) {
			this.viewer.entities.remove(this.modifyPoint);
			this.modifyPoint = null;
		}
		for (let i = 0; i < this.controlPoints.length; i++) {
			let point = this.controlPoints[i];
			this.viewer.entities.remove(point);
		}
		this.controlPoints = [];
		this.state = "no";
		if (this.prompt) this.prompt.destroy();
		if (this.polyline) {
			this.polyline = null;
			this.viewer.entities.remove(this.polyline);
		}
		this.forbidDrawWorld(false);
	}
}

function getSituationByType(type) {
	type = Number(type);
	if (isNaN(type)) {
		console.warn("输入态势标绘类型不对！");
		return;
	}
	if (!type || typeof (type) != "number") {
		console.warn("输入态势标绘类型不对！");
		return;
	}
	let arrowPlot;
	let minPointNum = -1;
	let maxPointNum = -1;
	let playObj = {
		canPlay: false,// 是否可移动
		pointNum: 0,// 可移动的点的数量
		pointWZ: [], // 可移动的点在数组中的位置 从0开始
	};
	playObj.canPlay = false; // 是否可以自动播放
	switch (type) {
		case 1:
			arrowPlot = new arrowAlgorithm.AttackArrow(); // 攻击箭头
			minPointNum = 3;
			maxPointNum = 999;
			playObj.canPlay = true;
			playObj.pointNum = 1;
			playObj.pointWZ = [maxPointNum];
			break;
		case 2:
			arrowPlot = new arrowAlgorithm.AttackArrowPW(); //攻击箭头平尾
			minPointNum = 3;
			maxPointNum = 999;
			playObj.canPlay = true;
			playObj.pointNum = 1;
			playObj.pointWZ = [maxPointNum];
			break;
		case 3:
			arrowPlot = new arrowAlgorithm.AttackArrowYW(); //攻击箭头燕尾
			minPointNum = 3;
			maxPointNum = 999;
			playObj.canPlay = true;
			playObj.pointNum = 1;
			playObj.pointWZ = [maxPointNum];
			break;
		case 4:
			arrowPlot = new arrowAlgorithm.CloseCurve(); //闭合曲面
			minPointNum = 3;
			maxPointNum = 999;
			playObj.canPlay = true;
			playObj.pointNum = 1;
			playObj.pointWZ = [maxPointNum];
			break;
		case 5:
			arrowPlot = new arrowAlgorithm.DoubleArrow(); //钳击箭头
			minPointNum = 3;  // 最小可为三个点 为做动画效果 故写死为5个点
			maxPointNum = 5;
			playObj.canPlay = true;
			playObj.pointNum = 2;
			playObj.pointWZ = [2, 3];
			break;
		case 6:
			arrowPlot = new arrowAlgorithm.FineArrow(); //单尖直箭头
			minPointNum = 2;
			maxPointNum = 2;
			playObj.canPlay = true;
			playObj.pointNum = 1;
			playObj.pointWZ = [maxPointNum];
			break;
		case 7:
			arrowPlot = new arrowAlgorithm.FineArrowYW(); //粗单尖直箭头(带燕尾)
			minPointNum = 2;
			maxPointNum = 2;
			playObj.canPlay = true;
			playObj.pointNum = 1;
			playObj.pointWZ = [maxPointNum];
			break;
		case 8:
			arrowPlot = new arrowAlgorithm.GatheringPlace(); //集结地
			minPointNum = 3;
			maxPointNum = 3;
			playObj.canPlay = true;
			playObj.pointNum = 1;
			playObj.pointWZ = [maxPointNum];
			break;
		case 9:
			arrowPlot = new arrowAlgorithm.Lune(); //弓形面
			minPointNum = 3;
			playObj.canPlay = true;
			maxPointNum = 3;
			playObj.canPlay = true;
			playObj.pointNum = 1;
			playObj.pointWZ = [maxPointNum];
			break;
		case 10:
			arrowPlot = new arrowAlgorithm.StraightArrow(); //粗直箭头
			minPointNum = 2;
			maxPointNum = 2;
			playObj.canPlay = true;
			playObj.pointNum = 1;
			playObj.pointWZ = [maxPointNum];
			break;
		case 11:
			arrowPlot = new arrowAlgorithm.RectFlag(); //矩形旗
			minPointNum = 2;
			maxPointNum = 2;
			arrowPlot.hasLine = true;
			arrowPlot.lineWZ = [1, 4, 5]; // 线坐标位置
			arrowPlot.spliceWZ = [5]; // 面所需要去除点的坐标位置
			playObj.canPlay = false;
			break;
		case 12:
			arrowPlot = new arrowAlgorithm.Sector(); //扇形
			minPointNum = 3;
			maxPointNum = 3;
			playObj.canPlay = false;
			break;
		case 13:
			arrowPlot = new arrowAlgorithm.TrangleFlag(); //三角旗
			minPointNum = 2;
			maxPointNum = 2;
			arrowPlot.hasLine = true;
			arrowPlot.lineWZ = [1, 3, 4]; // 线坐标位置
			arrowPlot.spliceWZ = [4]; // 面所需要去除点的坐标位
			playObj.canPlay = false;
			break;
		case 14:
			arrowPlot = new arrowAlgorithm.CurveFlag(); //曲线旗
			minPointNum = 2;
			maxPointNum = 2;
			arrowPlot.hasLine = true;
			arrowPlot.lineWZ = [1, 202, 203]; // 线坐标位置
			arrowPlot.spliceWZ = [203]; // 面所需要去除点的坐标位
			playObj.canPlay = false;
			break;
		case 15:
			arrowPlot = new arrowAlgorithm.Curve(); //曲线
			minPointNum = 2;
			maxPointNum = 999;
			arrowPlot.onlyLine = true;
			playObj.canPlay = true;
			break;
		case 16:
			arrowPlot = new arrowAlgorithm.LineStraightArrow(); //单线箭头
			minPointNum = 2;
			maxPointNum = 2;
			arrowPlot.onlyLine = true;
			playObj.canPlay = true;
			break;
		default:
			console.warn("不存在该类型！");
			break;
	}
	return {
		arrowPlot: arrowPlot,
		minPointNum: minPointNum,
		maxPointNum: maxPointNum,
		playObj: playObj
	};
}


export default CreateArrow;