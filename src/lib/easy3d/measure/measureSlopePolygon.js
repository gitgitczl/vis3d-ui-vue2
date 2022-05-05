// 根据坡度 构建坡度面
var MeasureSlopePolygon = function (viewer, opt) {
	if(!opt) opt = {};
	this.style = opt.style || {};
	this.objId = Number(
		new Date().getTime() + "" + Number(Math.random() * 1000).toFixed(0)
	);
	this.viewer = viewer;
	this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
	this.polyline = null;
	this.polygon = null;
	this.positions = [];
	this.movePush = false;
	this.prompt;
	this.mtx_inverse = null;
};
MeasureSlopePolygon.prototype = {
	//开始测量
	start: function () {
		if (!this.prompt) this.prompt = new Prompt(viewer, { offset: { x: 30, y: 30 } });
		var that = this;
		this.handler.setInputAction(function (evt) {
			var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
			if (!cartesian) return;
			if (that.movePush) {
				that.positions.pop();
				that.movePush = false;
			}
			that.positions.push(cartesian);
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		this.handler.setInputAction(function (evt) {
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
						that.polygon = that.createPolygon(that.style);
						that.polygon.isFilter = true;
						that.polygon.objId = that.objId;
						if (that.polyline) that.polyline.show = false;
					}
				}
				if (that.polygon) {
					// that.getSlopePolygon(that.positions);
				}
			}
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		this.handler.setInputAction(function (evt) {
			if (!that.polyline && !that.polygon) return;
			that.positions.splice(that.positions.length - 2, 1);
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
				that.getSlopePolygon(that.positions);
			}
		}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

		this.handler.setInputAction(function (evt) {
			//双击结束绘制
			if (!that.polygon) {
				return;
			}
			that.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
			that.viewer.trackedEntity = undefined;
			that.positions.pop();
			that.getSlopePolygon(that.positions);
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
	},
	//清除测量结果
	destroy () {
		if (this.polyline) {
			this.viewer.entities.remove(this.polyline);
			this.polyline = null;
		}
		if (this.polygon) {
			this.viewer.entities.remove(this.polygon);
			this.polygon = null;
		}
	},
	createPolyline: function () {
		var that = this;
		var polyline = this.viewer.entities.add({
			polyline: {
				positions: new Cesium.CallbackProperty(function () {
					return that.positions;
				}, false),
				material: Cesium.Color.YELLOW,
				width: 3,
				clampToGround: true
			}
		});
		return polyline;
	},
	createPolygon: function () {
		var that = this;
		var polygon = viewer.entities.add({
			polygon: new Cesium.PolygonGraphics({
				hierarchy: new Cesium.CallbackProperty(function () {
					return new Cesium.PolygonHierarchy(that.positions);
				}, false),
				fill: false
			})
		});
		return polygon;
	},
	//调用第三方插件计算面积 turf
	getSlopePolygon: function (positions) {
		var that = this;
		if (!positions || positions.length < 1) return;
		var ctrgs = this.lerpPositions(positions);
		Cesium.when(Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, ctrgs), function (updateLnglats) {
			for (var i = 0; i < updateLnglats.length; i++) {
				updateLnglats[i].height = updateLnglats[i].height + 5;
			}
			var mtxPosi = Cesium.Cartographic.toCartesian(updateLnglats[0]);
			var mtx = Cesium.Transforms.eastNorthUpToFixedFrame(mtxPosi);
			var mtx_inverse = Cesium.Matrix4.inverse(mtx, new Cesium.Matrix4());
			var geometryInstances = [];
			for (var index = 0; index < updateLnglats.length; index = index + 3) {
				var position = Cesium.Cartographic.toCartesian(updateLnglats[index]);
				var newPosition1 = Cesium.Cartographic.toCartesian(updateLnglats[index + 1]);
				var newPosition2 = Cesium.Cartographic.toCartesian(updateLnglats[index + 2]);
				var mtx_position = Cesium.Matrix4.multiplyByPoint(mtx_inverse, position, new Cesium.Cartesian3());
				var mtx_newPosition1 = Cesium.Matrix4.multiplyByPoint(mtx_inverse, newPosition1, new Cesium.Cartesian3());
				var mtx_newPosition2 = Cesium.Matrix4.multiplyByPoint(mtx_inverse, newPosition2, new Cesium.Cartesian3());
				var v1 = Cesium.Cartesian3.subtract(mtx_newPosition1, mtx_position, new Cesium.Cartesian3());
				var v2 = Cesium.Cartesian3.subtract(mtx_newPosition2, mtx_position, new Cesium.Cartesian3());
				//求法向量
				var cross = Cesium.Cartesian3.cross(v1, v2, new Cesium.Cartesian3());
				cross = Cesium.Cartesian3.normalize(cross, new Cesium.Cartesian3());
				var z = new Cesium.Cartesian3(0, 0, 1);
				var arc = Cesium.Cartesian3.dot(cross, z);
				var radians_north = Math.acos(arc);
				var dg = Cesium.Math.toDegrees(radians_north);
				dg = dg > 90 ? (180 - dg) : dg;
				console.log("坡度：" + dg);
				var color = that.getColor(dg);
				var instance = new Cesium.GeometryInstance({
					geometry: Cesium.PolygonGeometry.fromPositions({
						positions: [position, newPosition1, newPosition2],
						extrudedHeight: 0,
						vertexFormat: Cesium.PerInstanceColorAppearance.FLAT_VERTEX_FORMAT,
						perPositionHeight: true
					}),
					attributes: {
						color: Cesium.ColorGeometryInstanceAttribute.fromColor(color)
					},
					slope: dg
				});

				geometryInstances.push(instance);
			}
			that.viewer.scene.primitives.add(new Cesium.Primitive({
				geometryInstances: geometryInstances,
				appearance: new Cesium.PerInstanceColorAppearance({
					flat: true,
					closed: true,
					translucent: false
				})
			}));
		});
	},
	// 坐标插值
	lerpPositions: function (positions) {
		if (!positions || positions.length < 1) return;
		var lnglats = [];
		for (var i = 0; i < positions.length; i++) {
			lnglats.push(Cesium.Cartographic.fromCartesian(positions[i]));
		}
		// 计算跨度
		var maxLat = Number.MIN_VALUE;
		var maxLng = Number.MIN_VALUE;
		var minLat = Number.MAX_VALUE;
		var minLng = Number.MAX_VALUE;
		var random = 1 / 100000;
		for (var index = 0; index < lnglats.length; index++) {
			var lat = Cesium.Math.toDegrees(lnglats[index].latitude);
			var lng = Cesium.Math.toDegrees(lnglats[index].longitude);
			if (maxLat < lat) {
				maxLat = lat;
			}
			if (minLat > lat) {
				minLat = lat;
			}
			if (maxLng < lng) {
				maxLng = lng
			}
			if (minLng > lng) {
				maxLng = lng
			}
		}

		for (var step_i = minLng; step_i <= maxLng; step_i += random) {
			var nowMinLng = step_i;
			var nowMaxLng = step_i+random;
			for (var step_j = minLat; step_j <= maxLat; step_j += random) {
				var nowMinLat = step_j;
				var nowMaxLat = step_j + random;
			}
		}
	},
	isInPolygon:function(){
		
	},
	lerpPositions1: function (positions) {
		if (!positions || positions.length < 1) return;
		var granularity = Math.PI / Math.pow(2, 11);
		granularity = granularity / 500;
		//转为geometry
		var polygonGeometry = new Cesium.PolygonGeometry.fromPositions({
			positions: positions,
			vertexFormat: Cesium.PerInstanceColorAppearance.FLAT_VERTEX_FORMAT,
			granularity: granularity
		});
		var geom = new Cesium.PolygonGeometry.createGeometry(polygonGeometry);
		var indices = geom.indices;
		var attrPosition = geom.attributes.position;

		var ctrgs = [];
		for (var index = 0; index < indices.length; index = index + 3) {
			//计算图元三个点的坐标
			var first = indices[index];
			var second = indices[index + 1];
			var third = indices[index + 2];
			var cartesian1 = new Cesium.Cartesian3(
				attrPosition.values[first * 3],
				geom.attributes.position.values[first * 3 + 1],
				attrPosition.values[first * 3 + 2]
			);
			var cartesian2 = new Cesium.Cartesian3(
				attrPosition.values[second * 3],
				geom.attributes.position.values[second * 3 + 1],
				attrPosition.values[second * 3 + 2]
			);
			var cartesian3 = new Cesium.Cartesian3(
				geom.attributes.position.values[third * 3],
				geom.attributes.position.values[third * 3 + 1],
				attrPosition.values[third * 3 + 2]
			);
			var ctg1 = Cesium.Cartographic.fromCartesian(cartesian1);
			var ctg2 = Cesium.Cartographic.fromCartesian(cartesian2);
			var ctg3 = Cesium.Cartographic.fromCartesian(cartesian3);
			ctrgs.push(ctg1);
			ctrgs.push(ctg2);
			ctrgs.push(ctg3);
		}
		return ctrgs;
	},

	getColor: function (value) {
		var color;
		if (value < 10) {
			color = Cesium.Color.GREEN;
		} else if (value < 20) {
			color = Cesium.Color.AQUA;
		} else if (value < 30) {
			color = Cesium.Color.BLUE;
		} else if (value < 40) {
			color = Cesium.Color.ORANGE;
		} else if (value < 50) {
			color = Cesium.Color.GREENYELLOW;
		} else if (value < 60) {
			color = Cesium.Color.YELLOW;
		} else if (value < 70) {
			color = Cesium.Color.RED;
		} else if (value < 80) {
			color = Cesium.Color.DARKRED;
		} else {
			color = Cesium.Color.BLACK;
		}
		return color;

	},
  getCatesian3FromPX: function (px, viewer) {
    var picks = viewer.scene.drillPick(px);
      viewer.scene.render();
    var cartesian;
    var isOn3dtiles = false;
    for (var i = 0; i < picks.length; i++) {
      if ((picks[i] && picks[i].primitive) && picks[i].primitive instanceof Cesium.Cesium3DTileset) { //模型上拾取
        isOn3dtiles = true;
        break;
      }
    }
    if (isOn3dtiles) {
      cartesian = viewer.scene.pickPosition(px);
    } else {
      var ray = viewer.camera.getPickRay(px);
      if (!ray) return null;
      cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    }
    return cartesian;
  }
};