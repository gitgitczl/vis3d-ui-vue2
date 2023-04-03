
import * as echarts from 'echarts'

/* CompositeCoordinateSystem */
function CompositeCoordinateSystem(GLMap, api) {
  this._GLMap = GLMap;
  this.dimensions = ['lng', 'lat'];
  this._mapOffset = [0, 0];
  this._api = api;
}
CompositeCoordinateSystem.prototype.dimensions = ['lng', 'lat']
CompositeCoordinateSystem.prototype.setMapOffset = function (mapOffset) {
  this._mapOffset = mapOffset
}
CompositeCoordinateSystem.prototype.getBMap = function () {
  return this._GLMap
}
CompositeCoordinateSystem.prototype.dataToPoint = function (data) {
  var defVal = [99999, 99999];
  var position = Cesium.Cartesian3.fromDegrees(data[0], data[1]);
  if (!position) {
    return defVal;
  }
  var px = this._GLMap.cartesianToCanvasCoordinates(position);
  if (!px) {
    return defVal;
  }
  //判断是否在球的背面
  var scene = this._GLMap;
  if (scene.mode === Cesium.SceneMode.SCENE3D) {
    var angle = Cesium.Cartesian3.angleBetween(scene.camera.position, position);
    if (angle > Cesium.Math.toRadians(80)) return false;
  }
  //判断是否在球的背面
  return [px.x - this._mapOffset[0], px.y - this._mapOffset[1]];
}

CompositeCoordinateSystem.prototype.pointToData = function (pt) {
  var mapOffset = this._mapOffset;
  var pt = this._bmap.project(
    [
      pt[0] + mapOffset[0],
      pt[1] + mapOffset[1]
    ]
  );

  return [pt.lng, pt.lat];
}

CompositeCoordinateSystem.prototype.getViewRect = function () {
  var api = this._api;
  return new echarts.graphic.BoundingRect(0, 0, api.getWidth(), api.getHeight());
}

CompositeCoordinateSystem.prototype.getRoamTransform = function () {
  return echarts.matrix.create();
}

CompositeCoordinateSystem.dimensions = CompositeCoordinateSystem.prototype.dimensions;
CompositeCoordinateSystem.create = function (ecModel, api) {
  var coordSys;
  ecModel.eachComponent('GLMap', function (GLMapModel) {
    var viewportRoot = api.getZr().painter.getViewportRoot();
    var GLMap = echarts.glMap;
    coordSys = new CompositeCoordinateSystem(GLMap, api);
    coordSys.setMapOffset(GLMapModel.__mapOffset || [0, 0]);
    GLMapModel.coordinateSystem = coordSys;
  });
  ecModel.eachSeries(function (seriesModel) {
    if (seriesModel.get('coordinateSystem') === 'GLMap') {
      coordSys = new CompositeCoordinateSystem(echarts.glMap, api);
      seriesModel.coordinateSystem = new CompositeCoordinateSystem(echarts.glMap, api);
    }
  });
}


function registerGLMap() {
  echarts.registerCoordinateSystem('GLMap', CompositeCoordinateSystem);
  /* CompositeMap */
  echarts.registerAction({
    type: 'GLMapRoam',
    event: 'GLMapRoam',
    update: 'updateLayout'
  }, function (payload, ecModel) { })

  /* CompositeMapModel */
  echarts.extendComponentModel({
    type: 'GLMap',
    getBMap: function () {
      return this.__GLMap;
    },
    defaultOption: {
      roam: false
    }
  });
  /* 	CompositeMapView */
  echarts.extendComponentView({
    type: 'GLMap',
    lastCenter: null,
    lastCameraPitch: null,
    isControl: true,
    init: function (ecModel, api) {
      var that = this;
      var glMap = echarts.glMap;
      var moveHandler = function (type, target) {
        api.dispatchAction({
          type: 'GLMapRoam'
        })
      }
      //绑定渲染事件 实时监控echarts div和地球的位置
      var handler = new Cesium.ScreenSpaceEventHandler(glMap.canvas);
      var viewer = echarts.viewer;
      glMap.postRender.addEventListener(function () {
        var cameraPosition = viewer.camera.position;
        if (!cameraPosition) {
          that.isControl = true;
          return;
        }
        var height = Cesium.Cartographic.fromCartesian(cameraPosition).height;
        if (height > 450) {
          that.isControl = true;
        }
        if (that.isControl) moveHandler();
      });
      handler.setInputAction(function (evt) {
        var cameraPosition = viewer.camera.position;
        if (!cameraPosition) {
          that.isControl = true;
          return;
        }
        var height = Cesium.Cartographic.fromCartesian(cameraPosition).height;
        if (height < 450) {
          that.isControl = false;
        }
      }, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);
      handler.setInputAction(function (evt) {
        that.isControl = true;
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    },
    render: function render(GLMapModel, ecModel, api) { },
    dispose: function dispose(target) {
      echarts.glMap.postRender.removeEventListener(this.moveHandler, this);
    },
    getCenter: function (viewer) {
      var canvas = viewer.scene.canvas;
      var center = new Cesium.Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2);
      var ray = viewer.scene.camera.getPickRay(center);
      var center = viewer.scene.globe.pick(ray, viewer.scene, new Cesium.Cartesian3());
      return center;
    }
  })
}

var echartMap = {
  viewer: undefined,
  init: function (viewer, option) {
    this.viewer = viewer;
    if (!this.viewer) return;
    var oid = document.getElementById('echarts_div');
    if (oid) {
      this.viewer.container.removeChild(oid);
    }
    var overlay = this._createChartOverlay(this.viewer, option); //构建echarts
    overlay.setOption(option);
  },
  _createChartOverlay: function (container, option) {
    var chartContainer = document.createElement('div');
    var scene = container.scene;
    scene.canvas.setAttribute('tabIndex', 0);
    chartContainer.style.position = 'absolute';
    chartContainer.style.top = '0px';
    chartContainer.style.left = '0px';
    chartContainer.style.width = scene.canvas.width  + 'px';
    chartContainer.style.height = scene.canvas.height  + 'px';
    chartContainer.style.pointerEvents = 'none'; //控制echarts是否可以点击
    chartContainer.setAttribute('id', 'echarts_div');
    chartContainer.setAttribute('class', 'echartsLayer');
    container.container.appendChild(chartContainer);
    if (!echarts.glMap)
      registerGLMap();
    echarts.glMap = scene;
    echarts.viewer = this.viewer;
    return echarts.init(chartContainer);
  }
}

export default function (viewer, option) {
  echartMap.init(viewer, option);
};