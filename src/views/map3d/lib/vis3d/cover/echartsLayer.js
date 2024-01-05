
import * as echarts from 'echarts'
/* CompositeCoordinateSystem */
function CompositeCoordinateSystem(api) {
  this.dimensions = ['lng', 'lat'];
  this._mapOffset = [0, 0];
  this._api = api;
}
CompositeCoordinateSystem.dimensions = CompositeCoordinateSystem.prototype.dimensions = ['lng', 'lat'];
CompositeCoordinateSystem.prototype.setMapOffset = function (mapOffset) {
  this._mapOffset = mapOffset
}
CompositeCoordinateSystem.prototype.getBMap = function () {
  return this.GLMap
}
CompositeCoordinateSystem.prototype.dataToPoint = function (data) {
  var defVal = [99999, 99999];
  var position = Cesium.Cartesian3.fromDegrees(data[0], data[1]);
  if (!position) {
    return defVal;
  }
  var px = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.GLMap, position);
  if (!px) {
    return defVal;
  }
  //判断是否在球的背面
  var scene = this.GLMap;
  if (scene.mode === Cesium.SceneMode.SCENE3D) {
    var angle = Cesium.Cartesian3.angleBetween(scene.camera.position, position);
    if (angle > Cesium.Math.toRadians(80)) return [-100, -100];
  }
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

CompositeCoordinateSystem.create = function (ecModel, api) {
  var GLMap = CompositeCoordinateSystem.prototype.GLMap;
  var coordSys;
  ecModel.eachComponent('GLMap', function (GLMapModel) {
    coordSys = new CompositeCoordinateSystem(GLMap, api);
    coordSys.setMapOffset(GLMapModel.__mapOffset || [0, 0]);
    GLMapModel.coordinateSystem = coordSys;
  });
  ecModel.eachSeries(function (seriesModel) {
    if (seriesModel.get('coordinateSystem') === 'GLMap') {
      coordSys = new CompositeCoordinateSystem(GLMap, api);
      seriesModel.coordinateSystem = new CompositeCoordinateSystem(GLMap, api);
    }
  });
}

function registerGLMap(viewer) {
  CompositeCoordinateSystem.prototype.GLMap = viewer.scene;
  echarts.registerCoordinateSystem('GLMap', CompositeCoordinateSystem);
  echarts.registerAction({
    type: 'GLMapRoam',
    event: 'GLMapRoam',
    update: 'updateLayout'
  }, function (payload, ecModel) { })

  /* CompositeMapModel */
  echarts.extendComponentModel({
    type: 'GLMap',
    getBMap: function () {
      return this._GLMap;
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
      var moveHandler = function (type, target) {
        api.dispatchAction({
          type: 'GLMapRoam'
        })
      }
      //绑定渲染事件 实时监控echarts div和地球的位置
      var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
      viewer.scene.postRender.addEventListener(function () {
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
      viewer.scene.postRender.removeEventListener(this.moveHandler, this);
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


export default function echartMap(viewer, option) {
  // 创建echarts的div
  var chartContainer = document.createElement('div');
  var scene = viewer.scene;
  scene.canvas.setAttribute('tabIndex', 0);
  chartContainer.style.position = 'absolute';
  chartContainer.style.top = '0px';
  chartContainer.style.left = '0px';
  chartContainer.style.width = scene.canvas.width + 'px';
  chartContainer.style.height = scene.canvas.height + 'px';
  chartContainer.style.pointerEvents = 'none'; //控制echarts是否可以点击
  chartContainer.setAttribute('id', 'echarts_div');
  chartContainer.setAttribute('class', 'echartsLayer');
  viewer.container.appendChild(chartContainer);
  // 注册坐标系统
  registerGLMap(viewer);
  // 数据赋值
  let overlay = echarts.init(chartContainer);
  overlay.setOption(option);
}
