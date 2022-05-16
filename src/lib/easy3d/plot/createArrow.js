import '../prompt/prompt.css'
import Prompt from '../prompt/prompt.js'
import BasePlot from './basePlot'
import arrowAlgorithm from "./arrowAlgorithm";

/* 构建军事标绘 */
class CreateArrow extends BasePlot {
	constructor(viewer, situationType, style) {

		super(viewer, style);
		if (!situationType) {
			console.log("缺少箭头类型")
			return;
		}
		this.situationType = situationType;
		this.arrowObj = getSituationByType(situationType);
		if (!this.arrowObj) return;
		this.minPointNum = this.arrowObj.minPointNum;
		if (this.minPointNum == 1) {
			console.warn("控制点有误！");
			return;
		}
		this.maxPointNum = this.arrowObj.maxPointNum == -1 ? this.minPointNum : this.arrowObj.maxPointNum;
		//获取计算坐标的对象
		this.arrowPlot = this.arrowObj.arrowPlot;
		if (!this.arrowPlot) {
			console.warn("计算坐标类有误！");
			return;
		}

		this.type = "arrow";
		this.viewer = viewer;
		this.entity = null;
		this.polyline = null;
		let defaultStyle = {
			outlineColor: "#000000",
			outlineWidth: 2
		}
		this.style = Object.assign(defaultStyle, style || {});
		this.outline = null;

	}

	start(callBack) {
		let that = this;
		if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt(this.viewer,this.promptStyle);
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
			if (that.positions.length >= that.maxPointNum) {
				that.prompt.update(evt.endPosition, "双击结束");
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

			if (that.positions.length >= that.minPointNum) {
				if (!Cesium.defined(that.entity)) {
					that.entity = that.createPolygon();
					that.entity.objId = that.objId;
					that.polyline.show = false;
				}
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		this.handler.setInputAction(function (evt) {
			if (!that.entity) return;
			let cartesian = that.getCatesian3FromPX(evt.position, that.viewer, [that.entity]);
			if (!cartesian) return;
			if (that.positions.length >= that.minPointNum) { //结束

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

				that.state = "endCreate";
				that.handler.destroy();
				if (callBack) callBack(that.entity);
			}
		}, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
	}
	createByPositions(lnglatArr, callBack) { //通过传入坐标数组创建面
		if (!lnglatArr) return;
		this.state = "startCreate";
		let positions = (lnglatArr[0] instanceof Cesium.Cartesian3) ? lnglatArr : cUtil.lnglatsToCartesians(lnglatArr);
		if (!positions) return;
		this.entity = this.createPolygon();
		this.positions = positions;
		for (let i = 0; i < positions.length; i++) {
			let newP = positions[i];
			if (this.style.heightReference) {
				let ctgc = Cesium.Cartographic.fromCartesian(positions[i]);
				ctgc.height = this.viewer.scene.sampleHeight(ctgc);
				newP = Cesium.Cartographic.toCartesian(ctgc);
			}
			let point = this.createPoint(newP);
			point.ctgc = ctgc;
			point.wz = this.controlPoints.length;
			this.controlPoints.push(point);
		}
		this.state = "endCreate";
		this.entity.objId = this.objId;

		if (callBack) callBack(this.entity);
	}
	getStyle() {
		if (!this.entity) return;
		let obj = {};
		let polygon = this.entity.polygon;
		let color = polygon.material.color.getValue();
		obj.colorAlpha = color.alpha;
		obj.color = new Cesium.Color(color.red, color.green, color.blue, 1).toCssHexString();
		obj.fill = polygon.fill ? polygon.fill.getValue() : false;
		if (polygon.heightReference) {
			let heightReference = polygon.heightReference.getValue();
			obj.heightReference = Boolean(heightReference);
		}

		return obj;

	}
	// 设置相关样式
	setStyle(style) {
		if (!style) return;
		// 由于官方api中的outline限制太多 此处outline为重新构建的polyline
		if (style.heightReference != undefined) this.entity.polygon.heightReference = Number(style.heightReference);
		let color = style.color instanceof Cesium.Color ? style.color : Cesium.Color.fromCssColorString(style.color);
		let material = color.withAlpha(style.colorAlpha || 1);
		this.entity.polygon.material = material;
		if (style.fill != undefined) this.entity.polygon.fill = style.fill;
		this.style = Object.assign(this.style, style);
	}

	// 构建态势标绘面
	createPolygon() {
		let that = this;
		this.style.color = this.style.color || Cesium.Color.WHITE;
		this.style.outlineColor = this.style.outlineColor || Cesium.Color.BLACK;
		let polygonObj = {
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
				material: this.style.color instanceof Cesium.Color ? this.style.color : Cesium.Color.fromCssColorString(this.style.color).withAlpha(this.style.colorAlpha || 1)
			}
		}

		if (!this.style.heightReference) {
			polygonObj.polygon.height = 0; // 不贴地 必设
			polygonObj.polygon.perPositionHeight = true; // 启用点的真实高度
		}
		return this.viewer.entities.add(polygonObj);
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
			arrowPlot = new arrowAlgorithm.AttackArrow(); //攻击箭头
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
			arrowPlot = new arrowAlgorithm.CurveFlag(); //扇形
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