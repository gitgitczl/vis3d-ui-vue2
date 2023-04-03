import * as mapv from 'mapv'
var baiduMapLayer = mapv ? mapv.baiduMapLayer : null;
var BaseLayer = baiduMapLayer ? baiduMapLayer.__proto__ : Function;
var backAngle = Cesium.Math.toRadians(75);
class MapVRenderer extends BaseLayer {
	constructor(t, e, i, n) {
		if (super(t, e, i), BaseLayer) {
			this.map = t, this.scene = t.scene, this.dataSet = e;
			i = i || {}, this.init(i), this.argCheck(i), this.initDevicePixelRatio(), this.canvasLayer = n, this.stopAniamation = !
				1, this.animation = i.animation, this.clickEvent = this.clickEvent.bind(this), this.mousemoveEvent = this.mousemoveEvent
					.bind(this), this.bindEvent()
		}
	}
	initDevicePixelRatio() {
		this.devicePixelRatio = window.devicePixelRatio || 1
	}
	clickEvent(t) {
		var e = t.point;
		super.clickEvent(e, t)
	}
	mousemoveEvent(t) {
		var e = t.point;
		super.mousemoveEvent(e, t)
	}
	addAnimatorEvent() { }
	animatorMovestartEvent() {
		var t = this.options.animation;
		this.isEnabledTime() && this.animator && (this.steps.step = t.stepsRange.start)
	}
	animatorMoveendEvent() {
		this.isEnabledTime() && this.animator
	}
	bindEvent() {
		this.map;
		this.options.methods && (this.options.methods.click, this.options.methods.mousemove)
	}
	unbindEvent() {
		var t = this.map;
		this.options.methods && (this.options.methods.click && t.off("click", this.clickEvent), this.options.methods.mousemove &&
			t.off("mousemove", this.mousemoveEvent))
	}
	getContext() {
		return this.canvasLayer.canvas.getContext(this.context)
	}
	init(t) {
		this.options = t, this.initDataRange(t), this.context = this.options.context || "2d", this.options.zIndex && this.canvasLayer &&
			this.canvasLayer.setZIndex(this.options.zIndex), this.initAnimator()
	}
	_canvasUpdate(t) {
		this.map;
		var e = this.scene;
		if (this.canvasLayer && !this.stopAniamation) {
			var i = this.options.animation,
				n = this.getContext();
			if (this.isEnabledTime()) {
				if (void 0 === t) return void this.clear(n);
				"2d" === this.context && (n.save(), n.globalCompositeOperation = "destination-out", n.fillStyle =
					"rgba(0, 0, 0, .1)", n.fillRect(0, 0, n.canvas.width, n.canvas.height), n.restore())
			} else this.clear(n);
			if ("2d" === this.context)
				for (var o in this.options) n[o] = this.options[o];
			else n.clear(n.COLOR_BUFFER_BIT);
			var a = {
				transferCoordinate: function (t) {
					var defVal = [99999, 99999];
					//坐标转换
					var position = Cesium.Cartesian3.fromDegrees(t[0], t[1]);
					if (!position) {
						return defVal;
					}
					var px = e.cartesianToCanvasCoordinates(position);
					if (!px) {
						return defVal;
					}
					//判断是否在球的背面  
					var angle = Cesium.Cartesian3.angleBetween(e.camera.position, position);
					if (angle > backAngle) return false;
					//判断是否在球的背面
					return [px.x, px.y]
				}
			};
			void 0 !== t && (a.filter = function (e) {
				var n = i.trails || 10;
				return !!(t && e.time > t - n && e.time < t)
			});
			var c = this.dataSet.get(a);
			this.processData(c), "m" == this.options.unit && this.options.size,
				this.options._size = this.options.size;
			var h = Cesium.SceneTransforms.wgs84ToWindowCoordinates(e, Cesium.Cartesian3.fromDegrees(0, 0));

			this.drawContext(n, new mapv.DataSet(c), this.options, h), this.options.updateCallback && this.options.updateCallback(
				t)
		}
	}
	updateData(t, e) {
		var i = t;
		i && i.get && (i = i.get()), void 0 != i && this.dataSet.set(i), super.update({
			options: e
		})
	}
	addData(t, e) {
		var i = t;
		t && t.get && (i = t.get()), this.dataSet.add(i), this.update({
			options: e
		})
	}
	getData() {
		return this.dataSet
	}
	removeData(t) {
		if (this.dataSet) {
			var e = this.dataSet.get({
				filter: function (e) {
					return null == t || "function" != typeof t || !t(e)
				}
			});
			this.dataSet.set(e), this.update({
				options: null
			})
		}
	}
	clearData() {
		this.dataSet && this.dataSet.clear(), this.update({
			options: null
		})
	}
	draw() {
		this.canvasLayer.draw()
	}
	clear(t) {
		t && t.clearRect && t.clearRect(0, 0, t.canvas.width, t.canvas.height)
	}
}


var h = 0;
class MapvLayer {
	constructor(t, e, i, n) {
		this.map = t, this.scene = t.scene, this.mapvBaseLayer = new MapVRenderer(t, e, i, this),
			this.mapVOptions = i,
			this.initDevicePixelRatio(),
			this.canvas = this._createCanvas(),
			this.render = this.render.bind(this),
			void 0 != n ? (this.container = n, n.appendChild(this.canvas)) : (this.container = t.container, this.addInnerContainer()),
			this.bindEvent(),
			this._reset()
	}
	initDevicePixelRatio() {
		this.devicePixelRatio = window.devicePixelRatio || 1
	}
	addInnerContainer() {
		this.container.appendChild(this.canvas)
	}
	bindEvent() {
		//绑定cesium事件与mapv联动
		this.innerMoveStart = this.moveStartEvent.bind(this),
			this.innerMoveEnd = this.moveEndEvent.bind(this);

		this.scene.camera.moveStart.addEventListener(this.innerMoveStart, this);
		this.scene.camera.moveEnd.addEventListener(this.innerMoveEnd, this);
	}
	unbindEvent() {
		this.scene.camera.moveStart.removeEventListener(this.innerMoveStart, this);
		this.scene.camera.moveEnd.removeEventListener(this.innerMoveEnd, this);

		this.scene.postRender.removeEventListener(this._reset, this);
	}
	moveStartEvent() {
		this.mapvBaseLayer && this.mapvBaseLayer.animatorMovestartEvent() //, this._unvisiable()

		this.scene.postRender.addEventListener(this._reset, this);
	}
	moveEndEvent() {
		this.mapvBaseLayer && this.mapvBaseLayer.animatorMoveendEvent(), this._reset() //, this._visiable()

		this.scene.postRender.removeEventListener(this._reset, this);
	}
	zoomStartEvent() {
		this._unvisiable()
	}
	zoomEndEvent() {
		this._unvisiable()
	}
	addData(t, e) {
		void 0 != this.mapvBaseLayer && this.mapvBaseLayer.addData(t, e)
	}
	updateData(t, e) {
		void 0 != this.mapvBaseLayer && this.mapvBaseLayer.updateData(t, e)
	}
	getData() {
		return this.mapvBaseLayer && (this.dataSet = this.mapvBaseLayer.getData()), this.dataSet
	}
	removeData(t) {
		void 0 != this.mapvBaseLayer && this.mapvBaseLayer && this.mapvBaseLayer.removeData(t)
	}
	removeAllData() {
		void 0 != this.mapvBaseLayer && this.mapvBaseLayer.clearData()
	}
	_visiable() {
		return this.canvas.style.display = "block";
	}
	_unvisiable() {
		return this.canvas.style.display = "none";
	}
	_createCanvas() {
		var t = document.createElement("canvas");
		t.id = this.mapVOptions.layerid || "mapv" + h++, t.style.position = "absolute", t.style.top = "0px", t.style.left =
			"0px", t.style.pointerEvents = "none", t.style.zIndex = this.mapVOptions.zIndex || 100, t.width = parseInt(this.map
				.canvas.width), t.height = parseInt(this.map.canvas.height), t.style.width = this.map.canvas.style.width, t.style.height =
			this.map.canvas.style.height;
		var e = this.devicePixelRatio;
		return "2d" == this.mapVOptions.context && t.getContext(this.mapVOptions.context).scale(e, e), t
	}
	_reset() {
		this.resizeCanvas(), this.fixPosition(), this.onResize(), this.render()
	}
	draw() {
		this._reset()
	}
	show() {
		this._visiable()
	}
	hide() {
		this._unvisiable()
	}
	destroy() {
		this.remove()
	}
	remove() {
		void 0 != this.mapvBaseLayer && (this.removeAllData(), this.mapvBaseLayer.clear(this.mapvBaseLayer.getContext()),
			this.mapvBaseLayer = void 0, this.canvas.parentElement.removeChild(this.canvas))
	}
	update(t) {
		void 0 != t && this.updateData(t.data, t.options)
	}
	resizeCanvas() {
		if (void 0 != this.canvas && null != this.canvas) {
			var t = this.canvas;
			t.style.position = "absolute", t.style.top = "0px", t.style.left = "0px", t.width = parseInt(this.map.canvas.width),
				t.height = parseInt(this.map.canvas.height), t.style.width = this.map.canvas.style.width, t.style.height = this.map
					.canvas.style.height
		}
	}
	fixPosition() { }
	onResize() { }
	render() {
		void 0 != this.mapvBaseLayer && this.mapvBaseLayer._canvasUpdate()
	}
}


export default function (viewer, dataSet1, options1) {
	return new MapvLayer(viewer, dataSet1, options1);
};