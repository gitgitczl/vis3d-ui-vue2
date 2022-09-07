import '../prompt/prompt.css'
import Prompt from '../prompt/prompt.js'
import cUtil from '../cUtil.js'
import BasePlot from './basePlot';
class CreateBillboard extends BasePlot {
	constructor(viewer, style) {
		super(viewer, style);
		this.type = "billboard";
		this.viewer = viewer;
		let defaultStyle = {
			verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
			scale: 1
		}
		this.style = Object.assign({}, defaultStyle, style || {});
		this.entity = null;
		if (!this.style.hasOwnProperty("image")) {
			console.log("未设置billboard的参数！");
		}
		this.position = null;
	}

	start(callBack) {
		if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt(this.viewer,this.promptStyle);
		this.state = "startCreate";
		let that = this;
		this.handler.setInputAction(function (evt) { //单击开始绘制
			let cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
			if (!cartesian) return;
			that.position = cartesian.clone();
			that.entity = that.createBillboard(that.position);
			if (that.handler) {
				that.handler.destroy();
				that.handler = null;
			}
			if (that.prompt) {
				that.prompt.destroy();
				that.prompt = null;
			}
			that.state = "endCreate";
			if (callBack) callBack(that.entity);
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		this.handler.setInputAction(function (evt) { //单击开始绘制
			that.prompt.update(evt.endPosition, "单击新增");
			that.state = "startCreate";
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	}
	createByPositions(lnglatArr, callBack) {
		if (!lnglatArr) return;
		this.state = "startCreate";
		let position = null;
		if (lnglatArr instanceof Cesium.Cartesian3) {
			position = lnglatArr.clone();
		} else {
			position = Cesium.Cartesian3.fromDegrees(Number(lnglatArr[0]), Number(lnglatArr[1]), Number(lnglatArr[2] || 0));
		}

		if (!position) return;
		this.position = position.clone();
		this.entity = this.createBillboard(this.position);
		if (callBack) callBack(this.entity);
		this.state = "endCreate";
	}
	// 设置相关样式
	setStyle(style) {
		if (!style) return;
		let billboard = this.entity.billboard;
		if (style.image != undefined) billboard.image = style.image;
		if (style.heightReference != undefined) {
			let heightReference = 1;
			if (this.style.heightReference == true) {
				heightReference = 1;
			} else {
				heightReference = this.style.heightReference;
			}
			billboard.heightReference = heightReference;
		}
		if (style.heightReference != undefined) 
			billboard.heightReference = (style.heightReference == undefined ? 1 : Number(this.style.heightReference)) ; // 如果直接设置为true 会导致崩溃
		if (style.scale != undefined) billboard.scale = Number(style.scale);
		if (style.color) {
			let color = style.color instanceof Cesium.Color ? style.color : Cesium.Color.fromCssColorString(style.color);
			color = color.withAlpha(style.colorAlpha || 1);
			billboard.color = color;
		}
		this.style = Object.assign(this.style, style);
	}
	// 获取相关样式
	getStyle() {
		let obj = {};
		let billboard = this.entity.billboard;
		obj.image = this.style.image;
		if (billboard.heightReference) {
			let heightReference = billboard.heightReference.getValue();
			obj.heightReference = Boolean(heightReference);
		}
		obj.scale = billboard.scale.getValue();

		if (billboard.color) {
			let color = billboard.color.getValue();
			obj.colorAlpha = color.alpha;
			obj.color = new Cesium.Color(color.red, color.green, color.blue, 1).toCssHexString();
		}
		return obj;
	}
	startEdit() {
		if (this.state == "startEdit" || this.state == "editing" || !this.entity) return;
		this.state = "startEdit";
		if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
		let that = this;
		let editBillboard;
		this.modifyHandler.setInputAction(function (evt) {
			let pick = that.viewer.scene.pick(evt.position);
			if (Cesium.defined(pick) && pick.id) {
				editBillboard = pick.id;
				that.forbidDrawWorld(true);
			}
		}, Cesium.ScreenSpaceEventType.LEFT_DOWN);
		this.modifyHandler.setInputAction(function (evt) { //移动时绘制线
			if (!editBillboard) return;
			let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
			if (!cartesian) return;
			editBillboard.position.setValue(cartesian.clone());
			that.position = cartesian.clone();
			that.state = "editing";
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

		this.modifyHandler.setInputAction(function (evt) { //移动时绘制线
			if (!editBillboard) return;
			that.forbidDrawWorld(false);
			if (that.modifyHandler) {
				that.modifyHandler.destroy();
				that.modifyHandler = null;
				that.state = "editing";
			}
		}, Cesium.ScreenSpaceEventType.LEFT_UP);
	}
	endEdit(callback) {
		if (this.modifyHandler) {
			this.modifyHandler.destroy();
			this.modifyHandler = null;
			if (callback) callback(this.entity);
		}
		this.state = "endEdit";
	}
	createBillboard(cartesian) {
		if (!cartesian) return;
		let billboard = this.viewer.entities.add({
			position: cartesian,
			billboard: {
				color: this.style.color ? (this.style.color instanceof Cesium.Color ? this.style.color : Cesium.Color.fromCssColorString(this.style.outlineColor).withAlpha(this.style.outlineColorAlpha || 1)) : Cesium.Color.WHITE,
				image: this.style.image || "../img/mark4.png",
				scale: this.style.scale || 1,
				pixelOffset: this.style.pixelOffset,
				heightReference: this.style.heightReference == undefined ? 1 : Number(this.style.heightReference),
				verticalOrigin: Cesium.VerticalOrigin.BOTTOM
			}
		})
		billboard.objId = this.objId;
		return billboard;
	}

	remove() {
		if (this.entity) {
			this.state = "no";
			this.viewer.entities.remove(this.entity);
			this.entity = null;
		}
	}

	// 方法重写
	getPositions(isWgs84) {
		return isWgs84 ? cUtil.cartesianToLnglat(this.position, this.viewer) : this.position ;
	}

	setPosition(p) {
		let position = null;
		if (p instanceof Cesium.Cartesian3) {
			position = p;
		} else {
			position = Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2] || 0);
		}
		this.entity.position.setValue(position.clone());
		this.position = position.clone();
	}

}
export default CreateBillboard;