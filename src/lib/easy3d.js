'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var $ = _interopDefault(require('jquery'));
var axios = _interopDefault(require('axios'));
var L = require('leaflet');
require('leaflet/dist/leaflet.css');
var MarkdownItSanitizer = _interopDefault(require('markdown-it-sanitizer'));
var MarkdownIt = _interopDefault(require('markdown-it'));
var Hammer = _interopDefault(require('hammerjs'));

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }

  return _assertThisInitialized(self);
}

function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();

  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
        result;

    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

function cartesianToLnglat(cartesian, viewer) {
  if (!cartesian) return [];
  viewer = viewer || window.viewer;
  var ellipsoid = viewer.scene.globe.ellipsoid;
  var lnglat = ellipsoid.cartesianToCartographic(cartesian);
  var lat = Cesium.Math.toDegrees(lnglat.latitude);
  var lng = Cesium.Math.toDegrees(lnglat.longitude);
  var hei = lnglat.height;
  return [lng, lat, hei];
}

function cartesiansToLnglats(cartesians, viewer) {
  if (!cartesians || cartesians.length < 1) return;
  viewer = viewer || window.viewer;
  var arr = [];

  for (var i = 0; i < cartesians.length; i++) {
    arr.push(cartesianToLnglat(cartesians[i], viewer));
  }

  return arr;
} // 经纬度坐标数组 转 世界坐标数组


function lnglatsToCartesians(lnglats) {
  if (!lnglats || lnglats.length < 1) return;
  var arr = [];

  for (var i = 0; i < lnglats.length; i++) {
    var c3 = Cesium.Cartesian3.fromDegrees(lnglats[i][0], lnglats[i][1], lnglats[i][2] || 0);
    arr.push(c3);
  }

  return arr;
}

function flyTo(viewer, opt) {
  if (!viewer) return;
  var center = opt.center;

  if (!center) {
    console.log("缺少定位坐标！");
    return;
  }

  opt = opt || {};

  if (center instanceof Cesium.Cartesian3) {
    viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(center), {
      offset: new Cesium.HeadingPitchRange(Cesium.Math.toRadians(opt.heading || 0), Cesium.Math.toRadians(opt.pitch || -60), opt.range || 10000)
    });
  }

  if (center instanceof Array) {
    var boundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(center[0], center[1], center[2]));
    viewer.camera.flyToBoundingSphere(boundingSphere, {
      offset: new Cesium.HeadingPitchRange(Cesium.Math.toRadians(opt.heading || 0), Cesium.Math.toRadians(opt.pitch || -60), opt.range || 10000)
    });
  }
}

function getCameraView(viewer) {
  viewer = viewer || window.viewer;
  var camera = viewer.camera;
  var position = camera.position;
  var heading = camera.heading;
  var pitch = camera.pitch;
  var roll = camera.roll;
  var lnglat = Cesium.Cartographic.fromCartesian(position);
  var cameraV = {
    "x": Cesium.Math.toDegrees(lnglat.longitude),
    "y": Cesium.Math.toDegrees(lnglat.latitude),
    "z": lnglat.height,
    "heading": Cesium.Math.toDegrees(heading),
    "pitch": Cesium.Math.toDegrees(pitch),
    "roll": Cesium.Math.toDegrees(roll)
  };
  return cameraV;
}

function setCameraView(obj, mapViewer) {
  var viewer = mapViewer || window.viewer;
  if (!obj) return;
  var position = obj.destination || Cesium.Cartesian3.fromDegrees(obj.x, obj.y, obj.z); // 兼容cartesian3和xyz

  viewer.camera.flyTo({
    destination: position,
    orientation: {
      heading: Cesium.Math.toRadians(obj.heading || 0),
      pitch: Cesium.Math.toRadians(obj.pitch || 0),
      roll: Cesium.Math.toRadians(obj.roll || 0)
    },
    duration: obj.duration === undefined ? 3 : obj.duration,
    complete: obj.complete
  });
}

function oreatationToHpr(position, orientation, isWgs84) {
  if (!position || !orientation) return;
  var matrix3Scratch = new Cesium.Matrix3();
  var mtx3 = Cesium.Matrix3.fromQuaternion(orientation, matrix3Scratch);
  var mtx4 = Cesium.Matrix4.fromRotationTranslation(mtx3, position, new Cesium.Matrix4());
  var hpr = Cesium.Transforms.fixedFrameToHeadingPitchRoll(mtx4, Cesium.Ellipsoid.WGS84, Cesium.Transforms.eastNorthUpToFixedFrame, new Cesium.HeadingPitchRoll());
  var heading = hpr.heading,
      pitch = hpr.pitch,
      roll = hpr.roll;

  if (isWgs84) {
    // 是否转化为度
    heading = Cesium.Math.toDegrees(heading);
    pitch = Cesium.Math.toDegrees(pitch);
    roll = Cesium.Math.toDegrees(roll);
  }

  return {
    heading: heading,
    pitch: pitch,
    roll: roll
  };
}
var PI = 3.1415926535897932384626;
var a = 6378245.0;
var ee = 0.00669342162296594323;

function transformWD(lng, lat) {
  var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
  return ret;
}

function transformJD(lng, lat) {
  var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
  ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
  return ret;
}

function wgs2gcj(arrdata) {
  var lng = Number(arrdata[0]);
  var lat = Number(arrdata[1]);
  var dlat = transformWD(lng - 105.0, lat - 35.0);
  var dlng = transformJD(lng - 105.0, lat - 35.0);
  var radlat = lat / 180.0 * PI;
  var magic = Math.sin(radlat);
  magic = 1 - ee * magic * magic;
  var sqrtmagic = Math.sqrt(magic);
  dlat = dlat * 180.0 / (a * (1 - ee) / (magic * sqrtmagic) * PI);
  dlng = dlng * 180.0 / (a / sqrtmagic * Math.cos(radlat) * PI);
  var mglat = lat + dlat;
  var mglng = lng + dlng;
  mglng = Number(mglng.toFixed(6));
  mglat = Number(mglat.toFixed(6));
  return [mglng, mglat];
}

function gcj2wgs(arrdata) {
  var lng = Number(arrdata[0]);
  var lat = Number(arrdata[1]);
  var dlat = transformWD(lng - 105.0, lat - 35.0);
  var dlng = transformJD(lng - 105.0, lat - 35.0);
  var radlat = lat / 180.0 * PI;
  var magic = Math.sin(radlat);
  magic = 1 - ee * magic * magic;
  var sqrtmagic = Math.sqrt(magic);
  dlat = dlat * 180.0 / (a * (1 - ee) / (magic * sqrtmagic) * PI);
  dlng = dlng * 180.0 / (a / sqrtmagic * Math.cos(radlat) * PI);
  var mglat = lat + dlat;
  var mglng = lng + dlng;
  var jd = lng * 2 - mglng;
  var wd = lat * 2 - mglat;
  jd = Number(jd.toFixed(6));
  wd = Number(wd.toFixed(6));
  return [jd, wd];
}

function lerpPositions(positions) {
  if (!positions || positions.length == 0) return;
  var surfacePositions = Cesium.PolylinePipeline.generateArc({
    //将线进行插值
    positions: positions,
    granularity: 0.00001
  });
  if (!surfacePositions) return;
  var arr = [];

  for (var i = 0; i < surfacePositions.length; i += 3) {
    var cartesian = Cesium.Cartesian3.unpack(surfacePositions, i); //分组

    arr.push(cartesian);
  }

  return arr;
} // 由两点计算和地形以及模型的交点  当前点 可能是两点间 可能是两点外


function getIntersectPosition(viewer, obj) {
  var p1 = obj.startPoint;
  var p2 = obj.endPoint;

  if (!p1 || !p2) {
    console.log("缺少坐标！");
    return;
  }

  var direction = Cesium.Cartesian3.subtract(p2.clone(), p1.clone(), new Cesium.Cartesian3());
  direction = Cesium.Cartesian3.normalize(direction, new Cesium.Cartesian3());
  var ray = new Cesium.Ray(p1.clone(), direction.clone());
  var pick = viewer.scene.pickFromRay(ray);
  if (!pick) return null;
  return pick.position;
} // 由两点获取圆上的点 


function getCirclePoints(center, aimP, angle) {
  var dis = Cesium.Cartesian3.distance(center.clone(), aimP.clone());
  var circlePositions = [];

  for (var i = 0; i < 360; i += angle) {
    // 旋转矩阵
    var hpr = new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(i), Cesium.Math.toRadians(0), Cesium.Math.toRadians(0));
    var mtx4 = Cesium.Transforms.headingPitchRollToFixedFrame(center.clone(), hpr);
    var mtx3 = Cesium.Matrix4.getMatrix3(mtx4, new Cesium.Matrix3());
    var newPosition = Cesium.Matrix3.multiplyByVector(mtx3, aimP.clone(), new Cesium.Cartesian3());
    var dir = Cesium.Cartesian3.subtract(newPosition.clone(), center.clone(), new Cesium.Cartesian3());
    dir = Cesium.Cartesian3.normalize(dir, new Cesium.Cartesian3());
    dir = Cesium.Cartesian3.multiplyByScalar(dir, dis, new Cesium.Cartesian3());
    newPosition = Cesium.Cartesian3.add(center.clone(), dir.clone(), new Cesium.Cartesian3());
    var ctgc = Cesium.Cartographic.fromCartesian(newPosition.clone());
    circlePositions.push(ctgc);
  }

  circlePositions.unshift();
  return circlePositions;
} // 由中心点和半径获取圆上的点


function getCirclePointsByRadius(viewer, opt) {
  var _ref = opt || {},
      center = _ref.center,
      radius = _ref.radius,
      angle = _ref.angle;
  if (!center || !radius) return;
  angle = angle || 60;
  var positions = []; // 局部坐标系到世界坐标系的矩阵

  var mtx4 = Cesium.Transforms.eastNorthUpToFixedFrame(center.clone()); // 世界到局部

  var mtx4_inverse = Cesium.Matrix4.inverse(mtx4, new Cesium.Matrix4());
  var local_center = Cesium.Matrix4.multiplyByPoint(mtx4_inverse, center.clone(), new Cesium.Cartesian3());
  var rposition = Cesium.Cartesian3.add(local_center, new Cesium.Cartesian3(radius, 0, 0), new Cesium.Cartesian3());

  for (var i = 0; i <= 360; i += angle) {
    var radians = Cesium.Math.toRadians(i);
    var mtx3 = Cesium.Matrix3.fromRotationZ(radians);
    var newPosition = Cesium.Matrix3.multiplyByVector(mtx3, rposition.clone(), new Cesium.Cartesian3());
    newPosition = Cesium.Matrix4.multiplyByPoint(mtx4, newPosition.clone(), new Cesium.Cartesian3());
    positions.push(newPosition);
  }

  return positions;
}
/**
 * 
 * @param {Cartographic} p1 
 * @param {Cartographic} p2 
 * @returns 
 */


function computeAngle(p1, p2) {
  var lng_a = p1.longitude;
  var lat_a = p1.latitude;
  var lng_b = p2.longitude;
  var lat_b = p2.latitude;
  var y = Math.sin(lng_b - lng_a) * Math.cos(lat_b);
  var x = Math.cos(lat_a) * Math.sin(lat_b) - Math.sin(lat_a) * Math.cos(lat_b) * Math.cos(lng_b - lng_a);
  var bearing = Math.atan2(y, x);
  bearing = bearing * 180.0 / Math.PI;

  if (bearing < -180) {
    bearing = bearing + 360;
  }

  return bearing;
}

function updatePositionsHeight(pois, h) {
  if (!pois || h == undefined) return;
  var newPois = [];

  for (var i = 0; i < pois.length; i++) {
    var c3 = pois[i];
    var ct = cartesianToLnglat(c3);
    var newC3 = Cesium.Cartesian3.fromDegrees(ct[0], ct[1], h);
    newPois.push(newC3);
  }

  return newPois;
}

function computeUniforms(positions, fix, isOn3dtiles) {
  if (!positions) return;
  if (!fix) fix = 1000;
  var polygonGeometry = new Cesium.PolygonGeometry.fromPositions({
    positions: positions,
    vertexFormat: Cesium.PerInstanceColorAppearance.FLAT_VERTEX_FORMAT,
    granularity: Math.PI / Math.pow(2, 11) / fix
  });
  var geom = new Cesium.PolygonGeometry.createGeometry(polygonGeometry);
  var indices = geom.indices;
  var attrPosition = geom.attributes.position;
  var data = {};
  data.uniformArr = [];
  data.minHeight = Number.MAX_VALUE;
  data.maxHeight = Number.MIN_VALUE;

  for (var index = 0; index < indices.length; index = index + 3) {
    var obj = {};
    var first = indices[index];
    var second = indices[index + 1];
    var third = indices[index + 2];
    var cartesian1 = new Cesium.Cartesian3(attrPosition.values[first * 3], geom.attributes.position.values[first * 3 + 1], attrPosition.values[first * 3 + 2]);
    var h1;

    if (!isOn3dtiles) {
      h1 = getTerrainHeight(cartesian1);
    } else {
      h1 = get3dtilesHeight(cartesian1);
    }

    var cartesian2 = new Cesium.Cartesian3(attrPosition.values[second * 3], geom.attributes.position.values[second * 3 + 1], attrPosition.values[second * 3 + 2]);
    var h2;

    if (!isOn3dtiles) {
      h2 = getTerrainHeight(cartesian2);
    } else {
      h2 = get3dtilesHeight(cartesian2);
    }

    var cartesian3 = new Cesium.Cartesian3(geom.attributes.position.values[third * 3], geom.attributes.position.values[third * 3 + 1], attrPosition.values[third * 3 + 2]);
    var h3;

    if (!isOn3dtiles) {
      h3 = getTerrainHeight(cartesian3);
    } else {
      h3 = get3dtilesHeight(cartesian3);
    }

    obj.height = (h1 + h2 + h3) / 3;

    if (data.minHeight > obj.height) {
      data.minHeight = obj.height;
    }

    if (data.maxHeight < obj.height) {
      data.maxHeight = obj.height;
    }

    obj.area = computeAreaOfTriangle(cartesian1, cartesian2, cartesian3);
    data.uniformArr.push(obj);
  }

  return data;
}

function getTerrainHeight(cartesian) {
  if (!cartesian) return;
  return viewer.scene.globe.getHeight(Cesium.Cartographic.fromCartesian(cartesian));
}

function get3dtilesHeight(cartesian) {
  if (!cartesian) return;
  return viewer.scene.sampleHeight(Cesium.Cartographic.fromCartesian(cartesian));
}

function computeAreaOfTriangle(pos1, pos2, pos3) {
  if (!pos1 || !pos2 || !pos3) {
    console.log("传入坐标有误！");
    return 0;
  }

  var a = Cesium.Cartesian3.distance(pos1, pos2);
  var b = Cesium.Cartesian3.distance(pos2, pos3);
  var c = Cesium.Cartesian3.distance(pos3, pos1);
  var S = (a + b + c) / 2;
  return Math.sqrt(S * (S - a) * (S - b) * (S - c));
} // 计算坡度


function getSlopePosition(viewer, center, radius, angle) {
  if (!viewer || !center) return;
  var positions = getCirclePointsByRadius(viewer, {
    center: center,
    radius: radius || 10,
    angle: angle || 10
  });
  var minH = Number.MAX_VALUE;
  var centerH = getTerrainHeight(center.clone());
  var step = -1;

  for (var i = 0; i < positions.length; i++) {
    var h = getTerrainHeight(positions[i]);

    if (minH > h) {
      minH = h;
      step = i;
    }
  }

  var startP;
  var endP;

  if (minH < centerH) {
    startP = center.clone();
    endP = positions[step].clone();
  } else {
    startP = positions[step].clone();
    endP = center.clone();
  }

  var startCgtc = Cesium.Cartographic.fromCartesian(startP);
  var endCgtc = Cesium.Cartographic.fromCartesian(endP);
  startP = Cesium.Cartesian3.fromRadians(startCgtc.longitude, startCgtc.latitude, minH < centerH ? centerH : minH);
  endP = Cesium.Cartesian3.fromRadians(endCgtc.longitude, endCgtc.latitude, minH < centerH ? minH : centerH);
  var dis = Cesium.Cartesian3.distance(startP, endP);
  var height = Math.abs(centerH - minH);
  var sinAngle = height / dis;
  var slopeAngle = Math.acos(sinAngle);
  var slope = Cesium.Math.toDegrees(slopeAngle);
  return {
    startP: startP,
    endP: endP,
    slope: slope
  };
}

var cUtil$1 = {
  getSlopePosition: getSlopePosition,
  getCirclePointsByRadius: getCirclePointsByRadius,
  updatePositionsHeight: updatePositionsHeight,
  computeUniforms: computeUniforms,
  cartesianToLnglat: cartesianToLnglat,
  cartesiansToLnglats: cartesiansToLnglats,
  lnglatsToCartesians: lnglatsToCartesians,
  flyTo: flyTo,
  getCameraView: getCameraView,
  setCameraView: setCameraView,
  wgs2gcj: wgs2gcj,
  gcj2wgs: gcj2wgs,
  lerpPositions: lerpPositions,
  oreatationToHpr: oreatationToHpr,
  getIntersectPosition: getIntersectPosition,
  getCirclePoints: getCirclePoints,
  computeAngle: computeAngle
};

/*Cesium无关的常用小工具 */
// 图片下载 实现截屏
function downloadCanvasIamge(canvas, name) {
  // 通过选择器获取canvas元素
  var url = canvas.toDataURL('image/png');
  console.log(url); // 生成一个a元素

  var a = document.createElement('a'); // 创建一个单击事件

  var event = new MouseEvent('click'); // 将a的download属性设置为我们想要下载的图片名称，若name不存在则使用‘下载图片名称’作为默认名称

  a.download = name || '下载图片名称'; // 将生成的URL设置为a.href属性

  a.href = url; // 触发a的单击事件

  a.dispatchEvent(event);
}

var file = {
  //============内部私有属性及方法============
  _download: function _download(fileName, blob) {
    var aLink = document.createElement('a');
    aLink.download = fileName;
    aLink.href = URL.createObjectURL(blob);
    document.body.appendChild(aLink);
    aLink.click();
    document.body.removeChild(aLink);
  },
  //下载保存文件
  downloadFile: function downloadFile(fileName, string) {
    var blob = new Blob([string]);

    this._download(fileName, blob);
  },
  //下载导出图片
  downloadImage: function downloadImage(name, canvas) {
    var base64 = canvas.toDataURL("image/png");
    var blob = this.base64Img2Blob(base64);

    this._download(name + '.png', blob);
  },
  base64Img2Blob: function base64Img2Blob(code) {
    var parts = code.split(';base64,');
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;
    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {
      type: contentType
    });
  }
};
var cTool = {
  downloadCanvasIamge: downloadCanvasIamge,
  file: file
};

// 鼠标提示框
var Prompt$1 = /*#__PURE__*/function () {
  /**
   * opt
   *      type : 1  位置变化提示框  默认为1
   *             2  固定坐标提示框
   *      position: 固定坐标提示框的坐标 cartesian3 / [101,30] 
   *      anchor ： true 是否显示下方锚点
   *      closeBtn: true 是否显示关闭按钮
   *      content ： 弹窗内容
   *      close ： 点击退出回调函数
   *      offset :  偏移参数
   *          x:
   *          y
   *      style：
   *          background ： 弹窗背景色 默认为white
   *          boxShadow : 弹窗阴影
  */
  function Prompt(viewer, opt) {
    _classCallCheck(this, Prompt);

    this.viewer = viewer;
    if (!this.viewer) return;
    this.type = "prompt"; // 默认值

    opt = opt || {};
    var promptType = opt.type == undefined ? 1 : opt.type;
    var defaultOpt = {
      id: new Date().getTime() + "" + Math.floor(Math.random() * 10000),
      type: promptType,
      anchor: promptType == 2 ? true : false,
      closeBtn: promptType == 2 ? true : false,
      offset: promptType == 2 ? {
        x: 0,
        y: -20
      } : {
        x: 30,
        y: 20
      },
      content: "",
      show: true,
      style: {
        background: "rgba(0,0,0,0.5)",
        color: "white"
      }
    };
    this.opt = Object.assign(defaultOpt, opt); // ====================== 创建弹窗内容 start ======================

    var mapid = this.viewer.container.id;
    this.isShow = this.opt.show == undefined ? true : this.opt.show; // 是否显示

    var anchorHtml = "";
    var closeHtml = "";
    var background = this.opt.style.background;
    var color = this.opt.style.color;

    if (this.opt.anchor) {
      anchorHtml += "\n            <div class=\"prompt-anchor-container\">\n                <div class=\"prompt-anchor\" style=\"background:".concat(background, " !important;\">\n                </div>\n            </div>\n            ");
    }

    if (this.opt.closeBtn) {
      // 移动提示框 不显示关闭按钮
      closeHtml = "<a class=\"prompt-close\" attr=\"".concat(this.opt.id, "\" id=\"prompt-close-").concat(this.opt.id, "\" href=\"#close\">x</a>");
    }

    var boxShadow = this.opt.style.boxShadow;
    var promptId = "prompt-" + this.opt.id;
    var promptConenet = "\n                <!-- \u6587\u672C\u5185\u5BB9 -->\n                <div class=\"prompt-content-container\" style=\"background:".concat(background, " !important;color:").concat(color, " !important;box-shadow:").concat(boxShadow, "\">\n                    <div class=\"prompt-content\" id=\"prompt-content-").concat(this.opt.id, "\">\n                        ").concat(this.opt.content, "\n                    </div>\n                </div>\n                <!-- \u951A -->\n                ").concat(anchorHtml, "\n                <!-- \u5173\u95ED\u6309\u94AE -->\n                ").concat(closeHtml, "\n        "); // 构建弹窗元素 

    this.promptDiv = window.document.createElement("div");
    this.promptDiv.className = "easy3d-prompt";
    this.promptDiv.id = promptId;
    this.promptDiv.innerHTML = promptConenet;
    var mapDom = window.document.getElementById(mapid);
    mapDom.appendChild(this.promptDiv);
    var clsBtn = window.document.getElementById("prompt-close-".concat(this.opt.id));
    var that = this;

    if (clsBtn) {
      clsBtn.addEventListener("click", function (e) {
        that.hide();
        if (that.close) that.close();
      });
    }

    this.promptDom = window.document.getElementById(promptId);
    this.contentW = this.promptDom.offsetWidth; // 宽度

    this.contentH = this.promptDom.offsetHeight; // 高度

    this.position = this.transPosition(this.opt.position); // ====================== 创建弹窗内容 end ======================

    if (promptType == 2) this.bindRender(); // 固定位置弹窗 绑定实时渲染 当到地球背面时 隐藏

    if (this.opt.show == false) this.hide();
    this.containerW = this.viewer.container.offsetWidth;
    this.containerH = this.viewer.container.offsetHeight;
    this.containerLeft = this.viewer.container.offsetLeft;
    this.containerTop = this.viewer.container.offsetTop;
  } // 销毁


  _createClass(Prompt, [{
    key: "destroy",
    value: function destroy() {
      if (this.promptDiv) {
        window.document.getElementById(this.viewer.container.id).removeChild(this.promptDiv);
        this.promptDiv = null;
      }

      if (this.rendHandler) {
        this.rendHandler();
        this.rendHandler = null;
      }
    } // 实时监听

  }, {
    key: "bindRender",
    value: function bindRender() {
      var that = this;
      this.rendHandler = this.viewer.scene.postRender.addEventListener(function () {
        if (!that.isShow && that.promptDom) {
          that.promptDom.style.display = "none";
          return;
        }

        if (!that.position) return;

        if (that.position instanceof Cesium.Cartesian3) {
          var px = Cesium.SceneTransforms.wgs84ToWindowCoordinates(that.viewer.scene, that.position);
          if (!px) return;
          var occluder = new Cesium.EllipsoidalOccluder(that.viewer.scene.globe.ellipsoid, that.viewer.scene.camera.position); // 当前点位是否可见

          var res = occluder.isPointVisible(that.position);

          if (res) {
            if (that.promptDom) that.promptDom.style.display = "block";
          } else {
            if (that.promptDom) that.promptDom.style.display = "none";
          }

          that.setByPX({
            x: px.x,
            y: px.y
          });
        } else {
          that.setByPX({
            x: that.position.x,
            y: that.position.y
          });
        }
      }, this);
    }
  }, {
    key: "update",
    value: function update(px, html) {
      if (px instanceof Cesium.Cartesian3) {
        this.position = px.clone();
        px = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, px);
      }

      if (px) this.setByPX(px);
      if (html) this.setContent(html);
    } // 判断是否在当前视野内

  }, {
    key: "isInView",
    value: function isInView() {
      if (!this.position) return false;
      var px = null;

      if (this.position instanceof Cesium.Cartesian2) {
        px = this.position;
      } else {
        px = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, this.position);
      }

      var occluder = new Cesium.EllipsoidalOccluder(this.viewer.scene.globe.ellipsoid, this.viewer.scene.camera.position); // 是否在地球背面

      var res = occluder.isPointVisible(this.position);
      var isin = false;
      if (!px) return isin;

      if (px.x > this.containerLeft && px.x < this.containerLeft + this.containerW && px.y > this.containerTop && px.y < this.containerTop + this.containerH) {
        isin = true;
      }

      return res && isin;
    }
  }, {
    key: "setVisible",
    value: function setVisible(isShow) {
      var isin = this.isInView(this.position);

      if (isin && isShow) {
        this.isShow = true;
        if (this.promptDom) this.promptDom.style.display = "block";
      } else {
        this.isShow = false;
        if (this.promptDom) this.promptDom.style.display = "none";
      }
    }
  }, {
    key: "show",
    value: function show() {
      this.setVisible(true);
    }
  }, {
    key: "hide",
    value: function hide() {
      this.setVisible(false);
    }
  }, {
    key: "setContent",
    value: function setContent(content) {
      var pc = window.document.getElementById("prompt-content-".concat(this.opt.id));
      pc.innerHTML = content;
    }
  }, {
    key: "setByPX",
    value: function setByPX(opt) {
      if (!opt) return;

      if (this.promptDom) {
        this.promptDom.style.left = Number(opt.x) + Number(this.opt.offset.x || 0) - Number(this.contentW) / 2 + "px";
        this.promptDom.style.top = Number(opt.y) + Number(this.opt.offset.y || 0) - Number(this.contentH) + "px";
      }
    } // 坐标转换

  }, {
    key: "transPosition",
    value: function transPosition(p) {
      var position;

      if (Array.isArray(p)) {
        var posi = Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2] || 0);
        position = posi.clone();
      }

      if (p instanceof Cesium.Cartesian3) {
        position = p.clone();
      } else {
        // 像素类型
        position = p;
      }

      return position;
    }
  }]);

  return Prompt;
}();

var BasePlot = /*#__PURE__*/function () {
  function BasePlot(viewer, opt) {
    _classCallCheck(this, BasePlot);

    this.viewer = viewer;
    opt = opt || {};
    this.style = opt || {};
    this.objId = Number(new Date().getTime() + "" + Number(Math.random() * 1000).toFixed(0));
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.positions = [];
    this.state = null; // 标识当前状态 no startCreate creating endCreate startEdit endEdit editing

    this.prompt = null; // 初始化鼠标提示框

    this.controlPoints = []; // 控制点

    this.modifyPoint = null;
    this.entity = null;
    this.pointStyle = {};
    this.promptStyle = opt.prompt || {
      show: true,
      offset: {
        x: 30,
        y: 30
      }
    };
    this.properties = {};
  } // 坐标拾取


  _createClass(BasePlot, [{
    key: "getCatesian3FromPX",
    value: function getCatesian3FromPX(px) {
      var picks = this.viewer.scene.drillPick(px);
      this.viewer.scene.render();
      var cartesian;
      var isOn3dtiles = false;

      for (var i = 0; i < picks.length; i++) {
        if (picks[i] && picks[i].primitive && picks[i].primitive instanceof Cesium.Cesium3DTileset) {
          //模型上拾取
          isOn3dtiles = true;
          break;
        }
      }

      if (isOn3dtiles) {
        cartesian = this.viewer.scene.pickPosition(px);
      } else {
        var ray = this.viewer.camera.getPickRay(px);
        if (!ray) return null;
        cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
      }

      return cartesian;
    } // 获取标绘对象

  }, {
    key: "getEntity",
    value: function getEntity() {
      return this.entity;
    } // 获取坐标数组

  }, {
    key: "getPositions",
    value: function getPositions(isWgs84) {
      return isWgs84 ? cUtil$1.cartesiansToLnglats(this.positions, this.viewer) : this.positions;
    } // 绑定自定义属性到entity上

  }, {
    key: "setOwnProp",
    value: function setOwnProp(prop) {
      if (this.entity) this.entity.ownProp = prop;
    } // 移除

  }, {
    key: "remove",
    value: function remove() {
      if (this.entity) {
        this.state = "no";
        this.viewer.entities.remove(this.entity);
        this.entity = null;
      }
    } // 显示隐藏

  }, {
    key: "setVisible",
    value: function setVisible(vis) {
      this.entity.show = vis;
    } // 操作控制

  }, {
    key: "forbidDrawWorld",
    value: function forbidDrawWorld(isForbid) {
      this.viewer.scene.screenSpaceCameraController.enableRotate = !isForbid;
      this.viewer.scene.screenSpaceCameraController.enableTilt = !isForbid;
      this.viewer.scene.screenSpaceCameraController.enableTranslate = !isForbid;
      this.viewer.scene.screenSpaceCameraController.enableInputs = !isForbid;
    } // 销毁

  }, {
    key: "destroy",
    value: function destroy() {
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

      this.positions = [];
      this.style = null;

      for (var i = 0; i < this.controlPoints.length; i++) {
        var point = this.controlPoints[i];
        this.viewer.entities.remove(point);
      }

      this.controlPoints = [];
      this.modifyPoint = null;

      if (this.prompt) {
        this.prompt.destroy();
        this.prompt = null;
      }

      this.state = "no";
      this.forbidDrawWorld(false);
    }
  }, {
    key: "startEdit",
    value: function startEdit(callback) {
      if (this.state == "startEdit" || this.state == "editing" || !this.entity) return;
      this.state = "startEdit";
      if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
      var that = this;

      for (var i = 0; i < that.controlPoints.length; i++) {
        var point = that.controlPoints[i];
        if (point) point.show = true;
      }

      this.entity.show = true;
      this.modifyHandler.setInputAction(function (evt) {
        if (!that.entity) return;
        var pick = that.viewer.scene.pick(evt.position);

        if (Cesium.defined(pick) && pick.id) {
          if (!pick.id.objId) that.modifyPoint = pick.id;
          that.forbidDrawWorld(true);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      this.modifyHandler.setInputAction(function (evt) {
        if (that.positions.length < 1 || !that.modifyPoint) return;
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer, [that.entity, that.modifyPoint]);

        if (cartesian) {
          that.modifyPoint.position.setValue(cartesian);
          that.positions[that.modifyPoint.wz] = cartesian;
          that.state = "editing";
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      this.modifyHandler.setInputAction(function (evt) {
        if (!that.modifyPoint) return;
        that.modifyPoint = null;
        that.forbidDrawWorld(false);
        that.state = "editing";
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
    }
  }, {
    key: "endEdit",
    value: function endEdit(callback) {
      for (var i = 0; i < this.controlPoints.length; i++) {
        var point = this.controlPoints[i];
        if (point) point.show = false;
      }

      if (this.modifyHandler) {
        this.modifyHandler.destroy();
        this.modifyHandler = null;
        if (callback) callback(this.entity);
      }

      this.forbidDrawWorld(false);
      this.state = "endEdit";
    } // 构建控制点

  }, {
    key: "createPoint",
    value: function createPoint(position) {
      if (!position) return;
      this.pointStyle.color = this.pointStyle.color || Cesium.Color.CORNFLOWERBLUE;
      this.pointStyle.outlineColor = this.pointStyle.color || Cesium.Color.CORNFLOWERBLUE;
      var color = this.pointStyle.color instanceof Cesium.Color ? this.pointStyle.color : Cesium.Color.fromCssColorString(this.pointStyle.color);
      color = color.withAlpha(this.pointStyle.colorAlpha || 1);
      var outlineColor = this.pointStyle.outlineColor instanceof Cesium.Color ? this.pointStyle.outlineColor : Cesium.Color.fromCssColorString(this.pointStyle.outlineColor);
      outlineColor = outlineColor.withAlpha(this.pointStyle.outlineColorAlpha || 1);
      return this.viewer.entities.add({
        position: position,
        point: {
          pixelSize: this.pointStyle.property || 10,
          color: color,
          outlineWidth: this.pointStyle.outlineWidth || 0,
          outlineColor: outlineColor,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        show: false
      });
    } // 获取当前标绘的样式

    /*  getStyle() {
        if (!this.entity) return;
        let graphic = this.entity[this.plotType];
        if (!graphic) return;
        let style = {};
        switch (this.plotType) {
            case 'polyline':
                style.clampToGround = graphic.clampToGround._value; // 是否贴地
                style.distanceDisplayCondition = graphic.distanceDisplayCondition._value; // 显示控制
                style.width = graphic.width._value; // 线宽
                let colorObj = this.transfromLineMaterial(graphic.material);
                style = Object.assign(style, colorObj);
                break;
            case "polygon":
                style.heightReference = graphic.heightReference.getValue();
                style.fill = graphic.fill._value;
                style.extrudedHeight = graphic.extrudedHeight._value;
                let gonColorObj = this.transfromGonMaterial(graphic.material);
                style = Object.assign(style, gonColorObj);
                  style.outline = graphic.outline._value;
                let ocv = graphic.outlineColor.getValue();
                style.outlineColorAlpha = ocv.alpha;
                style.outlineColor = new Cesium.Color(ocv.red, ocv.green, ocv.blue, 1).toCssHexString();
                  break;
            default:
                break;
        }
        return style;
    } */
    // 获取线的材质

  }, {
    key: "transfromLineMaterial",
    value: function transfromLineMaterial(material) {
      if (!material) return;
      var colorObj = {};

      if (material instanceof Cesium.Color) {
        var colorVal = material.color.getValue();
        colorObj.colorAlpha = colorVal.alpha; // 转为hex

        colorObj.colorHex = new Cesium.Color(colorVal.red, colorVal.green, colorVal.blue, 1).toCssHexString();
      }

      return colorObj;
    } // 获取面材质

  }, {
    key: "transfromGonMaterial",
    value: function transfromGonMaterial(material) {
      if (!material) return;
      var colorObj = {};

      if (material instanceof Cesium.Color) {
        var colorVal = material.color.getValue();
        colorObj.colorAlpha = colorVal.alpha; // 转为hex

        colorObj.colorHex = new Cesium.Color(colorVal.red, colorVal.green, colorVal.blue, 1).toCssHexString();
      }

      return colorObj;
    } // 设置实体的属性

  }, {
    key: "setAttr",
    value: function setAttr(attr) {
      this.properties.attr = attr || {};
    }
  }, {
    key: "zoomTo",
    value: function zoomTo() {
      if (this.entity) {
        this.viewer.zoomTo(this.entity);
      }
    }
  }]);

  return BasePlot;
}();

var CreateBillboard = /*#__PURE__*/function (_BasePlot) {
  _inherits(CreateBillboard, _BasePlot);

  var _super = _createSuper(CreateBillboard);

  function CreateBillboard(viewer, style) {
    var _this;

    _classCallCheck(this, CreateBillboard);

    _this = _super.call(this, viewer, style);
    _this.type = "billboard";
    _this.viewer = viewer;
    var defaultStyle = {
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      scale: 1
    };
    _this.style = Object.assign({}, defaultStyle, style || {});
    _this.entity = null;

    if (!_this.style.hasOwnProperty("image")) {
      console.log("未设置billboard的参数！");
    }

    _this.position = null;
    return _this;
  }

  _createClass(CreateBillboard, [{
    key: "start",
    value: function start(callBack) {
      if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt$1(this.viewer, this.promptStyle);
      this.state = "startCreate";
      var that = this;
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
        var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
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
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
        that.prompt.update(evt.endPosition, "单击新增");
        that.state = "startCreate";
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
  }, {
    key: "createByPositions",
    value: function createByPositions(lnglatArr, callBack) {
      if (!lnglatArr) return;
      this.state = "startCreate";
      var position = null;

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
    } // 设置相关样式

  }, {
    key: "setStyle",
    value: function setStyle(style) {
      if (!style) return;
      var billboard = this.entity.billboard;
      if (style.image != undefined) billboard.image = style.image;

      if (style.heightReference != undefined) {
        var heightReference = 1;

        if (this.style.heightReference == true) {
          heightReference = 1;
        } else {
          heightReference = this.style.heightReference;
        }

        billboard.heightReference = heightReference;
      }

      if (style.heightReference != undefined) billboard.heightReference = style.heightReference == undefined ? 1 : Number(this.style.heightReference); // 如果直接设置为true 会导致崩溃

      if (style.scale != undefined) billboard.scale = Number(style.scale);

      if (style.color) {
        var color = style.color instanceof Cesium.Color ? style.color : Cesium.Color.fromCssColorString(style.color);
        color = color.withAlpha(style.colorAlpha || 1);
        billboard.color = color;
      }

      this.style = Object.assign(this.style, style);
    } // 获取相关样式

  }, {
    key: "getStyle",
    value: function getStyle() {
      var obj = {};
      var billboard = this.entity.billboard;
      obj.image = this.style.image;

      if (billboard.heightReference) {
        var heightReference = billboard.heightReference.getValue();
        obj.heightReference = Boolean(heightReference);
      }

      obj.scale = billboard.scale.getValue();

      if (billboard.color) {
        var color = billboard.color.getValue();
        obj.colorAlpha = color.alpha;
        obj.color = new Cesium.Color(color.red, color.green, color.blue, 1).toCssHexString();
      }

      return obj;
    }
  }, {
    key: "startEdit",
    value: function startEdit() {
      if (this.state == "startEdit" || this.state == "editing" || !this.entity) return;
      this.state = "startEdit";
      if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
      var that = this;
      var editBillboard;
      this.modifyHandler.setInputAction(function (evt) {
        var pick = that.viewer.scene.pick(evt.position);

        if (Cesium.defined(pick) && pick.id) {
          editBillboard = pick.id;
          that.forbidDrawWorld(true);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      this.modifyHandler.setInputAction(function (evt) {
        //移动时绘制线
        if (!editBillboard) return;
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
        if (!cartesian) return;
        editBillboard.position.setValue(cartesian.clone());
        that.position = cartesian.clone();
        that.state = "editing";
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      this.modifyHandler.setInputAction(function (evt) {
        //移动时绘制线
        if (!editBillboard) return;
        that.forbidDrawWorld(false);

        if (that.modifyHandler) {
          that.modifyHandler.destroy();
          that.modifyHandler = null;
          that.state = "editing";
        }
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
    }
  }, {
    key: "endEdit",
    value: function endEdit(callback) {
      if (this.modifyHandler) {
        this.modifyHandler.destroy();
        this.modifyHandler = null;
        if (callback) callback(this.entity);
      }

      this.state = "endEdit";
    }
  }, {
    key: "createBillboard",
    value: function createBillboard(cartesian) {
      if (!cartesian) return;
      var billboard = this.viewer.entities.add({
        position: cartesian,
        billboard: {
          color: this.style.color ? this.style.color instanceof Cesium.Color ? this.style.color : Cesium.Color.fromCssColorString(this.style.outlineColor).withAlpha(this.style.outlineColorAlpha || 1) : Cesium.Color.WHITE,
          image: this.style.image || "../img/mark4.png",
          scale: this.style.scale || 1,
          pixelOffset: this.style.pixelOffset,
          heightReference: this.style.heightReference == undefined ? 1 : Number(this.style.heightReference),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM
        }
      });
      billboard.objId = this.objId;
      return billboard;
    }
  }, {
    key: "remove",
    value: function remove() {
      if (this.entity) {
        this.state = "no";
        this.viewer.entities.remove(this.entity);
        this.entity = null;
      }
    } // 方法重写

  }, {
    key: "getPositions",
    value: function getPositions(isWgs84) {
      return isWgs84 ? cUtil$1.cartesianToLnglat(this.position, this.viewer) : this.position;
    }
  }, {
    key: "setPosition",
    value: function setPosition(p) {
      var position = null;

      if (p instanceof Cesium.Cartesian3) {
        position = p;
      } else {
        position = Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2] || 0);
      }

      this.entity.position.setValue(position.clone());
      this.position = position.clone();
    }
  }]);

  return CreateBillboard;
}(BasePlot);

var CreateCircle = /*#__PURE__*/function (_BasePlot) {
  _inherits(CreateCircle, _BasePlot);

  var _super = _createSuper(CreateCircle);

  function CreateCircle(viewer, style) {
    var _this;

    _classCallCheck(this, CreateCircle);

    _this = _super.call(this, viewer, style);
    _this.type = "circle";
    _this.objId = Number(new Date().getTime() + "" + Number(Math.random() * 1000).toFixed(0));
    _this.viewer = viewer;
    _this.style = style;
    _this.floatPoint = null;
    _this.centerPoint = null;
    _this.position = null;
    _this.floatPosition = null;
    _this.radius = 0.001;
    _this.modifyPoint = null;
    _this.pointArr = [];
    return _this;
  }

  _createClass(CreateCircle, [{
    key: "start",
    value: function start(callBack) {
      if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt$1(this.viewer, this.promptStyle);
      this.state = "startCreate";
      var that = this;
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
        var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
        if (!cartesian) return;

        if (!that.centerPoint) {
          that.position = cartesian;
          that.centerPoint = that.createPoint(cartesian);
          that.centerPoint.typeAttr = "center";
          that.floatPoint = that.createPoint(cartesian.clone());
          that.floatPosition = cartesian.clone();
          that.floatPoint.typeAttr = "float";
          that.entity = that.createCircle(that.position, that.radius);
        } else {
          if (that.entity) {
            that.floatPosition = cartesian.clone();
            that.state = "endCreate";

            if (that.handler) {
              that.handler.destroy();
              that.handler = null;
            }

            if (that.floatPoint) that.floatPoint.show = false;
            if (that.centerPoint) that.centerPoint.show = false;

            if (that.prompt) {
              that.prompt.destroy();
              that.prompt = null;
            }

            if (callBack) callBack(that.entity);
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.setInputAction(function (evt) {
        // 移动时绘制线
        if (!that.centerPoint) {
          that.prompt.update(evt.endPosition, "单击开始绘制");
          return;
        }

        that.state = "creating";
        that.prompt.update(evt.endPosition, "再次单击结束");
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
        if (!cartesian) return;

        if (that.floatPoint) {
          that.floatPoint.position.setValue(cartesian);
          that.floatPosition = cartesian.clone();
        }

        that.radius = Cesium.Cartesian3.distance(cartesian, that.position);
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
  }, {
    key: "createByPositions",
    value: function createByPositions(lnglatArr, callback) {
      if (!lnglatArr || lnglatArr.length < 1) return;
      this.state = "startCreate";

      if (Array.isArray(lnglatArr)) {
        // 第一种 传入中间点坐标和边界上某点坐标
        var isCartesian3 = lnglatArr[0] instanceof Cesium.Cartesian3;
        var positions = [];

        if (isCartesian3) {
          positions = lnglatArr;
        } else {
          positions = cUtil$1.lnglatsToCartesians(lnglatArr);
        }

        if (!positions || positions.length < 1) return;
        this.position = positions[0].clone();
        this.radius = Cesium.Cartesian3.distance(this.position, positions[1]);
        this.floatPosition = positions[1].clone();
      } else {
        // 第二种 传入中间点坐标和半径
        this.position = lnglatArr.position;
        this.radius = lnglatArr.radius;
        this.floatPosition = cUtil$1.getPositionByLength();
      }

      this.centerPoint = this.createPoint(this.position);
      this.centerPoint.typeAttr = "center";
      this.floatPoint = this.createPoint(this["float"]);
      this.floatPoint.typeAttr = "float";
      this.entity = this.createCircle(this.position, this.radius);
      this.state = "endCreate";
      if (callback) callback(this.entity);
    }
  }, {
    key: "startEdit",
    value: function startEdit(callback) {
      if (this.state == "startEdit" || this.state == "editing" || !this.entity) return;
      this.state = "startEdit";
      if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
      var that = this;
      if (that.floatPoint) that.floatPoint.show = true;
      if (that.centerPoint) that.centerPoint.show = true;
      this.modifyHandler.setInputAction(function (evt) {
        if (!that.entity) return;
        that.state = "editing";
        var pick = that.viewer.scene.pick(evt.position);

        if (Cesium.defined(pick) && pick.id) {
          if (!pick.id.objId) that.modifyPoint = pick.id;
          that.forbidDrawWorld(true);
        } else {
          if (that.floatPoint) that.floatPoint.show = false;
          if (that.centerPoint) that.centerPoint.show = false;

          if (that.modifyHandler) {
            that.modifyHandler.destroy();
            that.modifyHandler = null;
            if (callback) callback(that.entity);
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      this.modifyHandler.setInputAction(function (evt) {
        if (!that.modifyPoint) return;
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
        if (!cartesian) return;
        that.state = "editing";

        if (that.modifyPoint.typeAttr == "center") {
          var subtract = Cesium.Cartesian3.subtract(cartesian, that.position, new Cesium.Cartesian3());
          that.position = cartesian;
          that.centerPoint.position.setValue(that.position);
          that.entity.position.setValue(that.position);
          that.floatPosition = Cesium.Cartesian3.add(that["float"], subtract, new Cesium.Cartesian3());
          that.floatPoint.position.setValue(that["float"]);
        } else {
          that.floatPosition = cartesian;
          that.floatPoint.position.setValue(that["float"]);
          that.radius = Cesium.Cartesian3.distance(that["float"], that.position);
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      this.modifyHandler.setInputAction(function (evt) {
        if (!that.modifyPoint) return;
        that.modifyPoint = null;
        that.forbidDrawWorld(false);
        that.state = "editing";
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
    }
  }, {
    key: "endEdit",
    value: function endEdit(callback) {
      if (this.floatPoint) this.floatPoint.show = false;
      if (this.centerPoint) this.centerPoint.show = false;

      if (this.modifyHandler) {
        this.modifyHandler.destroy();
        this.modifyHandler = null;
        if (callback) callback(this.entity);
      }

      this.forbidDrawWorld(false);
      this.state = "endEdit";
    }
  }, {
    key: "createCircle",
    value: function createCircle() {
      var that = this;
      var defauteObj = {
        semiMajorAxis: new Cesium.CallbackProperty(function () {
          return that.radius;
        }, false),
        semiMinorAxis: new Cesium.CallbackProperty(function () {
          return that.radius;
        }, false),
        material: this.style.color instanceof Cesium.Color ? this.style.color : this.style.color ? Cesium.Color.fromCssColorString(this.style.color).withAlpha(this.style.colorAlpha || 1) : Cesium.Color.WHITE,
        outlineColor: this.style.outlineColor instanceof Cesium.Color ? this.style.outlineColor : this.style.outlineColor ? Cesium.Color.fromCssColorString(this.style.outlineColor).withAlpha(this.style.outlineColorAlpha || 1) : Cesium.Color.BLACK,
        outline: this.style.outline,
        outlineWidth: 1,
        fill: this.style.fill
      };

      if (!this.style.heightReference || Number(this.style.heightReference) == 0) {
        defauteObj.height = 100 ;
        defauteObj.heightReference = 0;
      } else {
        defauteObj.heightReference = 1;
      }

      var ellipse = this.viewer.entities.add({
        position: this.position,
        ellipse: defauteObj
      });
      ellipse.objId = this.objId;
      return ellipse;
    }
  }, {
    key: "setStyle",
    value: function setStyle(style) {
      if (!style) return;
      var color = Cesium.Color.fromCssColorString(style.color || "#ffff00");
      color = color.withAlpha(style.colorAlpha);
      this.entity.ellipse.material = color;
      this.entity.ellipse.outline = style.outline;
      this.entity.ellipse.outlineWidth = style.outlineWidth;
      var outlineColor = Cesium.Color.fromCssColorString(style.outlineColor || "#000000");
      outlineColor = outlineColor.withAlpha(style.outlineColorAlpha);
      this.entity.ellipse.outlineColor = outlineColor;
      this.entity.ellipse.heightReference = Number(style.heightReference);

      if (style.heightReference == 0) {
        this.entity.ellipse.height = Number(style.height);
        this.updatePointHeight(style.height);
      }

      this.entity.ellipse.fill = Boolean(style.fill);
      this.style = Object.assign(this.style, style);
    }
  }, {
    key: "getStyle",
    value: function getStyle() {
      var obj = {};
      var ellipse = this.entity.ellipse;
      var color = ellipse.material.color.getValue();
      obj.colorAlpha = color.alpha;
      obj.color = new Cesium.Color(color.red, color.green, color.blue, 1).toCssHexString();
      if (ellipse.outline) obj.outline = ellipse.outline.getValue();
      obj.outlineWidth = ellipse.outlineWidth._value;
      var outlineColor = ellipse.outlineColor.getValue();
      obj.outlineColorAlpha = outlineColor.alpha;
      obj.outlineColor = new Cesium.Color(outlineColor.red, outlineColor.green, outlineColor.blue, 1).toCssHexString();
      if (ellipse.height) obj.height = ellipse.height.getValue();
      if (ellipse.fill) obj.fill = ellipse.fill.getValue();
      obj.heightReference = ellipse.heightReference.getValue();
      return obj;
    }
  }, {
    key: "destroy",
    value: function destroy() {
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

      if (this.floatPoint) {
        this.viewer.entities.remove(this.floatPoint);
        this.floatPoint = null;
      }

      if (this.centerPoint) {
        this.viewer.entities.remove(this.centerPoint);
        this.centerPoint = null;
      }

      this.style = null;
      this.modifyPoint = null;
      if (this.prompt) this.prompt.destroy();
      this.forbidDrawWorld(false);
      this.state = "no";
    } // 修改点的高度

  }, {
    key: "updatePointHeight",
    value: function updatePointHeight(h) {
      var centerP = this.centerPoint.position.getValue();
      var floatP = this.floatPoint.position.getValue();
      centerP = cUtil$1.updatePositionsHeight([centerP], Number(this.style.height))[0];
      floatP = cUtil$1.updatePositionsHeight([floatP], Number(this.style.height))[0];
      this.centerPoint.position.setValue(centerP);
      this.floatPoint.position.setValue(floatP);
    }
  }, {
    key: "getPositions",
    value: function getPositions(isWgs84) {
      var positions = [];

      if (isWgs84) {
        positions = cUtil$1.cartesiansToLnglats([this.position, this.floatPosition]);
      } else {
        positions = [this.position, this.floatPosition];
      }

      return positions;
    }
  }]);

  return CreateCircle;
}(BasePlot);

var CreateGltfModel = /*#__PURE__*/function (_BasePlot) {
  _inherits(CreateGltfModel, _BasePlot);

  var _super = _createSuper(CreateGltfModel);

  function CreateGltfModel(viewer, style) {
    var _this;

    _classCallCheck(this, CreateGltfModel);

    _this = _super.call(this, viewer, style);
    _this.type = "gltfModel";
    style = style || {};
    _this.viewer = viewer;

    if (!style.uri) {
      console.warn("请输入模型地址！");
      return _possibleConstructorReturn(_this);
    }

    var defaultStyle = {
      heading: 0,
      pitch: 0,
      roll: 0,
      minimumPixelSize: 24,
      maximumScale: 120
    };
    _this.style = Object.assign(defaultStyle, style || {});
    _this.modelUri = style.uri;
    _this.entity = null;
    return _this;
  }

  _createClass(CreateGltfModel, [{
    key: "start",
    value: function start(callBack) {
      if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt$1(this.viewer, this.promptStyle);
      this.state = "startCreate";
      var that = this;
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
        var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);

        if (cartesian) {
          that.entity.position = cartesian;
          that.position = cartesian.clone();
        }

        that.state = "endCreate";

        if (that.handler) {
          that.handler.destroy();
          that.handler = null;
        }

        if (that.prompt) {
          that.prompt.destroy();
          that.prompt = null;
        }

        if (callBack) callBack(that.entity);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
        that.prompt.update(evt.endPosition, "单击新增");
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer, [that.entity]);
        if (!cartesian) return;

        if (!that.entity) {
          that.entity = that.createGltfModel(cartesian.clone());
        } else {
          that.entity.position = cartesian;
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
  }, {
    key: "createByPositions",
    value: function createByPositions(lnglatArr, callBack) {
      if (!lnglatArr) return;
      this.state = "startCreate";

      if (lnglatArr instanceof Cesium.Cartesian3) {
        this.position = lnglatArr;
      } else {
        this.position = Cesium.Cartesian3.fromDegrees(lnglatArr[0], lnglatArr[1], lnglatArr[2] || 0);
      }

      this.entity = this.createGltfModel(this.position);
      callBack(this.entity);
      this.state = "endCreate";
    }
  }, {
    key: "startEdit",
    value: function startEdit() {
      if (this.state == "startEdit" || this.state == "editing") return; //表示还没绘制完成

      if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
      var that = this;
      var eidtModel;
      this.state = "startEdit";
      this.modifyHandler.setInputAction(function (evt) {
        var pick = that.viewer.scene.pick(evt.position);

        if (Cesium.defined(pick) && pick.id) {
          eidtModel = pick.id;
          that.forbidDrawWorld(true);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      this.modifyHandler.setInputAction(function (evt) {
        if (!eidtModel) return;
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer, [that.entity]);
        if (!cartesian) return;

        if (that.entity) {
          that.entity.position.setValue(cartesian);
          that.position = cartesian.clone();
        }

        that.state = "editing";
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      this.modifyHandler.setInputAction(function (evt) {
        if (!eidtModel) return;
        that.forbidDrawWorld(false);

        if (that.modifyHandler) {
          that.modifyHandler.destroy();
          that.modifyHandler = null;
        }

        that.state = "editing";
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
    }
  }, {
    key: "endEdit",
    value: function endEdit(callback) {
      if (this.modifyHandler) {
        this.modifyHandler.destroy();
        this.modifyHandler = null;
        if (callback) callback(this.entity);
      }

      this.forbidDrawWorld(false);
      this.state = "endEdit";
    }
  }, {
    key: "createGltfModel",
    value: function createGltfModel(cartesian) {
      if (!cartesian) return;
      var heading = Cesium.Math.toRadians(this.style.heading);
      var pitch = Cesium.Math.toRadians(this.style.pitch);
      var roll = Cesium.Math.toRadians(this.style.roll);
      var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      var orientation = Cesium.Transforms.headingPitchRollQuaternion(cartesian, hpr);
      var entity = this.viewer.entities.add({
        position: cartesian,
        orientation: orientation,
        model: {
          uri: this.modelUri,
          minimumPixelSize: this.style.minimumPixelSize,
          maximumScale: this.style.maximumScale,
          scale: this.style.scale || 1,
          heightReference: this.style.heightReference
        }
      });
      entity.objId = this.objId;
      return entity;
    }
  }, {
    key: "getPositions",
    value: function getPositions(isWgs84) {
      return isWgs84 ? cUtil$1.cartesianToLnglat(this.position, this.viewer) : this.position;
    }
  }, {
    key: "getStyle",
    value: function getStyle() {
      var obj = {};
      var model = this.entity.model;
      obj.minimumPixelSize = model.minimumPixelSize.getValue();
      var orientation = this.entity.orientation.getValue();
      var p = this.entity.position.getValue(this.viewer.clock.currentTime);
      var hpr = cUtil$1.oreatationToHpr(p.clone(), orientation, true) || {};
      obj.heading = (hpr.heading || 0) < 360 ? hpr.heading + 360 : hpr.heading;
      obj.pitch = hpr.pitch || 0;
      obj.roll = hpr.roll || 0;
      obj.scale = model.scale.getValue();
      obj.uri = model.uri.getValue();
      return obj;
    }
  }, {
    key: "setStyle",
    value: function setStyle(style) {
      if (!style) return;
      this.setOrientation(style.heading, style.pitch, style.roll);
      this.entity.model.scale.setValue(style.scale == undefined ? 1 : style.scale);
      if (style.uri) this.entity.model.uri.setValue(style.uri);
      if (style.heightReference != undefined) this.entity.model.heightReference.setValue(Number(style.heightReference));
      this.style = Object.assign(this.style, style);
    }
  }, {
    key: "setOrientation",
    value: function setOrientation(h, p, r) {
      h = h || 0;
      p = p || 0;
      r = r || 0;
      this.style.heading = h;
      this.style.pitch = p;
      this.style.roll = r;
      var heading = Cesium.Math.toRadians(h || 0);
      var pitch = Cesium.Math.toRadians(p || 0);
      var roll = Cesium.Math.toRadians(r || 0);
      var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
      var position = this.entity.position._value;
      var orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);
      if (this.entity) this.entity.orientation = orientation;
    }
  }, {
    key: "remove",
    value: function remove() {
      if (this.entity) {
        this.state = "no";
        this.viewer.entities.remove(this.entity);
        this.entity = null;
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
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

      this.style = null;

      if (this.prompt) {
        that.prompt.destroy();
        this.prompt = null;
      }
    }
  }]);

  return CreateGltfModel;
}(BasePlot);

var CreateLabel = /*#__PURE__*/function (_BasePlot) {
  _inherits(CreateLabel, _BasePlot);

  var _super = _createSuper(CreateLabel);

  function CreateLabel(viewer, style) {
    var _this;

    _classCallCheck(this, CreateLabel);

    _this = _super.call(this, viewer, style);
    _this.type = "label";
    _this.objId = Number(new Date().getTime() + "" + Number(Math.random() * 1000).toFixed(0));
    _this.viewer = viewer;
    _this.style = style;
    _this.position = null;
    return _this;
  }

  _createClass(CreateLabel, [{
    key: "start",
    value: function start(callBack) {
      if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt$1(this.viewer, this.promptStyle);
      var that = this;
      this.state = "startCreate";
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
        var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
        if (!cartesian) return;
        that.prompt.update(evt.position, "\n        <ul class=\"label-context-".concat(that.objId, "\" objId=\"").concat(that.objId, "\">\n          <li>\u540D\u79F0\uFF1A<input type=\"text\" objId=\"").concat(that.objId, "\" id=\"label-name-").concat(that.objId, "\" /></li>\n          <li>\n              <input type=\"button\" value=\"\u786E\u5B9A\" objId=\"").concat(that.objId, "\" id=\"label-confirm-").concat(that.objId, "\"/>\n              <input type=\"button\" value=\"\u53D6\u6D88\" objId=\"").concat(that.objId, "\" id=\"label-reset-").concat(that.objId, "\"/>\n          </li>\n        <ul>\n      ")); // 事件绑定

        var confirmBtn = document.getElementById("label-confirm-".concat(that.objId));
        var resetBtn = document.getElementById("label-reset-".concat(that.objId));
        confirmBtn.addEventListener("click", function () {
          var objId = confirmBtn.getAttribute("objId");
          var inputName = document.getElementById("label-name-".concat(objId));
          var labelName = inputName.innerText();
          that.entity = that.createLabel(cartesian, labelName);
          that.position = cartesian;
          that.state = "endCreate";

          if (that.handler) {
            that.handler.destroy();
            that.handler = null;
          }

          if (that.prompt) {
            that.prompt.destroy();
            that.prompt = null;
          }

          if (callBack) callBack(that.entity);
        });
        resetBtn.addEventListener("click", function () {
          var objId = resetBtn.getAttribute("objId");
          that.destroy();
        });
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
        that.prompt.update(evt.endPosition, "单击新增");
        that.state = "startCreate";
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
  }, {
    key: "createByPositions",
    value: function createByPositions(lnglatArr, callBack) {
      if (!lnglatArr) return;
      this.state = "startCreate";
      var position = lnglatArr instanceof Cesium.Cartesian3 ? lnglatArr : Cesium.Cartesian3.fromDegrees(lnglatArr[0], lnglatArr[1], lnglatArr[2]);
      this.position = position;
      if (!position) return;
      this.entity = this.createLabel(position, this.style.text);
      if (callBack) callBack(this.entity);
      this.state = "endCreate";
    } // 设置相关样式

  }, {
    key: "setStyle",
    value: function setStyle(style) {
      if (!style) return;

      if (style.fillColor) {
        var fillColor = style.fillColor instanceof Cesium.Color ? style.fillColor : Cesium.Color.fromCssColorString(style.fillColor || "#ffff00");
        fillColor = fillColor.withAlpha(style.fillColorAlpha || 1);
        this.entity.label.fillColor = fillColor;
      }

      this.entity.label.outlineWidth = style.outlineWidth;

      if (style.backgroundColor) {
        var backgroundColor = style.backgroundColor instanceof Cesium.Color ? style.backgroundColor : Cesium.Color.fromCssColorString(style.backgroundColor || "#000000");
        backgroundColor = backgroundColor.withAlpha(style.backgroundColorAlpha || 1);
        this.entity.label.backgroundColor = backgroundColor;
      }

      if (style.heightReference != undefined) this.entity.label.heightReference = Number(style.heightReference);
      if (style.pixelOffset) this.entity.label.pixelOffset = style.pixelOffset;
      if (style.text) this.entity.label.text = style.text;
      if (style.showBackground != undefined) this.entity.label.showBackground = Boolean(style.showBackground);
      this.style = Object.assign(this.style, style);
    } // 获取相关样式

  }, {
    key: "getStyle",
    value: function getStyle() {
      var obj = {};
      var label = this.entity.label;
      var fillColor = label.fillColor.getValue();
      obj.fillColorAlpha = fillColor.alpha;
      obj.fillColor = new Cesium.Color(fillColor.red, fillColor.green, fillColor.blue, 1).toCssHexString();
      obj.outlineWidth = label.outlineWidth._value;
      var backgroundColor = label.backgroundColor.getValue();
      obj.backgroundColorAlpha = backgroundColor.alpha;
      obj.backgroundColor = new Cesium.Color(backgroundColor.red, backgroundColor.green, backgroundColor.blue, 1).toCssHexString();
      obj.showBackground = Boolean(label.showBackground.getValue());
      if (label.heightReference != undefined) obj.heightReference = label.heightReference.getValue();
      obj.pixelOffset = label.pixelOffset;
      obj.text = label.text.getValue();
      return obj;
    }
  }, {
    key: "getPositions",
    value: function getPositions(isWgs84) {
      return isWgs84 ? cUtil$1.cartesianToLnglat(this.position) : this.position;
    }
  }, {
    key: "startEdit",
    value: function startEdit() {
      if (this.state == "startEdit" || this.state == "editing" || !this.entity) return;
      this.state = "startEdit";
      if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
      var that = this;
      var editLabel;
      this.modifyHandler.setInputAction(function (evt) {
        var pick = that.viewer.scene.pick(evt.position);

        if (Cesium.defined(pick) && pick.id) {
          editLabel = pick.id;
          that.forbidDrawWorld(true);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      this.modifyHandler.setInputAction(function (evt) {
        if (!editLabel) return;
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
        if (!cartesian) return;

        if (that.entity) {
          that.entity.position.setValue(cartesian);
          that.position = cartesian;
          that.state = "editing";
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      this.modifyHandler.setInputAction(function (evt) {
        if (!editLabel) return;
        that.forbidDrawWorld(false);

        if (that.modifyHandler) {
          that.modifyHandler.destroy();
          that.modifyHandler = null;
          that.state = "editing";
        }
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
    }
  }, {
    key: "endEdit",
    value: function endEdit(callback) {
      if (this.modifyHandler) {
        this.modifyHandler.destroy();
        this.modifyHandler = null;
        if (callback) callback(this.entity);
      }

      this.forbidDrawWorld(false);
      this.state = "endEdit";
    }
  }, {
    key: "createLabel",
    value: function createLabel(cartesian, text) {
      if (!cartesian) return;
      var label = this.viewer.entities.add({
        position: cartesian,
        label: {
          text: text || "",
          fillColor: this.style.fillColor ? Cesium.Color.fromCssColorString(this.style.fillColor).withAlpha(this.style.fillColorAlpha || 1) : Cesium.Color.WHITE,
          backgroundColor: this.style.backgroundColor ? Cesium.Color.fromCssColorString(this.style.backgroundColor).withAlpha(this.style.backgroundColorAlpha || 1) : Cesium.Color.WHITE,
          style: Cesium.LabelStyle.FILL,
          outlineWidth: this.style.outlineWidth || 4,
          scale: this.style.scale || 1,
          pixelOffset: this.style.pixelOffset || Cesium.Cartesian2.ZERO,
          showBackground: this.style.showBackground,
          heightReference: this.style.heightReference || 0
        }
      });
      label.objId = this.objId;
      return label;
    }
  }]);

  return CreateLabel;
}(BasePlot);

var CreatePoint = /*#__PURE__*/function (_BasePlot) {
  _inherits(CreatePoint, _BasePlot);

  var _super = _createSuper(CreatePoint);

  function CreatePoint(viewer, style) {
    var _this;

    _classCallCheck(this, CreatePoint);

    _this = _super.call(this, viewer, style);
    _this.type = "point";
    _this.viewer = viewer;
    var defaultStyle = {
      color: Cesium.Color.AQUA,
      pixelSize: 10,
      outlineWidth: 1
    };
    _this.style = Object.assign(defaultStyle, style || {});
    _this.position = null;
    return _this;
  }

  _createClass(CreatePoint, [{
    key: "start",
    value: function start(callBack) {
      if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt$1(this.viewer, this.promptStyle);
      this.state = "startCreate";
      var that = this;
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
        var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
        if (!cartesian) return;
        that.entity = that.createPoint(cartesian);
        that.position = cartesian;
        that.state = "endCreate";

        if (that.handler) {
          that.handler.destroy();
          that.handler = null;
        }

        if (that.prompt) {
          that.prompt.destroy();
          that.prompt = null;
        }

        if (callBack) callBack(that.entity);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
        that.prompt.update(evt.endPosition, "单击新增");
        that.state = "startCreate";
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
  }, {
    key: "createByPositions",
    value: function createByPositions(lnglatArr, callBack) {
      if (!lnglatArr) return;
      this.state = "startCreate";
      var position = lnglatArr instanceof Cesium.Cartesian3 ? lnglatArr : Cesium.Cartesian3.fromDegrees(lnglatArr[0], lnglatArr[1], lnglatArr[2]);
      this.position = position;
      if (!position) return;
      this.entity = this.createPoint(position);
      if (callBack) callBack(this.entity);
      this.state = "endCreate";
    } // 设置相关样式

  }, {
    key: "setStyle",
    value: function setStyle(style) {
      if (!style) return;

      if (style.color) {
        var color = Cesium.Color.fromCssColorString(style.color || "#ffff00");
        color = color.withAlpha(style.colorAlpha);
        this.entity.point.color = color;
      }

      this.entity.point.outlineWidth = Number(style.outlineWidth);

      if (style.outlineColor) {
        var outlineColor = Cesium.Color.fromCssColorString(style.outlineColor || "#000000");
        outlineColor = outlineColor.withAlpha(style.outlineColorAlpha);
        this.entity.point.outlineColor = outlineColor;
      }

      this.entity.point.heightReference = Number(style.heightReference);
      this.entity.point.pixelSize = Number(style.pixelSize);
      this.style = Object.assign(this.style, style);
    } // 获取相关样式

  }, {
    key: "getStyle",
    value: function getStyle() {
      var obj = {};
      var point = this.entity.point;
      var color = point.color.getValue();
      obj.colorAlpha = color.alpha;
      obj.color = new Cesium.Color(color.red, color.green, color.blue, 1).toCssHexString();
      obj.outlineWidth = point.outlineWidth._value;
      var outlineColor = point.outlineColor.getValue();
      obj.outlineColorAlpha = outlineColor.alpha;
      obj.outlineColor = new Cesium.Color(outlineColor.red, outlineColor.green, outlineColor.blue, 1).toCssHexString();
      if (point.heightReference != undefined) obj.heightReference = point.heightReference.getValue();
      obj.pixelSize = Number(point.pixelSize);
      return obj;
    }
  }, {
    key: "getPositions",
    value: function getPositions(isWgs84) {
      return isWgs84 ? cUtil$1.cartesianToLnglat(this.position) : this.position;
    }
  }, {
    key: "startEdit",
    value: function startEdit() {
      if (this.state == "startEdit" || this.state == "editing" || !this.entity) return;
      this.state = "startEdit";
      if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
      var that = this;
      var editPoint;
      this.modifyHandler.setInputAction(function (evt) {
        var pick = that.viewer.scene.pick(evt.position);

        if (Cesium.defined(pick) && pick.id) {
          editPoint = pick.id;
          that.forbidDrawWorld(true);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      this.modifyHandler.setInputAction(function (evt) {
        if (!editPoint) return;
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
        if (!cartesian) return;

        if (that.entity) {
          that.entity.position.setValue(cartesian);
          that.position = cartesian;
          that.state = "editing";
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      this.modifyHandler.setInputAction(function (evt) {
        if (!editPoint) return;
        that.forbidDrawWorld(false);

        if (that.modifyHandler) {
          that.modifyHandler.destroy();
          that.modifyHandler = null;
          that.state = "editing";
        }
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
    }
  }, {
    key: "endEdit",
    value: function endEdit(callback) {
      if (this.modifyHandler) {
        this.modifyHandler.destroy();
        this.modifyHandler = null;
        if (callback) callback(this.entity);
      }

      this.forbidDrawWorld(false);
      this.state = "endEdit";
    }
  }, {
    key: "createPoint",
    value: function createPoint(cartesian) {
      if (!cartesian) return;
      var point = this.viewer.entities.add({
        position: cartesian,
        point: {
          color: this.style.color instanceof Cesium.Color ? this.style.color : this.style.color ? Cesium.Color.fromCssColorString(this.style.color).withAlpha(this.style.colorAlpha || 1) : Cesium.Color.WHITE,
          outlineColor: this.style.outlineColor instanceof Cesium.Color ? this.style.outlineColor : this.style.outlineColor ? Cesium.Color.fromCssColorString(this.style.outlineColor).withAlpha(this.style.outlineColorAlpha || 1) : Cesium.Color.BLACK,
          outlineWidth: this.style.outlineWidth || 4,
          pixelSize: this.style.pixelSize || 20
        }
      });
      point.objId = this.objId;
      return point;
    }
  }]);

  return CreatePoint;
}(BasePlot);

var CreatePolygon = /*#__PURE__*/function (_BasePlot) {
  _inherits(CreatePolygon, _BasePlot);

  var _super = _createSuper(CreatePolygon);

  function CreatePolygon(viewer, style) {
    var _this;

    _classCallCheck(this, CreatePolygon);

    _this = _super.call(this, viewer, style);
    _this.type = "polygon";
    _this.viewer = viewer;
    _this.entity = null;
    _this.polyline = null;
    var defaultStyle = {
      outlineColor: "#000000",
      outlineWidth: 2
    };
    _this.style = Object.assign(defaultStyle, style || {});
    _this.outline = null;
    return _this;
  }

  _createClass(CreatePolygon, [{
    key: "start",
    value: function start(callBack) {
      if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt$1(this.viewer, this.promptStyle);
      this.state = "startCreate";
      var that = this;
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
        var cartesian = that.getCatesian3FromPX(evt.position, that.viewer, []);
        if (!cartesian) return;

        if (that.movePush) {
          that.positions.pop();
          that.movePush = false;
        }

        that.positions.push(cartesian);
        var point = that.createPoint(cartesian);
        point.wz = that.positions.length - 1;
        that.controlPoints.push(point);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.setInputAction(function (evt) {
        //移动时绘制面
        if (that.positions.length < 1) {
          that.prompt.update(evt.endPosition, "单击开始绘制");
          that.state = "startCreate";
          return;
        }

        if (that.prompt) that.prompt.update(evt.endPosition, "双击结束，右键取消上一步");
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer, []);

        if (that.positions.length >= 1) {
          that.state = "creating";

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
            if (!Cesium.defined(that.entity)) {
              that.entity = that.createPolygon(that.style);

              if (!that.style.outline && that.polyline) {
                // 不需要创建轮廓 则后续删除
                that.polyline.show = false;
              }

              that.entity.objId = that.objId;
            }
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      this.handler.setInputAction(function (evt) {
        if (!that.entity) return;
        that.positions.splice(that.positions.length - 2, 1);
        that.viewer.entities.remove(that.controlPoints.pop());

        if (that.positions.length == 2) {
          if (that.entity) {
            that.viewer.entities.remove(that.entity);
            that.entity = null;
            if (that.polyline) that.polyline.show = true;
          }
        }

        if (that.positions.length == 1) {
          if (that.polyline) {
            that.viewer.entities.remove(that.polyline);
            that.polyline = null;
          }

          if (that.prompt) that.prompt.update(evt.endPosition, "单击开始绘制");
          that.positions = [];
          that.movePush = false;
        }
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      this.handler.setInputAction(function (evt) {
        //双击结束绘制
        if (!that.entity) return;
        that.state = "endCreate";
        that.positions.pop();
        that.viewer.entities.remove(that.controlPoints.pop());

        if (that.handler) {
          that.handler.destroy();
          that.handler = null;
        }

        that.movePush = false;

        if (that.prompt) {
          that.prompt.destroy();
          that.prompt = null;
        }

        that.viewer.trackedEntity = undefined;
        that.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        if (callBack) callBack(that.entity);
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }
  }, {
    key: "createByPositions",
    value: function createByPositions(lnglatArr, callBack) {
      //通过传入坐标数组创建面
      if (!lnglatArr) return;
      this.state = "startCreate";
      var positions = lnglatArr[0] instanceof Cesium.Cartesian3 ? lnglatArr : cUtil$1.lnglatsToCartesians(lnglatArr);
      if (!positions) return;
      this.entity = this.createPolygon();
      this.polyline = this.createPolyline();
      this.polyline.show = this.style.outline;
      this.positions = positions;

      for (var i = 0; i < positions.length; i++) {
        var newP = positions[i];
        var ctgc = Cesium.Cartographic.fromCartesian(positions[i]);

        if (this.style.heightReference) {
          ctgc.height = this.viewer.scene.sampleHeight(ctgc);
          newP = Cesium.Cartographic.toCartesian(ctgc);
        }

        var point = this.createPoint(newP);
        point.ctgc = ctgc;
        point.wz = this.controlPoints.length;
        this.controlPoints.push(point);
      }

      this.state = "endCreate";
      this.entity.objId = this.objId;
      if (callBack) callBack(this.entity);
    }
  }, {
    key: "getStyle",
    value: function getStyle() {
      if (!this.entity) return;
      var obj = {};
      var polygon = this.entity.polygon;

      if (polygon.material instanceof Cesium.ColorMaterialProperty) {
        obj.material = "common";
        var color = polygon.material.color.getValue();
        obj.colorAlpha = color.alpha;
        obj.color = new Cesium.Color(color.red, color.green, color.blue, 1).toCssHexString();
      }

      obj.fill = polygon.fill ? polygon.fill.getValue() : false;

      if (polygon.heightReference) {
        var heightReference = polygon.heightReference.getValue();
        obj.heightReference = Boolean(heightReference);
      }
      /* obj.heightReference = isNaN(polygon.heightReference.getValue()) ? false : polygon.heightReference.getValue(); */


      var outline = this.polyline.polyline;

      if (outline && this.polyline.show) {
        obj.outlineWidth = outline.width.getValue();
        /* obj.outline = "show"; */

        obj.outline = true;
        var oColor = outline.material.color.getValue();
        obj.outlineColorAlpha = oColor.alpha;
        obj.outlineColor = new Cesium.Color(oColor.red, oColor.green, oColor.blue, 1).toCssHexString();
      } else {
        /* obj.outline = "hide"; */
        obj.outline = false;
      }

      return obj;
    } // 设置相关样式

  }, {
    key: "setStyle",
    value: function setStyle(style) {
      if (!style) return; // 由于官方api中的outline限制太多 此处outline为重新构建的polyline

      /* this.polyline.show = style.outline.show == "show" ? true : false; */

      this.polyline.show = style.outline;
      var outline = this.polyline.polyline;
      outline.width = style.outlineWidth;
      this.polyline.clampToGround = Boolean(style.heightReference);
      var outlineColor = style.outlineColor instanceof Cesium.Color ? style.outlineColor : Cesium.Color.fromCssColorString(style.outlineColor);
      var outlineMaterial = outlineColor.withAlpha(style.outlineColorAlpha || 1);
      outline.material = outlineMaterial;
      if (style.heightReference != undefined) this.entity.polygon.heightReference = Number(style.heightReference);
      var color = style.color instanceof Cesium.Color ? style.color : Cesium.Color.fromCssColorString(style.color);
      var material = color.withAlpha(style.colorAlpha || 1);
      this.entity.polygon.material = material;
      if (style.fill != undefined) this.entity.polygon.fill = style.fill;
      this.style = Object.assign(this.style, style);
    }
  }, {
    key: "createPolygon",
    value: function createPolygon() {
      var that = this;
      this.style.color = this.style.color || Cesium.Color.WHITE;
      this.style.outlineColor = this.style.outlineColor || Cesium.Color.BLACK;
      var polygonObj = {
        polygon: {
          hierarchy: new Cesium.CallbackProperty(function () {
            return new Cesium.PolygonHierarchy(that.positions);
          }, false),
          heightReference: Number(this.style.heightReference),
          show: true,
          fill: this.style.fill || true,
          material: this.style.color instanceof Cesium.Color ? this.style.color : Cesium.Color.fromCssColorString(this.style.color).withAlpha(this.style.colorAlpha || 1)
        }
      };

      if (!this.style.heightReference) {
        polygonObj.polygon.height = 0; // 不贴地 必设

        polygonObj.polygon.perPositionHeight = true; // 启用点的真实高度
      }

      return this.viewer.entities.add(polygonObj);
    }
  }, {
    key: "createPolyline",
    value: function createPolyline() {
      var that = this;
      return this.viewer.entities.add({
        polyline: {
          positions: new Cesium.CallbackProperty(function () {
            var newPositions = that.positions.concat(that.positions[0]);
            return newPositions;
          }, false),
          clampToGround: Boolean(this.style.heightReference),
          material: this.style.outlineColor instanceof Cesium.Color ? this.style.outlineColor : Cesium.Color.fromCssColorString(this.style.outlineColor).withAlpha(this.style.outlineColorAlpha || 1),
          width: this.style.outlineWidth || 1
        }
      });
    }
  }, {
    key: "destroy",
    value: function destroy() {
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

      for (var i = 0; i < this.controlPoints.length; i++) {
        var point = this.controlPoints[i];
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
  }]);

  return CreatePolygon;
}(BasePlot);

var CreateRectangle = /*#__PURE__*/function (_BasePlot) {
  _inherits(CreateRectangle, _BasePlot);

  var _super = _createSuper(CreateRectangle);

  function CreateRectangle(viewer, style) {
    var _this;

    _classCallCheck(this, CreateRectangle);

    _this = _super.call(this, viewer, style);
    _this.type = "rectangle";
    _this.viewer = viewer;
    _this.style = style;
    _this.rightdownPoint = null;
    _this.leftupPoint = null;
    _this.leftup = null;
    _this.rightdown = null;
    _this.radius = 0;
    _this.modifyPoint = null;
    _this.pointArr = [];
    return _this;
  }

  _createClass(CreateRectangle, [{
    key: "start",
    value: function start(callBack) {
      if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt$1(this.viewer, this.promptStyle);
      this.state = "startCreate";
      var that = this;
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
        var cartesian = that.getCatesian3FromPX(evt.position, that.viewer, []);
        if (!cartesian) return;

        if (!that.leftupPoint) {
          that.leftup = cartesian;
          that.leftupPoint = that.createPoint(cartesian);
          that.leftupPoint.typeAttr = "leftup";
          that.rightdownPoint = that.createPoint(cartesian.clone());
          that.rightdown = cartesian.clone();
          that.rightdownPoint.typeAttr = "rightdown";
          that.entity = that.createRectangle(that.leftup, that.radius);
        } else {
          if (!that.entity) {
            return;
          }

          that.state = "endCreate";

          if (that.handler) {
            that.handler.destroy();
            that.handler = null;
          }

          if (that.rightdownPoint) that.rightdownPoint.show = false;
          if (that.leftupPoint) that.leftupPoint.show = false;

          if (that.prompt) {
            that.prompt.destroy();
            that.prompt = null;
          }

          if (callBack) callBack(that.entity);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.setInputAction(function (evt) {
        //移动时绘制线
        if (!that.leftupPoint) {
          that.prompt.update(evt.endPosition, "单击开始绘制");
          that.state = "startCreate";
          return;
        }

        that.prompt.update(evt.endPosition, "单击结束");
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer, []);
        if (!cartesian) return;

        if (that.rightdownPoint) {
          that.rightdownPoint.position.setValue(cartesian);
          that.rightdown = cartesian.clone();
          that.state = "creating";
        }

        that.radius = Cesium.Cartesian3.distance(cartesian, that.leftup);
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
  }, {
    key: "startEdit",
    value: function startEdit(callback) {
      if (this.state == "startEdit" || this.state == "editing" || !this.entity) return;
      this.state = "startEdit";
      if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
      var that = this;
      if (that.rightdownPoint) that.rightdownPoint.show = true;
      if (that.leftupPoint) that.leftupPoint.show = true;
      this.modifyHandler.setInputAction(function (evt) {
        if (!that.entity) return;
        var pick = that.viewer.scene.pick(evt.position);

        if (Cesium.defined(pick) && pick.id) {
          if (!pick.id.objId) that.modifyPoint = pick.id;
          that.forbidDrawWorld(true);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      this.modifyHandler.setInputAction(function (evt) {
        if (!that.modifyPoint) return;
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer, [that.entity, that.modifyPoint]);

        if (!cartesian) {
          return;
        }

        that.state == "editing";

        if (that.modifyPoint.typeAttr == "leftup") {
          that.leftup = cartesian;
          that.leftupPoint.position.setValue(that.leftup);
          that.entity.position.setValue(that.leftup);
        } else {
          that.rightdown = cartesian;
          that.rightdownPoint.position.setValue(that.rightdown);
        }

        that.radius = Cesium.Cartesian3.distance(that.rightdown, that.leftup);
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      this.modifyHandler.setInputAction(function (evt) {
        if (!that.modifyPoint) return;
        that.modifyPoint = null;
        that.forbidDrawWorld(false);
        that.state == "editing";
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
    }
  }, {
    key: "endEdit",
    value: function endEdit(callback) {
      if (this.rightdownPoint) this.rightdownPoint.show = false;
      if (this.leftupPoint) this.leftupPoint.show = false;

      if (this.modifyHandler) {
        this.modifyHandler.destroy();
        this.modifyHandler = null;
        if (callback) callback(this.entity);
      }

      this.forbidDrawWorld(false);
      this.state = "endEdit";
    }
  }, {
    key: "createRectangle",
    value: function createRectangle() {
      var that = this;
      var rectangle = this.viewer.entities.add({
        rectangle: {
          coordinates: new Cesium.CallbackProperty(function () {
            return Cesium.Rectangle.fromCartesianArray([that.leftup, that.rightdown]);
          }, false),
          heightReference: this.style.heightReference || 0,
          show: true,
          fill: this.style.fill || true,
          material: this.style.color instanceof Cesium.Color ? this.style.color : this.style.color ? Cesium.Color.fromCssColorString(this.style.color).withAlpha(this.style.colorAlpha || 1) : Cesium.Color.WHITE,
          outlineColor: this.style.outlineColor instanceof Cesium.Color ? this.style.outlineColor : this.style.outlineColor ? Cesium.Color.fromCssColorString(this.style.outlineColor).withAlpha(this.style.outlineColorAlpha || 1) : Cesium.Color.BLACK,
          outlineWidth: 1,
          outline: this.style.outline
        }
      });
      rectangle.objId = this.objId;
      return rectangle;
    }
  }, {
    key: "getPositions",
    value: function getPositions(isWgs84) {
      var positions = [];

      if (isWgs84) {
        positions = cUtil.cartesiansToLnglats([this.leftup, this.rightdown]);
      } else {
        positions = [this.leftup, this.rightdown];
      }

      return positions;
    }
  }, {
    key: "getStyle",
    value: function getStyle() {
      var obj = {};
      var rectangle = this.entity.rectangle;
      var color = rectangle.material.color.getValue();
      obj.colorAlpha = color.alpha;
      obj.color = new Cesium.Color(color.red, color.green, color.blue, 1).toCssHexString();
      if (rectangle.outline) obj.outline = rectangle.outline.getValue();
      obj.outlineWidth = rectangle.outlineWidth._value;
      var outlineColor = rectangle.outlineColor.getValue();
      obj.outlineColorAlpha = outlineColor.alpha;
      obj.outlineColor = new Cesium.Color(outlineColor.red, outlineColor.green, outlineColor.blue, 1).toCssHexString();
      if (obj.height) obj.height = rectangle.height.getValue();
      if (rectangle.fill) obj.fill = rectangle.fill.getValue();
      obj.heightReference = rectangle.heightReference.getValue();
      return obj;
    }
  }, {
    key: "setStyle",
    value: function setStyle(style) {
      if (!style) return;
      var color = style.color instanceof Cesium.Color ? style.color : Cesium.Color.fromCssColorString(style.color || "#ffff00");
      if (style.colorAlpha) color = color.withAlpha(style.colorAlpha);
      this.entity.rectangle.material = color;
      this.entity.rectangle.outline = style.outline;
      this.entity.rectangle.outlineWidth = style.outlineWidth;
      var outlineColor = style.outlineColor instanceof Cesium.Color ? style.outlineColor : Cesium.Color.fromCssColorString(style.outlineColor || "#000000");
      if (style.outlineColorAlpha) outlineColor = outlineColor.withAlpha(style.outlineColorAlpha);
      this.entity.rectangle.outlineColor = outlineColor;
      this.entity.rectangle.heightReference = Number(style.heightReference);

      if (style.heightReference == 0) {
        this.entity.rectangle.height = Number(style.height);
        this.updatePointHeight(style.height);
      }

      this.entity.rectangle.fill = Boolean(style.fill);
      this.style = Object.assign(this.style, style);
    }
  }]);

  return CreateRectangle;
}(BasePlot);

var CreatePolyline = /*#__PURE__*/function (_BasePlot) {
  _inherits(CreatePolyline, _BasePlot);

  var _super = _createSuper(CreatePolyline);

  function CreatePolyline(viewer, opt) {
    var _this;

    _classCallCheck(this, CreatePolyline);

    _this = _super.call(this, viewer, opt);
    opt = opt || {};
    _this = _super.call(this, viewer, opt);
    _this.movePush = false;
    _this.type = "polyline";
    _this.maxPointNum = opt.maxPointNum || Number.MAX_VALUE; // 最多点数

    return _this;
  }

  _createClass(CreatePolyline, [{
    key: "start",
    value: function start(callBack) {
      if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt$1(this.viewer, this.promptStyle);
      this.state = "startCreate";
      var that = this;
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
        var cartesian = that.getCatesian3FromPX(evt.position, that.viewer, [that.entity]);
        if (!cartesian) return;

        if (that.movePush) {
          that.positions.pop();
          that.movePush = false;
        }

        that.positions.push(cartesian);
        var point = that.createPoint(cartesian);
        point.wz = that.positions.length - 1;
        that.controlPoints.push(point); // 达到最大数量 结束绘制

        if (that.positions.length == that.maxPointNum) {
          that.state = "endCreate";

          if (that.handler) {
            that.handler.destroy();
            that.handler = null;
          }

          if (that.prompt) {
            that.prompt.destroy();
            that.prompt = null;
          }

          that.viewer.trackedEntity = undefined;
          that.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
          if (callBack) callBack(that.entity);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.setInputAction(function (evt) {
        //移动时绘制线
        that.state = "creating";

        if (that.positions.length < 1) {
          that.prompt.update(evt.endPosition, "单击开始绘制");
          that.state = "startCreate";
          return;
        }

        that.prompt.update(evt.endPosition, "右键取消上一步，双击结束");
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer, [that.entity]);
        if (!cartesian) return;

        if (!that.movePush) {
          that.positions.push(cartesian);
          that.movePush = true;
        } else {
          that.positions[that.positions.length - 1] = cartesian;
        }

        if (that.positions.length == 2) {
          if (!Cesium.defined(that.entity)) {
            that.entity = that.createPolyline();
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      this.handler.setInputAction(function (evt) {
        //右键取消上一步
        if (!that.entity) {
          return;
        }

        that.positions.splice(that.positions.length - 2, 1);
        that.viewer.entities.remove(that.controlPoints.pop());

        if (that.positions.length == 1) {
          if (that.entity) {
            that.viewer.entities.remove(that.entity);
            that.entity = null;
          }

          that.prompt.update(evt.endPosition, "单击开始绘制");
          that.movePush = false;
          that.positions = [];
        }
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      this.handler.setInputAction(function (evt) {
        //双击结束绘制
        if (!that.entity) {
          return;
        }

        that.state = "endCreate";

        if (that.handler) {
          that.handler.destroy();
          that.handler = null;
        }

        that.positions.pop();
        that.viewer.entities.remove(that.controlPoints.pop());

        if (that.prompt) {
          that.prompt.destroy();
          that.prompt = null;
        }

        that.viewer.trackedEntity = undefined;
        that.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        if (callBack) callBack(that.entity);
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }
  }, {
    key: "createByPositions",
    value: function createByPositions(lnglatArr, callBack) {
      //通过传入坐标数组创建面
      if (!lnglatArr || lnglatArr.length < 1) return;
      this.state = "startCreate";
      var positions = lnglatArr[0] instanceof Cesium.Cartesian3 ? lnglatArr : cUtil.lnglatsToCartesians(lnglatArr);
      if (!positions) return;
      this.entity = this.createPolyline(this.style);
      this.positions = positions;
      if (callBack) callBack(this.entity);

      for (var i = 0; i < positions.length; i++) {
        var newP = positions[i];

        if (this.style.clampToGround) {
          var ctgc = Cesium.Cartographic.fromCartesian(positions[i]);
          ctgc.height = this.viewer.scene.sampleHeight(ctgc);
          newP = Cesium.Cartographic.toCartesian(ctgc);
        }

        var point = this.createPoint(newP);
        point.wz = this.controlPoints.length;
        this.controlPoints.push(point);
      }

      this.state = "endCreate";
    }
  }, {
    key: "setStyle",
    value: function setStyle(style) {
      if (!style) return;
      var material = undefined;

      if (style.lineType) {
        material = this.getMaterial(style.lineType, style);
      } else {
        var color = style.color instanceof Cesium.Color ? style.color : Cesium.Color.fromCssColorString(style.color || "#000000");
        material = color.withAlpha(style.colorAlpha || 1);
      }

      this.entity.polyline.material = material;
      this.entity.polyline.clampToGround = Number(style.clampToGround);
      if (style.width) this.entity.polyline.width = style.width || 3;
      this.style = Object.assign(this.style, style);
    } // 获取相关样式

  }, {
    key: "getStyle",
    value: function getStyle() {
      if (!this.entity) return;
      var obj = {};
      var polyline = this.entity.polyline;

      if (this.style.lineType != undefined) {
        obj.lineType = this.style.lineType;
        obj.image = this.style.image;
        obj.duration = this.style.duration;
      }

      if (polyline.material instanceof Cesium.ColorMaterialProperty) {
        obj.material = "common";
      } else {
        if (polyline.material instanceof FlowLineMaterial) {
          obj.material = "flowLine";
        }

        if (polyline.material instanceof FlyLineMaterial) {
          obj.material = "flyLine";
        }

        obj.duration = polyline.material.duration;
      }

      var color = polyline.material.color.getValue();
      obj.colorAlpha = color.alpha;
      obj.color = new Cesium.Color(color.red, color.green, color.blue, 1).toCssHexString();
      obj.width = polyline.width._value;
      obj.clampToGround = polyline.clampToGround ? polyline.clampToGround.getValue() : false;
      return obj;
    }
  }, {
    key: "createPolyline",
    value: function createPolyline() {
      var that = this;
      var polyline = this.viewer.entities.add({
        polyline: {
          positions: new Cesium.CallbackProperty(function () {
            return that.positions;
          }, false),
          show: true,
          material: this.getMaterial(this.style.lineType, this.style),
          width: this.style.width || 3,
          clampToGround: this.style.clampToGround
        }
      });
      polyline.objId = this.objId;
      return polyline;
    }
  }, {
    key: "getMaterial",
    value: function getMaterial(lineType, style) {
      // 构建多种材质的线
      style = style || {};
      var material = null;

      if (lineType == "flowLine") {
        material = new FlowLineMaterial({
          color: style.color || Cesium.Color.RED,
          // 默认颜色
          image: style.image || "../img/texture/lineClr.png",
          duration: style.duration || 5000
        });
      } else if (lineType == "rainbowLine") {
        material = new FlowLineMaterial({
          image: style.image || "../img/texture/lineClr2.png",
          duration: style.duration || 5000
        });
      } else if (lineType == "flyLine") {
        material = new FlyLineMaterial({
          //动画线材质
          color: style.color || Cesium.Color.RED,
          duration: style.duration || 3000,
          image: style.image || "../img/texture/glow.png",
          repeat: new Cesium.Cartesian2(1, 1) //平铺

        });
      } else {
        material = style.color instanceof Cesium.Color ? style.color : style.color ? Cesium.Color.fromCssColorString(style.color).withAlpha(style.colorAlpha || 1) : Cesium.Color.WHITE;
      }

      return material;
    }
  }]);

  return CreatePolyline;
}(BasePlot);

// 箭头的基本计算方法
var ArrowUtil = /*#__PURE__*/function () {
  function ArrowUtil(opt) {
    _classCallCheck(this, ArrowUtil);

    this.FITTING_COUNT = 100;
    this.HALF_PI = Math.PI / 2;
    this.ZERO_TOLERANCE = 0.0001;
    this.TWO_PI = Math.PI * 2;
    this.headHeightFactor = opt.headHeightFactor;
    this.headWidthFactor = opt.headWidthFactor;
    this.neckHeightFactor = opt.neckHeightFactor;
    this.neckWidthFactor = opt.neckWidthFactor;
    this.headTailFactor = opt.headTailFactor;
    this.tailWidthFactor = opt.tailWidthFactor;
    this.swallowTailFactor = opt.swallowTailFactor;
  } //空间坐标转投影坐标


  _createClass(ArrowUtil, [{
    key: "cartesian32WeMercator",
    value: function cartesian32WeMercator(position) {
      if (!position) return;
      var lnglat = this.cartesianToLnglat(position);
      return this.lnglat2WeMercator(lnglat);
    } //投影坐标转空间坐标

  }, {
    key: "webMercator2Cartesian3",
    value: function webMercator2Cartesian3(arg) {
      if (!arg) return;
      var lnglat = this.webMercator2Lnglat(arg);
      return Cesium.Cartesian3.fromDegrees(lnglat[0], lnglat[1]);
    } //投影坐标转地理坐标

  }, {
    key: "webMercator2Lnglat",
    value: function webMercator2Lnglat(points) {
      if (!points) return;
      var x = points[0] / 20037508.34 * 180;
      var y = points[1] / 20037508.34 * 180;
      y = 180 / Math.PI * (2 * Math.atan(Math.exp(y * Math.PI / 180)) - Math.PI / 2);
      return [x, y];
    } //地理坐标转投影坐标

  }, {
    key: "lnglat2WeMercator",
    value: function lnglat2WeMercator(lnglat) {
      if (!lnglat) return;
      var x = lnglat[0] * 20037508.34 / 180;
      var y = Math.log(Math.tan((90 + lnglat[1]) * Math.PI / 360)) / (Math.PI / 180);
      y = y * 20037508.34 / 180;
      return [x, y];
    } //获取第三点 

  }, {
    key: "getThirdPoint",
    value: function getThirdPoint(startPnt, endPnt, angle, distance, clockWise) {
      var azimuth = this.getAzimuth(startPnt, endPnt);
      var alpha = clockWise ? azimuth + angle : azimuth - angle;
      var dx = distance * Math.cos(alpha);
      var dy = distance * Math.sin(alpha);
      return [endPnt[0] + dx, endPnt[1] + dy];
    } //计算夹角

  }, {
    key: "getAzimuth",
    value: function getAzimuth(startPoint, endPoint) {
      var azimuth = void 0;
      var angle = Math.asin(Math.abs(endPoint[1] - startPoint[1]) / this.MathDistance(startPoint, endPoint));

      if (endPoint[1] >= startPoint[1] && endPoint[0] >= startPoint[0]) {
        azimuth = angle + Math.PI;
      } else if (endPoint[1] >= startPoint[1] && endPoint[0] < startPoint[0]) {
        azimuth = Math.PI * 2 - angle;
      } else if (endPoint[1] < startPoint[1] && endPoint[0] < startPoint[0]) {
        azimuth = angle;
      } else if (endPoint[1] < startPoint[1] && endPoint[0] >= startPoint[0]) {
        azimuth = Math.PI - angle;
      }

      return azimuth;
    }
  }, {
    key: "MathDistance",
    value: function MathDistance(pnt1, pnt2) {
      var a = Math.pow(pnt1[0] - pnt2[0], 2);
      var b = Math.pow(pnt1[1] - pnt2[1], 2);
      var c = Math.sqrt(a + b) || 0.001; // 防止做分母  导致报错

      return c;
    } //计算闭合曲面上的点

  }, {
    key: "isClockWise",
    value: function isClockWise(pnt1, pnt2, pnt3) {
      return (pnt3[1] - pnt1[1]) * (pnt2[0] - pnt1[0]) > (pnt2[1] - pnt1[1]) * (pnt3[0] - pnt1[0]);
    }
  }, {
    key: "getBisectorNormals",
    value: function getBisectorNormals(t, pnt1, pnt2, pnt3) {
      var normal = this.getNormal(pnt1, pnt2, pnt3);
      var bisectorNormalRight = null,
          bisectorNormalLeft = null,
          dt = null,
          x = null,
          y = null;
      var dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
      var uX = normal[0] / dist;
      var uY = normal[1] / dist;
      var d1 = this.MathDistance(pnt1, pnt2);
      var d2 = this.MathDistance(pnt2, pnt3);

      if (dist > this.ZERO_TOLERANCE) {
        if (this.isClockWise(pnt1, pnt2, pnt3)) {
          dt = t * d1;
          x = pnt2[0] - dt * uY;
          y = pnt2[1] + dt * uX;
          bisectorNormalRight = [x, y];
          dt = t * d2;
          x = pnt2[0] + dt * uY;
          y = pnt2[1] - dt * uX;
          bisectorNormalLeft = [x, y];
        } else {
          dt = t * d1;
          x = pnt2[0] + dt * uY;
          y = pnt2[1] - dt * uX;
          bisectorNormalRight = [x, y];
          dt = t * d2;
          x = pnt2[0] - dt * uY;
          y = pnt2[1] + dt * uX;
          bisectorNormalLeft = [x, y];
        }
      } else {
        x = pnt2[0] + t * (pnt1[0] - pnt2[0]);
        y = pnt2[1] + t * (pnt1[1] - pnt2[1]);
        bisectorNormalRight = [x, y];
        x = pnt2[0] + t * (pnt3[0] - pnt2[0]);
        y = pnt2[1] + t * (pnt3[1] - pnt2[1]);
        bisectorNormalLeft = [x, y];
      }

      return [bisectorNormalRight, bisectorNormalLeft];
    }
  }, {
    key: "getCubicValue",
    value: function getCubicValue(t, startPnt, cPnt1, cPnt2, endPnt) {
      t = Math.max(Math.min(t, 1), 0);
      var tp = 1 - t,
          t2 = t * t;
      var t3 = t2 * t;
      var tp2 = tp * tp;
      var tp3 = tp2 * tp;
      var x = tp3 * startPnt[0] + 3 * tp2 * t * cPnt1[0] + 3 * tp * t2 * cPnt2[0] + t3 * endPnt[0];
      var y = tp3 * startPnt[1] + 3 * tp2 * t * cPnt1[1] + 3 * tp * t2 * cPnt2[1] + t3 * endPnt[1];
      return [x, y];
    }
  }, {
    key: "getNormal",
    value: function getNormal(pnt1, pnt2, pnt3) {
      var dX1 = pnt1[0] - pnt2[0];
      var dY1 = pnt1[1] - pnt2[1];
      var d1 = Math.sqrt(dX1 * dX1 + dY1 * dY1);
      dX1 /= d1;
      dY1 /= d1;
      var dX2 = pnt3[0] - pnt2[0];
      var dY2 = pnt3[1] - pnt2[1];
      var d2 = Math.sqrt(dX2 * dX2 + dY2 * dY2);
      dX2 /= d2;
      dY2 /= d2;
      var uX = dX1 + dX2;
      var uY = dY1 + dY2;
      return [uX, uY];
    }
  }, {
    key: "getArcPoints",
    value: function getArcPoints(center, radius, startAngle, endAngle) {
      var x = null,
          y = null,
          pnts = [],
          angleDiff = endAngle - startAngle;
      angleDiff = angleDiff < 0 ? angleDiff + Math.PI * 2 : angleDiff;

      for (var i = 0; i <= 100; i++) {
        var angle = startAngle + angleDiff * i / 100;
        x = center[0] + radius * Math.cos(angle);
        y = center[1] + radius * Math.sin(angle);
        pnts.push([x, y]);
      }

      return pnts;
    }
  }, {
    key: "getBaseLength",
    value: function getBaseLength(points) {
      return Math.pow(this.wholeDistance(points), 0.99);
    }
  }, {
    key: "wholeDistance",
    value: function wholeDistance(points) {
      var distance = 0;
      var that = this;

      if (points && Array.isArray(points) && points.length > 0) {
        points.forEach(function (item, index) {
          if (index < points.length - 1) {
            distance += that.MathDistance(item, points[index + 1]);
          }
        });
      }

      return distance;
    } // getArrowHeadPoints(obj) {
    //     if (!obj) return [];
    //     var points = obj.points;
    //     var tailLeft = obj.tailLeft;
    //     var tailRight = obj.tailRight;
    //     var headTailFactor = obj.headTailFactor;
    //     var neckWidthFactor = obj.neckWidthFactor;
    //     var neckHeightFactor = obj.neckHeightFactor;
    //     var headWidthFactor = obj.headWidthFactor;
    //     var headHeightFactor = obj.headHeightFactor;
    //     var len = this.getBaseLength(points);
    //     var headHeight = len * headHeightFactor;
    //     var headPnt = points[points.length - 1];
    //     len = this.MathDistance(headPnt, points[points.length - 2]);
    //     var tailWidth = this.MathDistance(tailLeft, tailRight);
    //     if (headHeight > tailWidth * headTailFactor) {
    //         headHeight = tailWidth * headTailFactor;
    //     }
    //     var headWidth = headHeight * headWidthFactor;
    //     var neckWidth = headHeight * neckWidthFactor;
    //     headHeight = headHeight > len ? len : headHeight;
    //     var neckHeight = headHeight * neckHeightFactor;
    //     var headEndPnt = this.getThirdPoint(points[points.length - 2], headPnt, 0, headHeight, true);
    //     var neckEndPnt = this.getThirdPoint(points[points.length - 2], headPnt, 0, neckHeight, true);
    //     var headLeft = this.getThirdPoint(headPnt, headEndPnt, this.HALF_PI, headWidth, false);
    //     var headRight = this.getThirdPoint(headPnt, headEndPnt, this.HALF_PI, headWidth, true);
    //     var neckLeft = this.getThirdPoint(headPnt, neckEndPnt, this.HALF_PI, neckWidth, false);
    //     var neckRight = this.getThirdPoint(headPnt, neckEndPnt, this.HALF_PI, neckWidth, true);
    //     return [neckLeft, headLeft, headPnt, headRight, neckRight];
    // }

  }, {
    key: "getArrowHeadPoints",
    value: function getArrowHeadPoints(points, tailLeft, tailRight) {
      this.DGIndex = points.length;
      this.points = points;
      var len = this.getBaseLength(points);
      var headHeight = len * this.headHeightFactor;
      var headPnt = points[points.length - 1];
      len = this.MathDistance(headPnt, points[points.length - 2]);
      var tailWidth = this.MathDistance(tailLeft, tailRight);

      if (headHeight > tailWidth * this.headTailFactor) {
        headHeight = tailWidth * this.headTailFactor;
      }

      var headWidth = headHeight * this.headWidthFactor;
      var neckWidth = headHeight * this.neckWidthFactor;
      headHeight = headHeight > len ? len : headHeight;
      var neckHeight = headHeight * this.neckHeightFactor;
      var headEndPnt = this.getThirdPoint(points[points.length - 2], headPnt, 0, headHeight, true);
      var neckEndPnt = this.getThirdPoint(points[points.length - 2], headPnt, 0, neckHeight, true);
      var headLeft = this.getThirdPoint(headPnt, headEndPnt, Math.PI / 2, headWidth, false);
      var headRight = this.getThirdPoint(headPnt, headEndPnt, Math.PI / 2, headWidth, true);
      var neckLeft = this.getThirdPoint(headPnt, neckEndPnt, Math.PI / 2, neckWidth, false);
      var neckRight = this.getThirdPoint(headPnt, neckEndPnt, Math.PI / 2, neckWidth, true);
      return [neckLeft, headLeft, headPnt, headRight, neckRight];
    }
  }, {
    key: "getArrowHeadPointsNoLR",
    value: function getArrowHeadPointsNoLR(points) {
      var len = this.getBaseLength(points);
      var headHeight = len * this.headHeightFactor;
      var headPnt = points[points.length - 1];
      var headWidth = headHeight * this.headWidthFactor;
      var neckWidth = headHeight * this.neckWidthFactor;
      var neckHeight = headHeight * this.neckHeightFactor;
      var headEndPnt = this.getThirdPoint(points[points.length - 2], headPnt, 0, headHeight, true);
      var neckEndPnt = this.getThirdPoint(points[points.length - 2], headPnt, 0, neckHeight, true);
      var headLeft = this.getThirdPoint(headPnt, headEndPnt, Math.PI / 2, headWidth, false);
      var headRight = this.getThirdPoint(headPnt, headEndPnt, Math.PI / 2, headWidth, true);
      var neckLeft = this.getThirdPoint(headPnt, neckEndPnt, Math.PI / 2, neckWidth, false);
      var neckRight = this.getThirdPoint(headPnt, neckEndPnt, Math.PI / 2, neckWidth, true);
      return [neckLeft, headLeft, headPnt, headRight, neckRight];
    } // getTailPoints(points) {
    //     if (!points) return;
    //     var tailWidthFactor = this.tailWidthFactor;
    //     var swallowTailFactor = this.swallowTailFactor;
    //     var allLen = this.getBaseLength(points);
    //     var tailWidth = allLen * tailWidthFactor;
    //     var tailLeft = this.getThirdPoint(points[1], points[0], this.HALF_PI, tailWidth, false);
    //     var tailRight = this.getThirdPoint(points[1], points[0], this.HALF_PI, tailWidth, true);
    //     var len = tailWidth * swallowTailFactor;
    //     var swallowTailPnt = this.getThirdPoint(points[1], points[0], 0, len, true);
    //     return [tailLeft, swallowTailPnt, tailRight];
    // }

  }, {
    key: "getTailPoints",
    value: function getTailPoints(points) {
      var allLen = this.getBaseLength(points);
      var tailWidth = allLen * this.tailWidthFactor;
      var tailLeft = this.getThirdPoint(points[1], points[0], Math.PI / 2, tailWidth, false);
      var tailRight = this.getThirdPoint(points[1], points[0], Math.PI / 2, tailWidth, true);
      return [tailLeft, tailRight];
    }
  }, {
    key: "getArrowBodyPoints",
    value: function getArrowBodyPoints(points, neckLeft, neckRight, tailWidthFactor) {
      var allLen = this.wholeDistance(points);
      var len = this.getBaseLength(points);
      var tailWidth = len * tailWidthFactor;
      var neckWidth = this.MathDistance(neckLeft, neckRight);
      var widthDif = (tailWidth - neckWidth) / 2;
      var tempLen = 0,
          leftBodyPnts = [],
          rightBodyPnts = [];

      for (var i = 1; i < points.length - 1; i++) {
        var angle = this.getAngleOfThreePoints(points[i - 1], points[i], points[i + 1]) / 2;
        tempLen += this.MathDistance(points[i - 1], points[i]);
        var w = (tailWidth / 2 - tempLen / allLen * widthDif) / Math.sin(angle);
        var left = this.getThirdPoint(points[i - 1], points[i], Math.PI - angle, w, true);
        var right = this.getThirdPoint(points[i - 1], points[i], angle, w, false);
        leftBodyPnts.push(left);
        rightBodyPnts.push(right);
      }

      return leftBodyPnts.concat(rightBodyPnts);
    }
  }, {
    key: "getAngleOfThreePoints",
    value: function getAngleOfThreePoints(pntA, pntB, pntC) {
      var angle = this.getAzimuth(pntB, pntA) - this.getAzimuth(pntB, pntC);
      return angle < 0 ? angle + Math.PI * 2 : angle;
    }
  }, {
    key: "getQBSplinePoints",
    value: function getQBSplinePoints(points) {
      if (points.length <= 2) {
        return points;
      } else {
        var n = 2,
            bSplinePoints = [];
        var m = points.length - n - 1;
        bSplinePoints.push(points[0]);

        for (var i = 0; i <= m; i++) {
          for (var t = 0; t <= 1; t += 0.05) {
            var x = 0,
                y = 0;

            for (var k = 0; k <= n; k++) {
              var factor = this.getQuadricBSplineFactor(k, t);
              x += factor * points[i + k][0];
              y += factor * points[i + k][1];
            }

            bSplinePoints.push([x, y]);
          }
        }

        bSplinePoints.push(points[points.length - 1]);
        return bSplinePoints;
      }
    }
  }, {
    key: "getQuadricBSplineFactor",
    value: function getQuadricBSplineFactor(k, t) {
      var res = 0;

      if (k === 0) {
        res = Math.pow(t - 1, 2) / 2;
      } else if (k === 1) {
        res = (-2 * Math.pow(t, 2) + 2 * t + 1) / 2;
      } else if (k === 2) {
        res = Math.pow(t, 2) / 2;
      }

      return res;
    }
  }, {
    key: "Mid",
    value: function Mid(point1, point2) {
      return [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];
    }
  }, {
    key: "getCircleCenterOfThreePoints",
    value: function getCircleCenterOfThreePoints(point1, point2, point3) {
      var pntA = [(point1[0] + point2[0]) / 2, (point1[1] + point2[1]) / 2];
      var pntB = [pntA[0] - point1[1] + point2[1], pntA[1] + point1[0] - point2[0]];
      var pntC = [(point1[0] + point3[0]) / 2, (point1[1] + point3[1]) / 2];
      var pntD = [pntC[0] - point1[1] + point3[1], pntC[1] + point1[0] - point3[0]];
      return this.getIntersectPoint(pntA, pntB, pntC, pntD);
    }
  }, {
    key: "getIntersectPoint",
    value: function getIntersectPoint(pntA, pntB, pntC, pntD) {
      if (pntA[1] === pntB[1]) {
        var _f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1]);

        var _x = _f * (pntA[1] - pntC[1]) + pntC[0];

        var _y = pntA[1];
        return [_x, _y];
      }

      if (pntC[1] === pntD[1]) {
        var _e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1]);

        var _x2 = _e * (pntC[1] - pntA[1]) + pntA[0];

        var _y2 = pntC[1];
        return [_x2, _y2];
      }

      var e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1]);
      var f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1]);
      var y = (e * pntA[1] - pntA[0] - f * pntC[1] + pntC[0]) / (e - f);
      var x = e * y - e * pntA[1] + pntA[0];
      return [x, y];
    }
  }, {
    key: "getBezierPoints",
    value: function getBezierPoints(points) {
      if (points.length <= 2) {
        return points;
      } else {
        var bezierPoints = [];
        var n = points.length - 1;

        for (var t = 0; t <= 1; t += 0.01) {
          var x = 0,
              y = 0;

          for (var index = 0; index <= n; index++) {
            var factor = this.getBinomialFactor(n, index);
            var a = Math.pow(t, index);
            var b = Math.pow(1 - t, n - index);
            x += factor * a * b * points[index][0];
            y += factor * a * b * points[index][1];
          }

          bezierPoints.push([x, y]);
        }

        bezierPoints.push(points[n]);
        return bezierPoints;
      }
    }
  }, {
    key: "getFactorial",
    value: function getFactorial(n) {
      var result = 1;

      switch (n) {
        case n <= 1:
          result = 1;
          break;

        case n === 2:
          result = 2;
          break;

        case n === 3:
          result = 6;
          break;

        case n === 24:
          result = 24;
          break;

        case n === 5:
          result = 120;
          break;

        default:
          for (var i = 1; i <= n; i++) {
            result *= i;
          }

          break;
      }

      return result;
    }
  }, {
    key: "getBinomialFactor",
    value: function getBinomialFactor(n, index) {
      return this.getFactorial(n) / (this.getFactorial(index) * this.getFactorial(n - index));
    }
  }, {
    key: "cartesianToLnglat",
    value: function cartesianToLnglat(cartesian) {
      if (!cartesian) return;
      var ellipsoid = viewer.scene.globe.ellipsoid;
      var lnglat = Cesium.Cartographic.fromCartesian(cartesian); // var lnglat = ellipsoid.cartesianToCartographic(cartesian);

      var lat = Cesium.Math.toDegrees(lnglat.latitude);
      var lng = Cesium.Math.toDegrees(lnglat.longitude);
      var hei = lnglat.height;
      return [lng, lat, hei];
    }
  }, {
    key: "getCurvePoints",
    value: function getCurvePoints(t, controlPoints) {
      var leftControl = this.getLeftMostControlPoint(controlPoints, t);
      var pnt1 = null,
          pnt2 = null,
          pnt3 = null,
          normals = [leftControl],
          points = [];

      for (var i = 0; i < controlPoints.length - 2; i++) {
        var _ref2 = [controlPoints[i], controlPoints[i + 1], controlPoints[i + 2]];
        pnt1 = _ref2[0];
        pnt2 = _ref2[1];
        pnt3 = _ref2[2];
        var normalPoints = this.getBisectorNormals(t, pnt1, pnt2, pnt3);
        normals = normals.concat(normalPoints);
      }

      var rightControl = this.getRightMostControlPoint(controlPoints, t);

      if (rightControl) {
        normals.push(rightControl);
      }

      for (var _i = 0; _i < controlPoints.length - 1; _i++) {
        pnt1 = controlPoints[_i];
        pnt2 = controlPoints[_i + 1];
        points.push(pnt1);

        for (var _t = 0; _t < this.FITTING_COUNT; _t++) {
          var pnt = this.getCubicValue(_t / this.FITTING_COUNT, pnt1, normals[_i * 2], normals[_i * 2 + 1], pnt2);
          points.push(pnt);
        }

        points.push(pnt2);
      }

      return points;
    }
  }, {
    key: "getLeftMostControlPoint",
    value: function getLeftMostControlPoint(controlPoints, t) {
      var _ref = [controlPoints[0], controlPoints[1], controlPoints[2], null, null],
          pnt1 = _ref[0],
          pnt2 = _ref[1],
          pnt3 = _ref[2],
          controlX = _ref[3],
          controlY = _ref[4];
      var pnts = this.getBisectorNormals(0, pnt1, pnt2, pnt3);
      var normalRight = pnts[0];
      var normal = this.getNormal(pnt1, pnt2, pnt3);
      var dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);

      if (dist > this.ZERO_TOLERANCE) {
        var mid = this.Mid(pnt1, pnt2);
        var pX = pnt1[0] - mid[0];
        var pY = pnt1[1] - mid[1];
        var d1 = this.MathDistance(pnt1, pnt2);
        var n = 2.0 / d1;
        var nX = -n * pY;
        var nY = n * pX;
        var a11 = nX * nX - nY * nY;
        var a12 = 2 * nX * nY;
        var a22 = nY * nY - nX * nX;
        var dX = normalRight[0] - mid[0];
        var dY = normalRight[1] - mid[1];
        controlX = mid[0] + a11 * dX + a12 * dY;
        controlY = mid[1] + a12 * dX + a22 * dY;
      } else {
        controlX = pnt1[0] + t * (pnt2[0] - pnt1[0]);
        controlY = pnt1[1] + t * (pnt2[1] - pnt1[1]);
      }

      return [controlX, controlY];
    }
  }, {
    key: "getRightMostControlPoint",
    value: function getRightMostControlPoint(controlPoints, t) {
      var count = controlPoints.length;
      var pnt1 = controlPoints[count - 3];
      var pnt2 = controlPoints[count - 2];
      var pnt3 = controlPoints[count - 1];
      var pnts = this.getBisectorNormals(0, pnt1, pnt2, pnt3);
      var normalLeft = pnts[1];
      var normal = this.getNormal(pnt1, pnt2, pnt3);
      var dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
      var controlX = null,
          controlY = null;

      if (dist > this.ZERO_TOLERANCE) {
        var mid = this.Mid(pnt2, pnt3);
        var pX = pnt3[0] - mid[0];
        var pY = pnt3[1] - mid[1];
        var d1 = this.MathDistance(pnt2, pnt3);
        var n = 2.0 / d1;
        var nX = -n * pY;
        var nY = n * pX;
        var a11 = nX * nX - nY * nY;
        var a12 = 2 * nX * nY;
        var a22 = nY * nY - nX * nX;
        var dX = normalLeft[0] - mid[0];
        var dY = normalLeft[1] - mid[1];
        controlX = mid[0] + a11 * dX + a12 * dY;
        controlY = mid[1] + a12 * dX + a22 * dY;
      } else {
        controlX = pnt3[0] + t * (pnt2[0] - pnt3[0]);
        controlY = pnt3[1] + t * (pnt2[1] - pnt3[1]);
      }

      return [controlX, controlY];
    }
  }]);

  return ArrowUtil;
}();

var AttackArrow = /*#__PURE__*/function () {
  function AttackArrow(opt) {
    _classCallCheck(this, AttackArrow);

    this.type = "AttackArrow";
    if (!opt) opt = {}; //影响因素

    opt.headHeightFactor = opt.headHeightFactor || 0.18;
    opt.headWidthFactor = opt.headWidthFactor || 0.3;
    opt.neckHeightFactor = opt.neckHeightFactor || 0.85;
    opt.neckWidthFactor = opt.neckWidthFactor || 0.15;
    opt.headTailFactor = opt.headTailFactor || 0.8;
    this.positions = null;
    this.plotUtil = new ArrowUtil(opt);
  }

  _createClass(AttackArrow, [{
    key: "startCompute",
    value: function startCompute(positions) {
      if (!positions) return;
      this.positions = positions;
      var pnts = [];

      for (var i = 0; i < positions.length; i++) {
        var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
        pnts.push(newP);
      }

      var _ref = [pnts[0], pnts[1]],
          tailLeft = _ref[0],
          tailRight = _ref[1];

      if (this.plotUtil.isClockWise(pnts[0], pnts[1], pnts[2])) {
        tailLeft = pnts[1];
        tailRight = pnts[0];
      }

      var midTail = this.plotUtil.Mid(tailLeft, tailRight);
      var bonePnts = [midTail].concat(pnts.slice(2));
      var headPnts = this.plotUtil.getArrowHeadPoints(bonePnts, tailLeft, tailRight);

      if (!headPnts || headPnts.length == 0) {
        console.warn("计算面数据有误，不计算，返回传入坐标数组！");
        return positions;
      }

      var _ref2 = [headPnts[0], headPnts[4]],
          neckLeft = _ref2[0],
          neckRight = _ref2[1];
      var tailWidthFactor = this.plotUtil.MathDistance(tailLeft, tailRight) / this.plotUtil.getBaseLength(bonePnts);
      var bodyPnts = this.plotUtil.getArrowBodyPoints(bonePnts, neckLeft, neckRight, tailWidthFactor);
      var count = bodyPnts.length;
      var leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2));
      leftPnts.push(neckLeft);
      var rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count));
      rightPnts.push(neckRight);
      leftPnts = this.plotUtil.getQBSplinePoints(leftPnts);
      rightPnts = this.plotUtil.getQBSplinePoints(rightPnts);
      var pList = leftPnts.concat(headPnts, rightPnts.reverse());
      var returnArr = [];

      for (var k = 0; k < pList.length; k++) {
        var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
        returnArr.push(posi);
      }

      return returnArr;
    }
  }]);

  return AttackArrow;
}();

var AttackArrowPW = /*#__PURE__*/function () {
  function AttackArrowPW(arg) {
    _classCallCheck(this, AttackArrowPW);

    if (!arg) arg = {}; //影响因素

    var opt = {};
    opt.headHeightFactor = arg.headHeightFactor || 0.18;
    opt.headWidthFactor = arg.headWidthFactor || 0.3;
    opt.neckHeightFactor = arg.neckHeightFactor || 0.85;
    opt.neckWidthFactor = arg.neckWidthFactor || 0.15;
    opt.tailWidthFactor = this.tailWidthFactor = arg.tailWidthFactor || 0.1;
    this.positions = null;
    this.plotUtil = new ArrowUtil(opt);
  }

  _createClass(AttackArrowPW, [{
    key: "startCompute",
    value: function startCompute(positions) {
      if (!positions) return;
      this.positions = positions;
      var pnts = [];

      for (var i = 0; i < positions.length; i++) {
        var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
        pnts.push(newP);
      }

      var tailPnts = this.plotUtil.getTailPoints(pnts);
      var headPnts = this.plotUtil.getArrowHeadPoints(pnts, tailPnts[0], tailPnts[1]);
      var neckLeft = headPnts[0];
      var neckRight = headPnts[4];
      var bodyPnts = this.plotUtil.getArrowBodyPoints(pnts, neckLeft, neckRight, this.tailWidthFactor);
      var _count = bodyPnts.length;
      var leftPnts = [tailPnts[0]].concat(bodyPnts.slice(0, _count / 2));
      leftPnts.push(neckLeft);
      var rightPnts = [tailPnts[1]].concat(bodyPnts.slice(_count / 2, _count));
      rightPnts.push(neckRight);
      leftPnts = this.plotUtil.getQBSplinePoints(leftPnts);
      rightPnts = this.plotUtil.getQBSplinePoints(rightPnts);
      var pList = leftPnts.concat(headPnts, rightPnts.reverse());
      var returnArr = [];

      for (var k = 0; k < pList.length; k++) {
        var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
        returnArr.push(posi);
      }

      return returnArr;
    }
  }]);

  return AttackArrowPW;
}();

var AttackArrowYW = /*#__PURE__*/function () {
  function AttackArrowYW(arg) {
    _classCallCheck(this, AttackArrowYW);

    if (!arg) arg = {};
    var opt = {}; //影响因素

    opt.headHeightFactor = arg.headHeightFactor || 0.18;
    opt.headWidthFactor = arg.headWidthFactor || 0.3;
    opt.neckHeightFactor = arg.neckHeightFactor || 0.85;
    opt.neckWidthFactor = arg.neckWidthFactor || 0.15;
    opt.tailWidthFactor = this.tailWidthFactor = arg.tailWidthFactor || 0.1;
    opt.headTailFactor = arg.headTailFactor || 0.8;
    opt.swallowTailFactor = this.swallowTailFactor = arg.swallowTailFactor || 1;
    this.positions = null;
    this.plotUtil = new ArrowUtil(opt);
  }

  _createClass(AttackArrowYW, [{
    key: "startCompute",
    value: function startCompute(positions) {
      if (!positions) return;
      this.positions = positions;
      var pnts = [];

      for (var i = 0; i < positions.length; i++) {
        var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
        pnts.push(newP);
      }

      var _ref = [pnts[0], pnts[1]],
          tailLeft = _ref[0],
          tailRight = _ref[1];

      if (this.plotUtil.isClockWise(pnts[0], pnts[1], pnts[2])) {
        tailLeft = pnts[1];
        tailRight = pnts[0];
      }

      var midTail = this.plotUtil.Mid(tailLeft, tailRight);
      var bonePnts = [midTail].concat(pnts.slice(2));
      var headPnts = this.plotUtil.getArrowHeadPoints(bonePnts, tailLeft, tailRight);
      var _ref2 = [headPnts[0], headPnts[4]],
          neckLeft = _ref2[0],
          neckRight = _ref2[1];
      var tailWidth = this.plotUtil.MathDistance(tailLeft, tailRight);
      var allLen = this.plotUtil.getBaseLength(bonePnts);
      var len = allLen * this.tailWidthFactor * this.swallowTailFactor;
      var swallowTailPnt = this.plotUtil.getThirdPoint(bonePnts[1], bonePnts[0], 0, len, true);
      var factor = tailWidth / allLen;
      var bodyPnts = this.plotUtil.getArrowBodyPoints(bonePnts, neckLeft, neckRight, factor);
      var count = bodyPnts.length;
      var leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2));
      leftPnts.push(neckLeft);
      var rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count));
      rightPnts.push(neckRight);
      leftPnts = this.plotUtil.getQBSplinePoints(leftPnts);
      rightPnts = this.plotUtil.getQBSplinePoints(rightPnts);
      var pList = leftPnts.concat(headPnts, rightPnts.reverse(), [swallowTailPnt, leftPnts[0]]);
      var returnArr = [];

      for (var k = 0; k < pList.length; k++) {
        var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
        returnArr.push(posi);
      }

      return returnArr;
    }
  }]);

  return AttackArrowYW;
}();

var CloseCurve = /*#__PURE__*/function () {
  function CloseCurve(arg) {
    _classCallCheck(this, CloseCurve);

    var opt = {}; //影响因素

    this.positions = null;
    this.plotUtil = new ArrowUtil(opt);
  }

  _createClass(CloseCurve, [{
    key: "startCompute",
    value: function startCompute(positions) {
      var pnts = [];

      for (var i = 0; i < positions.length; i++) {
        var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
        pnts.push(newP);
      }

      pnts.push(pnts[0], pnts[1]);
      var normals = [];
      var pList = [];

      for (var i = 0; i < pnts.length - 2; i++) {
        var normalPoints = this.plotUtil.getBisectorNormals(0.3, pnts[i], pnts[i + 1], pnts[i + 2]);
        normals = normals.concat(normalPoints);
      }

      var count = normals.length;
      normals = [normals[count - 1]].concat(normals.slice(0, count - 1));

      for (var _i = 0; _i < pnts.length - 2; _i++) {
        var pnt1 = pnts[_i];
        var pnt2 = pnts[_i + 1];
        pList.push(pnt1);

        for (var t = 0; t <= 100; t++) {
          var pnt = this.plotUtil.getCubicValue(t / 100, pnt1, normals[_i * 2], normals[_i * 2 + 1], pnt2);
          pList.push(pnt);
        }

        pList.push(pnt2);
      }

      var returnArr = [];

      for (var k = 0; k < pList.length; k++) {
        var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
        returnArr.push(posi);
      }

      return returnArr;
    }
  }]);

  return CloseCurve;
}();

var Curve = /*#__PURE__*/function () {
  function Curve(arg) {
    _classCallCheck(this, Curve);

    var opt = {}; //影响因素

    this.typeName = "Curve";
    this.plotUtil = new ArrowUtil(opt);
    this.t = 0.3;
  }

  _createClass(Curve, [{
    key: "startCompute",
    value: function startCompute(positions) {
      var pnts = [];

      for (var i = 0; i < positions.length; i++) {
        var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
        pnts.push(newP);
      }

      var pList = [];

      if (pnts.length < 2) {
        return false;
      } else if (pnts.length === 2) {
        pList = pnts;
      } else {
        pList = this.plotUtil.getCurvePoints(this.t, pnts);
      }

      var returnArr = [];

      for (var k = 0; k < pList.length; k++) {
        var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
        returnArr.push(posi);
      }

      return returnArr;
    }
  }]);

  return Curve;
}();

var CurveFlag = /*#__PURE__*/function () {
  function CurveFlag(arg) {
    _classCallCheck(this, CurveFlag);

    var opt = {}; //影响因素

    this.typeName = "CurveFlag";
    this.plotUtil = new ArrowUtil(opt);
  }

  _createClass(CurveFlag, [{
    key: "startCompute",
    value: function startCompute(positions) {
      var pnts = [];

      for (var i = 0; i < positions.length; i++) {
        var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
        pnts.push(newP);
      }

      var pList = [];

      if (pnts.length > 1) {
        var startPoint = pnts[0];
        var endPoint = pnts[pnts.length - 1];
        var point1 = startPoint;
        var point2 = [(endPoint[0] - startPoint[0]) / 4 + startPoint[0], (endPoint[1] - startPoint[1]) / 8 + startPoint[1]];
        var point3 = [(startPoint[0] + endPoint[0]) / 2, startPoint[1]];
        var point4 = [(endPoint[0] - startPoint[0]) * 3 / 4 + startPoint[0], -(endPoint[1] - startPoint[1]) / 8 + startPoint[1]];
        var point5 = [endPoint[0], startPoint[1]];
        var point6 = [endPoint[0], (startPoint[1] + endPoint[1]) / 2];
        var point7 = [(endPoint[0] - startPoint[0]) * 3 / 4 + startPoint[0], (endPoint[1] - startPoint[1]) * 3 / 8 + startPoint[1]];
        var point8 = [(startPoint[0] + endPoint[0]) / 2, (startPoint[1] + endPoint[1]) / 2];
        var point9 = [(endPoint[0] - startPoint[0]) / 4 + startPoint[0], (endPoint[1] - startPoint[1]) * 5 / 8 + startPoint[1]];
        var point10 = [startPoint[0], (startPoint[1] + endPoint[1]) / 2];
        var point11 = [startPoint[0], endPoint[1]];
        var curve1 = this.plotUtil.getBezierPoints([point1, point2, point3, point4, point5]);
        var curve2 = this.plotUtil.getBezierPoints([point6, point7, point8, point9, point10]);
        pList = curve1.concat(curve2);
        pList.push(point11);
      }

      var returnArr = [];

      for (var k = 0; k < pList.length; k++) {
        var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
        returnArr.push(posi);
      }

      return returnArr;
    }
  }]);

  return CurveFlag;
}();

var DoubleArrow = /*#__PURE__*/function () {
  function DoubleArrow(arg) {
    _classCallCheck(this, DoubleArrow);

    if (!arg) arg = {}; //影响因素

    var opt = {};
    opt.headHeightFactor = arg.headHeightFactor || 0.25;
    opt.headWidthFactor = arg.headWidthFactor || 0.3;
    opt.neckHeightFactor = arg.neckHeightFactor || 0.85;
    opt.neckWidthFactor = arg.neckWidthFactor || 0.15;
    this.positions = null;
    this.plotUtil = new ArrowUtil(opt);
  }

  _createClass(DoubleArrow, [{
    key: "startCompute",
    value: function startCompute(positions) {
      if (!positions) return;
      this.positions = positions;
      var pnts = [];

      for (var i = 0; i < positions.length; i++) {
        var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
        pnts.push(newP);
      }

      var _ref = [pnts[0], pnts[1], pnts[2]];
      var pnt1 = _ref[0];
      var pnt2 = _ref[1];
      var pnt3 = _ref[2];
      var count = this.positions.length;
      var tempPoint4;
      var connPoint;

      if (count === 3) {
        tempPoint4 = this.getTempPoint4(pnt1, pnt2, pnt3);
        connPoint = this.plotUtil.Mid(pnt1, pnt2);
      } else if (count === 4) {
        tempPoint4 = pnts[3];
        connPoint = this.plotUtil.Mid(pnt1, pnt2);
      } else {
        tempPoint4 = pnts[3];
        connPoint = pnts[4];
      }

      var leftArrowPnts = undefined,
          rightArrowPnts = undefined;

      if (this.plotUtil.isClockWise(pnt1, pnt2, pnt3)) {
        leftArrowPnts = this.getArrowPoints(pnt1, connPoint, tempPoint4, false);
        rightArrowPnts = this.getArrowPoints(connPoint, pnt2, pnt3, true);
      } else {
        leftArrowPnts = this.getArrowPoints(pnt2, connPoint, pnt3, false);
        rightArrowPnts = this.getArrowPoints(connPoint, pnt1, tempPoint4, true);
      }

      var m = leftArrowPnts.length;
      var t = (m - 5) / 2;
      var llBodyPnts = leftArrowPnts.slice(0, t);
      var lArrowPnts = leftArrowPnts.slice(t, t + 5);
      var lrBodyPnts = leftArrowPnts.slice(t + 5, m);
      var rlBodyPnts = rightArrowPnts.slice(0, t);
      var rArrowPnts = rightArrowPnts.slice(t, t + 5);
      var rrBodyPnts = rightArrowPnts.slice(t + 5, m);
      rlBodyPnts = this.plotUtil.getBezierPoints(rlBodyPnts);
      var bodyPnts = this.plotUtil.getBezierPoints(rrBodyPnts.concat(llBodyPnts.slice(1)));
      lrBodyPnts = this.plotUtil.getBezierPoints(lrBodyPnts);
      var newPnts = rlBodyPnts.concat(rArrowPnts, bodyPnts, lArrowPnts, lrBodyPnts);
      var returnArr = [];

      for (var k = 0; k < newPnts.length; k++) {
        var posi = this.plotUtil.webMercator2Cartesian3(newPnts[k]);
        returnArr.push(posi);
      }

      return returnArr;
    }
  }, {
    key: "getTempPoint4",
    value: function getTempPoint4(linePnt1, linePnt2, point) {
      var midPnt = this.plotUtil.Mid(linePnt1, linePnt2);
      var len = this.plotUtil.MathDistance(midPnt, point);
      var angle = this.plotUtil.getAngleOfThreePoints(linePnt1, midPnt, point);
      var symPnt = undefined,
          distance1 = undefined,
          distance2 = undefined,
          mid = undefined;

      if (angle < Math.PI / 2) {
        distance1 = len * Math.sin(angle);
        distance2 = len * Math.cos(angle);
        mid = this.plotUtil.getThirdPoint(linePnt1, midPnt, Math.PI / 2, distance1, false);
        symPnt = this.plotUtil.getThirdPoint(midPnt, mid, Math.PI / 2, distance2, true);
      } else if (angle >= Math.PI / 2 && angle < Math.PI) {
        distance1 = len * Math.sin(Math.PI - angle);
        distance2 = len * Math.cos(Math.PI - angle);
        mid = this.plotUtil.getThirdPoint(linePnt1, midPnt, Math.PI / 2, distance1, false);
        symPnt = this.plotUtil.getThirdPoint(midPnt, mid, Math.PI / 2, distance2, false);
      } else if (angle >= Math.PI && angle < Math.PI * 1.5) {
        distance1 = len * Math.sin(angle - Math.PI);
        distance2 = len * Math.cos(angle - Math.PI);
        mid = this.plotUtil.getThirdPoint(linePnt1, midPnt, Math.PI / 2, distance1, true);
        symPnt = this.plotUtil.getThirdPoint(midPnt, mid, Math.PI / 2, distance2, true);
      } else {
        distance1 = len * Math.sin(Math.PI * 2 - angle);
        distance2 = len * Math.cos(Math.PI * 2 - angle);
        mid = this.plotUtil.getThirdPoint(linePnt1, midPnt, Math.PI / 2, distance1, true);
        symPnt = this.plotUtil.getThirdPoint(midPnt, mid, Math.PI / 2, distance2, false);
      }

      return symPnt;
    }
  }, {
    key: "getArrowPoints",
    value: function getArrowPoints(pnt1, pnt2, pnt3, clockWise) {
      var midPnt = this.plotUtil.Mid(pnt1, pnt2);
      var len = this.plotUtil.MathDistance(midPnt, pnt3);
      var midPnt1 = this.plotUtil.getThirdPoint(pnt3, midPnt, 0, len * 0.3, true);
      var midPnt2 = this.plotUtil.getThirdPoint(pnt3, midPnt, 0, len * 0.5, true);
      midPnt1 = this.plotUtil.getThirdPoint(midPnt, midPnt1, Math.PI / 2, len / 5, clockWise);
      midPnt2 = this.plotUtil.getThirdPoint(midPnt, midPnt2, Math.PI / 2, len / 4, clockWise);
      var points = [midPnt, midPnt1, midPnt2, pnt3];
      var arrowPnts = this.plotUtil.getArrowHeadPointsNoLR(points);

      if (arrowPnts && Array.isArray(arrowPnts) && arrowPnts.length > 0) {
        var _ref2 = [arrowPnts[0], arrowPnts[4]],
            neckLeftPoint = _ref2[0],
            neckRightPoint = _ref2[1];
        var tailWidthFactor = this.plotUtil.MathDistance(pnt1, pnt2) / this.plotUtil.getBaseLength(points) / 2;
        var bodyPnts = this.plotUtil.getArrowBodyPoints(points, neckLeftPoint, neckRightPoint, tailWidthFactor);

        if (bodyPnts) {
          var n = bodyPnts.length;
          var lPoints = bodyPnts.slice(0, n / 2);
          var rPoints = bodyPnts.slice(n / 2, n);
          lPoints.push(neckLeftPoint);
          rPoints.push(neckRightPoint);
          lPoints = lPoints.reverse();
          lPoints.push(pnt2);
          rPoints = rPoints.reverse();
          rPoints.push(pnt1);
          return lPoints.reverse().concat(arrowPnts, rPoints);
        }
      } else {
        throw new Error('插值出错');
      }
    }
  }]);

  return DoubleArrow;
}();

var FineArrow = /*#__PURE__*/function () {
  function FineArrow(arg) {
    _classCallCheck(this, FineArrow);

    if (!arg) arg = {}; //影响因素

    var opt = {};
    opt.headAngle = this.headAngle = arg.headAngle || Math.PI / 8.5;
    opt.neckAngle = this.neckAngle = arg.neckAngle || Math.PI / 13;
    opt.tailWidthFactor = this.tailWidthFactor = arg.tailWidthFactor || 0.1;
    opt.neckWidthFactor = this.neckWidthFactor = arg.neckWidthFactor || 0.2;
    opt.headWidthFactor = this.headWidthFactor = arg.headWidthFactor || 0.25;
    opt.neckHeightFactor = arg.neckHeightFactor || 0.85;
    this.positions = null;
    this.plotUtil = new ArrowUtil(opt);
  }

  _createClass(FineArrow, [{
    key: "startCompute",
    value: function startCompute(positions) {
      if (!positions) return;
      this.positions = positions;
      var pnts = [];

      for (var i = 0; i < positions.length; i++) {
        var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
        pnts.push(newP);
      }

      var _ref = [pnts[0], pnts[1]],
          pnt1 = _ref[0],
          pnt2 = _ref[1];
      var len = this.plotUtil.getBaseLength(pnts);
      var tailWidth = len * this.tailWidthFactor;
      var neckWidth = len * this.neckWidthFactor;
      var headWidth = len * this.headWidthFactor;
      var tailLeft = this.plotUtil.getThirdPoint(pnt2, pnt1, Math.PI / 2, tailWidth, true);
      var tailRight = this.plotUtil.getThirdPoint(pnt2, pnt1, Math.PI / 2, tailWidth, false);
      var headLeft = this.plotUtil.getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, false);
      var headRight = this.plotUtil.getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, true);
      var neckLeft = this.plotUtil.getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, false);
      var neckRight = this.plotUtil.getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, true);
      var pList = [tailLeft, neckLeft, headLeft, pnt2, headRight, neckRight, tailRight];
      var returnArr = [];

      for (var k = 0; k < pList.length; k++) {
        var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
        returnArr.push(posi);
      }

      return returnArr;
    }
  }]);

  return FineArrow;
}();
/* 集结地 */


var GatheringPlace = /*#__PURE__*/function () {
  function GatheringPlace(opt) {
    _classCallCheck(this, GatheringPlace);

    if (!opt) opt = {}; //影响因素

    this.positions = null;
    this.plotUtil = new ArrowUtil(opt);
  }

  _createClass(GatheringPlace, [{
    key: "startCompute",
    value: function startCompute(positions) {
      var pnts = [];

      for (var i = 0; i < positions.length; i++) {
        var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
        pnts.push(newP);
      }

      var mid = this.plotUtil.Mid(pnts[0], pnts[2]);
      pnts.push(mid, pnts[0], pnts[1]);
      var normals = [],
          pnt1 = undefined,
          pnt2 = undefined,
          pnt3 = undefined,
          pList = [];

      for (var i = 0; i < pnts.length - 2; i++) {
        pnt1 = pnts[i];
        pnt2 = pnts[i + 1];
        pnt3 = pnts[i + 2];
        var normalPoints = this.plotUtil.getBisectorNormals(0.4, pnt1, pnt2, pnt3);
        normals = normals.concat(normalPoints);
      }

      var count = normals.length;
      normals = [normals[count - 1]].concat(normals.slice(0, count - 1));

      for (var _i = 0; _i < pnts.length - 2; _i++) {
        pnt1 = pnts[_i];
        pnt2 = pnts[_i + 1];
        pList.push(pnt1);

        for (var t = 0; t <= 100; t++) {
          var _pnt = this.plotUtil.getCubicValue(t / 100, pnt1, normals[_i * 2], normals[_i * 2 + 1], pnt2);

          pList.push(_pnt);
        }

        pList.push(pnt2);
      }

      var returnArr = [];

      for (var k = 0; k < pList.length; k++) {
        var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
        returnArr.push(posi);
      }

      return returnArr;
    }
  }]);

  return GatheringPlace;
}();
/* 直线箭头 */


var LineStraightArrow = /*#__PURE__*/function () {
  function LineStraightArrow(arg) {
    _classCallCheck(this, LineStraightArrow);

    var opt = {}; //影响因素

    this.typeName = "LineStraightArrow";
    this.plotUtil = new ArrowUtil(opt);
    this.fixPointCount = 2;
    this.maxArrowLength = 3000000;
    this.arrowLengthScale = 5;
  }

  _createClass(LineStraightArrow, [{
    key: "startCompute",
    value: function startCompute(positions) {
      var pnts = [];

      for (var i = 0; i < positions.length; i++) {
        var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
        pnts.push(newP);
      }

      var pList = [];

      try {
        if (pnts.length < 2) {
          return false;
        } else {
          var _ref = [pnts[0], pnts[1]],
              pnt1 = _ref[0],
              pnt2 = _ref[1];
          var distance = this.plotUtil.MathDistance(pnt1, pnt2);
          var len = distance / this.arrowLengthScale;
          len = len > this.maxArrowLength ? this.maxArrowLength : len;
          var leftPnt = this.plotUtil.getThirdPoint(pnt1, pnt2, Math.PI / 6, len, false);
          var rightPnt = this.plotUtil.getThirdPoint(pnt1, pnt2, Math.PI / 6, len, true);
          pList = [pnt1, pnt2, leftPnt, pnt2, rightPnt];
        }
      } catch (e) {
        console.log(e);
      }

      var returnArr = [];

      for (var k = 0; k < pList.length; k++) {
        var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
        returnArr.push(posi);
      }

      return returnArr;
    }
  }]);

  return LineStraightArrow;
}();
/* 弓形面 */


var Lune = /*#__PURE__*/function () {
  function Lune(opt) {
    _classCallCheck(this, Lune);

    if (!opt) opt = {}; //影响因素

    this.positions = null;
    this.plotUtil = new ArrowUtil(opt);
  }

  _createClass(Lune, [{
    key: "startCompute",
    value: function startCompute(positions) {
      var pnts = [];

      for (var i = 0; i < positions.length; i++) {
        var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
        pnts.push(newP);
      }

      var _ref = [pnts[0], pnts[1], pnts[2], undefined, undefined],
          pnt1 = _ref[0],
          pnt2 = _ref[1],
          pnt3 = _ref[2],
          startAngle = _ref[3],
          endAngle = _ref[4];
      var center = this.plotUtil.getCircleCenterOfThreePoints(pnt1, pnt2, pnt3);
      var radius = this.plotUtil.MathDistance(pnt1, center);
      var angle1 = this.plotUtil.getAzimuth(pnt1, center);
      var angle2 = this.plotUtil.getAzimuth(pnt2, center);

      if (this.plotUtil.isClockWise(pnt1, pnt2, pnt3)) {
        startAngle = angle2;
        endAngle = angle1;
      } else {
        startAngle = angle1;
        endAngle = angle2;
      }

      pnts = this.plotUtil.getArcPoints(center, radius, startAngle, endAngle);
      pnts.push(pnts[0]);
      var returnArr = [];

      for (var k = 0; k < pnts.length; k++) {
        var posi = this.plotUtil.webMercator2Cartesian3(pnts[k]);
        returnArr.push(posi);
      }

      return returnArr;
    }
  }]);

  return Lune;
}();
/* 三角旗 */


var RectFlag = /*#__PURE__*/function () {
  function RectFlag(opt) {
    _classCallCheck(this, RectFlag);

    if (!opt) opt = {}; //影响因素

    opt.typeName = "RectFlag";
    this.plotUtil = new ArrowUtil(opt);
  }

  _createClass(RectFlag, [{
    key: "startCompute",
    value: function startCompute(positions) {
      var pnts = [];

      for (var i = 0; i < positions.length; i++) {
        var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
        pnts.push(newP);
      }

      var components = [];

      if (pnts.length > 1) {
        var startPoint = pnts[0];
        var endPoint = pnts[pnts.length - 1];
        var point1 = [endPoint[0], startPoint[1]];
        var point2 = [endPoint[0], (startPoint[1] + endPoint[1]) / 2];
        var point3 = [startPoint[0], (startPoint[1] + endPoint[1]) / 2];
        var point4 = [startPoint[0], endPoint[1]];
        components = [startPoint, point1, point2, point3, point4];
      }

      var returnArr = [];

      for (var k = 0; k < components.length; k++) {
        var posi = this.plotUtil.webMercator2Cartesian3(components[k]);
        returnArr.push(posi);
      }

      return returnArr;
    }
  }]);

  return RectFlag;
}();
/* 扇形 */


var Sector = /*#__PURE__*/function () {
  function Sector(arg) {
    _classCallCheck(this, Sector);

    var opt = {}; //影响因素

    this.typeName = "Sector";
    this.plotUtil = new ArrowUtil(opt);
  }

  _createClass(Sector, [{
    key: "startCompute",
    value: function startCompute(positions) {
      if (positions.length <= 2) return [];
      var pnts = [];

      for (var i = 0; i < positions.length; i++) {
        var newP = this.plotUtil.cartesian32WeMercator(positions[i]);
        pnts.push(newP);
      }

      var _ref = [pnts[0], pnts[1], pnts[2]],
          center = _ref[0],
          pnt2 = _ref[1],
          pnt3 = _ref[2];
      var radius = this.plotUtil.MathDistance(pnt2, center);
      var startAngle = this.plotUtil.getAzimuth(pnt2, center);
      var endAngle = this.plotUtil.getAzimuth(pnt3, center);
      var pList = this.plotUtil.getArcPoints(center, radius, startAngle, endAngle);
      pList.push(center, pList[0]);
      var returnArr = [];

      for (var k = 0; k < pList.length; k++) {
        var posi = this.plotUtil.webMercator2Cartesian3(pList[k]);
        returnArr.push(posi);
      }

      return returnArr;
    }
  }]);

  return Sector;
}();

var arrowAlgorithm = {
  AttackArrow: AttackArrow,
  AttackArrowPW: AttackArrowPW,
  AttackArrowYW: AttackArrowYW,
  CloseCurve: CloseCurve,
  Curve: Curve,
  CurveFlag: CurveFlag,
  DoubleArrow: DoubleArrow,
  FineArrow: FineArrow,
  GatheringPlace: GatheringPlace,
  LineStraightArrow: LineStraightArrow,
  Lune: Lune,
  RectFlag: RectFlag,
  Sector: Sector
};

/* 构建军事标绘 */

var CreateArrow = /*#__PURE__*/function (_BasePlot) {
  _inherits(CreateArrow, _BasePlot);

  var _super = _createSuper(CreateArrow);

  function CreateArrow(viewer, situationType, style) {
    var _this;

    _classCallCheck(this, CreateArrow);

    _this = _super.call(this, viewer, style);
    _this.type = "arrow";

    if (!situationType) {
      console.log("缺少箭头类型");
      return _possibleConstructorReturn(_this);
    }

    _this.situationType = situationType;
    _this.arrowObj = getSituationByType(situationType);
    if (!_this.arrowObj) return _possibleConstructorReturn(_this);
    _this.minPointNum = _this.arrowObj.minPointNum;

    if (_this.minPointNum == 1) {
      console.warn("控制点有误！");
      return _possibleConstructorReturn(_this);
    }

    _this.maxPointNum = _this.arrowObj.maxPointNum == -1 ? _this.minPointNum : _this.arrowObj.maxPointNum; //获取计算坐标的对象

    _this.arrowPlot = _this.arrowObj.arrowPlot;

    if (!_this.arrowPlot) {
      console.warn("计算坐标类有误！");
      return _possibleConstructorReturn(_this);
    }

    _this.type = "arrow";
    _this.viewer = viewer;
    _this.entity = null;
    _this.polyline = null;
    var defaultStyle = {
      outlineColor: "#000000",
      outlineWidth: 2
    };
    _this.style = Object.assign(defaultStyle, style || {});
    _this.outline = null;
    return _this;
  }

  _createClass(CreateArrow, [{
    key: "start",
    value: function start(callBack) {
      var that = this;
      if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt$1(this.viewer, this.promptStyle);
      this.state = "startCreate";
      this.handler.setInputAction(function (evt) {
        //单机开始绘制
        var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
        if (!cartesian) return;
        if (that.positions.length > that.maxPointNum) return;

        if (that.movePush) {
          that.positions.pop();
          that.movePush = false;
        }

        that.positions.push(cartesian);
        var point = that.createPoint(cartesian);
        point.wz = that.controlPoints.length;
        that.controlPoints.push(point);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.setInputAction(function (evt) {
        //移动时绘制面
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

        that.state = "creating";
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
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
        var cartesian = that.getCatesian3FromPX(evt.position, that.viewer, [that.entity]);
        if (!cartesian) return;

        if (that.positions.length >= that.minPointNum) {
          //结束
          if (!that.movePush) {
            // 双击结束
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
  }, {
    key: "createByPositions",
    value: function createByPositions(lnglatArr, callBack) {
      //通过传入坐标数组创建面
      if (!lnglatArr) return;
      this.state = "startCreate";
      var positions = lnglatArr[0] instanceof Cesium.Cartesian3 ? lnglatArr : cUtil.lnglatsToCartesians(lnglatArr);
      if (!positions) return;
      this.entity = this.createPolygon();
      this.positions = positions;

      for (var i = 0; i < positions.length; i++) {
        var newP = positions[i];

        if (this.style.heightReference) {
          var _ctgc = Cesium.Cartographic.fromCartesian(positions[i]);

          _ctgc.height = this.viewer.scene.sampleHeight(_ctgc);
          newP = Cesium.Cartographic.toCartesian(_ctgc);
        }

        var point = this.createPoint(newP);
        point.ctgc = ctgc;
        point.wz = this.controlPoints.length;
        this.controlPoints.push(point);
      }

      this.state = "endCreate";
      this.entity.objId = this.objId;
      if (callBack) callBack(this.entity);
    }
  }, {
    key: "getStyle",
    value: function getStyle() {
      if (!this.entity) return;
      var obj = {};
      var polygon = this.entity.polygon;
      var color = polygon.material.color.getValue();
      obj.colorAlpha = color.alpha;
      obj.color = new Cesium.Color(color.red, color.green, color.blue, 1).toCssHexString();
      obj.fill = polygon.fill ? polygon.fill.getValue() : false;

      if (polygon.heightReference) {
        var heightReference = polygon.heightReference.getValue();
        obj.heightReference = Boolean(heightReference);
      }

      return obj;
    } // 设置相关样式

  }, {
    key: "setStyle",
    value: function setStyle(style) {
      if (!style) return; // 由于官方api中的outline限制太多 此处outline为重新构建的polyline

      if (style.heightReference != undefined) this.entity.polygon.heightReference = Number(style.heightReference);
      var color = style.color instanceof Cesium.Color ? style.color : Cesium.Color.fromCssColorString(style.color);
      var material = color.withAlpha(style.colorAlpha || 1);
      this.entity.polygon.material = material;
      if (style.fill != undefined) this.entity.polygon.fill = style.fill;
      this.style = Object.assign(this.style, style);
    } // 构建态势标绘面

  }, {
    key: "createPolygon",
    value: function createPolygon() {
      var that = this;
      this.style.color = this.style.color || Cesium.Color.WHITE;
      this.style.outlineColor = this.style.outlineColor || Cesium.Color.BLACK;
      var polygonObj = {
        polygon: {
          hierarchy: new Cesium.CallbackProperty(function () {
            var newPosition = that.arrowPlot.startCompute(that.positions);

            if (that.arrowPlot.spliceWZ != undefined) {
              newPosition.splice(that.arrowPlot.spliceWZ - 1, 1);
            }

            return new Cesium.PolygonHierarchy(newPosition);
          }, false),
          heightReference: Number(this.style.heightReference),
          show: true,
          fill: this.style.fill || true,
          material: this.style.color instanceof Cesium.Color ? this.style.color : Cesium.Color.fromCssColorString(this.style.color).withAlpha(this.style.colorAlpha || 1)
        }
      };

      if (!this.style.heightReference) {
        polygonObj.polygon.height = 0; // 不贴地 必设

        polygonObj.polygon.perPositionHeight = true; // 启用点的真实高度
      }

      return this.viewer.entities.add(polygonObj);
    }
  }, {
    key: "createPolyline",
    value: function createPolyline() {
      var that = this;
      return this.viewer.entities.add({
        polyline: {
          positions: new Cesium.CallbackProperty(function () {
            return that.positions;
          }, false),
          clampToGround: Boolean(this.style.clampToGround),
          material: this.style.outlineColor instanceof Cesium.Color ? this.style.outlineColor : Cesium.Color.fromCssColorString(this.style.outlineColor).withAlpha(this.style.outlineColorAlpha || 1),
          width: this.style.outlineWidth || 1
        }
      });
    }
  }, {
    key: "destroy",
    value: function destroy() {
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

      for (var i = 0; i < this.controlPoints.length; i++) {
        var point = this.controlPoints[i];
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
  }]);

  return CreateArrow;
}(BasePlot);

function getSituationByType(type) {
  type = Number(type);

  if (isNaN(type)) {
    console.warn("输入态势标绘类型不对！");
    return;
  }

  if (!type || typeof type != "number") {
    console.warn("输入态势标绘类型不对！");
    return;
  }

  var arrowPlot;
  var minPointNum = -1;
  var maxPointNum = -1;
  var playObj = {
    canPlay: false,
    // 是否可移动
    pointNum: 0,
    // 可移动的点的数量
    pointWZ: [] // 可移动的点在数组中的位置 从0开始

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

      minPointNum = 3; // 最小可为三个点 为做动画效果 故写死为5个点

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

var DrawTool = /*#__PURE__*/function () {
  function DrawTool(viewer, obj) {
    _classCallCheck(this, DrawTool);

    if (!viewer) {
      console.warn("缺少必要参数！--viewer");
      return;
    }

    obj = obj || {};
    this.viewer = viewer;
    this.toolArr = [];
    this.handler = null;
    this.removeHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    /* this.show = obj.drawEndShow == undefined ? true : obj.drawEndShow; */

    this.nowEditObj = null; // 当前编辑对象

    this.startEditFun = null;
    this.endEditFun = null;
    this.removeFun = null;
    this.deleteEntityObj = null; // 无论如何 进来先监听点击修改 与 右键删除事件 通过控制canEdit来判断要不要向下执行

    this.bindEdit();
    this.bindRemove();
    this.deletePrompt = null;
    this.canEdit = obj.canEdit == undefined ? true : obj.canEdit;

    this.intoEdit = null;
    this.lastEntityObj = null;
    this.lastStartEntityObj = null;
  } // 相关事件绑定


  _createClass(DrawTool, [{
    key: "on",
    value: function on(type, fun) {
      if (type == "startEdit") {
        // 开始编辑事件
        this.startEditFun = fun;
      } else if (type == "endEdit") {
        // 结束编辑事件
        this.endEditFun = fun;
      } else if (type == "remove") {
        // 移除事件
        this.removeFun = fun;
      } else if (type == "endCreate") {
        // 绘制完成事件
        this.endCreateFun = fun;
      }
    }
  }, {
    key: "canEdit",
    value: function canEdit(isOpen) {
      this.canEdit = isOpen;
    }
  }, {
    key: "start",
    value: function start(opt) {
      if (!opt || !opt.type) {
        return;
      }

      opt.id = opt.id || Number(new Date().getTime() + "" + Number(Math.random() * 1000).toFixed(0));
      var that = this;
      this.intoEdit = opt.intoEdit == undefined ? true : opt.intoEdit; // 绘制完成后 是否直接进入编辑（能否进入编辑 还得看 canEdit属性）

      this.endEdit(); // 绘制前  结束编辑

      if (this.lastStartEntityObj && this.lastStartEntityObj.state == "startCreate") {
        // 禁止一次绘制多个
        this.lastStartEntityObj.destroy();
        this.lastStartEntityObj = null;
      }

      var entityObj = this.createByType(opt);
      if (!entityObj) return;
      entityObj.attr = opt || {}; // 保存开始绘制时的属性
      // 开始绘制

      entityObj.start(function (entity) {
        that.toolArr.push(entityObj); // endCreateFun 和 success 无本质区别，若构建时 两个都设置了 当心重复

        if (opt.success) opt.success(entityObj, entity);
        if (that.endCreateFun) that.endCreateFun(entityObj, entity);
        if (opt.show == false) entityObj.setVisible(false); // 如果可以编辑 则绘制完成打开编辑

        if (that.canEdit && that.intoEdit) {
          entityObj.startEdit();
          if (that.startEditFun) that.startEditFun(entityObj, entity);
          that.lastEntityObj = entityObj;
        }
      });
      this.lastStartEntityObj = entityObj;
      return entityObj;
    }
  }, {
    key: "end",
    value: function end() {
      if (this.lastStartEntityObj && this.lastStartEntityObj.state == "startCreate") {
        // 禁止一次绘制多个
        this.lastStartEntityObj.destroy();
        this.lastStartEntityObj = null;
      }

      this.endEdit();
    } // 取消当前的状态

  }, {
    key: "cancel",
    value: function cancel() {
      if (this.lastStartEntityObj && (this.lastStartEntityObj.state != "endCreate" || this.lastStartEntityObj.state != "endEdit")) {
        this.lastStartEntityObj.destroy();
        this.lastStartEntityObj = null;
      }
    } // 开始编辑某个

  }, {
    key: "startEditOne",
    value: function startEditOne(entityObj) {
      if (!this.canEdit) return;

      if (this.lastEntityObj) {
        // 结束除当前选中实体的所有编辑操作
        this.lastEntityObj.endEdit();

        if (this.endEditFun) {
          this.endEditFun(this.lastEntityObj, this.lastEntityObj.getEntity()); // 结束事件
        }

        this.lastEntityObj = null;
      }

      if (entityObj) {
        entityObj.startEdit();
        if (this.startEditFun) this.startEditFun(entityObj, entityObj.getEntity());
        this.lastEntityObj = entityObj;
      }
    } // 修改某个的样式

  }, {
    key: "updateOneStyle",
    value: function updateOneStyle(entityObj, style) {
      if (entityObj) {
        entityObj.setStyle(style);
      }
    } // 根据坐标来创建

  }, {
    key: "createByPositions",
    value: function createByPositions(opt) {
      opt = opt || {};
      if (!opt) opt = {};
      if (!opt.positions) return;
      opt.id = opt.id || Number(new Date().getTime() + "" + Number(Math.random() * 1000).toFixed(0));
      var that = this;
      var entityObj = this.createByType(opt);
      if (!entityObj) return;
      entityObj.attr = opt; // 保存开始绘制时的属性

      this.intoEdit = opt.intoEdit == undefined ? true : opt.intoEdit; // 绘制完成后 是否直接进入编辑（能否进入编辑 还得看 canEdit属性）

      entityObj.createByPositions(opt.positions, function (entity) {
        that.toolArr.push(entityObj);
        entityObj.setStyle(opt.style); // 设置相关样式
        // endCreateFun 和 success 无本质区别，若构建时 两个都设置了 当心重复

        if (opt.success) opt.success(entityObj, entity);
        if (that.endCreateFun) that.endCreateFun(entityObj, entity);
        if (opt.show == false) entityObj.setVisible(false); // 如果可以编辑 则绘制完成打开编辑 

        /* if (that.canEdit && that.intoEdit) {
          entityObj.startEdit();
          if (that.startEditFun) that.startEditFun(entityObj, entity);
          that.lastEntityObj = entityObj;
        } */
      });
      return entityObj;
    } // 根据geojson构建entity

  }, {
    key: "createByGeojson",
    value: function createByGeojson(data) {
      var features = data.features;

      for (var i = 0; i < features.length; i++) {
        var feature = features[i];
        var properties = feature.properties,
            geometry = feature.geometry;
        var plotType = properties.plotType;
        var geoType = geometry.type;
        var coordinates = geometry.coordinates;
        var positions = [];
        var drawType = "";

        switch (geoType) {
          case "LineString":
            positions = cUtil$1.lnglatsToCartesians(coordinates);
            drawType = "polyline";
            break;

          case "Polygon":
            positions = cUtil$1.lnglatsToCartesians(coordinates[0]);
            drawType = "polygon";
            break;

          case "Point":
            positions = cUtil$1.lnglatsToCartesians([coordinates])[0];
            drawType = plotType;
            break;
        }

        this.createByPositions({
          type: drawType,
          positions: positions,
          style: properties.style
        });
      }
    } // 转为geojson

  }, {
    key: "toGeojson",
    value: function toGeojson() {
      var featureCollection = {
        type: "FeatureCollection",
        features: []
      };
      if (this.toolArr.length == 0) return null;

      for (var i = 0; i < this.toolArr.length; i++) {
        var item = this.toolArr[i];
        var coordinates = item.getPositions(true);
        var style = item.getStyle();
        var geoType = this.transType(item.type);
        var feature = {
          "type": "Feature",
          "properties": {
            "plotType": item.type,
            "style": style
          },
          "geometry": {
            "type": geoType,
            "coordinates": []
          }
        };

        switch (geoType) {
          case "Polygon":
            feature.geometry.coordinates = [coordinates];
            break;

          case "Point":
            feature.geometry.coordinates = coordinates;
            break;

          case "LineString":
            feature.geometry.coordinates = coordinates;
            break;
        }

        feature.properties = Object.assign(feature.properties, item.properties);
        featureCollection.features.push(feature);
      }

      return featureCollection;
    } // 标绘类型和geojson数据类型相互转换

  }, {
    key: "transType",
    value: function transType(plotType) {
      var geoType = '';

      switch (plotType) {
        case "polyline":
          geoType = "LineString";
          break;

        case "polygon":
          geoType = "Polygon";
          break;

        case "point":
        case "gltfModel":
        case "label":
        case "Billboard":
          geoType = "Point";
          break;

        default:
          geoType = plotType;
      }

      return geoType;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      for (var i = 0; i < this.toolArr.length; i++) {
        this.toolArr[i].destroy();
      }

      this.toolArr = [];
      this.nowEditObj = null;

      if (this.handler) {
        this.handler.destroy();
        this.handler = null;
      }

      if (this.removeHandler) {
        this.removeHandler.destroy();
        this.removeHandler = null;
      }
    }
  }, {
    key: "removeOne",
    value: function removeOne(entityObj) {
      if (!entityObj) return;
      this.removeById(entityObj.objId);
    }
  }, {
    key: "removeAll",
    value: function removeAll() {
      for (var i = 0; i < this.toolArr.length; i++) {
        var obj = this.toolArr[i];
        obj.destroy();
      }

      this.toolArr = [];
      this.nowEditObj = null;
    } // 是否包含某个对象

  }, {
    key: "hasEntityObj",
    value: function hasEntityObj(entityObj) {
      if (!entityObj) return false;
      var obj = this.getEntityObjByObjId(entityObj.objId);
      return obj != {} ? true : false;
    }
  }, {
    key: "removeById",
    value: function removeById(id) {
      var obj = this.getEntityObjByObjId(id);
      this.toolArr.splice(obj.index, 1); // 触发on绑定的移除事件

      if (this.removeFun) this.removeFun(obj.entityObj, obj.entityObj.getEntity());

      if (obj.entityObj) {
        obj.entityObj.destroy();
      }
    }
  }, {
    key: "zoomToById",
    value: function zoomToById(id) {
      var obj = this.getEntityObjByObjId(id);

      if (obj.entityObj) {
        obj.entityObj.zoomTo();
      }
    } // 根据标绘对象绑定的属性获取标绘对象 id : 123456

  }, {
    key: "getEntityObjByAttr",
    value: function getEntityObjByAttr(arg1, arg2) {
      var obj = {};

      if (!arg2) {
        // 如果缺少第二个参数 则默认以attr.id进行查询
        for (var i = 0; i < this.toolArr.length; i++) {
          var item = this.toolArr[i];

          if (item.attr.id == arg1) {
            obj.entityObj = item;
            obj.index = i;
            break;
          }
        }
      } else {
        // 否则 以键值对的形式进行查询
        for (var ind = 0; ind < this.toolArr.length; ind++) {
          var _item = this.toolArr[ind];

          if (_item.attr[arg1] == arg2) {
            obj.entityObj = _item;
            obj.index = ind;
            break;
          }
        }
      }

      return obj;
    }
  }, {
    key: "setVisible",
    value: function setVisible(id, visible) {
      var obj = this.getEntityObjByAttr("id", id);
      if (obj.entityObj) obj.entityObj.setVisible(visible);
    } // 根据标绘对象的optid 获取标会对象

  }, {
    key: "getEntityObjByObjId",
    value: function getEntityObjByObjId(id) {
      if (!id) return;
      var obj = {};

      for (var i = 0; i < this.toolArr.length; i++) {
        var item = this.toolArr[i];

        if (item.objId == id) {
          obj.entityObj = item;
          obj.index = i;
          break;
        }
      }

      return obj;
    } // 绑定编辑

  }, {
    key: "bindEdit",
    value: function bindEdit() {
      var that = this; // 如果是线 面 则需要先选中

      if (!this.handler) this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
        if (!that.canEdit) return;
        var pick = that.viewer.scene.pick(evt.position);

        if (Cesium.defined(pick) && pick.id) {
          // 选中实体
          for (var i = 0; i < that.toolArr.length; i++) {
            if (pick.id.objId == that.toolArr[i].objId && (that.toolArr[i].state != "startCreate" || that.toolArr[i].state != "creating" || that.toolArr[i].state != "endEdit")) {
              if (that.lastEntityObj) {
                // 结束除当前选中实体的所有编辑操作
                that.lastEntityObj.endEdit();

                if (that.endEditFun) {
                  that.endEditFun(that.lastEntityObj, that.lastEntityObj.getEntity()); // 结束事件
                }

                that.lastEntityObj = null;
              } // 开始编辑


              that.toolArr[i].startEdit();
              that.nowEditObj = that.toolArr[i];
              if (that.startEditFun) that.startEditFun(that.nowEditObj, pick.id); // 开始编辑

              that.lastEntityObj = that.toolArr[i];
              break;
            }
          }
        } else {
          // 未选中实体 则结束全部绘制
          if (that.lastEntityObj) {
            that.lastEntityObj.endEdit();

            if (that.endEditFun) {
              that.endEditFun(that.lastEntityObj, that.lastEntityObj.getEntity()); // 结束事件
            }

            that.lastEntityObj = null;
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    } // 关闭编辑功能

  }, {
    key: "closeEdit",
    value: function closeEdit() {
      this.endEdit();
      this.canEdit = false;
    } // 开启编辑功能

  }, {
    key: "openEdit",
    value: function openEdit() {
      this.canEdit = true;
    }
  }, {
    key: "endEdit",
    value: function endEdit() {
      if (this.lastEntityObj) {
        // 结束除当前选中实体的所有编辑操作
        this.lastEntityObj.endEdit();

        if (this.endEditFun) {
          this.endEditFun(this.lastEntityObj, this.lastEntityObj.getEntity()); // 结束事件
        }

        this.lastEntityObj = null;
      }

      for (var i = 0; i < this.toolArr.length; i++) {
        this.toolArr[i].endEdit();
      }
    } // 绑定删除事件

  }, {
    key: "bindRemove",
    value: function bindRemove() {
      var that = this;

      function remove(px) {
        // 构建右键删除鼠标提示
        if (that.deletePrompt) {
          that.deletePrompt.destroy();
          that.deletePrompt = null;
        }

        that.deletePrompt = new Prompt$1(viewer, {
          content: "<span id='deleteEntity' style='cursor: pointer;'>删除</span>",
          show: true,
          offset: {
            x: 60,
            y: 60
          }
        });
        var deleteDom = document.getElementById("deleteEntity");
        that.deletePrompt.update(px);
        deleteDom.addEventListener("click", function () {
          // 删除当前对象前 结束之前的编辑
          that.endEdit(); // 删除事件

          that.deletePrompt.destroy();
          if (!that.deleteEntityObj || that.deleteEntityObj == {}) return;
          var entObj = that.deleteEntityObj.entityObj;

          if (that.removeFun) {
            that.removeFun(entObj, entObj.getEntity());
          }

          entObj.destroy();
          that.toolArr.splice(that.deleteEntityObj.index, 1);
        });
      }

      this.removeHandler.setInputAction(function (evt) {
        //右键取消上一步
        if (!that.canEdit) return; // 右键点击当前目标外 销毁提示框

        if (that.deletePrompt) {
          that.deletePrompt.destroy();
          that.deletePrompt = null;
        }

        var pick = that.viewer.scene.pick(evt.position);

        if (Cesium.defined(pick) && pick.id) {
          // 选中实体
          for (var i = 0; i < that.toolArr.length; i++) {
            if (pick.id.objId == that.toolArr[i].objId && (that.toolArr[i].state == "endCreate" || that.toolArr[i].state == "startEdit" || that.toolArr[i].state == "endEdit")) {
              // 结束编辑或结束构建才给删
              that.deleteEntityObj = {
                entityObj: that.toolArr[i],
                index: i
              };
              remove(evt.position);
              break;
            }
          }
        }
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      this.removeHandler.setInputAction(function (evt) {
        //右键取消上一步
        if (that.deletePrompt) {
          that.deletePrompt.destroy();
          that.deletePrompt = null;
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
  }, {
    key: "getAll",
    value: function getAll() {
      return this.toolArr;
    }
  }, {
    key: "createByType",
    value: function createByType(opt) {
      var entityObj = undefined;
      var name = "";

      if (opt.type == "polyline") {
        entityObj = new CreatePolyline(this.viewer, opt.style);
        name = "折线_";
      }

      if (opt.type == "polygon") {
        entityObj = new CreatePolygon(this.viewer, opt.style);
        name = "面_";
      }

      if (opt.type == "billboard") {
        entityObj = new CreateBillboard(this.viewer, opt.style);
        name = "图标_";
      }

      if (opt.type == "circle") {
        entityObj = new CreateCircle(this.viewer, opt.style);
        name = "圆_";
      }

      if (opt.type == "rectangle") {
        entityObj = new CreateRectangle(this.viewer, opt.style);
        name = "矩形_";
      }

      if (opt.type == "gltfModel") {
        entityObj = new CreateGltfModel(this.viewer, opt.style);
        name = "模型_";
      }

      if (opt.type == "point") {
        entityObj = new CreatePoint(this.viewer, opt.style);
        name = "点_";
      }

      if (opt.type == "label") {
        entityObj = new CreateLabel(this.viewer, opt.style);
        name = "文字_";
      }

      if (opt.type == "arrow") {
        /**
        * situationType值及对应的类型：
        *  	1-攻击箭头 2-攻击箭头（平尾）3-攻击箭头（燕尾）4-闭合曲面 5-钳击箭头 
        * 		6-单尖直箭头 7-粗单尖直箭头(带燕尾) 8-集结地 9-弓形面 10-直箭头 
        * 		11-矩形旗 12-扇形 13-三角旗 14-矩形波浪旗 17-多边形 18-圆形
        */
        if (!opt.arrowType) {
          console.log("缺少军事标绘类型");
          return;
        }

        entityObj = new CreateArrow(this.viewer, opt.arrowType, opt.style);
      }

      if (entityObj) entityObj.name = name + new Date().getTime();
      return entityObj;
    }
  }]);

  return DrawTool;
}();

var BaseLayer = /*#__PURE__*/function () {
  function BaseLayer(viewer, opt) {
    _classCallCheck(this, BaseLayer);

    this.viewer = viewer;
    this.opt = opt || {};
    this.id = opt.id || Number(new Date().getTime() + "" + Number(Math.random() * 1000).toFixed(0));

    if (!opt.url && opt.type != "tdt" && opt.type != "grid") {
      console.log("缺少服务地址！", opt);
      return;
    } // 所加载的范围


    this.providerAttr = {};

    if (this.opt.rectangle) {
      this.opt.rectangle = new Cesium.Rectangle(Cesium.Math.toRadians(this.opt.rectangle[0]), Cesium.Math.toRadians(this.opt.rectangle[1]), Cesium.Math.toRadians(this.opt.rectangle[2]), Cesium.Math.toRadians(this.opt.rectangle[3]));
      this.providerAttr.rectangle = this.opt.rectangle; // 控制加载的范围
    } // 控制加载的层级


    if (this.opt.minimumLevel) this.providerAttr.minimumLevel = this.opt.minimumLevel;
    if (this.opt.maximumLevel) this.providerAttr.maximumLevel = this.opt.maximumLevel;
    this.providerAttr.url = opt.url;

    if (this.opt.srs == "EPSG:3857") {
      this.opt.tilingScheme = new Cesium.WebMercatorTilingScheme();
    } else if (this.opt.srs == "EPSG:4490") ; else if (this.opt.srs == "EPSG:4326") {
      this.opt.tilingScheme = new Cesium.GeographicTilingScheme();
    }

    this.providerAttr = Object.assign(this.opt, this.providerAttr);
    this._layer = null;
    this._provider = {};
  }

  _createClass(BaseLayer, [{
    key: "layer",
    get: function get() {
      return this._layer;
    } // 定义方法

  }, {
    key: "load",
    value: function load() {
      if (!this._provider || this._provider == {}) return;
      var options = {
        rectangle: this.opt.rectangle,

        /*  cutoutRectangle : this.opt.rectangle, */
        alpha: this.opt.alpha || 1,
        // 控制显示的层级
        show: this.opt.show == undefined ? true : this.opt.show
      };
      if (this.opt.minimumTerrainLevel) options.minimumTerrainLevel = this.opt.minimumTerrainLevel; // 控制显示的层级

      if (this.opt.maximumTerrainLevel) options.maximumTerrainLevel = this.opt.maximumTerrainLevel; // 控制显示的层级

      /* options = Object.assign(this.opt, options); */

      this._layer = new Cesium.ImageryLayer(this._provider, options);
      this.viewer.imageryLayers.add(this._layer, this.opt.zIndex);
      this._layer.attr = this.opt; // 保存配置信息
    }
  }, {
    key: "getLayer",
    value: function getLayer() {
      return this._layer;
    }
  }, {
    key: "remove",
    value: function remove() {
      if (this._layer) this.viewer.imageryLayers.remove(this._layer);
    }
  }, {
    key: "show",
    value: function show() {
      if (this._layer) {
        this._layer.show = true;
        this._layer.attr.show = true;
      }
    }
  }, {
    key: "hide",
    value: function hide() {
      if (this._layer) {
        this._layer.show = false;
        this._layer.attr.show = false;
      }
    }
  }, {
    key: "setVisible",
    value: function setVisible(visible) {
      visible = visible == undefined ? true : visible;

      if (visible) {
        this.show();
      } else {
        this.hide();
      }
    }
  }, {
    key: "zoomTo",
    value: function zoomTo() {
      if (this.opt.view) {
        cUtil$1.setCameraView(this.opt.view);
      } else {
        this.viewer.zoomTo(this._layer);
      }
    } // 设置透明度

  }, {
    key: "setAlpha",
    value: function setAlpha(alpha) {
      if (!this._layer) return;
      alpha = alpha == undefined ? 1 : alpha;
      this._layer.alpha = alpha;
    }
  }, {
    key: "lowerLayer",
    value: function lowerLayer() {
      if (this._layer) this.viewer.imageryLayers.lower(this._layer);
    }
  }, {
    key: "lowerLayerToBottom",
    value: function lowerLayerToBottom() {
      if (this._layer) this.viewer.imageryLayers.lowerToBottom(this._layer);
    }
  }, {
    key: "raiseLayer",
    value: function raiseLayer() {
      if (this._layer) this.viewer.imageryLayers.raise(this._layer);
    }
  }, {
    key: "raiselayerToTop",
    value: function raiselayerToTop() {
      if (this._layer) this.viewer.imageryLayers.raiseToTop(this._layer);
    }
  }]);

  return BaseLayer;
}();

var ArcgiscacheLayer = /*#__PURE__*/function (_BaseLayer) {
  _inherits(ArcgiscacheLayer, _BaseLayer);

  var _super = _createSuper(ArcgiscacheLayer);

  function ArcgiscacheLayer(viewer, opt) {
    var _this;

    _classCallCheck(this, ArcgiscacheLayer);

    _this = _super.call(this, viewer, opt);
    _this.type = "arcgiscache";

    if (!Cesium.UrlTemplateImageryProvider.prototype.padLeft0) {
      Cesium.UrlTemplateImageryProvider.prototype.padLeft0 = function (numStr, n) {
        numStr = String(numStr);
        var len = numStr.length;

        while (len < n) {
          numStr = "0" + numStr;
          len++;
        }

        return numStr;
      };
    }

    var customTags = {
      //小写
      "arc_x": function arc_x(imageryProvider, x, y, level) {
        return imageryProvider.padLeft0(x.toString(16), 8);
      },
      "arc_y": function arc_y(imageryProvider, x, y, level) {
        return imageryProvider.padLeft0(y.toString(16), 8);
      },
      "arc_z": function arc_z(imageryProvider, x, y, level) {
        return imageryProvider.padLeft0(level.toString(), 2);
      },
      "arc_z4490": function arc_z4490(imageryProvider, x, y, level) {
        return imageryProvider.padLeft0((level + 1).toString(), 2);
      },
      //大写
      "arc_X": function arc_X(imageryProvider, x, y, level) {
        return imageryProvider.padLeft0(x.toString(16), 8).toUpperCase();
      },
      "arc_Y": function arc_Y(imageryProvider, x, y, level) {
        return imageryProvider.padLeft0(y.toString(16), 8).toUpperCase();
      },
      "arc_Z": function arc_Z(imageryProvider, x, y, level) {
        return imageryProvider.padLeft0(level.toString(), 2).toUpperCase();
      },
      "arc_Z4490": function arc_Z4490(imageryProvider, x, y, level) {
        return imageryProvider.padLeft0((level + 1).toString(), 2).toUpperCase();
      }
    };
    var pattr = Object.assign(_this.providerAttr, {
      customTags: customTags
    });
    _this._provider = new Cesium.UrlTemplateImageryProvider(pattr);
    return _this;
  }

  return _createClass(ArcgiscacheLayer);
}(BaseLayer);

var MapserverLayer = /*#__PURE__*/function (_BaseLayer) {
  _inherits(MapserverLayer, _BaseLayer);

  var _super = _createSuper(MapserverLayer);

  function MapserverLayer(viewer, opt) {
    var _this;

    _classCallCheck(this, MapserverLayer);

    _this = _super.call(this, viewer, opt);
    _this.type = "mapserver";
    _this._provider = new Cesium.ArcGisMapServerImageryProvider(_this.providerAttr);
    return _this;
  }

  return _createClass(MapserverLayer);
}(BaseLayer);

var GridLayer = /*#__PURE__*/function (_BaseLayer) {
  _inherits(GridLayer, _BaseLayer);

  var _super = _createSuper(GridLayer);

  function GridLayer(viewer, opt) {
    var _this;

    _classCallCheck(this, GridLayer);

    _this = _super.call(this, viewer, opt);
    _this.type = "grid";
    var layerColor = Cesium.Color.fromCssColorString(opt.color || '#C0C0C0');
    _this.viewer.scene.globe.baseColor = Cesium.Color.GREY;
    _this.providerAttr.cells = _this.providerAttr.cells || 4;
    _this.providerAttr.color = layerColor;
    _this._provider = new Cesium.GridImageryProvider(_this.providerAttr);
    return _this;
  }

  return _createClass(GridLayer);
}(BaseLayer);

var GeojsonLayer = /*#__PURE__*/function (_BaseLayer) {
  _inherits(GeojsonLayer, _BaseLayer);

  var _super = _createSuper(GeojsonLayer);

  function GeojsonLayer(viewer, opt) {
    var _this;

    _classCallCheck(this, GeojsonLayer);

    _this = _super.call(this, viewer, opt);
    _this.type = "geojson";
    _this.viewer = viewer;
    _this.opt = opt || {};
    var defaultStyleVal = {
      "point": {
        "color": "#00FFFF",
        "colorAlpha": 1,
        "outlineWidth": 1,
        "outlineColor": "#000000",
        "outlineColorAlpha": 1,
        "pixelSize": 20
      },
      "polyline": {
        "color": "#FFFF00",
        "colorAlpha": 1,
        "width": 3,
        "clampToGround": 1
      },
      "polygon": {
        "heightReference": 1,
        "fill": true,
        "color": "#00FFFF",
        "colorAlpha": 1,
        "outline": true,
        "outlineWidth": 1,
        "outlineColor": "#FFFF00",
        "outlineColorAlpha": 1
      }
    };
    _this.style = Object.assign(defaultStyleVal, opt.style || {});
    _this.url = _this.opt.url || "";

    if (_this.url.indexOf("WFS") != -1) {
      // wfs服务
      _this.url = _this.opt.url + "?service=WFS&version=1.0.0&request=GetFeature&typeName=".concat(_this.opt.typeName, "&maxFeatures=50&outputFormat=application%2Fjson");
    }

    _this._layer = new Cesium.CustomDataSource(_this.opt.typeName || "geojson" + new Date().getTime());
    _this._layer.attr = _this.opt; // 绑定配置信息

    _this.viewer.dataSources.add(_this._layer);

    return _this;
  } // 加载


  _createClass(GeojsonLayer, [{
    key: "load",
    value: function load(fun) {
      var that = this;
      var resourece = Cesium.Resource.fetchJson({
        url: this.url
      });
      resourece.then(function (data) {
        var features = data.features;

        for (var i = 0; i < features.length; i++) {
          var feature = features[i];
          var geometry = feature.geometry,
              properties = feature.properties;
          if (!geometry) continue;
          var type = geometry.type,
              coordinates = geometry.coordinates;
          var positions = [];

          switch (type) {
            case "Point":
              // 当geojson是单点时  可能创建点 图标点 单个模型
              var position = cUtil$1.lnglatToCartesian(coordinates);
              var point = that.createPoint(position, that.style["point"], properties);
              point.properties = properties;
              if (that.opt.popup) point.popup = that.getContent(properties, that.opt.popup);
              if (that.opt.tooltip) point.tooltip = that.getContent(properties, that.opt.tooltip);
              break;

            case "MultiPoint":
              for (var _i = 0; _i < coordinates.length; _i++) {
                var _position = cUtil$1.lnglatToCartesian(coordinates[_i]);

                var _point = that.createPoint(_position, that.style["point"], properties);

                _point.properties = properties;
                if (that.opt.popup) _point.popup = that.getContent(properties, that.opt.popup);
                if (that.opt.tooltip) _point.tooltip = that.getContent(properties, that.opt.tooltip);
              }

              break;

            case "LineString":
              positions = cUtil$1.lnglatsToCartesians(coordinates);
              var polyline = that.createPolyline(positions, that.style["polyline"], properties);
              polyline.properties = properties;
              if (that.opt.popup) polyline.popup = that.getContent(properties, that.opt.popup);
              if (that.opt.tooltip) polyline.tooltip = that.getContent(properties, that.opt.tooltip); // 构建折线

              break;

            case "MultiLineString":
              for (var _i2 = 0; _i2 < coordinates.length; _i2++) {
                var positions_lineString = cUtil$1.lnglatsToCartesians(coordinates[_i2]);

                var _polyline = that.createPolyline(positions_lineString, that.style["polyline"], properties);

                _polyline.show = that.opt.show == undefined ? true : that.opt.show;
                _polyline.properties = properties;
                if (that.opt.popup) _polyline.popup = that.getContent(properties, that.opt.popup);
                if (that.opt.tooltip) _polyline.tooltip = that.getContent(properties, that.opt.tooltip);
              }

              break;

            case "Polygon":
              positions = cUtil$1.lnglatsToCartesians(coordinates[0]);
              var polygon = that.createPolygon(positions, that.style["polygon"], properties);
              polygon.show = that.opt.show == undefined ? true : that.opt.show;
              polygon.properties = properties;
              if (that.opt.popup) polygon.popup = that.getContent(properties, that.opt.popup);
              if (that.opt.tooltip) polygon.tooltip = that.getContent(properties, that.opt.tooltip);
              break;

            case "MultiPolygon":
              for (var _i3 = 0; _i3 < coordinates.length; _i3++) {
                var positions_mulitipolygon = cUtil$1.lnglatsToCartesians(coordinates[_i3][0]);

                var _polygon = that.createPolygon(positions_mulitipolygon, that.style["polygon"], properties);

                _polygon.show = that.opt.show == undefined ? true : that.opt.show;
                _polygon.properties = properties;
                if (that.opt.popup) _polygon.popup = that.getContent(properties, that.opt.popup);
                if (that.opt.tooltip) _polygon.tooltip = that.getContent(properties, that.opt.tooltip);
              }

              break;
          }
        }

        if (fun) fun();
      });
    }
  }, {
    key: "zoomTo",
    value: function zoomTo() {
      if (!this._layer) return;

      if (this._layer.attr.view) {
        cUtil$1.setCameraView(opt.view);
      } else {
        this.viewer.zoomTo(this._layer.entities);
      }
    } // 移除

  }, {
    key: "remove",
    value: function remove() {
      if (this._layer) {
        this.viewer.dataSources.remove(this._layer);
      }
    } // 显示

  }, {
    key: "show",
    value: function show() {
      if (this._layer) {
        this._layer.show = true;
        this._layer.attr.show = true;
      }
    } // 隐藏

  }, {
    key: "hide",
    value: function hide() {
      if (this._layer) {
        this._layer.attr.show = false;
        this._layer.show = false;
      }
    }
  }, {
    key: "getContent",
    value: function getContent(properties, fields) {
      var html = "";

      for (var i = 0; i < fields.length; i++) {
        var _fields$i = fields[i],
            field = _fields$i.field,
            fieldName = _fields$i.fieldName;
        var value = properties[field];
        html += "\n                <tr>\n                    <td>".concat(fieldName, "\uFF1A</td>\n                    <td>").concat(value, "</td>\n                </tr>\n            ");
      }

      return "\n            <table>".concat(html, "</table>\n        ");
    }
  }, {
    key: "getStyleValue",
    value: function getStyleValue(key, value, conditions) {
      var styleValue = null; // 获取默认值

      for (var ind = 0; ind < conditions.length; ind++) {
        if (conditions[ind][0] == "true") {
          styleValue = conditions[ind][1];
          break;
        }
      }

      for (var i = 0; i < conditions.length; i++) {
        var condition = conditions[i];
        var replaceStr = "${" + key + "}";
        var str = condition[0].replace(replaceStr, "\"" + value + "\"");
        console.log("eval===>", str, eval(str));

        if (eval(str)) {
          styleValue = condition[1];
          break;
        }
      }

      return styleValue;
    }
  }, {
    key: "setAlpha",
    value: function setAlpha(alpha) {
      var entities = this._layer.entities.values;
      entities.forEach(function (entity) {
        var style = entity.style;
        var color = null;
        color = Cesium.Color.fromCssColorString(style.color);
        color = color.withAlpha(alpha || 1);
        var outlineColor = null;
        outlineColor = Cesium.Color.fromCssColorString(style.outlineColor);
        outlineColor = outlineColor.withAlpha(alpha || 1);

        if (entity.point) {
          entity.point.color = color;
          entity.point.outlineColor = outlineColor;
        }

        if (entity.polygon) {
          entity.polygon.material = color;
        }

        if (entity.polyline) {
          entity.polyline.material = outlineColor;
        }
      });
    }
  }, {
    key: "createPoint",
    value: function createPoint(position, style, properties) {
      style = this.getNewStyle(style, properties);
      var color = null;
      style.color = style.color || "#ffff00";
      style.colorAlpha = style.colorAlpha || 1;
      color = Cesium.Color.fromCssColorString(style.color);
      color = color.withAlpha(style.colorAlpha);
      var outlineColor = null;
      style.outlineColor = style.outlineColor || "#000000";
      style.outlineColorAlpha = style.outlineColorAlpha || 1;
      outlineColor = Cesium.Color.fromCssColorString(style.outlineColor);
      outlineColor = outlineColor.withAlpha(style.outlineColorAlpha);

      var ent = this._layer.entities.add({
        position: position,
        point: {
          color: color,
          outlineColor: outlineColor,
          outlineWidth: style.outlineWidth || 1,
          pixelSize: style.pixelSize || 6,
          heightReference: 1
        }
      });

      ent.style = style;
      return ent;
    }
  }, {
    key: "createPolygon",
    value: function createPolygon(positions, style, properties) {
      style = this.getNewStyle(style, properties);
      var color = null;
      style.color = style.color || "#ffff00";
      style.colorAlpha = style.colorAlpha || 1;
      color = Cesium.Color.fromCssColorString(style.color);
      color = color.withAlpha(style.colorAlpha);
      var outlineColor = null;
      style.outlineColor = style.outlineColor || "#000000";
      style.outlineColorAlpha = style.outlineColorAlpha || 1;
      outlineColor = Cesium.Color.fromCssColorString(style.outlineColor);
      outlineColor = outlineColor.withAlpha(style.outlineColorAlpha);
      var grapicOpt = {};
      grapicOpt.polygon = {
        hierarchy: new Cesium.PolygonHierarchy(positions),
        heightReference: 1,
        material: color
      };

      if (style.outline) {
        grapicOpt.polyline = {
          positions: new Cesium.CallbackProperty(function () {
            return positions;
          }, false),
          material: outlineColor,
          width: style.outlineWidth || 1,
          clampToGround: true
        };
      }

      var ent = this._layer.entities.add(grapicOpt);

      ent.style = style;
      return ent;
    }
  }, {
    key: "createPolyline",
    value: function createPolyline(positions, style, properties) {
      style = this.getNewStyle(style, properties);
      var color = null;
      style.color = style.color || "#ffff00";
      style.colorAlpha = style.colorAlpha || 1;
      color = Cesium.Color.fromCssColorString(style.color);
      color = color.withAlpha(style.colorAlpha);

      var ent = this._layer.entities.add({
        polyline: {
          positions: positions,
          material: color,
          width: style.width || 3,
          clampToGround: true
        }
      });

      ent.style = style;
      return ent;
    }
  }, {
    key: "getRandomColor",
    value: function getRandomColor() {
      var color = "#";
      var arr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];

      for (var i = 0; i < 6; i++) {
        var num = parseInt(Math.random() * 16);
        color += arr[num];
      }

      return color;
    }
  }, {
    key: "getNewStyle",
    value: function getNewStyle(style, properties) {
      style = JSON.parse(JSON.stringify(style || {}));
      var newStyle = {};
      if (!properties) return style;

      for (var i in style) {
        if (style[i].conditions && style[i].conditions instanceof Array) {
          var field = style[i].field;
          var conditions = style[i].conditions;
          var val = properties[field];
          newStyle[i] = this.getStyleValue(field + '', val, conditions);
        } else if (style[i] instanceof String) {
          newStyle[i] = style[i];
        } else if (style[i].conditions == "random") {
          // 标识根据字段设置随机值
          if (style[i].type == "color") {
            newStyle[i] = this.getRandomColor();
          }

          if (style[i].type == "number") {
            newStyle[i] = Math.random() * 100;
          }
        }
      }

      style = Object.assign(style, newStyle);
      return style;
    }
  }]);

  return GeojsonLayer;
}(BaseLayer);

var TDTLayer = /*#__PURE__*/function (_BaseLayer) {
  _inherits(TDTLayer, _BaseLayer);

  var _super = _createSuper(TDTLayer);

  function TDTLayer(viewer, opt) {
    var _this;

    _classCallCheck(this, TDTLayer);

    // 内置keys
    var keys = ["313cd4b28ed520472e8b43de00b2de56", "83b36ded6b43b9bc81fbf617c40b83b5", "0ebd57f93a114d146a954da4ecae1e67", "6c99c7793f41fccc4bd595b03711913e", "56b81006f361f6406d0e940d2f89a39c"];
    _this = _super.call(this, viewer, opt);
    _this.type = "tdt";
    _this.opt = opt || {}; // 设定key 

    if (!_this.opt.keys || _this.opt.keys.length == 0) {
      var random = Math.random() * keys.length;
      random = Math.floor(random);
      _this.key = keys[random];
    } else {
      if (Array.isArray(_this.opt.keys)) {
        var _random = Math.random() * _this.opt.key.length;

        _random = Math.floor(_random);
        _this.key = keys[_random];
      } else {
        _this.key = _this.opt.keys;
      }
    } // vec（矢量底图）/ cva（矢量注记）/ img（影像底图）/ ter（地形晕渲）
    // cta（地形注记）/ ibo（全球境界）/ eva（矢量英文注记）/ eia（影像英文注记）


    if (!_this.opt.layerName) {
      console.log("缺少图层名称");
      return _possibleConstructorReturn(_this);
    }

    var tileMatrixSetID = "";
    var tdtLayerName = "";

    if (_this.opt.crs == 4326) {
      // 经纬度
      tileMatrixSetID = "c";
      tdtLayerName = _this.opt.layerName + "_c";
    } else {
      // 墨卡托  3857
      tileMatrixSetID = "w";
      tdtLayerName = _this.opt.layerName + "_w";
    }

    var url = 'https://t{s}.tianditu.gov.cn/' + tdtLayerName + '/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=' + _this.opt.layerName + '&style={style}&tilerow={TileRow}&tilecol={TileCol}&tilematrixset={TileMatrixSet}&format=tiles&tk=' + _this.key;
    var maxLevel = 18;
    var tileMatrixLabels = [];

    for (var z = 0; z <= maxLevel; z++) {
      tileMatrixLabels[z] = z.toString();
    }

    var pattr = {
      url: url,
      layer: tdtLayerName,
      style: 'default',
      format: 'tiles',
      tileMatrixSetID: tileMatrixSetID,
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
      tileMatrixLabels: tileMatrixLabels,
      tilingScheme: new Cesium.WebMercatorTilingScheme()
    };
    pattr = Object.assign(_this.providerAttr || {}, pattr);
    _this._provider = new Cesium.WebMapTileServiceImageryProvider(pattr);
    return _this;
  }

  return _createClass(TDTLayer);
}(BaseLayer);

var SingleImageLayer = /*#__PURE__*/function (_BaseLayer) {
  _inherits(SingleImageLayer, _BaseLayer);

  var _super = _createSuper(SingleImageLayer);

  function SingleImageLayer(viewer, opt) {
    var _this;

    _classCallCheck(this, SingleImageLayer);

    _this = _super.call(this, viewer, opt);
    _this.type = "singleImage";
    _this._provider = new Cesium.SingleTileImageryProvider(_this.opt);
    return _this;
  }

  return _createClass(SingleImageLayer);
}(BaseLayer);

var TMSLayer = /*#__PURE__*/function (_BaseLayer) {
  _inherits(TMSLayer, _BaseLayer);

  var _super = _createSuper(TMSLayer);

  function TMSLayer(viewer, opt) {
    var _this;

    _classCallCheck(this, TMSLayer);

    _this = _super.call(this, viewer, opt);
    _this.type = "tmsLayer";
    _this._provider = new Cesium.TileMapServiceImageryProvider(_this.opt);
    return _this;
  }

  return _createClass(TMSLayer);
}(BaseLayer);

var XYZLayer = /*#__PURE__*/function (_BaseLayer) {
  _inherits(XYZLayer, _BaseLayer);

  var _super = _createSuper(XYZLayer);

  function XYZLayer(viewer, opt) {
    var _this;

    _classCallCheck(this, XYZLayer);

    _this = _super.call(this, viewer, opt);
    _this.type = "XYZLayer";
    _this._provider = new Cesium.UrlTemplateImageryProvider(_this.providerAttr);
    return _this;
  } // 获取当前图层


  _createClass(XYZLayer, [{
    key: "layer",
    get: function get() {
      return this._layer;
    }
  }, {
    key: "provider",
    get: function get() {
      return this._provider;
    }
  }]);

  return XYZLayer;
}(BaseLayer);

var TilesetLayer = /*#__PURE__*/function (_BaseLayer) {
  _inherits(TilesetLayer, _BaseLayer);

  var _super = _createSuper(TilesetLayer);

  function TilesetLayer(viewer, opt) {
    var _this;

    _classCallCheck(this, TilesetLayer);

    _this = _super.call(this, viewer, opt);
    _this.opt = opt || {};
    _this.type = "3dtiles";

    if (!_this.opt.url) {
      console.log("缺少服务地址！", opt);
    }

    _this._layer = undefined;
    return _this;
  } // 获取当前图层


  _createClass(TilesetLayer, [{
    key: "layer",
    get: function get() {
      return this._layer;
    } // 加载

  }, {
    key: "load",
    value: function load(fun) {
      var that = this;
      var test = this.viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
        maximumScreenSpaceError: this.opt.maximumScreenSpaceError || 1,
        url: this.opt.url,

        /*  maximumMemoryUsage: 1024, */

        /* debugShowBoundingVolume:true, */

        /*  preloadWhenHidden: true, */
        preferLeaves: true
        /*  skipLevelOfDetail: true,
         immediatelyLoadDesiredLevelOfDetail: true, */

      }));
      test.readyPromise.then(function (tileset) {
        that._layer = tileset;
        that._layer.layerConfig = that.opt; // 保存配置信息

        that._layer.initBoundingSphere = tileset.boundingSphere.clone(); // 初始化中心

        that._layer.show = that.opt.show == undefined ? true : that.opt.show;

        if (that.opt.center) {
          // 设定模型中心点
          that.setCenter(that.opt.center);
        }

        if (that.opt.position) {
          // 设定模型位置
          that.setPosition(that.opt.position);
        }

        if (that.opt.flyTo) {
          // 是否定位
          that.zoomTo();
        }

        if (that.opt.style) that.updateStyle(tileset, that.opt.style);
        if (fun) fun(tileset);
      }).otherwise(function (error) {});
    }
  }, {
    key: "remove",
    value: function remove() {
      if (this._layer) {
        this.viewer.scene.primitives.remove(this._layer);
      }
    }
  }, {
    key: "show",
    value: function show() {
      if (this._layer) {
        this._layer.show = true;
        this._layer.layerConfig.show = true;
      }
    }
  }, {
    key: "hide",
    value: function hide() {
      if (this._layer) {
        this._layer.show = false;
        this._layer.layerConfig.show = false;
      }
    }
  }, {
    key: "zoomTo",
    value: function zoomTo() {
      if (!this._layer) return;

      if (this._layer.layerConfig.view) {
        cUtil.setCameraView(this._layer.layerConfig.view);
      } else {
        this.viewer.flyTo(this._layer, new Cesium.HeadingPitchRange(Cesium.Math.toRadians(0), Cesium.Math.toRadians(-60), this._layer.boundingSphere.radius * 5));
      }
    }
  }, {
    key: "setCenter",
    value: function setCenter(opt) {
      var cartographic = Cesium.Cartographic.fromCartesian(this._layer.initBoundingSphere.center);
      var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);
      var lng = opt.x || Cesium.Math.toDegrees(cartographic.longitude);
      var lat = opt.y || Cesium.Math.toDegrees(cartographic.latitude);
      var offset = Cesium.Cartesian3.fromDegrees(lng, lat, opt.z || 0);
      var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
      this._layer.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    }
  }, {
    key: "setPosition",
    value: function setPosition(position) {
      if (!position) {
        return;
      }

      var center;

      if (position instanceof Cesium.Cartesian3) {
        center = position.clone();
      } else {
        center = Cesium.Cartesian3.fromDegrees(position.x, position.y, position.z);
      }

      var mtx = Cesium.Transforms.eastNorthUpToFixedFrame(center);
      this._layer._root.transform = mtx;
    }
  }, {
    key: "updateStyle",
    value: function updateStyle(tileset, style) {
      if (!tileset || !style) return;
      tileset.style = new Cesium.Cesium3DTileStyle(style);
    }
  }, {
    key: "setAlpha",
    value: function setAlpha(alpha) {
      alpha = alpha == undefined ? 1 : alpha;
      this._layer.style = new Cesium.Cesium3DTileStyle({
        color: "color('rgba(255,255,255," + alpha + ")')"
      });
    }
  }]);

  return TilesetLayer;
}(BaseLayer);

var WMSLayer = /*#__PURE__*/function (_BaseLayer) {
  _inherits(WMSLayer, _BaseLayer);

  var _super = _createSuper(WMSLayer);

  function WMSLayer(viewer, opt) {
    var _this;

    _classCallCheck(this, WMSLayer);

    _this = _super.call(this, viewer, opt);
    _this.type = "wms";

    if (!_this.providerAttr.layers) {
      console.log("当前服务缺少 layers 参数！", _this.providerAttr);
    }

    _this._provider = new Cesium.WebMapServiceImageryProvider(_this.providerAttr);
    return _this;
  }

  return _createClass(WMSLayer);
}(BaseLayer);

var LayerTool = /*#__PURE__*/function () {
  function LayerTool(viewer) {
    _classCallCheck(this, LayerTool);

    this.viewer = viewer;
    this._layerObjs = [];
  }

  _createClass(LayerTool, [{
    key: "layers",
    get: function get() {
      return this._layerObjs;
    }
  }, {
    key: "add",
    value: function add(opt) {
      var layerObj = null;
      opt = JSON.parse(JSON.stringify(opt || {}));
      var type = opt.type;

      switch (type) {
        case "xyz":
          //xyz格式切片
          layerObj = new XYZLayer(this.viewer, opt);
          break;

        case "wfs": // wfs服务

        case "geojson":
          // geojson格式数据
          layerObj = new GeojsonLayer(this.viewer, opt);
          break;

        case "mapserver":
          // arcgis标准mapserver服务
          layerObj = new MapserverLayer(this.viewer, opt);
          break;

        case "arcgiscache":
          // arcmap标注wgs84切片
          layerObj = new ArcgiscacheLayer(this.viewer, opt);
          break;

        case "tdt":
          // 天地图图层
          layerObj = new TDTLayer(this.viewer, opt);
          break;

        case "singleImage":
          // 单张图片  
          layerObj = new SingleImageLayer(this.viewer, opt);
          break;

        case "tms":
          // 标准tms类型
          layerObj = new TMSLayer(this.viewer, opt);
          break;

        case "3dtiles":
          // 模型
          layerObj = new TilesetLayer(this.viewer, opt);
          break;

        case "wms":
          // 模型
          layerObj = new WMSLayer(this.viewer, opt);
          break;

        case "grid":
          // 网格图层
          layerObj = new GridLayer(this.viewer, opt);
          break;
      }

      if (!layerObj) return;

      if (layerObj.type == "3dtiles" || layerObj.type == "geojson") {
        layerObj.load(function () {
          if (opt.alpha != undefined) layerObj.setAlpha(opt.alpha);
          layerObj.setVisible(opt.show);
        });
      } else {
        layerObj.load();
        if (opt.alpha != undefined) layerObj.setAlpha(opt.alpha);
        layerObj.setVisible(opt.show);
      }

      this._layerObjs.push(layerObj);

      opt.id = opt.id || Number(new Date().getTime() + "" + Number(Math.random() * 1000).toFixed(0));
      opt.alpha = opt.alpha == undefined ? 1 : opt.alpha;
      layerObj.attr = opt; // 绑定属性文件

      return layerObj;
    }
  }, {
    key: "getLayerObjById",
    value: function getLayerObjById(id) {
      if (!id) return;
      var obj = {};

      for (var i = 0; i < this._layerObjs.length; i++) {
        if (this._layerObjs[i].attr.id == id) {
          obj = {
            layerObj: this._layerObjs[i],
            index: i
          };
          break;
        }
      }

      return obj;
    }
    /**
     * 获取当前图层对象
     * @param {Object} query 
     */

  }, {
    key: "getLayerObj",
    value: function getLayerObj(query) {
      var key = query.key,
          value = query.value;
      var obj = {};

      for (var i = 0; i < this._layerObjs.length; i++) {
        if (this._layerObjs[i].attr[key] == value) {
          obj = {
            layerObj: this._layerObjs[i],
            index: i
          };
          break;
        }
      }
    }
  }, {
    key: "removeLayerObj",
    value: function removeLayerObj(layerObj) {
      if (!layerObj) return;
      this.removeLayerObjById(layerObj.id);
    }
  }, {
    key: "removeLayerObjById",
    value: function removeLayerObjById(id) {
      if (!id) return;
      var lyropt = this.getLayerObjById(id);

      if (lyropt && lyropt.layerObj) {
        lyropt.layerObj.remove();

        this._layerObjs.splice(lyropt.index, 1);
      }
    }
  }, {
    key: "removeAll",
    value: function removeAll() {
      for (var i = 0; i < this._layerObjs.length; i++) {
        this._layerObjs[i].remove();
      }

      this._layerObjs = [];
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.removeAll();
      this._layerObjs = [];
      delete this._layerObjs;
    }
  }, {
    key: "hideById",
    value: function hideById(id) {
      if (!id) return;
      var layerOpt = this.getLayerObjById(id);

      if (layerOpt && layerOpt.layerObj) {
        layerOpt.layerObj.hide();
        layerOpt.layerObj.attr.show = false;
      }
    }
  }, {
    key: "showById",
    value: function showById(id) {
      if (!id) return;
      var layerOpt = this.getLayerObjById(id);

      if (layerOpt && layerOpt.layerObj) {
        layerOpt.layerObj.show();
        layerOpt.layerObj.attr.show = true;
      }
    }
  }, {
    key: "setVisible",
    value: function setVisible(id, isShow) {
      if (!id) return;

      if (isShow) {
        this.showById(id);
      } else {
        this.hideById(id);
      }
    } // 缩放到某个

  }, {
    key: "zoomTo",
    value: function zoomTo(id) {
      if (!id) return;
      var layobj = this.getLayerObjById(id) || {};
      if (layobj && layobj.layerObj) layobj.layerObj.zoomTo();
    }
  }, {
    key: "hideAll",
    value: function hideAll() {
      for (var i = 0; i < this._layerObjs.length; i++) {
        this._layerObjs[i].hide();
      }
    } // 获取当前所有显示的图层

  }, {
    key: "getAllshow",
    value: function getAllshow() {
      var arr = [];

      for (var i = 0; i < this._layerObjs.length; i++) {
        if (this._layerObjs[i].attr.show) {
          arr.push(this._layerObjs[i]);
        }
      }

      return arr;
    }
  }, {
    key: "getAllhide",
    value: function getAllhide() {
      var arr = [];

      for (var i = 0; i < this._layerObjs.length; i++) {
        if (!this._layerObjs[i].attr.show) {
          arr.push(this._layerObjs[i]);
        }
      }

      return arr;
    } // 根据字段来进行查询

  }, {
    key: "getLayerObjByField",
    value: function getLayerObjByField(field, val) {
      if (!field) return;
      var returnData = [];

      for (var i = 0; i < this._layerObjs.length; i++) {
        if (this._layerObjs[i].attr[field] == val) {
          returnData.push(this._layerObjs[i]);
        }
      }

      return returnData;
    }
  }, {
    key: "lowerLayer",
    value: function lowerLayer(opt) {
      if (!opt) return;

      if (opt instanceof String) {
        opt = {
          key: "id",
          value: opt
        };
      }

      var obj = this.getLayerObj(opt);
      if (obj && obj.layerObj) obj.layerObj.lowerLayer();
    }
  }, {
    key: "lowerLayerToBottom",
    value: function lowerLayerToBottom(opt) {
      if (!opt) return;

      if (opt instanceof String) {
        opt = {
          key: "id",
          value: opt
        };
      }

      var obj = this.getLayerObj(opt);
      if (obj && obj.layerObj) obj.layerObj.lowerLayerToBottom();
    }
  }, {
    key: "raiseLayer",
    value: function raiseLayer() {
      if (!opt) return;

      if (opt instanceof String) {
        opt = {
          key: "id",
          value: opt
        };
      }

      var obj = this.getLayerObj(opt);
      if (obj && obj.layerObj) obj.layerObj.raiseLayer();
    }
  }, {
    key: "raiselayerToTop",
    value: function raiselayerToTop() {
      if (!opt) return;

      if (opt instanceof String) {
        opt = {
          key: "id",
          value: opt
        };
      }

      var obj = this.getLayerObj(opt);
      if (obj && obj.layerObj) obj.layerObj.raiselayerToTop();
    }
  }]);

  return LayerTool;
}();

var PopupTooltipTool = /*#__PURE__*/function () {
  function PopupTooltipTool(viewer, opt) {
    _classCallCheck(this, PopupTooltipTool);

    this.viewer = viewer;
    this.opt = opt || {};
    this.toolOpen = true;
    this.popupHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.tooltipHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.lastTooltipPromptEnt = undefined;
    this.defaultVal = {
      type: 2,
      show: true
    };
  } // 点击气泡窗


  _createClass(PopupTooltipTool, [{
    key: "autoBindPopup",
    value: function autoBindPopup() {
      var that = this;
      this.popupHandler.setInputAction(function (evt) {
        //单击开始绘制
        if (!that.toolOpen) return;
        var pick = that.viewer.scene.pick(evt.position);

        if (!Cesium.defined(pick)) {
          return;
        }

        var ent;

        if (pick.primitive) {
          // 拾取图元
          ent = pick.primitive;
        }

        if (pick.id && pick.id instanceof Cesium.Entity) {
          ent = pick.id;
        }
        /* 如果当前实体绑定了点击事件 则执行点击事件*/


        if (ent.click) ent.click(ent); // 如果当前实体绑定了气泡窗 则弹出气泡窗

        if (ent.popup == undefined) return;

        if (!ent.popupPrompt) {
          var popup = {};

          if (typeof ent.popup == "string") {
            popup.content = ent.popup;
          } else {
            popup = Object.assign(popup, ent.popup);
          }

          popup.type = popup.type || 2; // 点击弹窗默认为固定点位弹窗

          ent.popupPrompt = that.createPrompt(ent, popup, evt.position);
          ent.popupPrompt.ent = ent; // 双向绑定
        }

        if (!ent.position) ent.popupPrompt.update(evt.position); // 除点状坐标外

        var isvisible;

        if (ent.popup.constructor == String) {
          isvisible = true;
        } else {
          // 可通过改变属性改变显示隐藏
          isvisible = ent.popup.show == undefined ? true : ent.popup.show;
        }

        ent.popupPrompt.setVisible(isvisible);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    } // 鼠标移入气泡窗

  }, {
    key: "autoBindTooltip",
    value: function autoBindTooltip() {
      var that = this;
      this.popupHandler.setInputAction(function (evt) {
        //单击开始绘制
        if (!that.toolOpen) return;
        var pick = that.viewer.scene.pick(evt.endPosition);
        var ent;

        if (pick && pick.primitive) {
          // 拾取图元
          ent = pick.primitive;
        }

        if (pick && pick.id && pick.id instanceof Cesium.Entity) {
          ent = pick.id;
        }
        /* 以下几种形式销毁弹窗
        1、未拾取到对象
        2、拾取到的对象不是上一个对象 */


        if (!ent) {
          if (that.lastTooltipPromptEnt && that.lastTooltipPromptEnt.tooltipPrompt) {
            that.lastTooltipPromptEnt.tooltipPrompt.destroy();
            that.lastTooltipPromptEnt.tooltipPrompt = null;
          }

          return;
        } else {
          if (that.lastTooltipPromptEnt && that.lastTooltipPromptEnt.tooltipPrompt && ent.id != that.lastTooltipPromptEnt.id) {
            that.lastTooltipPromptEnt.tooltipPrompt.destroy();
            that.lastTooltipPromptEnt.tooltipPrompt = null;
          }
        }

        if (ent.tooltip == undefined || ent.tooltip == "") return; // 修改位置   

        if (ent.tooltipPrompt) {
          ent.tooltipPrompt.update(evt.endPosition); // 除点状坐标外 点状坐标的锚点 为创建时的位置
        } else {
          // 重新构建
          ent.tooltipPrompt = that.createPrompt(ent, ent.tooltip, evt.endPosition);
        }

        var isvisible;

        if (ent.tooltip.constructor == String) {
          isvisible = true;
        } else {
          // 可通过改变属性改变显示隐藏
          isvisible = ent.tooltip.show == undefined ? true : ent.tooltip.show;
        }

        ent.tooltipPrompt.setVisible(isvisible);
        that.lastTooltipPromptEnt = ent;
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
  }, {
    key: "createPrompt",
    value: function createPrompt(ent, promptAttr, px) {
      var position;
      var defaultVal = JSON.parse(JSON.stringify(this.defaultVal));

      if (ent.billboard || ent.point || ent.model) {
        position = ent.position.getValue(this.viewer.clock.currentTime);
      } else {
        position = px;
      }

      if (ent.tooltip) {
        this.defaultVal.closeBtn = false;
      }

      defaultVal.position = position;

      if (promptAttr.constructor == String) {
        // 支持两种传参 字符串 / 对象
        defaultVal.content = promptAttr;
      } else {
        defaultVal = Object.assign(defaultVal, promptAttr);
      }

      return new Prompt$1(this.viewer, defaultVal);
    } // 关闭

  }, {
    key: "close",
    value: function close() {
      this.toolOpen = false;
    }
  }, {
    key: "open",
    value: function open() {
      this.toolOpen = true;
    }
  }]);

  return PopupTooltipTool;
}();

var RightTool = /*#__PURE__*/function () {
  function RightTool(viewer, opt) {
    _classCallCheck(this, RightTool);

    opt = opt || {};
    var defaultVal = {
      lnglat: true,
      cameraView: true,
      depth: true
    };
    this.opt = Object.assign(defaultVal, opt);

    if (!viewer) {
      console.log("缺少viewer对象！");
      return;
    }

    this.viewer = viewer;
    this.mapContainer = this.viewer.container;
    this.rightClickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.randomId = new Date().getTime() + "" + Math.ceil(Math.random() * 10000);
    var toolHtml = "\n            <div class=\"easy3d-right-tool\" id=\"easy3d-right-tool-".concat(this.randomId, "\">\n                <ul>\n                </ul>\n            </div>\n        ");
    $(this.mapContainer).append(toolHtml); // 点击其它地方 关闭面板

    $(document).off("click").on("click", function () {
      $(".easy3d-right-tool").hide();
    });
    $(".easy3d-right-tool").click(function (event) {
      event.stopPropagation(); //  阻止事件冒泡
    });

    if (this.opt.lnglat) {
      this.crateLnglatTool();
    }

    if (this.opt.cameraView) {
      this.createCameraViewTool();
    }

    if (this.opt.depth) {
      this.crateDepthTool();
    }

    this.bindHandler();
    this._clickPX = null;
  }

  _createClass(RightTool, [{
    key: "crateLnglatTool",
    value: function crateLnglatTool() {
      var that = this;
      var html = "\n          <li class=\"right-tool-lnglat\" id=\"right-tool-lnglat-".concat(this.randomId, "\">\n            <span style=\"font-weight:bold;\">\u5F53\u524D\u5750\u6807</span>\n          </li>\n        ");
      $("#easy3d-right-tool-".concat(this.randomId, " ul")).append(html);
      $("#right-tool-lnglat-".concat(this.randomId)).on("click", function () {
        $("#easy3d-right-tool-".concat(that.randomId)).hide();
        if (!that._clickPX) return;
        var picks = that.viewer.scene.drillPick(that._clickPX);
        that.viewer.scene.render();
        var cartesian;
        var isOn3dtiles = false;

        for (var i = 0; i < picks.length; i++) {
          if (picks[i] && picks[i].primitive && picks[i].primitive instanceof Cesium.Cesium3DTileset) {
            //模型上拾取
            isOn3dtiles = true;
            break;
          }
        }

        if (isOn3dtiles) {
          cartesian = that.viewer.scene.pickPosition(that._clickPX);
        } else {
          var ray = that.viewer.camera.getPickRay(that._clickPX);
          if (!ray) return null;
          cartesian = that.viewer.scene.globe.pick(ray, that.viewer.scene);
        }

        var ctgc = Cesium.Cartographic.fromCartesian(cartesian.clone());
        var lng = Cesium.Math.toDegrees(ctgc.longitude);
        var lat = Cesium.Math.toDegrees(ctgc.latitude);
        var height = ctgc.height;
        var title = "该点坐标";
        var resultC3 = "[".concat(Number(cartesian.x), " , ").concat(Number(cartesian.y), " , ").concat(Number(cartesian.z), "]");
        var resultJWD = "[".concat(Number(lng).toFixed(6), " , ").concat(Number(lat).toFixed(6), " , ").concat(Number(height).toFixed(2), "]");
        var result = "\n                \u4E16\u754C\u5750\u6807\uFF1A\n                <div>".concat(resultC3, "</div>\n                \u7ECF\u7EAC\u5EA6\uFF1A\n                <div>").concat(resultJWD, "</div>\n            ");
        that.crerateResultHtml(title, result);
      });
    }
  }, {
    key: "createCameraViewTool",
    value: function createCameraViewTool() {
      var that = this;
      var html = "\n          <li class=\"right-tool-view\" id=\"right-tool-view-".concat(this.randomId, "\">\n                <span>\u76F8\u673A\u89C6\u89D2</span>\n          </li>\n      ");
      $("#easy3d-right-tool-".concat(this.randomId, " ul")).append(html);
      $("#right-tool-view-".concat(this.randomId)).on("click", function () {
        $("#easy3d-right-tool-".concat(that.randomId)).hide();
        var camera = that.viewer.camera;
        var position = camera.position;
        var heading = camera.heading;
        var pitch = camera.pitch;
        var roll = camera.roll;
        var lnglat = Cesium.Cartographic.fromCartesian(position);
        var str = "\n                <div>{</div>              \n                <ul style=\"margin-left:10px;\">\n                    <li>\n                        <span>\n                            \"x\" : ".concat(Cesium.Math.toDegrees(lnglat.longitude), ",\n                        </span>\n                    </li>\n                    <li>\n                        <span>\n                            \"y\" : ").concat(Cesium.Math.toDegrees(lnglat.latitude), ",\n                        </span>\n                    </li>\n                    <li>\n                        <span>\n                            \"z\" : ").concat(lnglat.height, ",\n                        </span>\n                    </li>\n                    <li>\n                        <span>\n                            \"heading\" : ").concat(Cesium.Math.toDegrees(heading), ",\n                        </span>\n                    </li>\n                    <li>\n                        <span>\n                            \"pitch\" : ").concat(Cesium.Math.toDegrees(pitch), ",\n                        </span>\n                    </li>\n                    <li>\n                        <span>\n                        \"roll\" : ").concat(Cesium.Math.toDegrees(roll), "\n                        </span>\n                    </li>\n                </ul>\n                <div>}</div> \n            ");
        var title = "当前相机视角";
        that.crerateResultHtml(title, str);
      });
    }
  }, {
    key: "crateDepthTool",
    value: function crateDepthTool() {
      var that = this;
      var oldDepth = this.viewer.scene.globe.depthTestAgainstTerrain;
      var depthVal = !oldDepth ? "深度检测（开）" : "深度检测（关）";
      var html = "\n          <li>\n            <span class=\"right-tool-depth\" id=\"right-tool-depth-".concat(this.randomId, "\">\n              ").concat(depthVal, "\n            </span>\n          </li>\n      ");
      $("#easy3d-right-tool-".concat(this.randomId, " ul")).append(html);
      $("#right-tool-depth-".concat(this.randomId)).on("click", function () {
        $("#easy3d-right-tool-".concat(that.randomId)).hide();
        var text = $(this).text();

        if (text.indexOf("开") != -1) {
          // 表示当前是开启状态
          $(this).text("深度检测（关）");
          that.viewer.scene.globe.depthTestAgainstTerrain = true;
        } else {
          $(this).text("深度检测（开）");
          that.viewer.scene.globe.depthTestAgainstTerrain = false;
        }
      });
    }
  }, {
    key: "refreshDepthVal",
    value: function refreshDepthVal() {
      var oldDepth = this.viewer.scene.globe.depthTestAgainstTerrain;
      var depthVal = !oldDepth ? "深度检测（开）" : "深度检测（关）";
      $("#right-tool-depth-".concat(this.randomId)).html(depthVal);
    }
  }, {
    key: "bindHandler",
    value: function bindHandler() {
      var that = this;
      this.rightClickHandler.setInputAction(function (evt) {
        var pick = that.viewer.scene.pick(evt.position);
        var ent;

        if (pick && pick.primitive && !(pick.primitive instanceof Cesium.Cesium3DTileset)) {
          // 拾取图元
          ent = pick.primitive;
        }

        if (pick && pick.id && pick.id instanceof Cesium.Entity) {
          ent = pick.id;
        }

        if (ent) return; // 控制不能在已绘制的地方进行右键弹出面板

        that.refreshDepthVal();
        var px = evt.position;
        that._clickPX = evt.position;
        $("#easy3d-right-tool-".concat(that.randomId)).css({
          left: Number(px.x + 10) + "px",
          top: Number(px.y + 10) + "px",
          display: "block"
        });
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this.rightClickHandler) {
        this.rightClickHandler.destroy();
        this.rightClickHandler = null;
      }

      $("easy3d-right-tool-".concat(this.randomId)).remove();
    } // 构建结果面板

  }, {
    key: "crerateResultHtml",
    value: function crerateResultHtml(title, result) {
      var that = this;
      $("#easy3d-right-content-".concat(this.randomId)).remove();
      this.createShadow();
      var html = "\n            <div class=\"easy3d-right-content\" class=\"easy3d-right-content-".concat(this.randomId, "\">\n                <span class=\"right-content-close\" id=\"right-content-close-").concat(this.randomId, "\" alt=\"\" title=\"\u70B9\u51FB\u5173\u95ED\">x</span>\n                <div class=\"right-content-result scrollbar\">\n                <div class=\"content-result-title\" style=\"font-weight:bold;\">").concat(title, "\uFF1A</div>\n                <div class=\"content-result-line\"></div>\n                <div class=\"content-result-info\">").concat(result, "</div>\n                </div>\n            </div>\n        ");
      $("body").append(html); // 点击关闭

      $("#right-content-close-".concat(this.randomId)).off("click").on("click", function () {
        $(this).parent().remove();
        $("#easy3d-right-tool-shadow-".concat(that.randomId)).remove();
      });
    } //  创建遮罩

  }, {
    key: "createShadow",
    value: function createShadow() {
      $("#easy3d-right-tool-shadow-".concat(this.randomId)).remove();
      var html = "\n            <div class=\"easy3d-right-tool-shadow\" id=\"easy3d-right-tool-shadow-".concat(this.randomId, "\"></div>\n        ");
      $("body").append(html);
      $("#easy3d-right-tool-shadow-".concat(this.randomId)).show();
    }
  }]);

  return RightTool;
}();

var turf = require("turf/turf.js");

var BaseMeasure = /*#__PURE__*/function () {
  function BaseMeasure(viewer, opt) {
    _classCallCheck(this, BaseMeasure);

    opt = opt || {};
    this.viewer = viewer;
    this.objId = Number(new Date().getTime() + "" + Number(Math.random() * 1000).toFixed(0));
    this.state = null; // 标识当前状态 no startCreate creating endCreate startEdit endEdit editing

    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.floatLable = null;
    this.unit = opt.unit;
    this.controlPoints = [];
    this.pointStyle = {};
    this.modifyPoint = null;
    this.promptStyle = opt.prompt || {
      show: true,
      offset: {
        x: 30,
        y: 30
      }
    };
  }

  _createClass(BaseMeasure, [{
    key: "createLine",
    value: function createLine(positions, clampToGround) {
      if (!positions) return;
      var ent = this.viewer.entities.add({
        polyline: {
          positions: new Cesium.CallbackProperty(function () {
            return positions;
          }, false),
          show: true,
          material: Cesium.Color.YELLOW.withAlpha(0.7),
          width: 3,
          clampToGround: clampToGround
        }
      });
      ent.objId = this.objId;
      return ent;
    } // 操作控制

  }, {
    key: "forbidDrawWorld",
    value: function forbidDrawWorld(isForbid) {
      this.viewer.scene.screenSpaceCameraController.enableRotate = !isForbid;
      this.viewer.scene.screenSpaceCameraController.enableTilt = !isForbid;
      this.viewer.scene.screenSpaceCameraController.enableTranslate = !isForbid;
      this.viewer.scene.screenSpaceCameraController.enableInputs = !isForbid;
    }
  }, {
    key: "createLabel",
    value: function createLabel(c, text) {
      if (!c) return;
      return this.viewer.entities.add({
        position: c,
        label: {
          text: text || "",
          font: '24px Helvetica',
          fillColor: Cesium.Color.SKYBLUE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -20)
        }
      });
    }
  }, {
    key: "setUnit",
    value: function setUnit(unit) {
      if (!unit) return;
      this.unit = unit;
    } // 角度计算

  }, {
    key: "getAzimuthtAndCenter",
    value: function getAzimuthtAndCenter(mtx, positions) {
      if (!positions || positions.length < 2) return;
      var center = positions[0].clone();
      mtx = mtx || Cesium.Transforms.eastNorthUpToFixedFrame(center.clone());
      var mtxInverse = Cesium.Matrix4.inverse(mtx, new Cesium.Matrix4());
      var aim = positions[1].clone();
      center = Cesium.Matrix4.multiplyByPoint(mtxInverse, center, new Cesium.Cartesian3());
      aim = Cesium.Matrix4.multiplyByPoint(mtxInverse, aim, new Cesium.Cartesian3());
      var newC = Cesium.Cartesian3.subtract(aim, center, new Cesium.Cartesian3());
      newC = Cesium.Cartesian3.normalize(newC, new Cesium.Cartesian3());
      var north = new Cesium.Cartesian3(0, 1, 0);
      var arc_north = Cesium.Cartesian3.dot(north, newC); // east用于判断与正北是否大于180度

      var east = new Cesium.Cartesian3(1, 0, 0);
      var arc_east = Cesium.Cartesian3.dot(east, aim);
      var radians_north = Math.acos(arc_north);
      var dg = Cesium.Math.toDegrees(radians_north);
      if (arc_east < 0) dg = 360 - dg;
      return dg;
    }
  }, {
    key: "formateLength",
    value: function formateLength(val, dw) {
      if (val == undefined) return;
      dw = dw || "m";
      var dwStr = '';

      if (dw == "km" || dw == "千米") {
        dwStr += (Number(val) / 1000).toFixed(2) + "km";
      } else if (dw == "m" || dw == "米") {
        dwStr += Number(val).toFixed(2) + "m";
      }

      return dwStr;
    }
  }, {
    key: "formateArea",
    value: function formateArea(val, dw) {
      if (val == undefined) return;
      var dwStr = '';
      dw = dw || "m";

      if (dw == "km" || dw == "平方千米") {
        dwStr += (Number(val) / 1000000).toFixed(2) + "km²";
      } else if (dw == "m" || dw == "平方米") {
        dwStr += Number(val).toFixed(2) + "m²";
      }

      return dwStr;
    } //兼容模型和地形上坐标拾取

  }, {
    key: "getCatesian3FromPX",
    value: function getCatesian3FromPX(px, viewer) {
      var picks = viewer.scene.drillPick(px);
      viewer.scene.render();
      var cartesian;
      var isOn3dtiles = false;

      for (var i = 0; i < picks.length; i++) {
        if (picks[i] && picks[i].primitive && picks[i].primitive instanceof Cesium.Cesium3DTileset) {
          //模型上拾取
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
    } // 获取长度

  }, {
    key: "getGroundLength",
    value: function getGroundLength(positions, callback) {
      var that = this;
      var ellipsoid = this.viewer.scene.globe.ellipsoid;
      var len = this.getLength(positions[0], positions[1]);

      if (!this.viewer.terrainProvider.availability) {
        console.log("缺少地形数据，或地形加载失败！");
        if (callback) callback(len);
        return;
      }

      var surfacePositions = Cesium.PolylinePipeline.generateArc({
        positions: positions,
        granularity: 0.00001
      });
      if (!surfacePositions) return;
      var cartographicArray = [];
      var tempHeight = Cesium.Cartographic.fromCartesian(positions[0]).height;

      for (var i = 0; i < surfacePositions.length; i += 3) {
        var cartesian = Cesium.Cartesian3.unpack(surfacePositions, i);
        cartographicArray.push(ellipsoid.cartesianToCartographic(cartesian));
      }

      Cesium.when(Cesium.sampleTerrainMostDetailed(that.viewer.terrainProvider, cartographicArray), function (updateLnglats) {
        var allLength = 0;
        var offset = 10.0;

        for (var i = 0; i < updateLnglats.length; i++) {
          var item = updateLnglats[i];

          if (!item.height) {
            //当未获取到当前坐标下的地形高度时 手动设置为初始点的高度
            item.height = tempHeight;
          } else {
            item.height += offset;
          }
        }

        var raisedPositions = ellipsoid.cartographicArrayToCartesianArray(updateLnglats); //转为世界坐标数组

        for (var z = 0; z < raisedPositions.length - 1; z++) {
          allLength += Cesium.Cartesian3.distance(raisedPositions[z], raisedPositions[z + 1]);
        }

        if (allLength) callback(allLength);
      });
    } // 坡度量算

  }, {
    key: "getSlope",
    value: function getSlope(position, callback) {
      if (!position) return; // 求出该点周围两点的坐标 构建平面

      var ctg = Cesium.Cartographic.fromCartesian(position);
      var random = 1 / 100000;
      var lat = Cesium.Math.toDegrees(ctg.latitude);
      var lng = Cesium.Math.toDegrees(ctg.longitude);
      var height = ctg.height;
      var newCtg1 = Cesium.Cartographic.fromDegrees(lng, lat + random);
      var newCtg2 = Cesium.Cartographic.fromDegrees(lng + random, lat);
      var that = this;
      Cesium.when(Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, [newCtg1, newCtg2]), function (updateLnglats) {
        for (var i = 0; i < updateLnglats.length; i++) {
          var item = updateLnglats[i];
          item.height = item.height ? item.height : height;
        }

        var raisedPositions = that.viewer.scene.globe.ellipsoid.cartographicArrayToCartesianArray(updateLnglats); //转为世界坐标数组

        var newPosition1 = raisedPositions[0];
        var newPosition2 = raisedPositions[1];
        var mtx = Cesium.Transforms.eastNorthUpToFixedFrame(position);
        var mtx_inverse = Cesium.Matrix4.inverse(mtx, new Cesium.Matrix4());
        position = Cesium.Matrix4.multiplyByPoint(mtx_inverse, position, new Cesium.Cartesian3());
        newPosition1 = Cesium.Matrix4.multiplyByPoint(mtx_inverse, newPosition1, new Cesium.Cartesian3());
        newPosition2 = Cesium.Matrix4.multiplyByPoint(mtx_inverse, newPosition2, new Cesium.Cartesian3());
        var v1 = Cesium.Cartesian3.subtract(newPosition1, position, new Cesium.Cartesian3());
        var v2 = Cesium.Cartesian3.subtract(newPosition2, position, new Cesium.Cartesian3());
        var cross = Cesium.Cartesian3.cross(v1, v2, new Cesium.Cartesian3());
        cross = Cesium.Cartesian3.normalize(cross, new Cesium.Cartesian3());
        var z = new Cesium.Cartesian3(0, 0, 1);
        var arc = Cesium.Cartesian3.dot(cross, z);
        var radians_north = Math.acos(arc);
        var dg = Cesium.Math.toDegrees(radians_north);
        dg = dg > 90 ? 180 - dg : dg;
        if (callback) callback(dg);
      });
    }
  }, {
    key: "getLength",
    value: function getLength(c1, c2) {
      if (!c1 || !c2) return 0;
      return Cesium.Cartesian3.distance(c1, c2) || 0;
    } //调用第三方插件计算面积 turf

  }, {
    key: "getAreaAndCenter",
    value: function getAreaAndCenter(positions) {
      if (!positions || positions.length < 1) return;
      var cartographics = [];
      var turfPoints = [];

      for (var i = 0; i < positions.length; i++) {
        var cartesian3 = positions[i];
        var cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
        cartographics.push([Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude)]);
        turfPoints.push(turf.point([Cesium.Math.toDegrees(cartographic.longitude), Cesium.Math.toDegrees(cartographic.latitude)]));
      }

      if (!cartographics.length) return;
      cartographics = cartographics.concat([cartographics[0]]);
      var polygon = turf.polygon([cartographics]);
      var area = turf.area(polygon); //获取当前范围的中心点

      var features = turf.featureCollection(turfPoints);
      var turfCenter = turf.center(features);
      var center = turfCenter.geometry.coordinates;
      return {
        area: area,
        center: Cesium.Cartesian3.fromDegrees(center[0], center[1])
      };
    } // 构建控制点

  }, {
    key: "createPoint",
    value: function createPoint(position) {
      if (!position) return;
      this.pointStyle.color = this.pointStyle.color || Cesium.Color.CORNFLOWERBLUE;
      this.pointStyle.outlineColor = this.pointStyle.color || Cesium.Color.CORNFLOWERBLUE;
      var color = this.pointStyle.color instanceof Cesium.Color ? this.pointStyle.color : Cesium.Color.fromCssColorString(this.pointStyle.color);
      color = color.withAlpha(this.pointStyle.colorAlpha || 0.8);
      var outlineColor = this.pointStyle.outlineColor instanceof Cesium.Color ? this.pointStyle.outlineColor : Cesium.Color.fromCssColorString(this.pointStyle.outlineColor);
      outlineColor = outlineColor.withAlpha(this.pointStyle.outlineColorAlpha || 0.8);
      return this.viewer.entities.add({
        position: position,
        point: {
          pixelSize: this.pointStyle.property || 10,
          color: color,
          outlineWidth: this.pointStyle.outlineWidth || 0,
          outlineColor: outlineColor,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        show: false
      });
    }
  }]);

  return BaseMeasure;
}();

var MeasureGroundDistance = /*#__PURE__*/function (_BaseMeasure) {
  _inherits(MeasureGroundDistance, _BaseMeasure);

  var _super = _createSuper(MeasureGroundDistance);

  function MeasureGroundDistance(viewer, opt) {
    var _this;

    _classCallCheck(this, MeasureGroundDistance);

    _this = _super.call(this, viewer, opt);
    _this.unitType = "length";
    _this.type = "groundDistance";
    if (!opt) opt = {};
    _this.style = opt.style || {};
    _this.viewer = viewer; //线

    _this.polyline = null; //线坐标

    _this.positions = []; //标签数组

    _this.labels = [];
    _this.nowLabel = null; // 编辑时  当前点的label

    _this.nextlabel = null; // 编辑时  下一个点的label

    _this.lastPosition = null; // 编辑时   上一个点的坐标

    _this.nextPosition = null; // 编辑时   下一个点的坐标

    _this.modifyPoint = null;
    _this.lastCartesian = null;
    _this.allDistance = 0;
    _this.prompt;
    _this.movePush = false;
    _this.floatDistance = -1;
    return _this;
  } //开始测量


  _createClass(MeasureGroundDistance, [{
    key: "start",
    value: function start(fun) {
      if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt$1(this.viewer, this.promptStyle);
      var that = this;
      this.state = "startCreate";
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
        that.state = "creating";
        var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
        if (!cartesian) return;

        if (that.movePush) {
          that.positions.pop();
          that.movePush = false;
        }

        if (!that.floatLable) {
          that.floatLable = that.createLabel(cartesian, "");
          that.floatLable.wz = 0;
          that.floatLable.show = false;
        }

        var label = that.createLabel(cartesian, "");
        label.wz = that.positions.length;
        that.labels.push(label);
        var point = that.createPoint(cartesian.clone());
        point.wz = that.positions.length;
        that.controlPoints.push(point);

        if (that.positions.length == 0) {
          label.label.text = "起点";
        } else {
          that.lastDistance = that.floatDistance;
          that.allDistance += that.floatDistance;
          var text = that.formateLength(that.floatDistance);
          label.label.text = text;
          label.distance = that.floatDistance;
        }

        that.positions.push(cartesian.clone());
        that.lastCartesian = cartesian.clone();
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.setInputAction(function (evt) {
        that.state = "creating";

        if (that.positions.length < 1) {
          that.prompt.update(evt.endPosition, "单击开始测量");
          return;
        }

        that.prompt.update(evt.endPosition, "双击结束，右键取消上一步");
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
        if (!cartesian) return;

        if (!that.movePush) {
          that.positions.push(cartesian);
          that.movePush = true;
        } else {
          that.positions[that.positions.length - 1] = cartesian.clone();
        }

        if (!Cesium.defined(that.polyline)) {
          that.polyline = that.createLine(that.positions, true);
        }

        if (!that.lastCartesian) return;
        that.getGroundLength([cartesian, that.lastCartesian], function (distance) {
          that.floatLable.show = true;
          that.floatLable.label.text = that.formateLength(distance, that.unit);
          that.floatLable.position.setValue(cartesian);
          that.floatLable.distance = distance;
          that.floatDistance = distance;
          if (that.fun) that.fun(distance);
        });
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      this.handler.setInputAction(function (evt) {
        that.state = "creating";
        if (!that.polyline) return;
        if (that.positions.length <= 2) return; // 默认最后一个不给删除

        that.positions.splice(that.positions.length - 2, 1);
        that.viewer.entities.remove(that.labels.pop());
        that.viewer.entities.remove(that.controlPoints.pop()); // 移除最后一个

        that.allDistance = that.allDistance - that.lastDistance;

        if (that.positions.length == 1) {
          if (that.polyline) {
            that.viewer.entities.remove(that.polyline);
            that.polyline = null;
          }

          that.prompt.update(evt.endPosition, "单击开始测量");
          that.floatLable.show = false;
          that.positions = [];
        }

        var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
        if (!cartesian) return;
        that.getGroundLength([cartesian, that.positions[that.positions.length - 2]], function (distance) {
          that.floatLable.show = true;
          that.floatLable.label.text = that.formateLength(distance, that.unit);
          that.floatLable.distance = distance;
          that.floatLable.position.setValue(cartesian);
        });
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      this.handler.setInputAction(function (evt) {
        //双击结束绘制
        if (!that.polyline) return;
        that.floatLable.show = false;
        that.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        that.viewer.trackedEntity = undefined;
        that.positions.pop();
        that.viewer.entities.remove(that.labels.pop());
        that.viewer.entities.remove(that.controlPoints.pop()); // 移除最后一个

        var allDistance = that.formateLength(that.allDistance, that.unit);
        that.labels[that.labels.length - 1].label.text = "总长：" + allDistance;
        /* that.labels[that.labels.length - 1].distance = that.allDistance; */

        if (that.handler) {
          that.handler.destroy();
          that.handler = null;
        }

        if (that.prompt) {
          that.prompt.destroy();
          that.prompt = null;
        }

        that.state = "endCreate";
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    } // 开始编辑

  }, {
    key: "startEdit",
    value: function startEdit(callback) {
      if ((this.state == "endCrerate" || this.state == "endEdit") && !this.polyline) return;
      this.state = "startEdit";
      if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
      var that = this;

      for (var i = 0; i < that.controlPoints.length; i++) {
        var point = that.controlPoints[i];
        if (point) point.show = true;
      }

      this.modifyHandler.setInputAction(function (evt) {
        var pick = that.viewer.scene.pick(evt.position);

        if (Cesium.defined(pick) && pick.id) {
          if (!pick.id.objId) that.modifyPoint = pick.id;
          that.forbidDrawWorld(true);
          var wz = that.modifyPoint.wz; // 重新计算左右距离

          var nextIndex = wz + 1;
          var lastIndex = wz - 1;
          that.nowLabel = that.labels[wz];

          if (lastIndex >= 0) {
            that.lastPosition = that.positions[lastIndex];
          }

          if (nextIndex <= that.positions.length - 1) {
            that.nextPosition = that.positions[nextIndex];
            that.nextlabel = that.labels[nextIndex];
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      this.modifyHandler.setInputAction(function (evt) {
        if (that.positions.length < 1 || !that.modifyPoint) return;
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
        if (!cartesian) return;
        that.modifyPoint.position.setValue(cartesian);
        var wz = that.modifyPoint.wz;
        that.positions[wz] = cartesian.clone();
        that.state = "editing";
        that.nowLabel.position.setValue(cartesian.clone());
        var changeDis1 = 0;
        var changeDis2 = 0;

        if (that.nowLabel && that.lastPosition) {
          that.getGroundLength([cartesian.clone(), that.lastPosition.clone()], function (distance) {
            that.nowLabel.label.text = that.formateLength(distance, that.unit);
            changeDis1 = distance - that.nowLabel.distance;
            that.nowLabel.distance = distance; // 计算总长

            that.allDistance = that.allDistance + changeDis1 + changeDis2;
            var allDistance = that.formateLength(that.allDistance, that.unit);
            that.labels[that.labels.length - 1].label.text = "总长：" + allDistance;
          });
        }

        if (that.nextPosition && that.nextlabel) {
          that.getGroundLength([cartesian.clone(), that.nextPosition.clone()], function (distance) {
            that.nextlabel.label.text = that.formateLength(distance, that.unit);
            changeDis2 = distance - that.nextlabel.distance;
            that.nextlabel.distance = distance; // 计算总长

            that.allDistance = that.allDistance + changeDis1 + changeDis2;
            var allDistance = that.formateLength(that.allDistance, that.unit);
            that.labels[that.labels.length - 1].label.text = "总长：" + allDistance;
          });
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      this.modifyHandler.setInputAction(function (evt) {
        if (!that.modifyPoint) return;
        that.modifyPoint = null;
        that.lastPosition = null;
        that.nextPosition = null;
        that.forbidDrawWorld(false);
        if (callback) callback();
        that.state = "endEdit";
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
    }
  }, {
    key: "endEdit",
    value: function endEdit() {
      var that = this;
      this.state = "endEdit";

      if (this.modifyHandler) {
        this.modifyHandler.destroy();
        this.modifyHandler = null;
      }

      for (var i = 0; i < that.controlPoints.length; i++) {
        var point = that.controlPoints[i];
        if (point) point.show = false;
      }
    } //清除测量结果

  }, {
    key: "destroy",
    value: function destroy() {
      if (this.polyline) {
        this.viewer.entities.remove(this.polyline);
        this.polyline = null;
      }

      for (var i = 0; i < this.labels.length; i++) {
        this.viewer.entities.remove(this.labels[i]);
      }

      this.labels = [];

      for (var ind = 0; ind < this.controlPoints.length; ind++) {
        this.viewer.entities.remove(this.controlPoints[ind]);
      }

      this.controlPoints = [];
      this.modifyPoint = null;

      if (this.floatLable) {
        this.viewer.entities.remove(this.floatLable);
        this.floatLable = null;
      }

      this.floatLable = null;

      if (this.prompt) {
        this.prompt.destroy();
        this.prompt = null;
      }

      if (this.handler) {
        this.handler.destroy();
        this.handler = null;
      }

      if (this.modifyHandler) {
        this.modifyHandler.destroy();
        this.modifyHandler = null;
      }

      this.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      this.viewer.trackedEntity = undefined;
      this.state = "no";
    } // 设置单位

  }, {
    key: "setUnit",
    value: function setUnit(unit) {
      for (var i = 0; i < this.labels.length; i++) {
        var label = this.labels[i];
        var distance = label.distance;

        if (i == this.labels.length - 1) {
          label.text = "总长：" + this.formateLength(distance, unit);
        } else {
          label.text = this.formateLength(distance, unit);
        }
      }

      this.unit = unit;
    }
  }]);

  return MeasureGroundDistance;
}(BaseMeasure);

var MeasureSpaceDistance = /*#__PURE__*/function (_MeasureGroundDistanc) {
  _inherits(MeasureSpaceDistance, _MeasureGroundDistanc);

  var _super = _createSuper(MeasureSpaceDistance);

  function MeasureSpaceDistance(viewer, opt) {
    var _this;

    _classCallCheck(this, MeasureSpaceDistance);

    _this = _super.call(this, viewer, opt);
    _this.unitType = "length";
    _this.type = "spaceDistance";
    _this.allDistance = 0;
    _this.labels = [];
    _this.nowLabel = null; // 编辑时  当前点的label

    _this.nextlabel = null; // 编辑时  下一个点的label

    _this.lastPosition = null; // 编辑时   上一个点的坐标

    _this.nextPosition = null; // 编辑时   下一个点的坐标

    return _this;
  } //开始测量


  _createClass(MeasureSpaceDistance, [{
    key: "start",
    value: function start(callBack) {
      if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt$1(this.viewer, this.promptStyle);
      var that = this;
      this.state = "startCreate";
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
        that.state = "creating";
        var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
        if (!cartesian) return;

        if (that.movePush) {
          that.positions.pop();
          that.movePush = false;
        }

        var label;

        if (that.positions.length == 0) {
          label = that.createLabel(cartesian, "起点");
          that.floatLable = that.createLabel(cartesian, "");
          that.floatLable.wz = 0;
          that.floatLable.show = false;
        } else {
          var distance = that.getLength(cartesian, that.lastCartesian);
          that.lastDistance = distance;
          that.allDistance += distance;
          var text = that.formateLength(distance, that.unit);
          label = that.createLabel(cartesian, text);
          label.wz = that.positions.length; // 和坐标点关联

          label.distance = distance;
        }

        that.labels.push(label);
        var point = that.createPoint(cartesian.clone());
        point.wz = that.positions.length; // 和坐标点关联

        that.controlPoints.push(point);
        that.positions.push(cartesian);
        that.lastCartesian = cartesian.clone();
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.setInputAction(function (evt) {
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
        if (!cartesian) return;
        that.state = "creating";

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
          var distance = that.getLength(cartesian, that.lastCartesian);
          that.floatLable.show = true;
          that.floatLable.label.text = that.formateLength(distance, that.unit);
          that.floatLable.distance = distance;
          that.floatLable.position.setValue(cartesian);
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      this.handler.setInputAction(function (evt) {
        that.state = "creating";
        if (!that.polyline) return;
        if (that.positions.length <= 2) return; // 默认最后一个不给删除

        that.positions.splice(that.positions.length - 2, 1);
        that.viewer.entities.remove(that.labels.pop());
        that.viewer.entities.remove(that.controlPoints.pop()); // 移除最后一个

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

        var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
        if (!cartesian) return;
        var distance = that.getLength(cartesian, that.positions[that.positions.length - 2]);
        that.floatLable.show = true;
        that.floatLable.label.text = that.formateLength(distance, that.unit);
        that.floatLable.distance = distance;
        that.floatLable.position.setValue(cartesian);
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
      this.handler.setInputAction(function (evt) {
        //双击结束绘制
        if (!that.polyline) return;
        that.floatLable.show = false;
        that.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        that.viewer.trackedEntity = undefined;
        that.positions.pop();
        that.viewer.entities.remove(that.labels.pop());
        that.viewer.entities.remove(that.controlPoints.pop()); // 移除最后一个

        var allDistance = that.formateLength(that.allDistance, that.unit);
        that.labels[that.labels.length - 1].label.text = "总长：" + allDistance;
        /* that.labels[that.labels.length - 1].distance = that.allDistance; */

        that.movePush = false;

        if (that.prompt) {
          that.prompt.destroy();
          that.prompt = null;
        }

        if (that.handler) {
          that.handler.destroy();
          that.handler = null;
        }

        that.state = "endCreate";
        if (callBack) callBack();
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    } // 开始编辑

  }, {
    key: "startEdit",
    value: function startEdit(callback) {
      if ((this.state == "endCrerate" || this.state == "endEdit") && !this.polyline) return;
      this.state = "startEdit";
      if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
      var that = this;

      for (var i = 0; i < that.controlPoints.length; i++) {
        var point = that.controlPoints[i];
        if (point) point.show = true;
      }

      this.modifyHandler.setInputAction(function (evt) {
        var pick = that.viewer.scene.pick(evt.position);

        if (Cesium.defined(pick) && pick.id) {
          if (!pick.id.objId) that.modifyPoint = pick.id;
          that.forbidDrawWorld(true);
          var wz = that.modifyPoint.wz; // 重新计算左右距离

          var nextIndex = wz + 1;
          var lastIndex = wz - 1;
          that.nowLabel = that.labels[wz];

          if (lastIndex >= 0) {
            that.lastPosition = that.positions[lastIndex];
          }

          if (nextIndex <= that.positions.length - 1) {
            that.nextPosition = that.positions[nextIndex];
            that.nextlabel = that.labels[nextIndex];
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
      this.modifyHandler.setInputAction(function (evt) {
        if (that.positions.length < 1 || !that.modifyPoint) return;
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
        if (!cartesian) return;
        that.modifyPoint.position.setValue(cartesian);
        var wz = that.modifyPoint.wz;
        that.positions[wz] = cartesian.clone();
        that.state = "editing";
        that.nowLabel.position.setValue(cartesian.clone());
        var changeDis1 = 0;

        if (that.nowLabel && that.lastPosition) {
          var distance = that.getLength(cartesian.clone(), that.lastPosition.clone());
          that.nowLabel.label.text = that.formateLength(distance, that.unit);
          changeDis1 = distance - that.nowLabel.distance;
          that.nowLabel.distance = distance;
        }

        var changeDis2 = 0;

        if (that.nextPosition && that.nextlabel) {
          var _distance = that.getLength(cartesian.clone(), that.nextPosition.clone());

          that.nextlabel.label.text = that.formateLength(_distance, that.unit);
          changeDis2 = _distance - that.nextlabel.distance;
          that.nextlabel.distance = _distance;
        } // 计算总长


        that.allDistance = that.allDistance + changeDis1 + changeDis2;
        var allDistance = that.formateLength(that.allDistance, that.unit);
        that.labels[that.labels.length - 1].label.text = "总长：" + allDistance;
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      this.modifyHandler.setInputAction(function (evt) {
        if (!that.modifyPoint) return;
        that.modifyPoint = null;
        that.lastPosition = null;
        that.nextPosition = null;
        that.forbidDrawWorld(false);
        if (callback) callback();
        that.state = "endEdit";
      }, Cesium.ScreenSpaceEventType.LEFT_UP);
    }
  }, {
    key: "endEdit",
    value: function endEdit() {
      var that = this;
      this.state = "endEdit";

      if (this.modifyHandler) {
        this.modifyHandler.destroy();
        this.modifyHandler = null;
      }

      for (var i = 0; i < that.controlPoints.length; i++) {
        var point = that.controlPoints[i];
        if (point) point.show = false;
      }
    } //清除测量结果

  }, {
    key: "destroy",
    value: function destroy() {
      if (this.polyline) {
        this.viewer.entities.remove(this.polyline);
        this.polyline = null;
      }

      for (var i = 0; i < this.labels.length; i++) {
        this.viewer.entities.remove(this.labels[i]);
      }

      this.labels = [];

      for (var ind = 0; ind < this.controlPoints.length; ind++) {
        this.viewer.entities.remove(this.controlPoints[ind]);
      }

      this.controlPoints = [];
      this.modifyPoint = null;

      if (this.floatLable) {
        this.viewer.entities.remove(this.floatLable);
        this.floatLable = null;
      }

      this.floatLable = null;

      if (this.prompt) {
        this.prompt.destroy();
        this.prompt = null;
      }

      if (this.handler) {
        this.handler.destroy();
        this.handler = null;
      }

      if (this.modifyHandler) {
        this.modifyHandler.destroy();
        this.modifyHandler = null;
      }

      this.movePush = false;
      this.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      this.viewer.trackedEntity = undefined;
      this.state = "no";
    } // 设置单位

  }, {
    key: "setUnit",
    value: function setUnit(unit) {
      for (var i = 0; i < this.labels.length; i++) {
        var label = this.labels[i];
        var distance = label.distance;

        if (i == this.labels.length - 1) {
          label.text = "总长：" + that.formateLength(distance, unit);
        } else {
          label.text = that.formateLength(distance, unit);
        }
      }

      this.unit = unit;
    }
  }]);

  return MeasureSpaceDistance;
}(MeasureGroundDistance);

var MeasureSpaceArea = /*#__PURE__*/function (_BaseMeasure) {
  _inherits(MeasureSpaceArea, _BaseMeasure);

  var _super = _createSuper(MeasureSpaceArea);

  function MeasureSpaceArea(viewer, opt) {
    var _this;

    _classCallCheck(this, MeasureSpaceArea);

    _this = _super.call(this, viewer, opt);
    if (!opt) opt = {};
    _this.unitType = "area";
    _this.style = opt.style || {};
    _this.viewer = viewer;
    _this.polyline = null;
    _this.polygon = null; //面积标签

    _this.positions = [];
    _this.movePush = false;
    _this.prompt;
    return _this;
  } //开始测量


  _createClass(MeasureSpaceArea, [{
    key: "start",
    value: function start(callBack) {
      if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt$1(this.viewer, this.promptStyle);
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
              if (that.polyline) that.polyline.show = false;
            }

            if (!that.floatLabel) that.floatLabel = that.createLabel(cartesian, "");
          }

          if (that.polygon) {
            var areaCenter = that.getAreaAndCenter(that.positions);
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
      this.handler.setInputAction(function (evt) {
        //双击结束绘制
        if (!that.polygon) {
          return;
        }

        that.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        that.viewer.trackedEntity = undefined;
        that.positions.pop();
        var areaCenter = that.getAreaAndCenter(that.positions);
        var area = areaCenter.area;
        var center = areaCenter.center;
        var text = that.formateArea(area, that.unit);
        that.floatLabel.label.text = "面积：" + text;
        that.floatLabel.area = area;
        if (center) that.floatLabel.position.setValue(center);

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
        if (callBack) callBack(that.polyline);
      }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    } //清除测量结果

  }, {
    key: "destroy",
    value: function destroy() {
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

      this.floatLable = null;
    }
  }, {
    key: "createPolyline",
    value: function createPolyline() {
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
    }
  }, {
    key: "createPolygon",
    value: function createPolygon() {
      var that = this;
      var polygon = viewer.entities.add({
        polygon: new Cesium.PolygonGraphics({
          hierarchy: new Cesium.CallbackProperty(function () {
            return new Cesium.PolygonHierarchy(that.positions);
          }, false),
          material: this.style.material || Cesium.Color.LIME.withAlpha(0.5),
          fill: true
        })
      });
      return polygon;
    }
  }, {
    key: "setUnit",
    value: function setUnit(unit) {
      this.unit = unit;
      var text = this.formateArea(this.floatLabel.area, unit);
      this.floatLabel.label.text = "面积：" + text;
    }
  }]);

  return MeasureSpaceArea;
}(BaseMeasure);

var MeasureHeight = /*#__PURE__*/function (_BaseMeasure) {
  _inherits(MeasureHeight, _BaseMeasure);

  var _super = _createSuper(MeasureHeight);

  function MeasureHeight(viewer, opt) {
    var _this;

    _classCallCheck(this, MeasureHeight);

    _this = _super.call(this, viewer, opt);
    if (!opt) opt = {};
    _this.unitType = "length";
    _this.style = opt.style || {};
    _this.viewer = viewer;
    _this.polyline = null;
    _this.floatLabel = null;
    _this.positions = [];
    _this.height = 0;
    return _this;
  } //开始测量


  _createClass(MeasureHeight, [{
    key: "start",
    value: function start() {
      if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt$1(this.viewer, this.promptStyle);
      this.state = "startCreate";
      var that = this;
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
        that.state = "creating";
        var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
        if (!cartesian) return;

        if (that.positions.length == 2) {
          that.positions.pop();
          that.positions.push(cartesian);

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

        that.positions.push(cartesian);
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.setInputAction(function (evt) {
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
        if (!cartesian) return;
        that.state = "creating";

        if (that.positions.length < 1) {
          that.prompt.update(evt.endPosition, "单击开始测量");
          return;
        } else {
          that.prompt.update(evt.endPosition, "单击结束");

          if (that.positions.length == 2 && !Cesium.defined(that.polyline)) {
            that.polyline = that.createLine(that.positions, false);
            if (!that.floatLabel) that.floatLabel = that.createLabel(cartesian, "");
          }

          var heightAndCenter = that.getHeightAndCenter(that.positions[0], that.positions[1]);
          var text = that.formateLength(heightAndCenter.height, that.unit);
          that.height = heightAndCenter.height;
          that.floatLabel.label.text = "高度差：" + text;
          that.floatLabel.length = heightAndCenter.height;
          if (heightAndCenter.center) that.floatLabel.position.setValue(heightAndCenter.center);
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    } //清除测量结果

  }, {
    key: "destroy",
    value: function destroy() {
      if (this.polyline) {
        this.viewer.entities.remove(this.polyline);
        this.polyline = null;
      }

      if (this.floatLabel) {
        this.viewer.entities.remove(this.floatLabel);
        this.floatLabel = null;
      }

      if (this.prompt) {
        this.prompt.destroy();
        this.prompt = null;
      }

      if (this.handler) {
        this.handler.destroy();
        this.handler = null;
      }

      this.state = "no";
    }
  }, {
    key: "getHeightAndCenter",
    value: function getHeightAndCenter(p1, p2) {
      if (!p1 || !p2) return;
      var cartographic1 = Cesium.Cartographic.fromCartesian(p1);
      var cartographic2 = Cesium.Cartographic.fromCartesian(p2);
      var height = Math.abs(cartographic1.height - cartographic2.height);
      return {
        height: height,
        center: Cesium.Cartesian3.midpoint(p1, p2, new Cesium.Cartesian3())
      };
    }
  }, {
    key: "setUnit",
    value: function setUnit(unit) {
      var text = this.formateLength(this.floatLabel.length, unit);
      this.floatLabel.label.text = "高度差：" + text;
      this.unit = unit;
    }
  }]);

  return MeasureHeight;
}(BaseMeasure);

var MeasureTriangle = /*#__PURE__*/function (_BaseMeasure) {
  _inherits(MeasureTriangle, _BaseMeasure);

  var _super = _createSuper(MeasureTriangle);

  function MeasureTriangle(viewer, opt) {
    var _this;

    _classCallCheck(this, MeasureTriangle);

    _this = _super.call(this, viewer, opt);
    if (!opt) opt = {};
    _this.unitType = "length";
    _this.style = opt.style || {};
    _this.objId = Number(new Date().getTime() + "" + Number(Math.random() * 1000).toFixed(0));
    _this.viewer = viewer;
    _this.handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas);
    _this.ts_handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas); //线

    _this.heightfloatLabel = null;
    _this.spaceDistancefloatLabel = null;
    _this.horizonDistancefloatLabel = null;
    _this.heightLine = null;
    _this.spaceLine = null;
    _this.horizonLine = null;
    _this.firstPoint = null;
    _this.endPoint = null;
    _this.midPoint = null;
    _this.prompt;
    return _this;
  } //开始测量


  _createClass(MeasureTriangle, [{
    key: "start",
    value: function start() {
      if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt$1(this.viewer, this.promptStyle);
      var that = this;
      this.state = 1;
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
        var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
        if (!cartesian) return;

        if (!that.firstPoint) {
          that.firstPoint = cartesian;
          that.heightfloatLabel = that.createLabel(cartesian, "");
          that.spaceDistancefloatLabel = that.createLabel(cartesian, "");
          that.horizonDistancefloatLabel = that.createLabel(cartesian, "");
        } else {
          that.endPoint = cartesian;
          that.midPoint = that.computerPoint(that.firstPoint, that.endPoint);

          if (that.handler) {
            that.handler.destroy();
            that.handler = null;
          }

          if (that.ts_handler) {
            that.ts_handler.destroy();
            that.ts_handler = null;
          }

          if (that.prompt) {
            that.prompt.destroy();
            that.prompt = null;
          }

          that.state = "endCreate";
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.setInputAction(function (evt) {
        that.state = "creating";

        if (that.firstPoint < 1) {
          that.prompt.update(evt.endPosition, "单击开始测量");
          return;
        } else {
          that.prompt.update(evt.endPosition, "单击结束");
          var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
          if (!cartesian) return;
          that.endPoint = cartesian;
          that.midPoint = that.computerPoint(that.firstPoint, that.endPoint);

          if (that.firstPoint && that.endPoint && !that.spaceLine) {
            that.spaceLine = that.viewer.entities.add({
              polyline: {
                positions: new Cesium.CallbackProperty(function () {
                  return [that.firstPoint, that.endPoint];
                }, false),
                show: true,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                material: Cesium.Color.YELLOW,
                width: 3,
                depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.YELLOW)
              }
            });
            that.heightLine = that.viewer.entities.add({
              polyline: {
                positions: new Cesium.CallbackProperty(function () {
                  return [that.firstPoint, that.midPoint];
                }, false),
                show: true,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                material: Cesium.Color.YELLOW,
                width: 3,
                depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.YELLOW)
              }
            });
            that.horizonLine = that.viewer.entities.add({
              polyline: {
                positions: new Cesium.CallbackProperty(function () {
                  return [that.endPoint, that.midPoint];
                }, false),
                show: true,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                material: Cesium.Color.YELLOW,
                width: 3,
                depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.YELLOW)
              }
            });
          }
        }

        if (that.spaceLine) {
          //高度差
          var height = Math.abs(Cesium.Cartographic.fromCartesian(that.firstPoint).height - Cesium.Cartographic.fromCartesian(that.endPoint).height);
          var height_mid = Cesium.Cartesian3.midpoint(that.firstPoint, that.midPoint, new Cesium.Cartesian3());
          that.heightfloatLabel.show = true;
          that.heightfloatLabel.position.setValue(height_mid);
          var text1 = that.formateLength(height, that.unit);
          that.heightfloatLabel.label.text = "高度差：" + text1;
          that.heightfloatLabel.length = height; //水平距离

          var horizonDistance = Cesium.Cartesian3.distance(that.endPoint, that.midPoint);
          var horizon_mid = Cesium.Cartesian3.midpoint(that.endPoint, that.midPoint, new Cesium.Cartesian3());
          that.horizonDistancefloatLabel.show = true;
          that.horizonDistancefloatLabel.position.setValue(horizon_mid);
          var text2 = that.formateLength(horizonDistance, that.unit);
          that.horizonDistancefloatLabel.label.text = "水平距离：" + text2;
          that.horizonDistancefloatLabel.length = horizonDistance; //空间距离

          var spaceDistance = Cesium.Cartesian3.distance(that.endPoint, that.firstPoint);
          var space_mid = Cesium.Cartesian3.midpoint(that.endPoint, that.firstPoint, new Cesium.Cartesian3());
          that.spaceDistancefloatLabel.show = true;
          that.spaceDistancefloatLabel.position.setValue(space_mid);
          var text3 = that.formateLength(spaceDistance, that.unit);
          that.spaceDistancefloatLabel.label.text = "空间距离：" + text3;
          that.spaceDistancefloatLabel.length = spaceDistance;
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    } //清除测量结果

  }, {
    key: "destroy",
    value: function destroy() {
      this.state = "no";

      if (this.heightLine) {
        this.viewer.entities.remove(this.heightLine);
        this.heightLine = null;
      }

      if (this.spaceLine) {
        this.viewer.entities.remove(this.spaceLine);
        this.spaceLine = null;
      }

      if (this.horizonLine) {
        this.viewer.entities.remove(this.horizonLine);
        this.horizonLine = null;
      }

      if (this.heightfloatLabel) {
        this.viewer.entities.remove(this.heightfloatLabel);
        this.heightfloatLabel = null;
      }

      this.heightfloatLabel = null;

      if (this.spaceDistancefloatLabel) {
        this.viewer.entities.remove(this.spaceDistancefloatLabel);
        this.spaceDistancefloatLabel = null;
      }

      this.spaceDistancefloatLabel = null;

      if (this.horizonDistancefloatLabel) {
        this.viewer.entities.remove(this.horizonDistancefloatLabel);
        this.horizonDistancefloatLabel = null;
      }

      this.horizonDistancefloatLabel = null;

      if (this.prompt) {
        this.prompt.destroy();
        this.prompt = null;
      }

      if (this.handler) {
        this.handler.destroy();
        this.handler = null;
      }
    }
  }, {
    key: "createLine",
    value: function createLine(p1, p2) {
      if (!p1 || !p2) return;
      var polyline = this.viewer.entities.add({
        polyline: {
          positions: new Cesium.CallbackProperty(function () {
            return [p1, p2];
          }, false),
          show: true,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          material: Cesium.Color.YELLOW,
          width: 3,
          depthFailMaterial: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.YELLOW)
        }
      });
      return polyline;
    } //计算正上方的点

  }, {
    key: "computerPoint",
    value: function computerPoint(p1, p2) {
      var cartographic1 = Cesium.Cartographic.fromCartesian(p1);
      var cartographic2 = Cesium.Cartographic.fromCartesian(p2);
      var c = null;

      if (cartographic1.height > cartographic2.height) {
        c = Cesium.Cartesian3.fromRadians(cartographic2.longitude, cartographic2.latitude, cartographic1.height);
      } else {
        c = Cesium.Cartesian3.fromRadians(cartographic1.longitude, cartographic1.latitude, cartographic2.height);
      }

      return c;
    }
  }, {
    key: "setUnit",
    value: function setUnit(unit) {
      var text1 = that.formateLength(this.heightfloatLabel.length, unit);
      this.heightfloatLabel.label.text = "高度差：" + text1;
      var text2 = that.formateLength(this.horizonDistancefloatLabel.length, unit);
      this.horizonDistancefloatLabel.label.text = "水平距离：" + text2;
      var text3 = that.formateLength(this.spaceDistancefloatLabel.length, unit);
      this.spaceDistancefloatLabel.label.text = "空间距离：" + text3;
      this.unit = unit;
    }
  }]);

  return MeasureTriangle;
}(BaseMeasure);

var MeasureLnglat = /*#__PURE__*/function (_BaseMeasure) {
  _inherits(MeasureLnglat, _BaseMeasure);

  var _super = _createSuper(MeasureLnglat);

  function MeasureLnglat(viewer, opt) {
    var _this;

    _classCallCheck(this, MeasureLnglat);

    _this = _super.call(this, viewer, opt);
    if (!opt) opt = {};
    _this.style = opt.style || {};
    _this.point = null;
    _this.position = null;
    _this.state = 0;
    return _this;
  }

  _createClass(MeasureLnglat, [{
    key: "start",
    value: function start() {
      this.state = "startCreate";
      var that = this;
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
        that.state = "endCreate";
        var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
        if (!cartesian) return;
        that.position = cartesian;

        if (that.handler) {
          that.handler.destroy();
          that.handler = null;
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.setInputAction(function (evt) {
        that.state = "creating";
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
        if (!cartesian) return;
        that.position = cartesian.clone();
        if (!Cesium.defined(that.point)) that.point = that.createPoint();
        var lnglat = cUtil$1.cartesianToLnglat(cartesian);
        that.point.label.text = "经度：" + lnglat[0].toFixed(6) + "\n纬度：" + lnglat[1].toFixed(6) + "\n高度：" + lnglat[2].toFixed(2) + "米";
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    } //清除测量结果

  }, {
    key: "destroy",
    value: function destroy() {
      this.state = "no";

      if (this.point) {
        this.viewer.entities.remove(this.point);
        this.point = null;
      }

      if (this.handler) {
        this.handler.destroy();
        this.handler = null;
      }
    }
  }, {
    key: "createPoint",
    value: function createPoint() {
      var that = this;
      var point = this.viewer.entities.add({
        position: new Cesium.CallbackProperty(function () {
          return that.position;
        }, false),
        point: {
          show: true,
          outlineColor: Cesium.Color.YELLOW,
          pixelSize: 6,
          outlineWidth: 3,
          disableDepthTestDistance: Number.MAX_VALUE
        },
        label: {
          font: '24px Helvetica',
          fillColor: Cesium.Color.SKYBLUE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -60)
        }
      });
      return point;
    }
  }]);

  return MeasureLnglat;
}(BaseMeasure);

var MeasureAzimutht = /*#__PURE__*/function (_BaseMeasure) {
  _inherits(MeasureAzimutht, _BaseMeasure);

  var _super = _createSuper(MeasureAzimutht);

  function MeasureAzimutht(viewer, opt) {
    var _this;

    _classCallCheck(this, MeasureAzimutht);

    _this = _super.call(this, viewer, opt);
    _this.style = opt.style || {}; //线

    _this.polyline = null;
    _this.floatLabel = null;
    _this.positions = [];
    _this.mtx = null;
    _this.azimutht = null;
    return _this;
  } //开始测量


  _createClass(MeasureAzimutht, [{
    key: "start",
    value: function start(fun) {
      var that = this;
      this.state = "startCreate";
      if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt$1(this.viewer, this.promptStyle);
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
        var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
        if (!cartesian) return;

        if (that.positions.length == 2) {
          that.positions.pop();

          if (that.handler) {
            that.handler.destroy();
            that.handler = null;
            that.state = "endCreate";
          }
        }

        if (!that.polyline) {
          that.polyline = that.createLine(that.positions);
          that.polyline.polyline.width = 5;
          that.polyline.polyline.material = new Cesium.PolylineArrowMaterialProperty(Cesium.Color.YELLOW);
        }

        that.positions.push(cartesian);

        if (that.positions.length == 1) {
          that.mtx = Cesium.Transforms.eastNorthUpToFixedFrame(that.positions[0].clone());
          that.floatLabel = that.createLabel(cartesian, "");
          if (fun) fun(that.azimutht);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.setInputAction(function (evt) {
        if (that.positions.length < 1) {
          that.prompt.update(evt.endPosition, "单击开始测量");
          return;
        }

        that.prompt.update(evt.endPosition, "单击结束");
        that.state = "creating";
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
        if (!cartesian) return;

        if (that.positions.length < 2) {
          that.positions.push(cartesian.clone());
        } else {
          that.positions[1] = cartesian.clone();
        }

        if (that.floatLabel) {
          that.azimutht = that.getAzimuthtAndCenter(that.mtx, that.positions);
          that.floatLabel.label.text = "方位角：" + that.azimutht.toFixed(2);
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    } //清除测量结果

  }, {
    key: "destroy",
    value: function destroy() {
      if (this.polyline) {
        this.viewer.entities.remove(this.polyline);
        this.polyline = null;
      }

      if (this.floatLabel) {
        this.viewer.entities.remove(this.floatLabel);
        this.floatLabel = null;
      }

      this.floatLable = null;

      if (this.handler) {
        this.handler.destroy();
        this.handler = null;
      }

      this.state = "no";

      if (this.prompt) {
        this.prompt.destroy();
        this.prompt = null;
      }
    }
  }]);

  return MeasureAzimutht;
}(BaseMeasure);

var MeasureSection = /*#__PURE__*/function (_BaseMeasure) {
  _inherits(MeasureSection, _BaseMeasure);

  var _super = _createSuper(MeasureSection);

  function MeasureSection(viewer, opt) {
    var _this;

    _classCallCheck(this, MeasureSection);

    _this = _super.call(this, viewer, opt);
    _this.style = opt.style || {};
    _this.viewer = viewer; //线

    _this.polyline = null; //线坐标

    _this.positions = []; //标签数组

    _this.movePush = false;
    _this.prompt;
    _this.isStart = false;
    _this.firstPosition = null;
    _this.state = "no";
    return _this;
  } //开始测量


  _createClass(MeasureSection, [{
    key: "start",
    value: function start(callback) {
      if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt(this.viewer, this.promptStyle);
      var that = this;
      that.state = "startCreate";
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
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
          } // 生成剖面图数据


          that.getHeight(that.positions, function (data) {
            callback(data);
          });
          that.state = "endCreate";
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.setInputAction(function (evt) {
        //移动时绘制线
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
                return that.positions;
              }, false),
              material: Cesium.Color.GREEN,
              width: 3,
              clampToGround: true
            }
          });
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    } //清除测量结果

  }, {
    key: "destroy",
    value: function destroy() {
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
  }, {
    key: "getHeight",
    value: function getHeight(positions, callback) {
      if (!positions || positions.length < 1) return; // 求出该点周围两点的坐标 构建平面

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
        });
      });
    }
  }]);

  return MeasureSection;
}(BaseMeasure);

var MeasureSlope = /*#__PURE__*/function (_BaseMeasure) {
  _inherits(MeasureSlope, _BaseMeasure);

  var _super = _createSuper(MeasureSlope);

  function MeasureSlope(viewer, opt) {
    var _this;

    _classCallCheck(this, MeasureSlope);

    if (!opt) opt = {};
    _this = _super.call(this, viewer, opt);
    _this.style = opt.style || {};
    _this.viewer = viewer;
    _this.label = null;
    _this.point = null;
    return _this;
  } //开始测量


  _createClass(MeasureSlope, [{
    key: "start",
    value: function start() {
      this.state = "startCreate";
      var that = this;
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
        if (that.handler) {
          that.handler.destroy();
          that.handler = null;
          that.state = "endCreate";
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.setInputAction(function (evt) {
        that.state = "creating";
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
        if (!cartesian) return;

        if (!that.point) {
          that.point = that.createPoint(cartesian);
        }

        that.point.position.setValue(cartesian);
        that.getSlope(cartesian, function (slop) {
          if (!that.label) that.label = that.createLabel(cartesian, "");
          that.label.position.setValue(cartesian);
          that.label.label.text = "坡度：" + slop.toFixed(2) + "°";
        });
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    } //清除测量结果

  }, {
    key: "destroy",
    value: function destroy() {
      this.state = "no";

      if (this.label) {
        this.viewer.entities.remove(this.label);
        this.label = null;
      }

      if (this.point) {
        this.viewer.entities.remove(this.point);
        this.point = null;
      }

      if (this.handler) {
        this.handler.destroy();
        this.handler = null;
      }
    }
  }, {
    key: "createPoint",
    value: function createPoint(position) {
      var _point;

      return this.viewer.entities.add({
        position: position,
        point: (_point = {
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          show: true,
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.RED,
          outlineWidth: 2,
          pixelSize: 6
        }, _defineProperty(_point, "outlineWidth", 3), _defineProperty(_point, "disableDepthTestDistance", Number.MAX_VALUE), _point)
      });
    }
  }]);

  return MeasureSlope;
}(BaseMeasure);

var MeasureTool = /*#__PURE__*/function () {
  function MeasureTool(viewer, obj) {
    _classCallCheck(this, MeasureTool);

    if (!viewer) {
      console.warn("缺少必要参数！--viewer");
      return;
    }

    obj = obj || {};
    this.viewer = viewer;
    this.nowMeasureObj = null; // 当前测量对象

    this.toolArr = [];
    this.lastMeasureObj = null;
    this.handler = null;
    this.canEdit = obj.canEdit == undefined ? true : obj.canEdit;
    this.intoEdit = obj.intoEdit == undefined ? true : obj.intoEdit;
    this.bindEdit();
  } // 事件绑定


  _createClass(MeasureTool, [{
    key: "on",
    value: function on(type, fun) {
      if (type == "endMeasure") {
        this.endMeasureFun = fun;
      }

      if (type == "startEdit") {
        this.startEditFun = fun;
      }

      if (type == "endEdit") {
        this.endEditFun = fun;
      }
    }
  }, {
    key: "start",
    value: function start(opt) {
      opt = opt || {};
      if (!opt.type) return;
      var ms;
      if (this.nowMeasureObj && this.nowMeasureObj.state != "endCreate" && this.nowMeasureObj.state != "endEdit" && measureTool.nowMeasureObj.state != "no") return;

      switch (Number(opt.type)) {
        case 1:
          // 空间距离测量
          ms = new MeasureSpaceDistance(this.viewer, opt);
          break;

        case 2:
          // 贴地距离测量
          ms = new MeasureGroundDistance(this.viewer, opt);
          break;

        case 3:
          // 空间面积测量
          ms = new MeasureSpaceArea(this.viewer, opt);
          break;

        case 4:
          // 高度测量
          ms = new MeasureHeight(this.viewer, opt);
          break;

        case 5:
          // 三角测量
          ms = new MeasureTriangle(this.viewer, opt);
          break;

        case 6:
          // 坐标量算
          ms = new MeasureLnglat(this.viewer, opt);
          break;

        case 7:
          // 方位角测量
          ms = new MeasureAzimutht(this.viewer, opt);
          break;

        case 8:
          // 剖面测量
          ms = new MeasureSection(this.viewer, opt);
          break;

        case 9:
          // 单点坡度
          ms = new MeasureSlope(this.viewer, opt);
          break;

        /* 	case 10: //贴模型距离
        		ms = new MeasureTilesetDistance(this.viewer);
        		break; */

        case 11:
          // 单点坡度
          ms = new MeasureSlopePolygon(this.viewer);
          break;
      }

      this.nowMeasureObj = ms;
      var that = this;

      if (ms) {
        ms.start(function (res) {
          if (that.intoEdit) {
            ms.startEdit();
            if (that.startEditFun) that.startEditFun(ms);
            that.lastMeasureObj = ms;
          }

          if (opt.success) opt.success(ms, res);
          if (that.endMeasureFun) that.endMeasureFun(ms, res);
        });
        this.toolArr.push(ms);
      }
    } // 绑定编辑

  }, {
    key: "bindEdit",
    value: function bindEdit() {
      var that = this; // 如果是线 面 则需要先选中

      if (!this.handler) this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
      this.handler.setInputAction(function (evt) {
        //单击开始绘制
        if (!that.canEdit) return;
        var pick = that.viewer.scene.pick(evt.position);

        if (Cesium.defined(pick) && pick.id && pick.id.objId) {
          // 选中实体
          for (var i = 0; i < that.toolArr.length; i++) {
            if (pick.id.objId == that.toolArr[i].objId && (that.toolArr[i].state == "endCreate" || that.toolArr[i].state == "endEdit")) {
              if (that.lastMeasureObj) {
                // 结束除当前选中实体的所有编辑操作
                that.lastMeasureObj.endEdit();

                if (that.endEditFun) {
                  that.endEditFun(that.lastMeasureObj);
                }

                that.lastMeasureObj = null;
              } // 开始编辑


              that.toolArr[i].startEdit();
              that.nowEditObj = that.toolArr[i];
              if (that.startEditFun) that.startEditFun(that.nowEditObj); // 开始编辑

              that.lastMeasureObj = that.toolArr[i];
              break;
            }
          }
        } else {
          // 未选中实体 则结束全部绘制
          if (that.lastMeasureObj) {
            that.lastMeasureObj.endEdit();

            if (that.endEditFun) {
              that.endEditFun(that.lastMeasureObj); // 结束事件
            }

            that.lastMeasureObj = null;
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
  }, {
    key: "endEdit",
    value: function endEdit() {
      if (this.lastMeasureObj) {
        // 结束除当前选中实体的所有编辑操作
        this.lastMeasureObj.endEdit();

        if (this.endEditFun) {
          this.endEditFun(this.lastMeasureObj, this.lastMeasureObj.getEntity()); // 结束事件
        }

        this.lastMeasureObj = null;
      }

      for (var i = 0; i < this.toolArr.length; i++) {
        this.toolArr[i].endEdit();
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      for (var i = 0; i < this.toolArr.length; i++) {
        if (this.toolArr[i]) this.toolArr[i].destroy();
      }

      this.toolArr = [];
      this.nowMeasureObj = null; // 当前编辑对象
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.clear();

      if (this.handler) {
        this.handler.destroy();
        this.handler = null;
      }
    } // 设置单位

  }, {
    key: "setUnit",
    value: function setUnit(unit) {
      if (!unit) return;
      this.nowMeasureObj.setUnit(unit);
    }
  }]);

  return MeasureTool;
}();

// 底部鼠标及相机坐标信息
var LatlngNavigation = /*#__PURE__*/function () {
  function LatlngNavigation(viewer, opt) {
    _classCallCheck(this, LatlngNavigation);

    this.viewer = viewer;
    this.moveHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.initHtml();
    this.bindMouseMoveHandler();
    this.ellipsoid = this.viewer.scene.globe.ellipsoid;
  }

  _createClass(LatlngNavigation, [{
    key: "bindMouseMoveHandler",
    value: function bindMouseMoveHandler() {
      var that = this;
      this.moveHandler.setInputAction(function (evt) {
        //单击开始绘制
        var cartesian = that.getCatesian3FromPX(evt.endPosition);
        if (!cartesian) return;
        var lnglat = that.ellipsoid.cartesianToCartographic(cartesian);
        var lat = Cesium.Math.toDegrees(lnglat.latitude);
        var lng = Cesium.Math.toDegrees(lnglat.longitude);
        var height = lnglat.height;
        var cameraV = that.getCameraView();
        that.setHtml({
          lng: lng,
          lat: lat,
          height: height
        }, cameraV);
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this.moveHandler) {
        this.moveHandler.destroy();
        this.moveHandler = null;
      }

      var doms = document.getElementsByClassName("easy3d-lnglatNavigation");
      var id = this.viewer.container.id;
      var mapDom = document.getElementById(id);
      mapDom.removeChild(doms[0]);
    }
  }, {
    key: "initHtml",
    value: function initHtml() {
      var id = this.viewer.container.id;
      var mapDom = document.getElementById(id);
      var ele = document.createElement("div");
      ele.className = 'easy3d-lnglatNavigation';
      ele.innerHTML = " <ul>\n                            <li></li>   \n                            <li></li>\n                            <li></li>\n                            <li></li>\n                            <li></li>\n                            <li></li>\n                            <li></li>\n                        <ul>";
      mapDom.appendChild(ele);
    }
  }, {
    key: "getCatesian3FromPX",
    value: function getCatesian3FromPX(px) {
      var picks = this.viewer.scene.drillPick(px);
      this.viewer.scene.render();
      var cartesian;
      var isOn3dtiles = false;

      for (var i = 0; i < picks.length; i++) {
        if (picks[i] && picks[i].primitive && picks[i].primitive instanceof Cesium.Cesium3DTileset) {
          //模型上拾取
          isOn3dtiles = true;
          break;
        }
      }

      if (isOn3dtiles) {
        cartesian = this.viewer.scene.pickPosition(px);
      } else {
        var ray = this.viewer.camera.getPickRay(px);
        if (!ray) return null;
        cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
      }

      return cartesian;
    }
  }, {
    key: "setHtml",
    value: function setHtml(latlngOpt, cameraView) {
      var lng = Number(latlngOpt.lng).toFixed(6);
      var lat = Number(latlngOpt.lat).toFixed(6);
      var height = Number(latlngOpt.height).toFixed(2);
      var heading = Number(cameraView.heading).toFixed(2);
      var pitch = Number(cameraView.pitch).toFixed(2);
      var roll = Number(cameraView.roll).toFixed(2);
      var z = Number(cameraView.z).toFixed(2);
      var eles = document.getElementsByClassName('easy3d-lnglatNavigation');
      if (!eles || eles.length < 1) return;
      var ele = eles[0];
      var lis = ele.children[0].children;
      lis[0].innerHTML = "\u7ECF\u5EA6\uFF1A".concat(lng);
      lis[1].innerHTML = "\u7EAC\u5EA6\uFF1A".concat(lat);
      lis[2].innerHTML = "\u9AD8\u5EA6\uFF1A".concat(height);
      lis[3].innerHTML = "\u504F\u8F6C\u89D2\uFF1A".concat(heading);
      lis[4].innerHTML = "\u4EF0\u4FEF\u89D2\uFF1A".concat(pitch);
      lis[5].innerHTML = "\u7FFB\u6EDA\u89D2\uFF1A".concat(roll);
      lis[6].innerHTML = "\u76F8\u673A\u9AD8\u5EA6\uFF1A".concat(z);
    }
  }, {
    key: "getCameraView",
    value: function getCameraView() {
      var camera = this.viewer.camera;
      var position = camera.position;
      var heading = camera.heading;
      var pitch = camera.pitch;
      var roll = camera.roll;
      var lnglat = Cesium.Cartographic.fromCartesian(position);
      return {
        "x": Cesium.Math.toDegrees(lnglat.longitude),
        "y": Cesium.Math.toDegrees(lnglat.latitude),
        "z": lnglat.height,
        "heading": Cesium.Math.toDegrees(heading),
        "pitch": Cesium.Math.toDegrees(pitch),
        "roll": Cesium.Math.toDegrees(roll)
      };
    }
  }]);

  return LatlngNavigation;
}();

var GaodeRoute = /*#__PURE__*/function () {
  function GaodeRoute(opts) {
    _classCallCheck(this, GaodeRoute);

    opts = opts || {}; //请在实际项目中将下面高德KEY换为自己申请的，因为该key不保证长期有效。

    this._keys = opts.key || ["ae29a37307840c7ae4a785ac905927e0", //2020-6-18
    "888a52a74c55ca47abe6c55ab3661d11", "0bc2903efcb3b67ebf1452d2f664a238", "0df8f6f984adc49fca5b7b1108664da2", "72f75689dff38a781055e68843474751"];
    this.GaodeRouteType = {
      Walking: 1,
      //步行
      Bicycling: 2,
      //骑行
      Driving: 3 //驾车

    };
    this._key_index = 0;
  } //高德key


  _createClass(GaodeRoute, [{
    key: "keys",
    get: function get() {
      return this._keys;
    },
    set: function set(val) {
      this._keys = val;
    } //取单个key（轮询）

  }, {
    key: "key",
    get: function get() {
      var thisidx = this._key_index++ % this._keys.length;
      return this._keys[thisidx];
    } //  按指定类别自动查询

  }, {
    key: "query",
    value: function query(opt) {
      var filter = {
        "key": this.key,
        "output": "json"
      }; //坐标构造

      var startP = cUtil$1.wgs2gcj(opt.points[0]);
      var endP = cUtil$1.wgs2gcj(opt.points[opt.points.length - 1]);
      filter.origin = startP[0] + "," + startP[1];
      filter.destination = endP[0] + "," + endP[1]; // 如果有避让区域  添加避让区域

      if (opt.avoidareas) {
        var avoidStr = '';

        for (var i = 0; i < opt.avoidareas.length; i++) {
          var item = opt.avoidareas[i];
          avoidStr += "".concat(item[0], ",").concat(item[1], ";");
        }

        filter.avoidpolygons = avoidStr;
      }

      switch (opt.type) {
        default:
        case this.GaodeRouteType.Walking:
          //步行
          this.queryWalking(filter, opt);
          break;

        case this.GaodeRouteType.Bicycling:
          //骑行
          this.queryBicycling(filter, opt);
          break;

        case this.GaodeRouteType.Driving:
          //驾车
          this.queryDriving(filter, opt);
          break;
      }
    } //  一次查询多个路线

  }, {
    key: "queryList",
    value: function queryList(opt) {
      var that = this;
      var index = -1;
      var newOpts = {};

      for (var key in opt) {
        if (key == "points" || key == "success" || key == "error") continue;
        newOpts[key] = opt[key];
      }

      var arrPoints = opt.points;
      var arrResult = [];

      function queryNextLine() {
        index++;
        newOpts.points = arrPoints[index];

        newOpts.success = function (data) {
          if (data && data.paths && data.paths.length > 0) arrResult.push(data.paths[0]);else arrResult.push(null);

          if (index >= arrPoints.length - 1) {
            if (opt.success) {
              opt.success(arrResult);
            }
          } else {
            queryNextLine();
          }
        };

        newOpts.error = newOpts.success;
        that.query(newOpts);
      }

      queryNextLine();
    } //  计算最短距离的线 

  }, {
    key: "computeMindistanceLine",
    value: function computeMindistanceLine(data) {
      var mindis = Number.MAX_VALUE;
      var lineData = null;
      var index = -1;

      for (var i = 0; i < data.length; i++) {
        var item = data[i];

        if (item) {
          if (item.allDistance <= mindis) {
            lineData = item;
            index = i;
            mindis = item.allDistance;
          }
        }
      }

      return {
        lineData: lineData,
        index: index
      };
    } // 步行路径规划(单个查询)

    /*opt = { 
           points: 按起点、途经点、终点顺序的坐标数组 [[x1,y1],[x2,y2]] 
           error: function (data) //错误或无数据时回调方法
           success: function (data) //有数据时回调方法
    }*/

  }, {
    key: "queryWalking",
    value: function queryWalking(filter, opt) {
      var that = this;
      axios.get('http://restapi.amap.com/v3/direction/walking', {
        params: filter
      }).then(function (res) {
        var data = res.data || {};

        if (data.infocode !== "10000") {
          var msg = "路径规划 请求失败(" + data.infocode + ")：" + data.info;
          if (opt.error) opt.error(msg);
          return;
        }

        if (!data.route || !data.route.paths) {
          var msg = "未查询到相关结果！";
          if (opt.error) opt.error(msg);
          return;
        }

        var result = that._formatRouteData(filter.origin, filter.destination, data.route.paths);

        if (opt.success) opt.success(result);
      })["catch"](function (err) {
        if (opt.error) opt.error(err);
      });
    } //骑行路径查询

    /*opt = { 
           points: 按起点、途经点、终点顺序的坐标数组 [[x1,y1],[x2,y2]] 
           error: function (data) //错误或无数据时回调方法
           success: function (data) //有数据时回调方法
       }*/

  }, {
    key: "queryBicycling",
    value: function queryBicycling(filter, opt) {
      var that = this;
      axios.get("https://restapi.amap.com/v4/direction/bicycling", {
        params: filter
      }).then(function (res) {
        var data = res.data || {};

        if (data.infocode !== "10000") {
          var msg = "路径规划 请求失败(" + data.infocode + ")：" + data.info;
          if (opt.error) opt.error(msg);
          return;
        }

        if (!data.route || !data.route.paths) {
          var msg = "未查询到相关结果！";
          if (opt.error) opt.error(msg);
          return;
        }

        var result = that._formatRouteData(filter.origin, filter.destination, data.route.paths);

        if (opt.success) opt.success(result);
      })["catch"](function (err) {
        if (opt.error) opt.error(err);
      });
    } //驾车路径规划查询

    /*opt = { 
            points: 按起点、途经点、终点顺序的坐标数组 [[x1,y1],[x2,y2]] 
            error: function (data) //错误或无数据时回调方法
            success: function (data) //有数据时回调方法
        }*/

  }, {
    key: "queryDriving",
    value: function queryDriving(filter, opt) {
      filter.extensions = opt.extensions || "base";
      filter.strategy = opt.strategy || 0; //默认返回一条速度优先的路径

      var that = this;
      axios("https://restapi.amap.com/v3/direction/driving", {
        params: filter
      }).then(function (res) {
        var data = res.data || {};

        if (data.infocode !== "10000") {
          var msg = "路径规划 请求失败(" + data.infocode + ")：" + data.info;
          if (opt.error) opt.error(msg);
          return;
        }

        if (!data.route || !data.route.paths || data.route.paths.length == 0) {
          var msg = "未查询到相关结果！";
          if (opt.error) opt.error(msg);
          return;
        }

        var result = that._formatRouteData(filter.origin, filter.destination, data.route.paths);

        if (opt.success) opt.success(result);
      })["catch"](function (err) {
        if (opt.error) opt.error(err);
      });
    } // 格式化返回的数据

  }, {
    key: "_formatRouteData",
    value: function _formatRouteData(start, end, resultPaths) {
      var wgs_origin, wgs_destination;
      var paths = [];
      if (start) wgs_origin = cUtil$1.gcj2wgs(start.split(","));
      if (end) wgs_destination = cUtil$1.gcj2wgs(end.split(","));

      if (resultPaths && resultPaths.length > 0) {
        for (var i = 0; i < resultPaths.length; i++) {
          var route = [];
          route.push(wgs_origin); //连接起点

          var item = resultPaths[i];
          var steps = item.steps;
          var newSteps = [];
          var roadInfo = []; //途径地方

          for (var index = 0; index < steps.length; index++) {
            var obj = {
              instruction: steps[index].instruction,
              //路段步行指示
              distance: steps[index].distance,
              //路段距离 米
              duration: steps[index].duration,
              //路段预计时间 秒
              points: [],
              route: steps[index].road
            };
            var polyline = steps[index].polyline;
            var polylineArr = polyline.split(";");

            for (var ind = 0; ind < polylineArr.length; ind++) {
              var one = polylineArr[ind];
              var wgs = cUtil$1.gcj2wgs(one.split(","));
              route.push(wgs);
              obj.points.push(wgs);
            }

            roadInfo.push(obj.route);
            newSteps.push(obj);
          }

          route.push(wgs_destination); //连接终点

          paths.push({
            allDistance: item.distance,
            //总距离
            allDuration: item.duration,
            //全部所需时间
            steps: newSteps,
            //每一段的数据
            points: route,
            //包含起点和终点的 完整路径的wgs84坐标数组
            road: roadInfo
          });
        }
      }

      return {
        origin: wgs_origin,
        //起点
        destination: wgs_destination,
        //终点
        paths: paths //所有方案

      };
    }
  }]);

  return GaodeRoute;
}();

// 相关小工具
var gadgets = {
  GaodeRoute: GaodeRoute
};

/**
 * opt
 *      positions 坐标
 *      startTime 开始时间
 *      times 全部时间
 *      speed 漫游速度 和times互斥 times优先级高
 *      entityType : 类型（point/model）
 *      entityAttr ： 漫游对象 默认为不显示的point
 *          uri 模型地址
 *          scale 模型大小
 *          ...  同ModelGraphics中配置
 */
var Roam = /*#__PURE__*/function () {
  function Roam(viewer, opt) {
    _classCallCheck(this, Roam);

    console.log("漫游对象属性--》", opt);
    this.viewer = viewer;
    this.objId = Number(new Date().getTime() + "" + Number(Math.random() * 1000).toFixed(0));
    this.opt = opt || {};
    this.startTime = opt.startTime ? Cesium.JulianDate.fromDate(opt.startTime, new Cesium.JulianDate()) : this.viewer.clock.currentTime.clone();
    this.endTime = null;

    if (!this.opt.positions) {
      console.log("缺少漫游坐标");
      return;
    }

    this.positions = this.transfromPositions(this.opt.positions);
    this.clockSpeed = 1;
    this.stopTime = null;
    this.alldistance = 0;
    this.alltimes = 0;
    this.distanceED = -1;
    this.timesED = -1;
    this.speed = 0;
    this.viewType = "none"; // 漫游视角

    this.rendHandler = null;
    this.isLockView = false; // 是否锁定视角

    this.viewXYZ = {
      // 锁定时视角参数
      x: 0,
      y: 0,
      z: 0
    };
    this.endRoamCallback = opt.endRoamCallback;
    this.roamingCallback = opt.roamingCallback;
    this.init();
    this.setViewType(opt.viewType); // 初始化时 设置视角
  }

  _createClass(Roam, [{
    key: "init",
    value: function init() {
      var attr = {};

      if (this.opt.times) {
        // 固定时长漫游
        this.endTime = Cesium.JulianDate.addSeconds(this.startTime, this.opt.times, new Cesium.JulianDate());
        attr = this.createPropertyByTimes(this.positions, this.opt.times);
      } else {
        // 固定速度漫游 (m/s)
        if (!this.opt.speed) {
          console.log("缺少漫游时长或速度参数！");
          return;
        }

        attr = this.createPropertyBySpeed(this.positions, this.opt.speed);
      }

      this.alldistance = attr.alldistance;
      this.alltimes = attr.alltimes;
      this.speed = attr.speed;
      this.roamEntity = this.createRoamEntity(this.opt.entityType, attr.property);
    } // 修改漫游的路径

  }, {
    key: "setPositions",
    value: function setPositions(positions) {
      this.destroy();
      this.positions = positions;
      this.init();
    } // 开始漫游

  }, {
    key: "start",
    value: function start() {
      if (this.roamEntity) this.roamEntity.show = true;
      this.clockSpeed = 1;
      this.viewer.clock.currentTime = this.startTime;
      this.viewer.clock.multiplier = this.clockSpeed;
      this.viewer.clock.shouldAnimate = true;
      this.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
      this.computeCamera(); // 设置视角
    } // 结束漫游

  }, {
    key: "end",
    value: function end() {
      if (this.roamEntity) this.roamEntity.show = false;
      this.viewer.clock.currentTime = this.endTime;
      this.viewer.clock.shouldAnimate = false;
      this.distanceED = this.alldistance;
      this.timesED = this.alltimes;
      if (this.endRoamCallback) this.endRoamCallback(this.opt);
    } // 暂停漫游

  }, {
    key: "stop",
    value: function stop() {
      this.stopTime = this.viewer.clock.currentTime.clone();
      this.viewer.clock.shouldAnimate = false;
      if (this.roamingFun) this.roamingFun();
    } // 继续漫游

  }, {
    key: "goon",
    value: function goon() {
      if (!this.stopTime) return;
      this.viewer.clock.currentTime = this.stopTime.clone();
      this.viewer.clock.shouldAnimate = true;
      this.stopTime = null;
    } // 播放速度

  }, {
    key: "setSpeed",
    value: function setSpeed(speed) {
      this.clockSpeed = speed;
      this.viewer.clock.multiplier = this.clockSpeed;
    } // 销毁

  }, {
    key: "destroy",
    value: function destroy() {
      if (this.roamEntity) {
        this.viewer.entities.remove(this.roamEntity);
        this.roamEntity = null;
      }

      if (this.rendHandler) {
        this.rendHandler();
        this.rendHandler = null;
      }

      this.viewer.clock.multiplier = 1;
      this.isLockView = false;
      this.viewer.trackedEntity = undefined;
      this.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }
  }, {
    key: "createRoamEntity",
    value: function createRoamEntity(type, property) {
      var entity = null;

      if (type == "model") {
        if (!this.opt.entityAttr || !this.opt.entityAttr.uri) {
          console.log("漫游缺少模型对象！");
          return;
        }

        entity = this.viewer.entities.add({
          orientation: new Cesium.VelocityOrientationProperty(property),
          position: property,
          model: this.opt.entityAttr
        });
      } else if (type == "image") {
        if (!this.opt.entityAttr || !this.opt.entityAttr.image) {
          console.log("漫游缺少图片对象！");
          return;
        }

        entity = this.viewer.entities.add({
          orientation: new Cesium.VelocityOrientationProperty(property),
          position: property,
          billboard: this.opt.entityAttr
        });
      } else {
        entity = this.viewer.entities.add({
          orientation: new Cesium.VelocityOrientationProperty(property),
          position: property,
          point: {
            pixelSize: 0.001,
            color: Cesium.Color.WHITE.withAlpha(0.0001)
          }
        });
      }

      entity.show = false;
      return entity;
    }
  }, {
    key: "transfromPositions",
    value: function transfromPositions(positions) {
      if (!positions) return;

      if (positions[0] instanceof Cesium.Cartesian3) {
        return positions;
      } else {
        var newPositions = [];
        positions.forEach(function (element) {
          var p = Cesium.Cartesian3.fromDegrees(element[0], element[1], element[2] || 0);
          newPositions.push(p);
        });
        return newPositions;
      }
    } // 实时计算相机视角

  }, {
    key: "computeCamera",
    value: function computeCamera() {
      var that = this;
      var scratch = new Cesium.Matrix4();
      this.distanceED = 0; // 飞过的距离

      this.timeED = 0; // 所用时间

      var lastPosition = null;

      if (!this.rendHandler) {
        this.rendHandler = this.viewer.scene.preRender.addEventListener(function (e) {
          if (!that.viewer.clock.shouldAnimate || !that.roamEntity) return;
          var currentTime = that.viewer.clock.currentTime;
          var tiemC = Cesium.JulianDate.compare(that.endTime, currentTime);

          if (tiemC < 0) {
            that.end();
            return;
          }

          if (that.roamingCallback) that.roamingCallback(that.distanceED, that.timesED);

          if (that.isLockView) {
            that.getModelMatrix(that.roamEntity, that.viewer.clock.currentTime, scratch);
            that.viewer.scene.camera.lookAtTransform(scratch, new Cesium.Cartesian3(-that.viewXYZ.x, that.viewXYZ.y, that.viewXYZ.z));
          }

          that.timeED = Cesium.JulianDate.secondsDifference(currentTime, that.startTime);
          var position = that.roamEntity.position.getValue(currentTime);

          if (position && lastPosition) {
            that.distanceED += Cesium.Cartesian3.distance(position, lastPosition);
          }

          lastPosition = position;
        });
      }
    }
  }, {
    key: "getModelMatrix",
    value: function getModelMatrix(entity, time, result) {
      if (!entity) return;
      var position = Cesium.Property.getValueOrUndefined(entity.position, time, new Cesium.Cartesian3());
      if (!Cesium.defined(position)) return;
      var orientation = Cesium.Property.getValueOrUndefined(entity.orientation, time, new Cesium.Quaternion());

      if (!orientation) {
        result = Cesium.Transforms.eastNorthUpToFixedFrame(position, undefined, result);
      } else {
        result = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromQuaternion(orientation, new Cesium.Matrix3()), position, result);
      }

      return result;
    } // 构建漫游的property

  }, {
    key: "createPropertyByTimes",
    value: function createPropertyByTimes(positions, times) {
      if (!positions || positions.length < 2) return;
      var property = new Cesium.SampledPositionProperty();
      var alldistance = 0; // 总距离

      for (var i = 1; i < positions.length; i++) {
        var p = positions[i - 1];
        var nextP = positions[i];
        var distance = Cesium.Cartesian3.distance(p, nextP);
        alldistance += distance;
      }

      var speed = alldistance / times; // 速度

      var passdistance = 0;

      for (var ind = 0; ind < positions.length; ind++) {
        var nowP = positions[ind];
        var currentTime = void 0;

        if (ind == 0) {
          currentTime = this.startTime.clone();
        } else {
          var lastP = positions[ind - 1];

          var _distance = Cesium.Cartesian3.distance(nowP, lastP);

          passdistance += _distance;

          var _times = passdistance / speed;

          currentTime = Cesium.JulianDate.addSeconds(this.startTime.clone(), _times, new Cesium.JulianDate());
        }

        property.addSample(currentTime.clone(), nowP.clone());
      }

      return {
        property: property,
        alldistance: alldistance,
        alltimes: times,
        speed: speed
      };
    }
  }, {
    key: "createPropertyBySpeed",
    value: function createPropertyBySpeed(positions, speed) {
      if (!positions || positions.length < 2) return;
      var property = new Cesium.SampledPositionProperty();
      var alldistance = 0; // 总距离

      for (var i = 1; i < positions.length; i++) {
        var p = positions[i - 1];
        var nextP = positions[i];
        var distance = Cesium.Cartesian3.distance(p, nextP);
        alldistance += distance;
      }

      var passdistance = 0;

      for (var ind = 0; ind < positions.length; ind++) {
        var nowP = positions[ind];
        var currentTime = void 0;

        if (ind == 0) {
          currentTime = this.startTime.clone();
        } else {
          var lastP = positions[ind - 1];

          var _distance2 = Cesium.Cartesian3.distance(nowP, lastP);

          passdistance += _distance2;
          var times = passdistance / speed;
          currentTime = Cesium.JulianDate.addSeconds(this.startTime.clone(), times, new Cesium.JulianDate());
        }

        property.addSample(currentTime.clone(), nowP.clone());
      }

      return {
        property: property,
        alldistance: alldistance,
        alltimes: alldistance / speed,
        speed: speed
      };
    } // 设置漫游视角

  }, {
    key: "setViewType",
    value: function setViewType(viewType) {
      this.viewType = viewType;

      switch (this.viewType) {
        case "dy":
          this.isLockView = true;
          this.viewXYZ = {
            x: 100,
            y: 0,
            z: 10
          };
          break;

        case "sd":
          this.isLockView = true;
          this.viewXYZ = {
            x: 0,
            y: 0,
            z: 5000
          };
          break;

        case "gs":
          this.isLockView = false;
          this.viewer.trackedEntity = undefined;
          break;

        default:
          this.isLockView = false;
          this.viewer.trackedEntity = undefined;
          this.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      }
    } // 设置自定义跟随视角

  }, {
    key: "setTrackView",
    value: function setTrackView(viewXYZ) {
      this.isLockView = true;
      this.viewXYZ = viewXYZ;
    } // 获取当前漫游的属性

  }, {
    key: "getAttr",
    value: function getAttr() {
      var attr = _defineProperty({
        viewType: this.viewType,
        alldistance: this.alldistance,
        alltimes: this.alltimes,
        distanceED: this.distanceED,
        times: this.distanceED
      }, "viewType", this.viewType);

      return Object.assign(this.opt, attr);
    }
  }]);

  return Roam;
}();

var RoamTool = /*#__PURE__*/function () {
  function RoamTool(viewer, opt) {
    _classCallCheck(this, RoamTool);

    this.viewer = viewer;
    this.opt = opt || {};
    this.startRoamFun = null;
    this.endRoamFun = null;
    this.roamingFun = null;
    this.stopRoamFun = null;
    this.goonRoamFun = null;
    this.endCreateFun = null;
    this.roamList = [];
    this.nowStartRoam = null;
  } // 事件绑定


  _createClass(RoamTool, [{
    key: "on",
    value: function on(type, fun) {

      if (type == "startRoam") {
        this.startRoamFun = fun;
      }

      if (type == "endRoam") {
        this.endRoamFun = fun;
      }

      if (type == "roaming") {
        this.roamingFun = fun;
      }

      if (type == "stopRoam") {
        this.stopRoamFun = fun;
      }

      if (type == "goonRoam") {
        this.goonRoamFun = fun;
      }

      if (type == "endCreate") {
        this.endCreateFun = fun;
      }
    } // 创建漫游

  }, {
    key: "create",
    value: function create(opt, callback) {
      opt = opt || {};
      var _opt = opt,
          roamType = _opt.roamType,
          positions = _opt.positions;
      positions = this.transfromPositions(positions);
      var roam = null;
      var roamAttr = {
        times: opt.times,
        speed: opt.speed,
        endRoamCallback: this.endRoamFun,
        roamingCallback: this.roamingFun,
        viewType: opt.viewType
      };
      if (!opt.times && !opt.speed) roamAttr.times = 60; // 不设置速度和时长 默认以60s时长飞完

      roamAttr = Object.assign(opt, roamAttr);
      var that = this;

      switch (roamType) {
        case 1:
          // 飞行漫游
          if (!opt.height) {
            console.log("飞行漫游缺少高度！");
            return;
          }

          var newPositions = this.updatePositionsHeight(positions, opt.height);
          roamAttr.positions = newPositions;
          roam = new Roam(this.viewer, roamAttr);
          roam.attr = roamAttr;
          this.roamList.push(roam);
          if (callback) callback(roam);
          break;

        case 2:
          // 贴地漫游
          this.getTerrainPositions(positions, function (newPositions) {
            roamAttr.positions = newPositions;
            /* roamAttr.modelHeightReference = 1; */

            roam = new Roam(that.viewer, roamAttr);
            roam.attr = roamAttr;
            that.roamList.push(roam);
            if (callback) callback(roam);
          });
          break;

        case 3:
          // 贴模型漫游
          break;

        default:
          // 默认是普通漫游
          roamAttr.positions = positions;
          roam = new Roam(this.viewer, roamAttr);
          roam.attr = roamAttr;
          this.roamList.push(roam);
          if (callback) callback(roam);
      }
    }
  }, {
    key: "transfromPositions",
    value: function transfromPositions(positions) {
      if (!positions) return;

      if (positions[0] instanceof Cesium.Cartesian3) {
        return positions;
      } else if (positions[0].x && positions[0].y && positions[0].z) {
        var arr = [];
        positions.forEach(function (item) {
          arr.push(new Cesium.Cartesian3(item.x, item.y, item.z));
        });
        return arr;
      } else {
        var newPositions = [];
        positions.forEach(function (element) {
          var p = Cesium.Cartesian3.fromDegrees(element[0], element[1], element[2] || 0);
          newPositions.push(p);
        });
        return newPositions;
      }
    }
  }, {
    key: "updatePositionsHeight",
    value: function updatePositionsHeight(positions, height) {
      if (!positions || positions.length < 2) return;
      var newPositions = [];
      positions.forEach(function (position) {
        var ctgc = Cesium.Cartographic.fromCartesian(position.clone());
        ctgc.height = height;
        var p = Cesium.Cartographic.toCartesian(ctgc);
        newPositions.push(p);
      });
      return newPositions;
    } // 计算贴地高程

  }, {
    key: "getTerrainPositions",
    value: function getTerrainPositions(positions, callback) {
      if (!positions || positions.length < 2) return;
      var cgArr = [];

      for (var i = 0; i < positions.length; i++) {
        var cartesian = positions[i];
        var cg = Cesium.Cartographic.fromCartesian(cartesian);
        cgArr.push(cg);
      }

      Cesium.when(Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, cgArr), function (updateLnglats) {
        var raisedPositions = ellipsoid.cartographicArrayToCartesianArray(updateLnglats); //转为世界坐标数组

        if (callback) callback(raisedPositions);
      });
    } // 根据构建时指定的属性获取当前漫游对象

  }, {
    key: "getRoamByField",
    value: function getRoamByField(fieldName, fieldValue) {
      if (!fieldName) return [];
      var arr = [];

      for (var i = 0; i < this.roamList.length; i++) {
        var roam = this.roamList[i];

        if (roam.attr[fieldName] == fieldValue) {
          arr.push({
            roam: roam,
            index: i
          });
        }
      }

      return arr;
    }
  }, {
    key: "removeRoamById",
    value: function removeRoamById(roamId) {
      if (!roamId) return;

      for (var i = this.roamList.length - 1; i >= 0; i--) {
        var roam = this.roamList[i];

        if (roam.objId == roamId) {
          roam.destroy();
          this.roamList.splice(i, 1);
          break;
        }
      }
    }
  }, {
    key: "removeRoam",
    value: function removeRoam(roam) {
      if (!roam) return;
      var roamId = roam.objId;
      this.removeRoamById(roamId);
    } // 开始漫游

  }, {
    key: "startRoam",
    value: function startRoam(roam) {
      this.endRoam();
      var roamId = roam.objId;

      for (var i = this.roamList.length - 1; i >= 0; i--) {
        var _roam = this.roamList[i];

        if (_roam.objId == roamId) {
          _roam.start();

          this.nowStartRoam = _roam;
          if (this.startRoamFun) this.startRoamFun(_roam);
          break;
        }
      }
    }
  }, {
    key: "endRoam",
    value: function endRoam() {
      if (this.nowStartRoam) {
        this.nowStartRoam.end();
        this.nowStartRoam = null;
      }
    }
  }, {
    key: "getNowroamAttr",
    value: function getNowroamAttr() {
      if (!this.nowStartRoam) return {};
      var attr = Object.assign(this.nowStartRoam.attr, this.nowStartRoam.getAttr());
      return attr;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      for (var i = this.roamList.length - 1; i >= 0; i--) {
        var roam = this.roamList[i];
        roam.destroy();
      }

      this.roamList = [];
    } // 转化为json

  }, {
    key: "toJson",
    value: function toJson() {
      var arr = [];

      for (var i = this.roamList.length - 1; i >= 0; i--) {
        var roam = this.roamList[i];
        arr.push(roam.getAttr());
      }

      return arr;
    }
  }]);

  return RoamTool;
}();

// 缩放工具
var ZoomTool = /*#__PURE__*/function () {
  function ZoomTool(viewer, opt) {
    _classCallCheck(this, ZoomTool);

    this.viewer = viewer;
    this.opt = opt || {};
    this.step = this.opt.step || 0.5;
    this.forwardAmount = null;
    this.backwardAmount = null;
    this.position = null;
  } // 向前移动


  _createClass(ZoomTool, [{
    key: "forward",
    value: function forward() {
      var amount;

      if (this.backwardAmount) {
        amount = this.backwardAmount;
        this.backwardAmount = null;
      } else {
        amount = this.computeLength() || 10000;
        amount = amount * this.step;
      }

      this.viewer.camera.moveForward(amount);
      this.forwardAmount = amount;
    } // 向后移动

  }, {
    key: "backward",
    value: function backward() {
      var amount;

      if (this.forwardAmount) {
        amount = this.forwardAmount;
        this.forwardAmount = null;
      } else {
        amount = this.computeLength() || 10000;
        amount = amount * this.step;
      }

      this.viewer.camera.moveBackward(amount);
      this.backwardAmount = amount;
    } // 计算相机距离

  }, {
    key: "computeLength",
    value: function computeLength() {
      this.position = this.viewer.camera.position;
      var lnglat = Cesium.Cartographic.fromCartesian(this.position);
      var height = lnglat.height;
      var dir = this.viewer.camera.direction;
      dir = Cesium.Cartesian3.normalize(dir, new Cesium.Cartesian3());
      var reverseZ = new Cesium.Cartesian3(0, 0, -1);
      var cosAngle = Cesium.Cartesian3.dot(dir, reverseZ);
      var angle = Math.asin(cosAngle);
      var length = height / Math.cos(angle);
      return length;
    }
  }]);

  return ZoomTool;
}();

var OverviewMap = /*#__PURE__*/function () {
  function OverviewMap(viewer, opt) {
    _classCallCheck(this, OverviewMap);

    this.viewer = viewer;
    this.opt = opt || {};
    var defaulteStyle = {
      height: 150,
      width: 200,
      bottom: 30,
      right: 60
    };
    this.style = Object.assign(defaulteStyle, this.opt.style);
    this.rectangle = null;
    this.init();
  }

  _createClass(OverviewMap, [{
    key: "init",
    value: function init() {
      this.mapEle = window.document.createElement("div");
      this.mapEle.setAttribute("id", "map2d");
      this.mapEle.style.height = this.style.height + "px";
      this.mapEle.style.width = this.style.width + "px";
      this.mapEle.style.position = "absolute";
      this.mapEle.style.bottom = this.style.bottom + "px";
      this.mapEle.style.right = this.style.right + "px";
      document.body.appendChild(this.mapEle);
      this.showStyle = {
        color: "#ff7800",
        weight: 1,
        fill: true,
        stroke: true,
        opacity: 1
      };
      this.hideStyle = {
        fill: false,
        opacity: 0
      }; //根据参数创建鹰眼图  

      var map = L.map('map2d', {
        minZoom: 3,
        maxZoom: 17,
        center: [31.827107, 117.240601],
        zoom: 4,
        zoomControl: false,
        attributionControl: false
      });
      L.tileLayer("http://a.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
      this.map = map;
      this.viewer.camera.percentageChanged = 0.01;
      this.viewer.camera.changed.addEventListener(this.sceneRenderHandler, this);
      this.sceneRenderHandler();
    }
  }, {
    key: "sceneRenderHandler",
    value: function sceneRenderHandler() {
      var rectangle = this.viewer.camera.computeViewRectangle();
      var extend = {};

      if (rectangle) {
        extend.ymin = Cesium.Math.toDegrees(rectangle.south);
        extend.ymax = Cesium.Math.toDegrees(rectangle.north);
        extend.xmin = Cesium.Math.toDegrees(rectangle.west);
        extend.xmax = Cesium.Math.toDegrees(rectangle.east);
      } else {
        extend.ymin = -90;
        extend.ymax = 90;
        extend.xmin = -180;
        extend.xmin = 180;
      }

      var corner1 = L.latLng(extend.ymin, extend.xmin),
          corner2 = L.latLng(extend.ymax, extend.xmax);
      var bounds = L.latLngBounds(corner1, corner2);

      if (this.rectangle) {
        this.rectangle.setBounds(bounds);
      } else {
        this.rectangle = L.rectangle(bounds, this.showStyle).addTo(this.map);
      }

      if (extend.xmin == -180 && extend.xmax == 180 && extend.ymax == 90 && extend.ymin == -90) {
        //整个地球在视域内 
        this.map.setView([0, 0], 0);
        this.rectangle.setStyle(this.hideStyle);
      } else {
        var padBounds = bounds.pad(0.5);
        this.map.fitBounds(padBounds);
        this.rectangle.setStyle(this.showStyle);
      }
    } //关闭鹰眼图

  }, {
    key: "hide",
    value: function hide() {
      if (this.mapEle) this.mapEle.style.display = "none";
    } //打开鹰眼图

  }, {
    key: "show",
    value: function show() {
      if (this.map && this.mapEle) this.mapEle.style.display = "block";
    } //设置矩形框样式

  }, {
    key: "setStyle",
    value: function setStyle(style) {
      if (!style) return;
      this.showStyle = style;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this.mapEle) {
        document.body.removeChild(this.mapEle);
      }

      this.viewer.camera.changed.removeEventListener(this.sceneRenderHandler, this);
    }
  }]);

  return OverviewMap;
}();

/* eslint-disable no-unused-vars */
var htmlTagRegex = /<html(.|\s)*>(.|\s)*<\/html>/im;
var md = new MarkdownIt({
  html: true,
  linkify: true
});
md.use(MarkdownItSanitizer, {
  imageClass: '',
  removeUnbalanced: false,
  removeUnknown: false
});
var KnockoutMarkdownBinding = {
  register: function register(Knockout) {
    Knockout.bindingHandlers.markdown = {
      'init': function init() {
        // Prevent binding on the dynamically-injected HTML (as developers are unlikely to expect that, and it has security implications)
        return {
          'controlsDescendantBindings': true
        };
      },
      'update': function update(element, valueAccessor) {
        // Remove existing children of this element.
        while (element.firstChild) {
          Knockout.removeNode(element.firstChild);
        }

        var rawText = Knockout.unwrap(valueAccessor()); // If the text contains an <html> tag, don't try to interpret it as Markdown because
        // we'll probably break it in the process.

        var html;

        if (htmlTagRegex.test(rawText)) {
          html = rawText;
        } else {
          html = md.render(rawText);
        }

        var nodes = Knockout.utils.parseHtmlFragment(html, element);
        element.className = element.className + ' markdown';

        for (var i = 0; i < nodes.length; ++i) {
          var node = nodes[i];
          setAnchorTargets(node);
          element.appendChild(node);
        }
      }
    };
  }
};

function setAnchorTargets(element) {
  if (element instanceof HTMLAnchorElement) {
    element.target = '_blank';
  }

  if (element.childNodes && element.childNodes.length > 0) {
    for (var i = 0; i < element.childNodes.length; ++i) {
      setAnchorTargets(element.childNodes[i]);
    }
  }
}

/* eslint-disable no-unused-vars */

var cesium = require('cesium/Cesium.js');

var knockout = cesium.knockout;
var KnockoutHammerBinding = {
  register: function register(Knockout) {
    Knockout.bindingHandlers.swipeLeft = {
      init: function init(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var f = Knockout.unwrap(valueAccessor());
        new Hammer(element).on('swipeleft', function (e) {
          var viewModel = bindingContext.$data;
          f.apply(viewModel, arguments);
        });
      }
    };
    Knockout.bindingHandlers.swipeRight = {
      init: function init(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var f = Knockout.unwrap(valueAccessor());
        new Hammer(element).on('swiperight', function (e) {
          var viewModel = bindingContext.$data;
          f.apply(viewModel, arguments);
        });
      }
    };
  }
};

/* eslint-disable no-unused-vars */
var cesium$1 = require('cesium/Cesium.js');

var knockout$1 = cesium$1.knockout,
    SvgPathBindingHandler = cesium$1.SvgPathBindingHandler;
var Knockout = knockout$1;

var registerKnockoutBindings = function registerKnockoutBindings() {
  SvgPathBindingHandler.register(Knockout);
  KnockoutMarkdownBinding.register(Knockout);
  KnockoutHammerBinding.register(Knockout);
  Knockout.bindingHandlers.embeddedComponent = {
    init: function init(element, valueAccessor, allBindings, viewModel, bindingContext) {
      var component = Knockout.unwrap(valueAccessor());
      component.show(element);
      return {
        controlsDescendantBindings: true
      };
    },
    update: function update(element, valueAccessor, allBindings, viewModel, bindingContext) {}
  };
};

var createFragmentFromTemplate = function createFragmentFromTemplate(htmlString) {
  var holder = document.createElement('div');
  holder.innerHTML = htmlString;
  var fragment = document.createDocumentFragment();

  while (holder.firstChild) {
    fragment.appendChild(holder.firstChild);
  }

  return fragment;
};

/* eslint-disable no-unused-vars */
var cesium$2 = require('cesium/Cesium.js');

var knockout$2 = cesium$2.knockout,
    getElement = cesium$2.getElement;
var Knockout$1 = knockout$2;

var loadView = function loadView(htmlString, container, viewModel) {
  container = getElement(container);
  var fragment = createFragmentFromTemplate(htmlString); // Sadly, fragment.childNodes doesn't have a slice function.
  // This code could be replaced with Array.prototype.slice.call(fragment.childNodes)
  // but that seems slightly error prone.

  var nodes = [];
  var i;

  for (i = 0; i < fragment.childNodes.length; ++i) {
    nodes.push(fragment.childNodes[i]);
  }

  container.appendChild(fragment);

  for (i = 0; i < nodes.length; ++i) {
    var node = nodes[i];

    if (node.nodeType === 1 || node.nodeType === 8) {
      Knockout$1.applyBindings(viewModel, node);
    }
  }

  return nodes;
};

/* eslint-disable no-unused-vars */
var cesium$3 = require('cesium/Cesium.js');

var defined = cesium$3.defined,
    DeveloperError = cesium$3.DeveloperError,
    EllipsoidGeodesic = cesium$3.EllipsoidGeodesic,
    Cartesian2 = cesium$3.Cartesian2,
    getTimestamp = cesium$3.getTimestamp,
    EventHelper = cesium$3.EventHelper,
    knockout$3 = cesium$3.knockout;
var Knockout$2 = knockout$3;

var DistanceLegendViewModel = function DistanceLegendViewModel(options) {
  if (!defined(options) || !defined(options.terria)) {
    throw new DeveloperError('options.terria is required.');
  }

  this.terria = options.terria;
  this._removeSubscription = undefined;
  this._lastLegendUpdate = undefined;
  this.eventHelper = new EventHelper();
  this.distanceLabel = undefined;
  this.barWidth = undefined;
  this.enableDistanceLegend = defined(options.enableDistanceLegend) ? options.enableDistanceLegend : true;
  Knockout$2.track(this, ['distanceLabel', 'barWidth']);
  this.eventHelper.add(this.terria.afterWidgetChanged, function () {
    if (defined(this._removeSubscription)) {
      this._removeSubscription();

      this._removeSubscription = undefined;
    }
  }, this); //        this.terria.beforeWidgetChanged.addEventListener(function () {
  //            if (defined(this._removeSubscription)) {
  //                this._removeSubscription();
  //                this._removeSubscription = undefined;
  //            }
  //        }, this);

  var that = this;

  function addUpdateSubscription() {
    if (defined(that.terria)) {
      var scene = that.terria.scene;
      that._removeSubscription = scene.postRender.addEventListener(function () {
        updateDistanceLegendCesium(this, scene);
      }, that);
    }
  }

  addUpdateSubscription();
  this.eventHelper.add(this.terria.afterWidgetChanged, function () {
    addUpdateSubscription();
  }, this); // this.terria.afterWidgetChanged.addEventListener(function() {
  //    addUpdateSubscription();
  // }, this);
};

DistanceLegendViewModel.prototype.destroy = function () {
  this.eventHelper.removeAll();
};

DistanceLegendViewModel.prototype.show = function (container) {
  var testing;

  if (this.enableDistanceLegend) {
    testing = '<div class="distance-legend" id="easy3d-distance-legend" data-bind="visible: distanceLabel && barWidth">' + '<div class="distance-legend-label" data-bind="text: distanceLabel"></div>' + '<div class="distance-legend-scale-bar" data-bind="style: { width: barWidth + \'px\', left: (5 + (125 - barWidth) / 2) + \'px\' }"></div>' + '</div>';
  } else {
    testing = '<div class="distance-legend" id="easy3d-distance-legend" style="display: none;" data-bind="visible: distanceLabel && barWidth">' + '<div class="distance-legend-label"  data-bind="text: distanceLabel"></div>' + '<div class="distance-legend-scale-bar"  data-bind="style: { width: barWidth + \'px\', left: (5 + (125 - barWidth) / 2) + \'px\' }"></div>' + '</div>';
  }

  loadView(testing, container, this);
};

DistanceLegendViewModel.create = function (options) {
  var result = new DistanceLegendViewModel(options);
  result.show(options.container);
  result.setStyle(options.style);
  return result;
}; // 设置样式


DistanceLegendViewModel.prototype.setStyle = function (style) {
  if (!style || Object.keys(style).length < 1) return;
  var ele = document.getElementById("easy3d-distance-legend");
  if (!ele) return;

  for (var i in style) {
    ele.style[i] = style[i];
  }
};

var geodesic = new EllipsoidGeodesic();
var distances = [1, 2, 3, 5, 10, 20, 30, 50, 100, 200, 300, 500, 1000, 2000, 3000, 5000, 10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000, 1000000, 2000000, 3000000, 5000000, 10000000, 20000000, 30000000, 50000000];

function updateDistanceLegendCesium(viewModel, scene) {
  if (!viewModel.enableDistanceLegend) {
    viewModel.barWidth = undefined;
    viewModel.distanceLabel = undefined;
    return;
  }

  var now = getTimestamp();

  if (now < viewModel._lastLegendUpdate + 250) {
    return;
  }

  viewModel._lastLegendUpdate = now; // Find the distance between two pixels at the bottom center of the screen.

  var width = scene.canvas.clientWidth;
  var height = scene.canvas.clientHeight;
  var left = scene.camera.getPickRay(new Cartesian2(width / 2 | 0, height - 1));
  var right = scene.camera.getPickRay(new Cartesian2(1 + width / 2 | 0, height - 1));
  var globe = scene.globe;
  var leftPosition = globe.pick(left, scene);
  var rightPosition = globe.pick(right, scene);

  if (!defined(leftPosition) || !defined(rightPosition)) {
    viewModel.barWidth = undefined;
    viewModel.distanceLabel = undefined;
    return;
  }

  var leftCartographic = globe.ellipsoid.cartesianToCartographic(leftPosition);
  var rightCartographic = globe.ellipsoid.cartesianToCartographic(rightPosition);
  geodesic.setEndPoints(leftCartographic, rightCartographic);
  var pixelDistance = geodesic.surfaceDistance; // Find the first distance that makes the scale bar less than 100 pixels.

  var maxBarWidth = 100;
  var distance;

  for (var i = distances.length - 1; !defined(distance) && i >= 0; --i) {
    if (distances[i] / pixelDistance < maxBarWidth) {
      distance = distances[i];
    }
  }

  if (defined(distance)) {
    var label;

    if (distance >= 1000) {
      label = (distance / 1000).toString() + ' km';
    } else {
      label = distance.toString() + ' m';
    }

    viewModel.barWidth = distance / pixelDistance | 0;
    viewModel.distanceLabel = label;
  } else {
    viewModel.barWidth = undefined;
    viewModel.distanceLabel = undefined;
  }
}

var svgReset = 'M 7.5,0 C 3.375,0 0,3.375 0,7.5 0,11.625 3.375,15 7.5,15 c 3.46875,0 6.375,-2.4375 7.21875,-5.625 l -1.96875,0 C 12,11.53125 9.9375,13.125 7.5,13.125 4.40625,13.125 1.875,10.59375 1.875,7.5 1.875,4.40625 4.40625,1.875 7.5,1.875 c 1.59375,0 2.90625,0.65625 3.9375,1.6875 l -3,3 6.5625,0 L 15,0 12.75,2.25 C 11.4375,0.84375 9.5625,0 7.5,0 z';

var cesium$4 = require('cesium/Cesium.js');

var defined$1 = cesium$4.defined,
    DeveloperError$1 = cesium$4.DeveloperError,
    knockout$4 = cesium$4.knockout;
var Knockout$3 = knockout$4;
/**
 * The view-model for a control in the user interface
 *
 * @alias UserInterfaceControl
 * @constructor
 * @abstract
 *
 * @param {Terria} terria The Terria instance.
 */

var UserInterfaceControl = function UserInterfaceControl(terria) {
  if (!defined$1(terria)) {
    throw new DeveloperError$1('terria is required');
  }

  this._terria = terria;
  /**
   * Gets or sets the name of the control which is set as the controls title.
   * This property is observable.
   * @type {String}
   */

  this.name = 'Unnamed Control';
  /**
   * Gets or sets the text to be displayed in the UI control.
   * This property is observable.
   * @type {String}
   */

  this.text = undefined;
  /**
   * Gets or sets the svg icon of the control.  This property is observable.
   * @type {Object}
   */

  this.svgIcon = undefined;
  /**
   * Gets or sets the height of the svg icon.  This property is observable.
   * @type {Integer}
   */

  this.svgHeight = undefined;
  /**
   * Gets or sets the width of the svg icon.  This property is observable.
   * @type {Integer}
   */

  this.svgWidth = undefined;
  /**
   * Gets or sets the CSS class of the control. This property is observable.
   * @type {String}
   */

  this.cssClass = undefined;
  /**
   * Gets or sets the property describing whether or not the control is in the active state.
   * This property is observable.
   * @type {Boolean}
   */

  this.isActive = false;
  Knockout$3.track(this, ['name', 'svgIcon', 'svgHeight', 'svgWidth', 'cssClass', 'isActive']);
};

Object.defineProperties(UserInterfaceControl.prototype, {
  /**
   * Gets the Terria instance.
   * @memberOf UserInterfaceControl.prototype
   * @type {Terria}
   */
  terria: {
    get: function get() {
      return this._terria;
    }
  },

  /**
   * Gets a value indicating whether this button has text associated with it.
   * @type {Object}
   */
  hasText: {
    get: function get() {
      return defined$1(this.text) && typeof this.text === 'string';
    }
  }
});
/**
 * When implemented in a derived class, performs an action when the user clicks
 * on this control.
 * @abstract
 * @protected
 */

UserInterfaceControl.prototype.activate = function () {
  throw new DeveloperError$1('activate must be implemented in the derived class.');
};

/**
 * The view-model for a control in the navigation control tool bar
 *
 * @alias NavigationControl
 * @constructor
 * @abstract
 *
 * @param {Terria} terria The Terria instance.
 */

var NavigationControl = function NavigationControl(terria) {
  UserInterfaceControl.apply(this, arguments);
};

NavigationControl.prototype = Object.create(UserInterfaceControl.prototype);

var cesium$5 = require('cesium/Cesium.js');

var defined$2 = cesium$5.defined,
    Camera = cesium$5.Camera,
    Rectangle = cesium$5.Rectangle,
    Cartographic = cesium$5.Cartographic,
    Math$1 = cesium$5.Math;
/**
 * The model for a zoom in control in the navigation control tool bar
 *
 * @alias ResetViewNavigationControl
 * @constructor
 * @abstract
 *
 * @param {Terria} terria The Terria instance.
 */

var ResetViewNavigationControl = function ResetViewNavigationControl(terria) {
  NavigationControl.apply(this, arguments);
  /**
   * Gets or sets the name of the control which is set as the control's title.
   * This property is observable.
   * @type {String}
   */

  this.name = '重置视图';
  this.navigationLocked = false;
  /**
   * Gets or sets the svg icon of the control.  This property is observable.
   * @type {Object}
   */

  this.svgIcon = svgReset;
  /**
   * Gets or sets the height of the svg icon.  This property is observable.
   * @type {Integer}
   */

  this.svgHeight = 15;
  /**
   * Gets or sets the width of the svg icon.  This property is observable.
   * @type {Integer}
   */

  this.svgWidth = 15;
  /**
   * Gets or sets the CSS class of the control. This property is observable.
   * @type {String}
   */

  this.cssClass = 'navigation-control-icon-reset';
};

ResetViewNavigationControl.prototype = Object.create(NavigationControl.prototype);

ResetViewNavigationControl.prototype.setNavigationLocked = function (locked) {
  this.navigationLocked = locked;
};

ResetViewNavigationControl.prototype.resetView = function () {
  // this.terria.analytics.logEvent('navigation', 'click', 'reset');
  if (this.navigationLocked) {
    return;
  }

  var scene = this.terria.scene;
  var sscc = scene.screenSpaceCameraController;

  if (!sscc.enableInputs) {
    return;
  }

  this.isActive = true;
  var camera = scene.camera;

  if (defined$2(this.terria.trackedEntity)) {
    // when tracking do not reset to default view but to default view of tracked entity
    var trackedEntity = this.terria.trackedEntity;
    this.terria.trackedEntity = undefined;
    this.terria.trackedEntity = trackedEntity;
  } else {
    // reset to a default position or view defined in the options
    if (this.terria.options.view) {
      this.setCameraView(this.terria.options.view, this.terria);
    } else if (typeof camera.flyHome === 'function') {
      camera.flyHome(1);
    } else {
      camera.flyTo({
        'destination': Camera.DEFAULT_VIEW_RECTANGLE,
        'duration': 1
      });
    }
  }

  this.isActive = false;
};
/**
 * When implemented in a derived class, performs an action when the user clicks
 * on this control
 * @abstract
 * @protected
 */


ResetViewNavigationControl.prototype.activate = function () {
  this.resetView();
};

ResetViewNavigationControl.prototype.setCameraView = function (obj, mapViewer) {
  var viewer = mapViewer || window.viewer;
  if (!obj) return;
  var position = obj.destination || Cesium.Cartesian3.fromDegrees(obj.x, obj.y, obj.z); // 兼容cartesian3和xyz

  viewer.camera.flyTo({
    destination: position,
    orientation: {
      heading: Cesium.Math.toRadians(obj.heading || 0),
      pitch: Cesium.Math.toRadians(obj.pitch || 0),
      roll: Cesium.Math.toRadians(obj.roll || 0)
    },
    duration: obj.duration === undefined ? 3 : obj.duration,
    complete: obj.complete
  });
};

/* eslint-disable no-unused-vars */
var cesium$6 = require('cesium/Cesium.js');

var defined$3 = cesium$6.defined,
    Ray = cesium$6.Ray,
    Cartesian3 = cesium$6.Cartesian3,
    Cartographic$1 = cesium$6.Cartographic,
    ReferenceFrame = cesium$6.ReferenceFrame,
    SceneMode = cesium$6.SceneMode;
var Utils = {};
var unprojectedScratch = new Cartographic$1();
var rayScratch = new Ray();
/**
 * gets the focus point of the camera
 * @param {Viewer|Widget} terria The terria
 * @param {boolean} inWorldCoordinates true to get the focus in world coordinates, otherwise get it in projection-specific map coordinates, in meters.
 * @param {Cartesian3} [result] The object in which the result will be stored.
 * @return {Cartesian3} The modified result parameter, a new instance if none was provided or undefined if there is no focus point.
 */

Utils.getCameraFocus = function (terria, inWorldCoordinates, result) {
  var scene = terria.scene;
  var camera = scene.camera;

  if (scene.mode === SceneMode.MORPHING) {
    return undefined;
  }

  if (!defined$3(result)) {
    result = new Cartesian3();
  } // TODO bug when tracking: if entity moves the current position should be used and not only the one when starting orbiting/rotating
  // TODO bug when tracking: reset should reset to default view of tracked entity


  if (defined$3(terria.trackedEntity)) {
    result = terria.trackedEntity.position.getValue(terria.clock.currentTime, result);
  } else {
    rayScratch.origin = camera.positionWC;
    rayScratch.direction = camera.directionWC;
    result = scene.globe.pick(rayScratch, scene, result);
  }

  if (!defined$3(result)) {
    return undefined;
  }

  if (scene.mode === SceneMode.SCENE2D || scene.mode === SceneMode.COLUMBUS_VIEW) {
    result = camera.worldToCameraCoordinatesPoint(result, result);

    if (inWorldCoordinates) {
      result = scene.globe.ellipsoid.cartographicToCartesian(scene.mapProjection.unproject(result, unprojectedScratch), result);
    }
  } else {
    if (!inWorldCoordinates) {
      result = camera.worldToCameraCoordinatesPoint(result, result);
    }
  }

  return result;
};

var cesium$7 = require('cesium/Cesium.js');

var defined$4 = cesium$7.defined,
    Ray$1 = cesium$7.Ray,
    IntersectionTests = cesium$7.IntersectionTests,
    Cartesian3$1 = cesium$7.Cartesian3,
    SceneMode$1 = cesium$7.SceneMode;
/**
 * The model for a zoom in control in the navigation control tool bar
 *
 * @alias ZoomOutNavigationControl
 * @constructor
 * @abstract
 *
 * @param {Terria} terria The Terria instance.
 * @param {boolean} zoomIn is used for zooming in (true) or out (false)
 */

var ZoomNavigationControl = function ZoomNavigationControl(terria, zoomIn) {
  NavigationControl.apply(this, arguments);
  /**
   * Gets or sets the name of the control which is set as the control's title.
   * This property is observable.
   * @type {String}
   */

  this.name = '视图 ' + (zoomIn ? '放大' : '缩小');
  /**
   * Gets or sets the text to be displayed in the nav control. Controls that
   * have text do not display the svgIcon.
   * This property is observable.
   * @type {String}
   */

  this.text = zoomIn ? '+' : '-';
  /**
   * Gets or sets the CSS class of the control. This property is observable.
   * @type {String}
   */

  this.cssClass = 'navigation-control-icon-zoom-' + (zoomIn ? 'in' : 'out');
  this.relativeAmount = 2;

  if (zoomIn) {
    // this ensures that zooming in is the inverse of zooming out and vice versa
    // e.g. the camera position remains when zooming in and out
    this.relativeAmount = 1 / this.relativeAmount;
  }
};

ZoomNavigationControl.prototype.relativeAmount = 1;
ZoomNavigationControl.prototype = Object.create(NavigationControl.prototype);
/**
 * When implemented in a derived class, performs an action when the user clicks
 * on this control
 * @abstract
 * @protected
 */

ZoomNavigationControl.prototype.activate = function () {
  this.zoom(this.relativeAmount);
};

var cartesian3Scratch = new Cartesian3$1();

ZoomNavigationControl.prototype.zoom = function (relativeAmount) {
  // this.terria.analytics.logEvent('navigation', 'click', 'zoomIn');
  this.isActive = true;

  if (defined$4(this.terria)) {
    var scene = this.terria.scene;
    var sscc = scene.screenSpaceCameraController; // do not zoom if it is disabled

    if (!sscc.enableInputs || !sscc.enableZoom) {
      return;
    } // TODO
    //            if(scene.mode == SceneMode.COLUMBUS_VIEW && !sscc.enableTranslate) {
    //                return;
    //            }


    var camera = scene.camera;
    var orientation;

    switch (scene.mode) {
      case SceneMode$1.MORPHING:
        break;

      case SceneMode$1.SCENE2D:
        camera.zoomIn(camera.positionCartographic.height * (1 - this.relativeAmount));
        break;

      default:
        var focus;

        if (defined$4(this.terria.trackedEntity)) {
          focus = new Cartesian3$1();
        } else {
          focus = Utils.getCameraFocus(this.terria, false);
        }

        if (!defined$4(focus)) {
          // Camera direction is not pointing at the globe, so use the ellipsoid horizon point as
          // the focal point.
          var ray = new Ray$1(camera.worldToCameraCoordinatesPoint(scene.globe.ellipsoid.cartographicToCartesian(camera.positionCartographic)), camera.directionWC);
          focus = IntersectionTests.grazingAltitudeLocation(ray, scene.globe.ellipsoid);
          orientation = {
            heading: camera.heading,
            pitch: camera.pitch,
            roll: camera.roll
          };
        } else {
          orientation = {
            direction: camera.direction,
            up: camera.up
          };
        }

        var direction = Cartesian3$1.subtract(camera.position, focus, cartesian3Scratch);
        var movementVector = Cartesian3$1.multiplyByScalar(direction, relativeAmount, direction);
        var endPosition = Cartesian3$1.add(focus, movementVector, focus);

        if (defined$4(this.terria.trackedEntity) || scene.mode === SceneMode$1.COLUMBUS_VIEW) {
          // sometimes flyTo does not work (jumps to wrong position) so just set the position without any animation
          // do not use flyTo when tracking an entity because during animatiuon the position of the entity may change
          camera.position = endPosition;
        } else {
          camera.flyTo({
            destination: endPosition,
            orientation: orientation,
            duration: 0.5,
            convert: false
          });
        }

    }
  } // this.terria.notifyRepaintRequired();


  this.isActive = false;
};

var svgCompassOuterRing = 'm 66.5625,0 0,15.15625 3.71875,0 0,-10.40625 5.5,10.40625 4.375,0 0,-15.15625 -3.71875,0 0,10.40625 L 70.9375,0 66.5625,0 z M 72.5,20.21875 c -28.867432,0 -52.28125,23.407738 -52.28125,52.28125 0,28.87351 23.413818,52.3125 52.28125,52.3125 28.86743,0 52.28125,-23.43899 52.28125,-52.3125 0,-28.873512 -23.41382,-52.28125 -52.28125,-52.28125 z m 0,1.75 c 13.842515,0 26.368948,5.558092 35.5,14.5625 l -11.03125,11 0.625,0.625 11.03125,-11 c 8.9199,9.108762 14.4375,21.579143 14.4375,35.34375 0,13.764606 -5.5176,26.22729 -14.4375,35.34375 l -11.03125,-11 -0.625,0.625 11.03125,11 c -9.130866,9.01087 -21.658601,14.59375 -35.5,14.59375 -13.801622,0 -26.321058,-5.53481 -35.4375,-14.5 l 11.125,-11.09375 c 6.277989,6.12179 14.857796,9.90625 24.3125,9.90625 19.241896,0 34.875,-15.629154 34.875,-34.875 0,-19.245847 -15.633104,-34.84375 -34.875,-34.84375 -9.454704,0 -18.034511,3.760884 -24.3125,9.875 L 37.0625,36.4375 C 46.179178,27.478444 58.696991,21.96875 72.5,21.96875 z m -0.875,0.84375 0,13.9375 1.75,0 0,-13.9375 -1.75,0 z M 36.46875,37.0625 47.5625,48.15625 C 41.429794,54.436565 37.65625,63.027539 37.65625,72.5 c 0,9.472461 3.773544,18.055746 9.90625,24.34375 L 36.46875,107.9375 c -8.96721,-9.1247 -14.5,-21.624886 -14.5,-35.4375 0,-13.812615 5.53279,-26.320526 14.5,-35.4375 z M 72.5,39.40625 c 18.297686,0 33.125,14.791695 33.125,33.09375 0,18.302054 -14.827314,33.125 -33.125,33.125 -18.297687,0 -33.09375,-14.822946 -33.09375,-33.125 0,-18.302056 14.796063,-33.09375 33.09375,-33.09375 z M 22.84375,71.625 l 0,1.75 13.96875,0 0,-1.75 -13.96875,0 z m 85.5625,0 0,1.75 14,0 0,-1.75 -14,0 z M 71.75,108.25 l 0,13.9375 1.71875,0 0,-13.9375 -1.71875,0 z';

var svgCompassGyro = 'm 72.71875,54.375 c -0.476702,0 -0.908208,0.245402 -1.21875,0.5625 -0.310542,0.317098 -0.551189,0.701933 -0.78125,1.1875 -0.172018,0.363062 -0.319101,0.791709 -0.46875,1.25 -6.91615,1.075544 -12.313231,6.656514 -13,13.625 -0.327516,0.117495 -0.661877,0.244642 -0.9375,0.375 -0.485434,0.22959 -0.901634,0.471239 -1.21875,0.78125 -0.317116,0.310011 -0.5625,0.742111 -0.5625,1.21875 l 0.03125,0 c 0,0.476639 0.245384,0.877489 0.5625,1.1875 0.317116,0.310011 0.702066,0.58291 1.1875,0.8125 0.35554,0.168155 0.771616,0.32165 1.21875,0.46875 1.370803,6.10004 6.420817,10.834127 12.71875,11.8125 0.146999,0.447079 0.30025,0.863113 0.46875,1.21875 0.230061,0.485567 0.470708,0.870402 0.78125,1.1875 0.310542,0.317098 0.742048,0.5625 1.21875,0.5625 0.476702,0 0.876958,-0.245402 1.1875,-0.5625 0.310542,-0.317098 0.582439,-0.701933 0.8125,-1.1875 0.172018,-0.363062 0.319101,-0.791709 0.46875,-1.25 6.249045,-1.017063 11.256351,-5.7184 12.625,-11.78125 0.447134,-0.1471 0.86321,-0.300595 1.21875,-0.46875 0.485434,-0.22959 0.901633,-0.502489 1.21875,-0.8125 0.317117,-0.310011 0.5625,-0.710861 0.5625,-1.1875 l -0.03125,0 c 0,-0.476639 -0.245383,-0.908739 -0.5625,-1.21875 C 89.901633,71.846239 89.516684,71.60459 89.03125,71.375 88.755626,71.244642 88.456123,71.117495 88.125,71 87.439949,64.078341 82.072807,58.503735 75.21875,57.375 c -0.15044,-0.461669 -0.326927,-0.884711 -0.5,-1.25 -0.230061,-0.485567 -0.501958,-0.870402 -0.8125,-1.1875 -0.310542,-0.317098 -0.710798,-0.5625 -1.1875,-0.5625 z m -0.0625,1.40625 c 0.03595,-0.01283 0.05968,0 0.0625,0 0.0056,0 0.04321,-0.02233 0.1875,0.125 0.144288,0.147334 0.34336,0.447188 0.53125,0.84375 0.06385,0.134761 0.123901,0.309578 0.1875,0.46875 -0.320353,-0.01957 -0.643524,-0.0625 -0.96875,-0.0625 -0.289073,0 -0.558569,0.04702 -0.84375,0.0625 C 71.8761,57.059578 71.936151,56.884761 72,56.75 c 0.18789,-0.396562 0.355712,-0.696416 0.5,-0.84375 0.07214,-0.07367 0.120304,-0.112167 0.15625,-0.125 z m 0,2.40625 c 0.448007,0 0.906196,0.05436 1.34375,0.09375 0.177011,0.592256 0.347655,1.271044 0.5,2.03125 0.475097,2.370753 0.807525,5.463852 0.9375,8.9375 -0.906869,-0.02852 -1.834463,-0.0625 -2.78125,-0.0625 -0.92298,0 -1.802327,0.03537 -2.6875,0.0625 0.138529,-3.473648 0.493653,-6.566747 0.96875,-8.9375 0.154684,-0.771878 0.320019,-1.463985 0.5,-2.0625 0.405568,-0.03377 0.804291,-0.0625 1.21875,-0.0625 z m -2.71875,0.28125 c -0.129732,0.498888 -0.259782,0.987558 -0.375,1.5625 -0.498513,2.487595 -0.838088,5.693299 -0.96875,9.25 -3.21363,0.15162 -6.119596,0.480068 -8.40625,0.9375 -0.682394,0.136509 -1.275579,0.279657 -1.84375,0.4375 0.799068,-6.135482 5.504716,-11.036454 11.59375,-12.1875 z M 75.5,58.5 c 6.043169,1.18408 10.705093,6.052712 11.5,12.15625 -0.569435,-0.155806 -1.200273,-0.302525 -1.875,-0.4375 -2.262525,-0.452605 -5.108535,-0.783809 -8.28125,-0.9375 -0.130662,-3.556701 -0.470237,-6.762405 -0.96875,-9.25 C 75.761959,59.467174 75.626981,58.990925 75.5,58.5 z m -2.84375,12.09375 c 0.959338,0 1.895843,0.03282 2.8125,0.0625 C 75.48165,71.267751 75.5,71.871028 75.5,72.5 c 0,1.228616 -0.01449,2.438313 -0.0625,3.59375 -0.897358,0.0284 -1.811972,0.0625 -2.75,0.0625 -0.927373,0 -1.831062,-0.03473 -2.71875,-0.0625 -0.05109,-1.155437 -0.0625,-2.365134 -0.0625,-3.59375 0,-0.628972 0.01741,-1.232249 0.03125,-1.84375 0.895269,-0.02827 1.783025,-0.0625 2.71875,-0.0625 z M 68.5625,70.6875 c -0.01243,0.60601 -0.03125,1.189946 -0.03125,1.8125 0,1.22431 0.01541,2.407837 0.0625,3.5625 -3.125243,-0.150329 -5.92077,-0.471558 -8.09375,-0.90625 -0.784983,-0.157031 -1.511491,-0.316471 -2.125,-0.5 -0.107878,-0.704096 -0.1875,-1.422089 -0.1875,-2.15625 0,-0.115714 0.02849,-0.228688 0.03125,-0.34375 0.643106,-0.20284 1.389577,-0.390377 2.25,-0.5625 2.166953,-0.433487 4.97905,-0.75541 8.09375,-0.90625 z m 8.3125,0.03125 c 3.075121,0.15271 5.824455,0.446046 7.96875,0.875 0.857478,0.171534 1.630962,0.360416 2.28125,0.5625 0.0027,0.114659 0,0.228443 0,0.34375 0,0.735827 -0.07914,1.450633 -0.1875,2.15625 -0.598568,0.180148 -1.29077,0.34562 -2.0625,0.5 -2.158064,0.431708 -4.932088,0.754666 -8.03125,0.90625 0.04709,-1.154663 0.0625,-2.33819 0.0625,-3.5625 0,-0.611824 -0.01924,-1.185379 -0.03125,-1.78125 z M 57.15625,72.5625 c 0.0023,0.572772 0.06082,1.131112 0.125,1.6875 -0.125327,-0.05123 -0.266577,-0.10497 -0.375,-0.15625 -0.396499,-0.187528 -0.665288,-0.387337 -0.8125,-0.53125 -0.147212,-0.143913 -0.15625,-0.182756 -0.15625,-0.1875 0,-0.0047 -0.02221,-0.07484 0.125,-0.21875 0.147212,-0.143913 0.447251,-0.312472 0.84375,-0.5 0.07123,-0.03369 0.171867,-0.06006 0.25,-0.09375 z m 31.03125,0 c 0.08201,0.03503 0.175941,0.05872 0.25,0.09375 0.396499,0.187528 0.665288,0.356087 0.8125,0.5 0.14725,0.14391 0.15625,0.21405 0.15625,0.21875 0,0.0047 -0.009,0.04359 -0.15625,0.1875 -0.147212,0.143913 -0.416001,0.343722 -0.8125,0.53125 -0.09755,0.04613 -0.233314,0.07889 -0.34375,0.125 0.06214,-0.546289 0.09144,-1.094215 0.09375,-1.65625 z m -29.5,3.625 c 0.479308,0.123125 0.983064,0.234089 1.53125,0.34375 2.301781,0.460458 5.229421,0.787224 8.46875,0.9375 0.167006,2.84339 0.46081,5.433176 0.875,7.5 0.115218,0.574942 0.245268,1.063612 0.375,1.5625 -5.463677,-1.028179 -9.833074,-5.091831 -11.25,-10.34375 z m 27.96875,0 C 85.247546,81.408945 80.919274,85.442932 75.5,86.5 c 0.126981,-0.490925 0.261959,-0.967174 0.375,-1.53125 0.41419,-2.066824 0.707994,-4.65661 0.875,-7.5 3.204493,-0.15162 6.088346,-0.480068 8.375,-0.9375 0.548186,-0.109661 1.051942,-0.220625 1.53125,-0.34375 z M 70.0625,77.53125 c 0.865391,0.02589 1.723666,0.03125 2.625,0.03125 0.912062,0 1.782843,-0.0048 2.65625,-0.03125 -0.165173,2.736408 -0.453252,5.207651 -0.84375,7.15625 -0.152345,0.760206 -0.322989,1.438994 -0.5,2.03125 -0.437447,0.03919 -0.895856,0.0625 -1.34375,0.0625 -0.414943,0 -0.812719,-0.02881 -1.21875,-0.0625 -0.177011,-0.592256 -0.347655,-1.271044 -0.5,-2.03125 -0.390498,-1.948599 -0.700644,-4.419842 -0.875,-7.15625 z m 1.75,10.28125 c 0.284911,0.01545 0.554954,0.03125 0.84375,0.03125 0.325029,0 0.648588,-0.01171 0.96875,-0.03125 -0.05999,0.148763 -0.127309,0.31046 -0.1875,0.4375 -0.18789,0.396562 -0.386962,0.696416 -0.53125,0.84375 -0.144288,0.147334 -0.181857,0.125 -0.1875,0.125 -0.0056,0 -0.07446,0.02233 -0.21875,-0.125 C 72.355712,88.946416 72.18789,88.646562 72,88.25 71.939809,88.12296 71.872486,87.961263 71.8125,87.8125 z';

var svgCompassRotationMarker = 'M 72.46875,22.03125 C 59.505873,22.050338 46.521615,27.004287 36.6875,36.875 L 47.84375,47.96875 C 61.521556,34.240041 83.442603,34.227389 97.125,47.90625 l 11.125,-11.125 C 98.401629,26.935424 85.431627,22.012162 72.46875,22.03125 z';

var cesium$8 = require('cesium/Cesium.js');

var defined$5 = cesium$8.defined,
    Math$2 = cesium$8.Math,
    getTimestamp$1 = cesium$8.getTimestamp,
    EventHelper$1 = cesium$8.EventHelper,
    Transforms = cesium$8.Transforms,
    SceneMode$2 = cesium$8.SceneMode,
    Cartesian2$1 = cesium$8.Cartesian2,
    Cartesian3$2 = cesium$8.Cartesian3,
    Matrix4 = cesium$8.Matrix4,
    BoundingSphere = cesium$8.BoundingSphere,
    HeadingPitchRange = cesium$8.HeadingPitchRange,
    knockout$5 = cesium$8.knockout;

var Knockout$4 = knockout$5;

var NavigationViewModel = function NavigationViewModel(options) {
  this.terria = options.terria;
  this.eventHelper = new EventHelper$1();
  this.enableZoomControls = defined$5(options.enableZoomControls) ? options.enableZoomControls : true;
  this.enableCompass = defined$5(options.enableCompass) ? options.enableCompass : true;
  this.navigationLocked = false; // if (this.showZoomControls)
  //   {

  this.controls = options.controls;

  if (!defined$5(this.controls)) {
    this.controls = [new ZoomNavigationControl(this.terria, true), new ResetViewNavigationControl(this.terria), new ZoomNavigationControl(this.terria, false)];
  } // }


  this.svgCompassOuterRing = svgCompassOuterRing;
  this.svgCompassGyro = svgCompassGyro;
  this.svgCompassRotationMarker = svgCompassRotationMarker;
  this.showCompass = defined$5(this.terria) && this.enableCompass;
  this.heading = this.showCompass ? this.terria.scene.camera.heading : 0.0;
  this.isOrbiting = false;
  this.orbitCursorAngle = 0;
  this.orbitCursorOpacity = 0.0;
  this.orbitLastTimestamp = 0;
  this.orbitFrame = undefined;
  this.orbitIsLook = false;
  this.orbitMouseMoveFunction = undefined;
  this.orbitMouseUpFunction = undefined;
  this.isRotating = false;
  this.rotateInitialCursorAngle = undefined;
  this.rotateFrame = undefined;
  this.rotateIsLook = false;
  this.rotateMouseMoveFunction = undefined;
  this.rotateMouseUpFunction = undefined;
  this._unsubcribeFromPostRender = undefined;
  Knockout$4.track(this, ['controls', 'showCompass', 'heading', 'isOrbiting', 'orbitCursorAngle', 'isRotating']);
  var that = this;

  NavigationViewModel.prototype.setNavigationLocked = function (locked) {
    this.navigationLocked = locked;

    if (this.controls && this.controls.length > 1) {
      this.controls[1].setNavigationLocked(this.navigationLocked);
    }
  };

  function widgetChange() {
    if (defined$5(that.terria)) {
      if (that._unsubcribeFromPostRender) {
        that._unsubcribeFromPostRender();

        that._unsubcribeFromPostRender = undefined;
      }

      that.showCompass =  that.enableCompass;
      that._unsubcribeFromPostRender = that.terria.scene.postRender.addEventListener(function () {
        that.heading = that.terria.scene.camera.heading;
      });
    } else {
      if (that._unsubcribeFromPostRender) {
        that._unsubcribeFromPostRender();

        that._unsubcribeFromPostRender = undefined;
      }

      that.showCompass = false;
    }
  }

  this.eventHelper.add(this.terria.afterWidgetChanged, widgetChange, this); // this.terria.afterWidgetChanged.addEventListener(widgetChange);

  widgetChange();
};

NavigationViewModel.prototype.destroy = function () {
  this.eventHelper.removeAll(); // loadView(require('fs').readFileSync(baseURLEmpCesium + 'js-lib/terrajs/lib/Views/Navigation.html', 'utf8'), container, this);
};

NavigationViewModel.prototype.show = function (container) {
  var compassDisplay = this.enableCompass == undefined ? true : this.enableCompass;
  compassDisplay = compassDisplay ? "block" : "none";
  var enableZoomControlsDisplay = this.enableZoomControls == undefined ? true : this.enableZoomControls;
  enableZoomControlsDisplay = enableZoomControlsDisplay ? "block" : "none";
  var testing = '<div class="compass" id="easy3d-compass" title="" style="display:' + compassDisplay + '" data-bind="visible: showCompass, event: { mousedown: handleMouseDown, dblclick: handleDoubleClick }">' + '<div class="compass-outer-ring-background"></div>' + ' <div class="compass-rotation-marker" data-bind="visible: isOrbiting, style: { transform: \'rotate(-\' + orbitCursorAngle + \'rad)\', \'-webkit-transform\': \'rotate(-\' + orbitCursorAngle + \'rad)\', opacity: orbitCursorOpacity }, cesiumSvgPath: { path: svgCompassRotationMarker, width: 145, height: 145 }"></div>' + ' <div class="compass-outer-ring" title="" data-bind="style: { transform: \'rotate(-\' + heading + \'rad)\', \'-webkit-transform\': \'rotate(-\' + heading + \'rad)\' }, cesiumSvgPath: { path: svgCompassOuterRing, width: 145, height: 145 }"></div>' + ' <div class="compass-gyro-background"></div>' + ' <div class="compass-gyro" data-bind="cesiumSvgPath: { path: svgCompassGyro, width: 145, height: 145 }, css: { \'compass-gyro-active\': isOrbiting }"></div>' + '</div>' + '<div class="navigation-controls" id="easy3d-navigation-controls" style="display:' + enableZoomControlsDisplay + '">' + '<!-- ko foreach: controls -->' + '<div data-bind="click: activate, attr: { title: $data.name }, css: $root.isLastControl($data) ? \'navigation-control-last\' : \'navigation-control\' ">' + '   <!-- ko if: $data.hasText -->' + '   <div data-bind="text: $data.text, css: $data.isActive ?  \'navigation-control-icon-active \' + $data.cssClass : $data.cssClass"></div>' + '   <!-- /ko -->' + '  <!-- ko ifnot: $data.hasText -->' + '  <div data-bind="cesiumSvgPath: { path: $data.svgIcon, width: $data.svgWidth, height: $data.svgHeight }, css: $data.isActive ?  \'navigation-control-icon-active \' + $data.cssClass : $data.cssClass"></div>' + '  <!-- /ko -->' + ' </div>' + ' <!-- /ko -->' + '</div>';
  loadView(testing, container, this); // loadView(navigatorTemplate, container, this);
  // loadView(require('fs').readFileSync(baseURLEmpCesium + 'js-lib/terrajs/lib/Views/Navigation.html', 'utf8'), container, this);
};

NavigationViewModel.prototype.setStyle = function (style) {
  if (!style || Object.keys(style).length < 1) return;
  var ele = document.getElementById("easy3d-compass");
  var ele2 = document.getElementById("easy3d-navigation-controls");
  if (!ele) return;

  for (var i in style) {
    ele.style[i] = style[i];
    ele2.style[i] = style[i];

    if (i == "top") {
      ele2.style[i] = parseFloat(style[i]) + 100 + "px";
    }

    if (i == "bottom") {
      ele.style[i] = parseFloat(style[i]) + 82 + "px";
    }

    if (i == "left") {
      ele2.style.left = parseFloat(ele.style.left) + 30 + "px";
    }

    if (i == "right") {
      ele2.style.right = parseFloat(ele.style.right) - 30 + "px";
    }
  }
};
/**
 * Adds a control to this toolbar.
 * @param {NavControl} control The control to add.
 */


NavigationViewModel.prototype.add = function (control) {
  this.controls.push(control);
};
/**
 * Removes a control from this toolbar.
 * @param {NavControl} control The control to remove.
 */


NavigationViewModel.prototype.remove = function (control) {
  this.controls.remove(control);
};
/**
 * Checks if the control given is the last control in the control array.
 * @param {NavControl} control The control to remove.
 */


NavigationViewModel.prototype.isLastControl = function (control) {
  return control === this.controls[this.controls.length - 1];
};

var vectorScratch = new Cartesian2$1();

NavigationViewModel.prototype.handleMouseDown = function (viewModel, e) {
  var scene = this.terria.scene;

  if (scene.mode === SceneMode$2.MORPHING) {
    return true;
  }

  if (viewModel.navigationLocked) {
    return true;
  }

  var compassElement = e.currentTarget;
  var compassRectangle = e.currentTarget.getBoundingClientRect();
  var maxDistance = compassRectangle.width / 2.0;
  var center = new Cartesian2$1((compassRectangle.right - compassRectangle.left) / 2.0, (compassRectangle.bottom - compassRectangle.top) / 2.0);
  var clickLocation = new Cartesian2$1(e.clientX - compassRectangle.left, e.clientY - compassRectangle.top);
  var vector = Cartesian2$1.subtract(clickLocation, center, vectorScratch);
  var distanceFromCenter = Cartesian2$1.magnitude(vector);
  var distanceFraction = distanceFromCenter / maxDistance;
  var nominalTotalRadius = 145;
  var norminalGyroRadius = 50;

  if (distanceFraction < norminalGyroRadius / nominalTotalRadius) {
    orbit(this, compassElement, vector); //            return false;
  } else if (distanceFraction < 1.0) {
    rotate(this, compassElement, vector); //            return false;
  } else {
    return true;
  }
};

var oldTransformScratch = new Matrix4();
var newTransformScratch = new Matrix4();
var centerScratch = new Cartesian3$2();

NavigationViewModel.prototype.handleDoubleClick = function (viewModel, e) {
  var scene = viewModel.terria.scene;
  var camera = scene.camera;
  var sscc = scene.screenSpaceCameraController;

  if (scene.mode === SceneMode$2.MORPHING || !sscc.enableInputs) {
    return true;
  }

  if (viewModel.navigationLocked) {
    return true;
  }

  if (scene.mode === SceneMode$2.COLUMBUS_VIEW && !sscc.enableTranslate) {
    return;
  }

  if (scene.mode === SceneMode$2.SCENE3D || scene.mode === SceneMode$2.COLUMBUS_VIEW) {
    if (!sscc.enableLook) {
      return;
    }

    if (scene.mode === SceneMode$2.SCENE3D) {
      if (!sscc.enableRotate) {
        return;
      }
    }
  }

  var center = Utils.getCameraFocus(viewModel.terria, true, centerScratch);

  if (!defined$5(center)) {
    // Globe is barely visible, so reset to home view.
    this.controls[1].resetView();
    return;
  }

  var cameraPosition = scene.globe.ellipsoid.cartographicToCartesian(camera.positionCartographic, new Cartesian3$2());
  var surfaceNormal = scene.globe.ellipsoid.geodeticSurfaceNormal(center);
  var focusBoundingSphere = new BoundingSphere(center, 0);
  camera.flyToBoundingSphere(focusBoundingSphere, {
    offset: new HeadingPitchRange(0, // do not use camera.pitch since the pitch at the center/target is required
    Math$2.PI_OVER_TWO - Cartesian3$2.angleBetween(surfaceNormal, camera.directionWC), // distanceToBoundingSphere returns wrong values when in 2D or Columbus view so do not use
    // camera.distanceToBoundingSphere(focusBoundingSphere)
    // instead calculate distance manually
    Cartesian3$2.distance(cameraPosition, center)),
    duration: 1.5
  });
};

NavigationViewModel.create = function (options) {
  // options.enableZoomControls = this.enableZoomControls;
  // options.enableCompass = this.enableCompass;
  var result = new NavigationViewModel(options);
  result.show(options.container);
  result.setStyle(options.style);
  return result;
};

function orbit(viewModel, compassElement, cursorVector) {
  var scene = viewModel.terria.scene;
  var sscc = scene.screenSpaceCameraController; // do not orbit if it is disabled

  if (scene.mode === SceneMode$2.MORPHING || !sscc.enableInputs) {
    return;
  }

  if (viewModel.navigationLocked) {
    return true;
  }

  switch (scene.mode) {
    case SceneMode$2.COLUMBUS_VIEW:
      if (sscc.enableLook) {
        break;
      }

      if (!sscc.enableTranslate || !sscc.enableTilt) {
        return;
      }

      break;

    case SceneMode$2.SCENE3D:
      if (sscc.enableLook) {
        break;
      }

      if (!sscc.enableTilt || !sscc.enableRotate) {
        return;
      }

      break;

    case SceneMode$2.SCENE2D:
      if (!sscc.enableTranslate) {
        return;
      }

      break;
  } // Remove existing event handlers, if any.


  document.removeEventListener('mousemove', viewModel.orbitMouseMoveFunction, false);
  document.removeEventListener('mouseup', viewModel.orbitMouseUpFunction, false);

  if (defined$5(viewModel.orbitTickFunction)) {
    viewModel.terria.clock.onTick.removeEventListener(viewModel.orbitTickFunction);
  }

  viewModel.orbitMouseMoveFunction = undefined;
  viewModel.orbitMouseUpFunction = undefined;
  viewModel.orbitTickFunction = undefined;
  viewModel.isOrbiting = true;
  viewModel.orbitLastTimestamp = getTimestamp$1();
  var camera = scene.camera;

  if (defined$5(viewModel.terria.trackedEntity)) {
    // when tracking an entity simply use that reference frame
    viewModel.orbitFrame = undefined;
    viewModel.orbitIsLook = false;
  } else {
    var center = Utils.getCameraFocus(viewModel.terria, true, centerScratch);

    if (!defined$5(center)) {
      viewModel.orbitFrame = Transforms.eastNorthUpToFixedFrame(camera.positionWC, scene.globe.ellipsoid, newTransformScratch);
      viewModel.orbitIsLook = true;
    } else {
      viewModel.orbitFrame = Transforms.eastNorthUpToFixedFrame(center, scene.globe.ellipsoid, newTransformScratch);
      viewModel.orbitIsLook = false;
    }
  }

  viewModel.orbitTickFunction = function (e) {
    var timestamp = getTimestamp$1();
    var deltaT = timestamp - viewModel.orbitLastTimestamp;
    var rate = (viewModel.orbitCursorOpacity - 0.5) * 2.5 / 1000;
    var distance = deltaT * rate;
    var angle = viewModel.orbitCursorAngle + Math$2.PI_OVER_TWO;
    var x = Math$2.cos(angle) * distance;
    var y = Math$2.sin(angle) * distance;
    var oldTransform;

    if (viewModel.navigationLocked) {
      return true;
    }

    if (defined$5(viewModel.orbitFrame)) {
      oldTransform = Matrix4.clone(camera.transform, oldTransformScratch);
      camera.lookAtTransform(viewModel.orbitFrame);
    } // do not look up/down or rotate in 2D mode


    if (scene.mode === SceneMode$2.SCENE2D) {
      camera.move(new Cartesian3$2(x, y, 0), Math$2.max(scene.canvas.clientWidth, scene.canvas.clientHeight) / 100 * camera.positionCartographic.height * distance);
    } else {
      if (viewModel.orbitIsLook) {
        camera.look(Cartesian3$2.UNIT_Z, -x);
        camera.look(camera.right, -y);
      } else {
        camera.rotateLeft(x);
        camera.rotateUp(y);
      }
    }

    if (defined$5(viewModel.orbitFrame)) {
      camera.lookAtTransform(oldTransform);
    } // viewModel.terria.cesium.notifyRepaintRequired();


    viewModel.orbitLastTimestamp = timestamp;
  };

  function updateAngleAndOpacity(vector, compassWidth) {
    var angle = Math$2.atan2(-vector.y, vector.x);
    viewModel.orbitCursorAngle = Math$2.zeroToTwoPi(angle - Math$2.PI_OVER_TWO);
    var distance = Cartesian2$1.magnitude(vector);
    var maxDistance = compassWidth / 2.0;
    var distanceFraction = Math$2.min(distance / maxDistance, 1.0);
    var easedOpacity = 0.5 * distanceFraction * distanceFraction + 0.5;
    viewModel.orbitCursorOpacity = easedOpacity; // viewModel.terria.cesium.notifyRepaintRequired();
  }

  viewModel.orbitMouseMoveFunction = function (e) {
    var compassRectangle = compassElement.getBoundingClientRect();
    var center = new Cartesian2$1((compassRectangle.right - compassRectangle.left) / 2.0, (compassRectangle.bottom - compassRectangle.top) / 2.0);
    var clickLocation = new Cartesian2$1(e.clientX - compassRectangle.left, e.clientY - compassRectangle.top);
    var vector = Cartesian2$1.subtract(clickLocation, center, vectorScratch);
    updateAngleAndOpacity(vector, compassRectangle.width);
  };

  viewModel.orbitMouseUpFunction = function (e) {
    // TODO: if mouse didn't move, reset view to looking down, north is up?
    viewModel.isOrbiting = false;
    document.removeEventListener('mousemove', viewModel.orbitMouseMoveFunction, false);
    document.removeEventListener('mouseup', viewModel.orbitMouseUpFunction, false);

    if (defined$5(viewModel.orbitTickFunction)) {
      viewModel.terria.clock.onTick.removeEventListener(viewModel.orbitTickFunction);
    }

    viewModel.orbitMouseMoveFunction = undefined;
    viewModel.orbitMouseUpFunction = undefined;
    viewModel.orbitTickFunction = undefined;
  };

  document.addEventListener('mousemove', viewModel.orbitMouseMoveFunction, false);
  document.addEventListener('mouseup', viewModel.orbitMouseUpFunction, false);
  viewModel.terria.clock.onTick.addEventListener(viewModel.orbitTickFunction);
  updateAngleAndOpacity(cursorVector, compassElement.getBoundingClientRect().width);
}

function rotate(viewModel, compassElement, cursorVector) {
  var scene = viewModel.terria.scene;
  var camera = scene.camera;
  var sscc = scene.screenSpaceCameraController; // do not rotate in 2D mode or if rotating is disabled

  if (scene.mode === SceneMode$2.MORPHING || scene.mode === SceneMode$2.SCENE2D || !sscc.enableInputs) {
    return;
  }

  if (viewModel.navigationLocked) {
    return true;
  }

  if (!sscc.enableLook && (scene.mode === SceneMode$2.COLUMBUS_VIEW || scene.mode === SceneMode$2.SCENE3D && !sscc.enableRotate)) {
    return;
  } // Remove existing event handlers, if any.


  document.removeEventListener('mousemove', viewModel.rotateMouseMoveFunction, false);
  document.removeEventListener('mouseup', viewModel.rotateMouseUpFunction, false);
  viewModel.rotateMouseMoveFunction = undefined;
  viewModel.rotateMouseUpFunction = undefined;
  viewModel.isRotating = true;
  viewModel.rotateInitialCursorAngle = Math$2.atan2(-cursorVector.y, cursorVector.x);

  if (defined$5(viewModel.terria.trackedEntity)) {
    // when tracking an entity simply use that reference frame
    viewModel.rotateFrame = undefined;
    viewModel.rotateIsLook = false;
  } else {
    var viewCenter = Utils.getCameraFocus(viewModel.terria, true, centerScratch);

    if (!defined$5(viewCenter) || scene.mode === SceneMode$2.COLUMBUS_VIEW && !sscc.enableLook && !sscc.enableTranslate) {
      viewModel.rotateFrame = Transforms.eastNorthUpToFixedFrame(camera.positionWC, scene.globe.ellipsoid, newTransformScratch);
      viewModel.rotateIsLook = true;
    } else {
      viewModel.rotateFrame = Transforms.eastNorthUpToFixedFrame(viewCenter, scene.globe.ellipsoid, newTransformScratch);
      viewModel.rotateIsLook = false;
    }
  }

  var oldTransform;

  if (defined$5(viewModel.rotateFrame)) {
    oldTransform = Matrix4.clone(camera.transform, oldTransformScratch);
    camera.lookAtTransform(viewModel.rotateFrame);
  }

  viewModel.rotateInitialCameraAngle = -camera.heading;

  if (defined$5(viewModel.rotateFrame)) {
    camera.lookAtTransform(oldTransform);
  }

  viewModel.rotateMouseMoveFunction = function (e) {
    var compassRectangle = compassElement.getBoundingClientRect();
    var center = new Cartesian2$1((compassRectangle.right - compassRectangle.left) / 2.0, (compassRectangle.bottom - compassRectangle.top) / 2.0);
    var clickLocation = new Cartesian2$1(e.clientX - compassRectangle.left, e.clientY - compassRectangle.top);
    var vector = Cartesian2$1.subtract(clickLocation, center, vectorScratch);
    var angle = Math$2.atan2(-vector.y, vector.x);
    var angleDifference = angle - viewModel.rotateInitialCursorAngle;
    var newCameraAngle = Math$2.zeroToTwoPi(viewModel.rotateInitialCameraAngle - angleDifference);
    var camera = viewModel.terria.scene.camera;
    var oldTransform;

    if (defined$5(viewModel.rotateFrame)) {
      oldTransform = Matrix4.clone(camera.transform, oldTransformScratch);
      camera.lookAtTransform(viewModel.rotateFrame);
    }

    var currentCameraAngle = -camera.heading;
    camera.rotateRight(newCameraAngle - currentCameraAngle);

    if (defined$5(viewModel.rotateFrame)) {
      camera.lookAtTransform(oldTransform);
    } // viewModel.terria.cesium.notifyRepaintRequired();

  };

  viewModel.rotateMouseUpFunction = function (e) {
    viewModel.isRotating = false;
    document.removeEventListener('mousemove', viewModel.rotateMouseMoveFunction, false);
    document.removeEventListener('mouseup', viewModel.rotateMouseUpFunction, false);
    viewModel.rotateMouseMoveFunction = undefined;
    viewModel.rotateMouseUpFunction = undefined;
  };

  document.addEventListener('mousemove', viewModel.rotateMouseMoveFunction, false);
  document.addEventListener('mouseup', viewModel.rotateMouseUpFunction, false);
}

/* eslint-disable no-unused-vars */
var cesium$9 = require('cesium/Cesium.js');

var defined$6 = cesium$9.defined,
    Event = cesium$9.Event,
    knockout$6 = cesium$9.knockout,
    DeveloperError$2 = cesium$9.DeveloperError;
var CesiumEvent = Event;
/**
 * @alias CesiumNavigation
 * @constructor
 *
 * @param {Viewer|CesiumWidget} viewerCesiumWidget The Viewer or CesiumWidget instance
 */

var CesiumNavigation = function CesiumNavigation(viewerCesiumWidget) {
  initialize.apply(this, arguments);
  this._onDestroyListeners = [];
};

CesiumNavigation.prototype.distanceLegendViewModel = undefined;
CesiumNavigation.prototype.navigationViewModel = undefined;
CesiumNavigation.prototype.navigationDiv = undefined;
CesiumNavigation.prototype.distanceLegendDiv = undefined;
CesiumNavigation.prototype.terria = undefined;
CesiumNavigation.prototype.container = undefined;
CesiumNavigation.prototype._onDestroyListeners = undefined;
CesiumNavigation.prototype._navigationLocked = false;

CesiumNavigation.prototype.setNavigationLocked = function (locked) {
  this._navigationLocked = locked;
  this.navigationViewModel.setNavigationLocked(this._navigationLocked);
};

CesiumNavigation.prototype.getNavigationLocked = function () {
  return this._navigationLocked;
};

CesiumNavigation.prototype.destroy = function () {
  if (defined$6(this.navigationViewModel)) {
    this.navigationViewModel.destroy();
  }

  if (defined$6(this.distanceLegendViewModel)) {
    this.distanceLegendViewModel.destroy();
  }

  if (defined$6(this.navigationDiv)) {
    this.navigationDiv.parentNode.removeChild(this.navigationDiv);
  }

  delete this.navigationDiv;

  if (defined$6(this.distanceLegendDiv)) {
    this.distanceLegendDiv.parentNode.removeChild(this.distanceLegendDiv);
  }

  delete this.distanceLegendDiv;

  if (defined$6(this.container)) {
    this.container.parentNode.removeChild(this.container);
  }

  delete this.container;

  for (var i = 0; i < this._onDestroyListeners.length; i++) {
    this._onDestroyListeners[i]();
  }
};

CesiumNavigation.prototype.addOnDestroyListener = function (callback) {
  if (typeof callback === 'function') {
    this._onDestroyListeners.push(callback);
  }
};
/**
 * @param {Viewer|CesiumWidget} viewerCesiumWidget The Viewer or CesiumWidget instance
 * @param options
 */


function initialize(viewerCesiumWidget, options) {
  if (!defined$6(viewerCesiumWidget)) {
    throw new DeveloperError$2('CesiumWidget or Viewer is required.');
  }

  var cesiumWidget = defined$6(viewerCesiumWidget.cesiumWidget) ? viewerCesiumWidget.cesiumWidget : viewerCesiumWidget; // 构件导航球容器

  var container = document.createElement('div');
  container.className = 'cesium-widget-cesiumNavigationContainer';
  cesiumWidget.container.appendChild(container);
  this.container = container;
  this.terria = viewerCesiumWidget;
  this.terria.options = defined$6(options) ? options : {}; // 定义viewer的事件 供其它模块调用

  this.terria.afterWidgetChanged = new CesiumEvent();
  this.terria.beforeWidgetChanged = new CesiumEvent(); // 比例尺

  this.distanceLegendDiv = document.createElement('div');
  container.appendChild(this.distanceLegendDiv);
  this.distanceLegendDiv.setAttribute('id', 'distanceLegendDiv');
  var distanceStyleAttr = options.distanceLegend && options.distanceLegend.style || "leftBottom";
  distanceStyleAttr = typeof distanceStyleAttr == "string" ? getDistanceStyleByType(distanceStyleAttr) : distanceStyleAttr;
  this.distanceLegendViewModel = DistanceLegendViewModel.create({
    container: this.distanceLegendDiv,
    style: distanceStyleAttr,
    terria: this.terria,
    enableDistanceLegend: this.terria.options.enableDistanceLegend == undefined ? true : this.terria.options.enableDistanceLegend
  }); // 指北针及缩放按钮

  this.navigationDiv = document.createElement('div');
  this.navigationDiv.setAttribute('id', 'navigationDiv');
  container.appendChild(this.navigationDiv);
  var compassStyleAttr = options.distanceLegend && options.distanceLegend.style || "leftBottom";
  compassStyleAttr = typeof compassStyleAttr == "string" ? getCompassStyleByType(compassStyleAttr) : compassStyleAttr;
  this.navigationViewModel = NavigationViewModel.create({
    container: this.navigationDiv,
    terria: this.terria,
    style: compassStyleAttr,
    enableZoomControls: this.terria.options.enableZoomControls == undefined ? true : this.terria.options.enableZoomControls,
    enableCompass: this.terria.options.enableCompass == undefined ? true : this.terria.options.enableCompass
  });
  registerKnockoutBindings();
}

function getDistanceStyleByType(type) {
  type = type || "leftBottom";
  var defaultStyle = {};

  if (type == "leftBottom") {
    defaultStyle = {
      left: "10px",
      bottom: "4px"
    };
  } else if (type == "leftTop") {
    defaultStyle = {
      left: "20px",
      top: "20px"
    };
  } else if (type == "rightBottom") {
    defaultStyle = {
      right: "20px",
      bottom: "4px"
    };
  } else {
    defaultStyle = {
      right: "20px",
      top: "20px"
    };
  }

  defaultStyle.zIndex = 99999;
  return defaultStyle;
}

function getCompassStyleByType(type) {
  type = type || "rightTop";
  var defaultStyle = {};

  if (type == "leftBottom") {
    defaultStyle = {
      left: "20px",
      bottom: "60px"
    };
  } else if (type == "leftTop") {
    defaultStyle = {
      left: "20px",
      top: "20px"
    };
  } else if (type == "rightBottom") {
    defaultStyle = {
      right: "20px",
      bottom: "60px"
    };
  } else {
    defaultStyle = {
      right: "20px",
      top: "20px"
    };
  }

  defaultStyle.zIndex = 99999;
  return defaultStyle;
}

var easy3dView = {
  viewAround: {
    initView: null,
    removeEventHdl: null,
    startTime: null,
    isStop: false,
    initHeading: null,
    start: function start(initView) {
      viewer.clock.shouldAnimate = true; //自动播放

      this.isStop = false;
      this.initView = initView || cUtil.getCameraView();
      this.initHeading = this.initView.heading;
      this.startTime = viewer.clock.currentTime;
      var that = this;

      if (!this.removeEventHdl) {
        this.removeEventHdl = viewer.clock.onTick.addEventListener(function () {
          if (that.isStop) return;
          var delTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, that.startTime);
          that.initView.heading = that.initHeading + delTime * that.angle;
          that.initView.duration = 0;
          cUtil.setCameraView(that.initView);
        });
      }
    },
    end: function end() {
      if (this.removeEventHdl) {
        this.removeEventHdl();
        this.removeEventHdl = null;
      }

      this.initView = null;
      this.startTime = null;
      this.isStop = false;
      this.initHeading = null;
      this.angle = 5;
    },
    stop: function stop() {
      this.isStop = true;
    },
    goon: function goon() {
      this.initView = cUtil.getCameraView();
      this.startTime = viewer.clock.startTime;
      this.initHeading = this.initView.heading;
      this.isStop = false;
    },
    angle: 5,
    setSpeed: function setSpeed(angle) {
      this.angle = angle;
    }
  },
  viewPoint: {
    removeEventLis: null,
    initHeading: 0,
    isStop: false,
    position: null,
    startTime: null,
    start: function start(position) {
      viewer.clock.shouldAnimate = true; //自动播放

      if (!position) {
        var lnglat = cUtil.getViewCenter();
        position = Cesium.Cartesian3.fromDegrees(lnglat[0], lnglat[1]);
      }

      this.position = position;
      this.startTime = viewer.clock.currentTime;
      this.isStop = false;
      var that = this;

      if (!this.removeEventLis) {
        this.removeEventLis = viewer.clock.onTick.addEventListener(function () {
          if (that.isStop) return;
          var delTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, that.startTime);
          var heading = that.initHeading + delTime * that.angle;
          var hpr = that.setHpr({
            heading: heading
          });
          viewer.camera.lookAt(position, hpr);
        });
      }
    },
    stop: function stop() {
      this.isStop = true;
    },
    goon: function goon() {
      this.startTime = viewer.clock.startTime;
      this.isStop = false;
    },
    end: function end() {
      if (this.removeEventLis) {
        this.removeEventLis();
        this.removeEventLis = null;
      }

      this.initHeading = 0;
      this.isStop = false;
      this.position = null;
      this.startTime = null;
      this.angle = 5;
    },
    angle: 5,
    setSpeed: function setSpeed(angle) {
      this.angle = angle;
    },
    setHpr: function setHpr(opt) {
      var heading = Cesium.Math.toRadians(opt.heading || 0);
      var pitch = Cesium.Math.toRadians(opt.pitch || -60);
      var range = opt.range || 5000;
      return new Cesium.HeadingPitchRange(heading, pitch, range);
    },
    setPosotion: function setPosotion(position) {
      this.position = position;
    }
  },
  setRotate: function setRotate(obj, callback) {
    //传入所需定位的经纬度 及旋转的速度 旋转的圈数
    if (!obj.x || !obj.y) {
      console.log("设定地球旋转时，并未传入经纬度！");
      return;
    }

    var v = obj.v || 1;
    var i = 0;
    var q = obj.q || 2;
    var x = obj.x;
    var y = obj.y;
    var z = obj.z;
    var interVal = window.setInterval(function () {
      x = x + v;

      if (x >= 179) {
        x = -180;
        i++;
      }

      viewer.scene.camera.setView({
        destination: new Cesium.Cartesian3.fromDegrees(x, y, z || 20000000)
      });

      if (i == q) {
        //此处有瑕疵  未修改
        clearInterval(interVal);
        callback();
      }
    }, 16);
  }
};

//定义下雪场景 着色器
var fog = {
  fogProcs: null,
  isActivate: false,
  fogVal: 0.50,
  activate: function activate() {
    if (this.isActivate) return;
    this.isActivate = true;
    var fs_fog = this.initfog(); //整个场景通过后期渲染变亮 1为保持不变 大于1变亮 0-1变暗 uniforms后面为对应glsl里面定义的uniform参数
    // this.fogProcs.uniforms.brightness=2;

    this.fogProcs = new Cesium.PostProcessStage({
      name: 'czm_fog',
      fragmentShader: fs_fog
    });
    viewer.scene.postProcessStages.add(this.fogProcs);
  },
  disable: function disable() {
    if (!this.isActivate) return;
    this.isActivate = false;

    if (this.fogProcs) {
      viewer.scene.postProcessStages.remove(this.fogProcs);
      this.fogProcs.destroy();
      this.fogProcs = null;
    }
  },
  initfog: function initfog() {
    return "  uniform sampler2D colorTexture;\n" + "  uniform sampler2D depthTexture;\n" + "  varying vec2 v_textureCoordinates;\n" + "  void main(void)\n" + "  {\n" + "      vec4 origcolor=texture2D(colorTexture, v_textureCoordinates);\n" + "      vec4 fogcolor=vec4(0.8,0.8,0.8,0.2);\n" + "\n" + "      vec4 depthcolor = texture2D(depthTexture, v_textureCoordinates);\n" + "\n" + "      float f=(depthcolor.r-0.22)/" + this.fogVal + ";\n" + "      if(f<0.0) f=0.0;\n" + "      else if(f>1.0) f=1.0;\n" + "      gl_FragColor = mix(origcolor,fogcolor,f);\n" + "   }";
  }
};

//定义下雪场景 着色器
var rain = {
  rainProcs: null,
  isActivate: false,
  activate: function activate() {
    if (this.isActivate) return;
    this.isActivate = true;
    var fs_rain = this.initRain();
    this.rainProcs = new Cesium.PostProcessStage({
      name: 'czm_rain',
      fragmentShader: fs_rain
    });
    viewer.scene.postProcessStages.add(this.rainProcs);
  },
  disable: function disable() {
    if (!this.isActivate) return;
    this.isActivate = false;

    if (this.rainProcs) {
      viewer.scene.postProcessStages.remove(this.rainProcs);
      this.rainProcs = null;
    }
  },
  initRain: function initRain() {
    return "uniform sampler2D colorTexture;\n\
                varying vec2 v_textureCoordinates;\n\
                \n\
                float hash(float x){\n\
                    return fract(sin(x*23.3)*13.13);\n\
                }\n\
                \n\
                void main(void){\n\
                \n\
                    float time = czm_frameNumber / 60.0;\n\
                    vec2 resolution = czm_viewport.zw;\n\
                    \n\
                    vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
                    vec3 c=vec3(.6,.7,.8);\n\
                    \n\
                    float a=-.4;\n\
                    float si=sin(a),co=cos(a);\n\
                    uv*=mat2(co,-si,si,co);\n\
                    uv*=length(uv+vec2(0,4.9))*.3+1.;\n\
                    \n\
                    float v=1.-sin(hash(floor(uv.x*100.))*2.);\n\
                    float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;\n\
                    c*=v*b; \n\
                    \n\
                    gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,1), 0.5);  \n\
                }\n\
        ";
  }
};

//定义下雪场景 着色器
var snow = {
  snowProcs: null,
  isActivate: false,
  activate: function activate() {
    if (this.isActivate) return;
    this.isActivate = true;
    var fs_snow = this.initSnow();
    this.snowProcs = new Cesium.PostProcessStage({
      name: 'czm_snow',
      fragmentShader: fs_snow
    });
    viewer.scene.postProcessStages.add(this.snowProcs);
  },
  disable: function disable() {
    if (!this.isActivate) return;
    this.isActivate = false;

    if (this.snowProcs) {
      viewer.scene.postProcessStages.remove(this.snowProcs);
      this.snowProcs = null;
    }
  },
  initSnow: function initSnow() {
    return "uniform sampler2D colorTexture;\n\
                varying vec2 v_textureCoordinates;\n\
                \n\
                float snow(vec2 uv,float scale)\n\
                {\n\
                float time = czm_frameNumber / 60.0;\n\
                float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;\n\
                uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;\n\
                uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;\n\
                p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);\n\
                k=smoothstep(0.,k,sin(f.x+f.y)*0.01);\n\
                return k*w;\n\
                }\n\
                \n\
                void main(void){\n\
                vec2 resolution = czm_viewport.zw;\n\
                vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
                vec3 finalColor=vec3(0);\n\
                float c = 0.0;\n\
                c+=snow(uv,30.)*.0;\n\
                c+=snow(uv,20.)*.0;\n\
                c+=snow(uv,15.)*.0;\n\
                c+=snow(uv,10.);\n\
                c+=snow(uv,8.);\n\
                c+=snow(uv,6.);\n\
                c+=snow(uv,5.);\n\
                finalColor=(vec3(c)); \n\
                gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.3); \n\
                \n\
                }\n\
            ";
  }
};

function getPostStageFragmentShader(viewShed, isTerrain) {
  var usesDepthTexture = viewShed._usesDepthTexture;
  var polygonOffsetSupported = viewShed._polygonOffsetSupported;
  var isPointLight = viewShed._isPointLight;
  var isSpotLight = viewShed._isSpotLight;
  var hasCascades = viewShed._numberOfCascades > 1;
  var debugCascadeColors = viewShed.debugCascadeColors;
  var softShadows = viewShed.softShadows;
  var fsSource = '';

  if (isPointLight) {
    fsSource += '#define USE_CUBE_MAP_SHADOW\n';
  } else if (usesDepthTexture) {
    fsSource += '#define USE_SHADOW_DEPTH_TEXTURE\n';
  }

  if (softShadows && !isPointLight) {
    fsSource += '#define USE_SOFT_SHADOWS\n';
  }

  var shadowParameters = 'struct sg_shadowParameters\n' + '{\n' + '#ifdef USE_CUBE_MAP_SHADOW\n' + '    vec3 texCoords;\n' + '#else\n' + '    vec2 texCoords;\n' + '#endif\n' + '\n' + '    float depthBias;\n' + '    float depth;\n' + '    float nDotL;\n' + '    vec2 texelStepSize;\n' + '    float normalShadingSmooth;\n' + '    float darkness;\n' + '};\n';
  var shadowVisibility = '#ifdef USE_CUBE_MAP_SHADOW\n' + 'float sg_sampleShadowMap(samplerCube shadowMap, vec3 d)\n' + '{\n' + '    return czm_unpackDepth(textureCube(shadowMap, d));\n' + '}\n' + 'float sg_shadowDepthCompare(samplerCube shadowMap, vec3 uv, float depth)\n' + '{\n' + '    return step(depth, sg_sampleShadowMap(shadowMap, uv));\n' + '}\n' + 'float sg_shadowVisibility(samplerCube shadowMap, sg_shadowParameters shadowParameters)\n' + '{\n' + '    float depthBias = shadowParameters.depthBias;\n' + '    float depth = shadowParameters.depth;\n' + '    float nDotL = shadowParameters.nDotL;\n' + '    float normalShadingSmooth = shadowParameters.normalShadingSmooth;\n' + '    float darkness = shadowParameters.darkness;\n' + '    vec3 uvw = shadowParameters.texCoords;\n' + '\n' + '    depth -= depthBias;\n' + '    float visibility = sg_shadowDepthCompare(shadowMap, uvw, depth);\n' + '    return visibility;\n' + '}\n' + '#else\n' + 'float sg_sampleShadowMap(sampler2D shadowMap, vec2 uv)\n' + '{\n' + '#ifdef USE_SHADOW_DEPTH_TEXTURE\n' + '    return texture2D(shadowMap, uv).r;\n' + '#else\n' + '    return czm_unpackDepth(texture2D(shadowMap, uv));\n' + '#endif\n' + '}\n' + 'float sg_shadowDepthCompare(sampler2D shadowMap, vec2 uv, float depth)\n' + '{\n' + '    return step(depth, sg_sampleShadowMap(shadowMap, uv));\n' + '}\n' + 'float sg_shadowVisibility(sampler2D shadowMap, sg_shadowParameters shadowParameters)\n' + '{\n' + '    float depthBias = shadowParameters.depthBias;\n' + '    float depth = shadowParameters.depth;\n' + '    float nDotL = shadowParameters.nDotL;\n' + '    float normalShadingSmooth = shadowParameters.normalShadingSmooth;\n' + '    float darkness = shadowParameters.darkness;\n' + '    vec2 uv = shadowParameters.texCoords;\n' + '\n' + '    depth -= depthBias;\n' + '#ifdef USE_SOFT_SHADOWS\n' + '    vec2 texelStepSize = shadowParameters.texelStepSize;\n' + '    float radius = 1.0;\n' + '    float dx0 = -texelStepSize.x * radius;\n' + '    float dy0 = -texelStepSize.y * radius;\n' + '    float dx1 = texelStepSize.x * radius;\n' + '    float dy1 = texelStepSize.y * radius;\n' + '    float visibility = (\n' + '        sg_shadowDepthCompare(shadowMap, uv, depth) +\n' + '        sg_shadowDepthCompare(shadowMap, uv + vec2(dx0, dy0), depth) +\n' + '        sg_shadowDepthCompare(shadowMap, uv + vec2(0.0, dy0), depth) +\n' + '        sg_shadowDepthCompare(shadowMap, uv + vec2(dx1, dy0), depth) +\n' + '        sg_shadowDepthCompare(shadowMap, uv + vec2(dx0, 0.0), depth) +\n' + '        sg_shadowDepthCompare(shadowMap, uv + vec2(dx1, 0.0), depth) +\n' + '        sg_shadowDepthCompare(shadowMap, uv + vec2(dx0, dy1), depth) +\n' + '        sg_shadowDepthCompare(shadowMap, uv + vec2(0.0, dy1), depth) +\n' + '        sg_shadowDepthCompare(shadowMap, uv + vec2(dx1, dy1), depth)\n' + '    ) * (1.0 / 9.0);\n' + '#else\n' + '    float visibility = sg_shadowDepthCompare(shadowMap, uv, depth);\n' + '#endif\n' + '\n' + '    return visibility;\n' + '}\n' + '#endif\n';
  var getPostionEC = 'vec4 getPositionEC(float depth) \n' + '{ \n' + '    vec2 xy = vec2((v_textureCoordinates.x * 2.0 - 1.0), (v_textureCoordinates.y * 2.0 - 1.0));\n' + '    float z = (depth - czm_viewportTransformation[3][2]) / czm_viewportTransformation[2][2];\n' + '    vec4 posInCamera = czm_inverseProjection * vec4(xy, z, 1.0);\n' + '    posInCamera = posInCamera / posInCamera.w;\n' + '    return posInCamera;\n' + '} \n';
  fsSource += 'uniform sampler2D colorTexture;\n' + 'uniform sampler2D depthTexture;\n';

  if (isPointLight) {
    fsSource += 'uniform samplerCube shadowMap_textureCube; \n';
  } else {
    fsSource += 'uniform sampler2D shadowMap_texture; \n';
  }

  fsSource += 'uniform mat4 shadowMap_matrix; \n' + 'uniform vec3 shadowMap_lightDirectionEC; \n' + 'uniform vec4 shadowMap_lightPositionEC; \n' + 'uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness; \n' + 'uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth; \n' + 'uniform vec4 viewShed_frontColor; \n' + 'uniform vec4 viewShed_backColor; \n' + 'uniform float viewShed_Fov; \n' + 'uniform float viewShed_Far;\n' + '\n' + 'varying vec2 v_textureCoordinates;\n' + '\n' + shadowParameters + shadowVisibility + getPostionEC + 'vec3 getNormalEC() \n' + '{ \n' + '    return vec3(1.0); \n' + '} \n' + '\n';
  fsSource += 'void main() \n' + '{ \n' + '    float depth = czm_readDepth(depthTexture, v_textureCoordinates);\n' + '    if(depth > 0.999999)\n' + '    {\n' + '        gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n' + '        return;\n' + '    }\n' + '    vec4 positionEC = getPositionEC(depth); \n' + '    vec3 normalEC = getNormalEC(); \n' + '    float z = -positionEC.z; \n';
  fsSource += '    sg_shadowParameters shadowParameters; \n' + '    shadowParameters.texelStepSize = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy; \n' + '    shadowParameters.depthBias = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z; \n' + '    shadowParameters.normalShadingSmooth = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w; \n' + '    shadowParameters.darkness = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w; \n';

  if (isTerrain) {
    // Scale depth bias based on view distance to reduce z-fighting in distant terrain
    fsSource += '    shadowParameters.depthBias *= max(z * 0.01, 1.0); \n';
  } else if (!polygonOffsetSupported) {
    // If polygon offset isn't supported push the depth back based on view, however this
    // causes light leaking at further away views
    fsSource += '    shadowParameters.depthBias *= mix(1.0, 100.0, z * 0.0015); \n';
  }

  if (isPointLight) {
    fsSource += '    vec3 directionEC = positionEC.xyz - shadowMap_lightPositionEC.xyz; \n' + '    float distance = length(directionEC); \n' + '    directionEC = normalize(directionEC); \n' + '    float radius = shadowMap_lightPositionEC.w; \n' + '    // Stop early if the fragment is beyond the point light radius \n' + '    if (distance > radius) \n' + '    { \n' + '        gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n' + '        return; \n' + '    } \n' + '    vec3 directionWC  = czm_inverseViewRotation * directionEC; \n' + '    shadowParameters.depth = distance / radius; \n' + '    shadowParameters.texCoords = directionWC; \n' + '    float visibility = sg_shadowVisibility(shadowMap_textureCube, shadowParameters); \n';
  } else if (isSpotLight) {
    fsSource += '    vec3 directionEC = positionEC.xyz - shadowMap_lightPositionEC.xyz; \n' + '    float distance = length(directionEC); \n' + '    if(distance > viewShed_Far)\n' + '    {\n' + '        gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n' + '        return;\n' + '    }\n' + '    vec4 shadowPosition = shadowMap_matrix * positionEC; \n' + '    // Spot light uses a perspective projection, so perform the perspective divide \n' + '    shadowPosition /= shadowPosition.w; \n' + '    // Stop early if the fragment is not in the shadow bounds \n' + '    if (any(lessThan(shadowPosition.xyz, vec3(0.0))) || any(greaterThan(shadowPosition.xyz, vec3(1.0)))) \n' + '    { \n' + '        gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n' + '        return; \n' + '    } \n' + '    shadowParameters.texCoords = shadowPosition.xy; \n' + '    shadowParameters.depth = shadowPosition.z; \n' + '    float visibility = sg_shadowVisibility(shadowMap_texture, shadowParameters); \n';
  } else if (hasCascades) {
    fsSource += '    float maxDepth = shadowMap_cascadeSplits[1].w; \n' + '    // Stop early if the eye depth exceeds the last cascade \n' + '    if (z > maxDepth) \n' + '    { \n' + '        gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n' + '        return; \n' + '    } \n' + '    // Get the cascade based on the eye-space z \n' + '    vec4 weights = czm_cascadeWeights(z); \n' + '    // Transform position into the cascade \n' + '    vec4 shadowPosition = czm_cascadeMatrix(weights) * positionEC; \n' + '    // Get visibility \n' + '    shadowParameters.texCoords = shadowPosition.xy; \n' + '    shadowParameters.depth = shadowPosition.z; \n' + '    float visibility = sg_shadowVisibility(shadowMap_texture, shadowParameters); \n' + '    // Fade out shadows that are far away \n' + '    float shadowMapMaximumDistance = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.z; \n' + '    float fade = max((z - shadowMapMaximumDistance * 0.8) / (shadowMapMaximumDistance * 0.2), 0.0); \n' + '    visibility = mix(visibility, 1.0, fade); \n';
  } else {
    fsSource += '    vec4 shadowPosition = shadowMap_matrix * positionEC; \n' + '    // Stop early if the fragment is not in the shadow bounds \n' + '    if (any(lessThan(shadowPosition.xyz, vec3(0.0))) || any(greaterThan(shadowPosition.xyz, vec3(1.0)))) \n' + '    { \n' + '        gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n' + '        return; \n' + '    } \n' + '    shadowParameters.texCoords = shadowPosition.xy; \n' + '    shadowParameters.depth = shadowPosition.z; \n' + '    float visibility = sg_shadowVisibility(shadowMap_texture, shadowParameters); \n';
  }

  fsSource += '    vec4 color = texture2D(colorTexture, v_textureCoordinates);\n' + (hasCascades && debugCascadeColors ? '    color *= czm_cascadeColor(weights); \n' : '') + '    if(visibility > 0.0) \n' + '        gl_FragColor = vec4(color.rgb * (1.0 - viewShed_frontColor.a) + viewShed_frontColor.rgb * viewShed_frontColor.a, color.a); \n' + '    else \n' + '        gl_FragColor = vec4(color.rgb * (1.0 - viewShed_backColor.a) + viewShed_backColor.rgb * viewShed_backColor.a, color.a); \n' + '} \n';
  return fsSource;
}

var VisualField = /*#__PURE__*/function () {
  function VisualField(viewer, options) {
    _classCallCheck(this, VisualField);

    if (!Cesium.defined(viewer)) {
      throw new Cesium.DeveloperError('缺少地图对象！');
    }

    this.options = options || {};
    this._scene = viewer.scene;
    var cameraOptions = options.cameraOptions || {}; // 是否开启点光源贴图

    this._enabled = Cesium.defaultValue(options.enabled, true); // 定义相机目标位置

    this._viewerPosition = Cesium.defaultValue(cameraOptions.viewerPosition, new Cesium.Cartesian3.fromDegrees(0, 0, 0)); // 定义相机的方向

    this._heading = Cesium.defaultValue(cameraOptions.heading, 0); // 定义相机的仰俯角

    this._pitch = Cesium.defaultValue(cameraOptions.pitch, 0); // 水平视角范围

    this._horizontalFov = Cesium.defaultValue(cameraOptions.horizontalFov, 179.9); // 垂直视角范围

    this._verticalFov = Cesium.defaultValue(cameraOptions.verticalFov, 60); // 视锥体长度 即距远平面的距离

    this._distance = Cesium.defaultValue(cameraOptions.distance, 100); // 可见地区颜色 

    this._visibleAreaColor = cameraOptions.visibleAreaColor instanceof Cesium.Color ? cameraOptions.visibleAreaColor : Cesium.Color.fromCssColorString(cameraOptions.visibleAreaColor); // 可见区域颜色透明度

    this._visibleAreaColorAlpha = cameraOptions.visibleAreaColorAlpha == undefined ? 1 : cameraOptions.visibleAreaColorAlpha; // 不可见地区颜色

    this._hiddenAreaColor = cameraOptions.hiddenAreaColor instanceof Cesium.Color ? cameraOptions.hiddenAreaColor : Cesium.Color.fromCssColorString(cameraOptions.hiddenAreaColor); // 不可见地区颜色透明度

    this._hiddenAreaColorAlpha = cameraOptions.hiddenAreaColorAlpha == undefined ? 1 : cameraOptions.hiddenAreaColorAlpha; // 点光源中的像素大小尺寸

    this._size = Cesium.defaultValue(options.size, 2048); // 点光源中的柔和阴影

    this._softShadows = Cesium.defaultValue(options.softShadows, false); // 屏蔽距离误差

    this._bugDistance = this._distance + 0.000001 * this._horizontalFov - 0.000001 * this._verticalFov; // 椎体边界颜色

    this._outlineColor = Cesium.defaultValue(options.outlineColor, Cesium.Color.YELLOW); // 构建视锥体

    this._lightCameraPrimitive = undefined; // 构建光源相机

    this._lightCamera = new Cesium.Camera(this._scene); // 控制椎体相机改变

    this._lightCameraDirty = false; // 添加后处理

    this._stage = undefined;
    this._stageDirty = true;
    this.updateCamera(); // 创建一个点光源

    this._shadowMap = new Cesium.ShadowMap({
      context: this._scene.context,
      lightCamera: this._lightCamera,
      enabled: this._enabled,
      isPointLight: false,
      pointLightRadius: 100.0,
      cascadesEnabled: false,
      size: this._size,
      softShadows: this._softShadows,
      normalOffset: false,
      fromLightSource: false
    });
    this._bias = this._shadowMap._primitiveBias;
  }

  _createClass(VisualField, [{
    key: "enabled",
    get: function get() {
      return this._enabled;
    },
    set: function set(value) {
      /* this.dirty = this._enabled !== value; */
      this._enabled = value;
      this._shadowMap.enabled = value;
    }
  }, {
    key: "softShadows",
    get: function get() {
      return this._softShadows;
    },
    set: function set(value) {
      this._softShadows = value;
      this._shadowMap.softShadows = value;
    }
  }, {
    key: "size",
    get: function get() {
      return this._size;
    },
    set: function set(value) {
      this.size = value;
      this._shadowMap.size = value;
    }
  }, {
    key: "visibleAreaColor",
    get: function get() {
      return Cesium.Color.fromCartesian4(this._visibleAreaColor);
    },
    set: function set(value) {
      var color = value instanceof Cesium.Color ? value : Cesium.Color.fromCssColorString(value);
      this._visibleAreaColor = color;

      this._scene.requestRender();
    }
  }, {
    key: "visibleAreaColorAlpha",
    get: function get() {
      return this._visibleAreaColorAlpha;
    },
    set: function set(value) {
      this._visibleAreaColorAlpha = Number(value);

      this._scene.requestRender();
    }
  }, {
    key: "hiddenAreaColorAlpha",
    get: function get() {
      return this._hiddenAreaColorAlpha;
    },
    set: function set(value) {
      this._hiddenAreaColorAlpha = Number(value);

      this._scene.requestRender();
    }
  }, {
    key: "hiddenAreaColor",
    get: function get() {
      return Cesium.Color.fromCartesian4(this._hiddenAreaColor);
    },
    set: function set(value) {
      var color = value instanceof Cesium.Color ? value : Cesium.Color.fromCssColorString(value);
      this._hiddenAreaColor = color;
      /* this._hiddenAreaColor = Cesium.Cartesian4.fromColor(color); */

      this._scene.requestRender();
    }
  }, {
    key: "viewerPosition",
    get: function get() {
      return this._viewerPosition;
    },
    set: function set(value) {
      this._viewerPosition = value;
      this._lightCameraDirty = true;

      this._scene.requestRender();
    }
  }, {
    key: "heading",
    get: function get() {
      return this._heading;
    },
    set: function set(value) {
      this._heading = value;
      this._lightCameraDirty = true;

      this._scene.requestRender();
    }
  }, {
    key: "pitch",
    get: function get() {
      return this._pitch;
    },
    set: function set(value) {
      this._pitch = value;
      this._lightCameraDirty = true;

      this._scene.requestRender();
    }
  }, {
    key: "horizontalFov",
    get: function get() {
      return this._horizontalFov;
    },
    set: function set(value) {
      this._horizontalFov = value;
      this._bugDistance = this._distance + 0.000001 * this._horizontalFov - 0.000001 * this._verticalFov;
      this._lightCameraDirty = true;

      this._scene.requestRender();
    }
  }, {
    key: "verticalFov",
    get: function get() {
      return this._verticalFov;
    },
    set: function set(value) {
      this._verticalFov = value;
      this._bugDistance = this._distance + 0.000001 * this._horizontalFov - 0.000001 * this._verticalFov;
      this._lightCameraDirty = true;

      this._scene.requestRender();
    }
  }, {
    key: "distance",
    get: function get() {
      return this._distance;
    },
    set: function set(value) {
      this._distance = value;
      this._bugDistance = this._distance + 0.000001 * this._horizontalFov - 0.000001 * this._verticalFov;
      this._lightCameraDirty = true;

      this._scene.requestRender();
    } // 锥体相机更新

  }, {
    key: "updateCamera",
    value: function updateCamera() {
      // 视锥体近平面
      this._lightCamera.frustum.near = .001 * this._bugDistance; // 视锥体远平面

      this._lightCamera.frustum.far = this._bugDistance; // 视锥体张角

      this._lightCamera.frustum.fov = Cesium.Math.toRadians(this._verticalFov); // 视锥体宽高比

      var horizontalFovRadians = Cesium.Math.toRadians(this._horizontalFov);
      var verticalFovRadians = Cesium.Math.toRadians(this._verticalFov);
      this._lightCamera.frustum.aspectRatio = this._bugDistance * Math.tan(horizontalFovRadians * 0.5) * 2.0 / (this._bugDistance * Math.tan(verticalFovRadians * 0.5) * 2.0);
      this._lightCamera.frustum.aspectRatio = Math.tan(horizontalFovRadians * 0.5) / Math.tan(verticalFovRadians * 0.5); // 如果水平方向张角大于垂直方向 则视锥体张角取值为水平方向角度 ？

      if (this._horizontalFov > this._verticalFov) this._lightCamera.frustum.fov = Cesium.Math.toRadians(this._horizontalFov); // 设置相机姿态

      this._lightCamera.setView({
        destination: this._viewerPosition,
        orientation: {
          heading: Cesium.Math.toRadians(this._heading),
          pitch: Cesium.Math.toRadians(this._pitch)
        }
      }); // 构建视锥体


      if (this._lightCameraPrimitive) {
        this._lightCameraPrimitive.destroy();

        this._lightCameraPrimitive = undefined;
      }

      var outlineGeometry = this.createOutLineGeometry();
      this._lightCameraPrimitive = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: outlineGeometry,
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(this._outlineColor)
          }
        }),
        appearance: new Cesium.PerInstanceColorAppearance({
          translucent: false,
          flat: true
        }),
        modelMatrix: this._lightCamera.inverseViewMatrix,
        asynchronous: false
      });
      this._lightCameraDirty = false;
    } // 构建谁锥体几何

  }, {
    key: "createOutLineGeometry",
    value: function createOutLineGeometry() {
      var positions = new Float32Array(633);
      var i,
          a,
          d,
          p = positions,
          m = Cesium.Math.toRadians(this._horizontalFov),
          v = Cesium.Math.toRadians(this._verticalFov),
          b = Math.tan(0.5 * m),
          S = Math.tan(0.5 * v);
      a = this._distance * b;
      d = this._distance * S;
      i = -a;
      var P = 0;
      p[P++] = 0;
      p[P++] = 0;
      p[P++] = 0;
      var D, I;
      var M = Math.PI - 0.5 * m;
      var R = m / 4;

      for (var L = 0; L < 5; ++L) {
        D = M + L * R;
        var B = d / (this._distance / Math.cos(D));
        var F = Math.atan(B);
        var U = -F;
        var V = F / 10;

        for (var z = 0; z < 21; ++z) {
          I = U + z * V;
          p[P++] = this._distance * Math.cos(I) * Math.sin(D);
          p[P++] = this._distance * Math.sin(I);
          p[P++] = this._distance * Math.cos(I) * Math.cos(D);
        }
      }

      R = m / 20;

      for (var G = 0; G < 21; ++G) {
        D = M + G * R;

        var _B = d / (this._distance / Math.cos(D));

        var _F = Math.atan(_B);

        var _U = -_F,
            _V = _F / 2;

        for (var H = 0; H < 5; ++H) {
          I = _U + H * _V;
          p[P++] = this._distance * Math.cos(I) * Math.sin(D);
          p[P++] = this._distance * Math.sin(I);
          p[P++] = this._distance * Math.cos(I) * Math.cos(D);
        }
      }

      var attributes = new Cesium.GeometryAttributes({
        position: new Cesium.GeometryAttribute({
          componentDatatype: Cesium.ComponentDatatype.DOUBLE,
          componentsPerAttribute: 3,
          values: positions
        })
      });
      var indices = new Uint16Array(408);
      var t = indices;
      var r = 0;
      t[r++] = 0;
      t[r++] = 1;
      t[r++] = 0;
      t[r++] = 21;
      t[r++] = 0;
      t[r++] = 85;
      t[r++] = 0;
      t[r++] = 105;

      for (var _i = 0, n = 0; n < 5; ++n) {
        _i++;

        for (var _a = 0; _a < 20; ++_a) {
          t[r++] = _i++, t[r++] = _i;
        }
      }

      i++;

      for (var _s = 0; _s < 20; ++_s) {
        for (var l = 0; l < 5; ++l) {
          t[r++] = i, t[r++] = i++ + 5;
        }
      }

      return new Cesium.Geometry({
        attributes: attributes,
        indices: indices,
        primitiveType: Cesium.PrimitiveType.LINES,
        boundingSphere: Cesium.BoundingSphere.fromVertices(positions)
      });
    } // 更新后处理

  }, {
    key: "updateStage",
    value: function updateStage() {
      if (!this._stageDirty) {
        return;
      }

      this._stageDirty = false;

      if (Cesium.defined(this._stage)) {
        this._scene.postProcessStages.remove(this._stage);

        this._stage = undefined;
      }

      var scratchTexelStepSize = new Cesium.Cartesian2();
      var bias = this._bias;
      var shadowMap = this._shadowMap;
      var that = this;
      var uniformMap = {
        shadowMap_texture: function shadowMap_texture() {
          return shadowMap._shadowMapTexture;
        },
        shadowMap_matrix: function shadowMap_matrix() {
          return shadowMap._shadowMapMatrix;
        },
        viewShed_frontColor: function viewShed_frontColor() {
          var vColor = that._visibleAreaColor.withAlpha(that._visibleAreaColorAlpha);

          vColor = Cesium.Cartesian4.fromColor(vColor);
          return vColor;
        },
        viewShed_backColor: function viewShed_backColor() {
          var hColor = that._hiddenAreaColor.withAlpha(that._hiddenAreaColorAlpha);

          hColor = Cesium.Cartesian4.fromColor(hColor);
          return that._hiddenAreaColor;
        },
        viewShed_Far: function viewShed_Far() {
          return shadowMap._lightCamera.frustum.far;
        },
        shadowMap_lightheadingEC: function shadowMap_lightheadingEC() {
          return shadowMap._lightheadingEC;
        },
        shadowMap_lightPositionEC: function shadowMap_lightPositionEC() {
          return shadowMap._lightPositionEC;
        },
        shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: function shadowMap_texelSizeDepthBiasAndNormalShadingSmooth() {
          var texelStepSize = scratchTexelStepSize;
          texelStepSize.x = 1.0 / shadowMap._textureSize.x;
          texelStepSize.y = 1.0 / shadowMap._textureSize.y;
          return Cesium.Cartesian4.fromElements(texelStepSize.x, texelStepSize.y, bias.depthBias, bias.normalShadingSmooth, this.combinedUniforms1);
        },
        shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: function shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness() {
          return Cesium.Cartesian4.fromElements(bias.normalOffsetScale, shadowMap._distance, shadowMap.maximumDistance, shadowMap._darkness, this.combinedUniforms2);
        },
        combinedUniforms1: new Cesium.Cartesian4(),
        combinedUniforms2: new Cesium.Cartesian4()
      };
      var fshader = getPostStageFragmentShader(shadowMap, false);
      this._stage = new Cesium.PostProcessStage({
        fragmentShader: fshader,
        uniforms: uniformMap
      });

      this._scene.postProcessStages.add(this._stage);
    }
  }, {
    key: "update",
    value: function update(frameState) {
      if (this._lightCameraDirty) this.updateCamera();
      this.updateStage();
      frameState.shadowMaps.push(this._shadowMap);
      if (this._lightCameraPrimitive) this._lightCameraPrimitive.update(frameState);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (Cesium.defined(this._stage)) {
        this._scene.postProcessStages.remove(this._stage);

        this._stage = undefined;
        /*  var length = this._scene.postProcessStages.length;  */
      }

      this._shadowMap = this._shadowMap.destroy();

      if (this._lightCameraPrimitive) {
        this._lightCameraPrimitive.destroy();

        this._lightCameraPrimitive = undefined;
      }
    }
  }]);

  return VisualField;
}();

var VisualTool = /*#__PURE__*/function () {
  function VisualTool(viewer, opt) {
    _classCallCheck(this, VisualTool);

    if (!Cesium.defined(viewer)) {
      throw new Cesium.DeveloperError('缺少地图对象！');
    }

    this.viewer = viewer;
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.positions = [];
    this.prompt = null;
    this.startPosition = null;
    this.endPosition = null;
    this.vfPrimitive = null; // 默认样式

    var defaultStyle = {
      visibleAreaColor: "#00FF00",
      visibleAreaColorAlpha: 1,
      hiddenAreaColor: "#FF0000",
      hiddenAreaColorAlpha: 1,
      verticalFov: 60,
      horizontalFov: 120
    };
    this.opt = Object.assign(defaultStyle, opt || {});
    this.visibleAreaColor = this.opt.visibleAreaColor;
    this.hiddenAreaColor = this.opt.hiddenAreaColor;
    this.visibleAreaColorAlpha = this.opt.visibleAreaColorAlpha;
    this.hiddenAreaColorAlpha = this.opt.hiddenAreaColorAlpha;
    this.heading = this.opt.heading || 0;
    this.pitch = this.opt.pitch || 0;
    this.verticalFov = this.opt.verticalFov;
    this.horizontalFov = this.opt.horizontalFov;
    this.distance = 0;
  }

  _createClass(VisualTool, [{
    key: "startDraw",
    value: function startDraw(fun) {
      var that = this;
      if (!this.prompt) this.prompt = new Prompt$1(this.viewer, this.promptStyle);
      this.handler.setInputAction(function (evt) {
        // 单击开始绘制
        var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
        if (!cartesian) return;

        if (!that.startPosition) {
          that.startPosition = cartesian.clone();
        } else {
          that.endPosition = cartesian.clone();

          if (that.handler) {
            that.handler.destroy();
            that.handler = null;
          }

          if (that.prompt) {
            that.prompt.destroy();
            that.prompt = null;
          }
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      this.handler.setInputAction(function (evt) {
        // 移动时绘制线
        if (!that.startPosition) {
          that.prompt.update(evt.endPosition, "单击开始绘制");
          return;
        }

        that.prompt.update(evt.endPosition, "再次单击结束");
        var cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
        if (!cartesian) return;

        if (!that.vfPrimitive) {
          that.vfPrimitive = new VisualField(that.viewer, {
            cameraOptions: {
              viewerPosition: that.startPosition.clone(),
              visibleAreaColor: that.visibleAreaColor,
              visibleAreaColorAlpha: that.visibleAreaColorAlpha,
              hiddenAreaColor: that.hiddenAreaColor,
              hiddenAreaColorAlpha: that.hiddenAreaColorAlpha,
              horizontalFov: that.horizontalFov,
              verticalFov: that.verticalFov
            }
          });
          that.viewer.scene.primitives.add(that.vfPrimitive);
        }

        var c1 = Cesium.Cartographic.fromCartesian(that.startPosition.clone());
        var c2 = Cesium.Cartographic.fromCartesian(cartesian.clone());
        var angle = that.computeAngle(c1, c2);
        that.heading = angle;
        that.vfPrimitive.heading = angle;
        var distance = Cesium.Cartesian3.distance(that.startPosition.clone(), cartesian.clone());
        that.distance = distance;
        that.vfPrimitive.distance = distance;
        if (fun) fun(heading, distance);
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    } // 设置可视区域颜色

  }, {
    key: "setVisibleAreaColor",
    value: function setVisibleAreaColor(val) {
      if (!val) return;
      this.visibleAreaColor = val;
      if (this.vfPrimitive) this.vfPrimitive.visibleAreaColor = val;
    } // 设置可视区域颜色透明度

  }, {
    key: "setVisibleAreaColorAlpha",
    value: function setVisibleAreaColorAlpha(val) {
      if (!val) return;
      this.visibleAreaColorAlpha = Number(val);
      if (this.vfPrimitive) this.vfPrimitive.visibleAreaColorAlpha = Number(val);
    } // 设置不可视区域颜色

  }, {
    key: "setHiddenAreaColor",
    value: function setHiddenAreaColor(val) {
      if (!val) return;
      this.hiddenAreaColor = val;
      if (this.vfPrimitive) this.vfPrimitive.hiddenAreaColor = val;
    } // 设置不可视区域颜色透明度

  }, {
    key: "setHiddenAreaColorAlpha",
    value: function setHiddenAreaColorAlpha(val) {
      if (!val) return;
      this.hiddenAreaColorAlpha = Number(val);
      if (this.vfPrimitive) this.vfPrimitive.hiddenAreaColorAlpha = Number(val);
    } // 设置锥体长度

  }, {
    key: "setDistance",
    value: function setDistance(val) {
      if (!val) return;
      this.distance = Number(val);
      if (this.vfPrimitive) this.vfPrimitive.distance = Number(val);
    } // 设置垂直张角

  }, {
    key: "setVerticalFov",
    value: function setVerticalFov(val) {
      if (!val) return;
      this.verticalFov = Number(val);
      if (this.vfPrimitive) this.vfPrimitive.verticalFov = Number(val);
    } // 设置水平张角

  }, {
    key: "setHorizontalFov",
    value: function setHorizontalFov(val) {
      if (!val) return;
      this.horizontalFov = Number(val);
      if (this.vfPrimitive) this.vfPrimitive.horizontalFov = Number(val);
    } // 设置锥体姿态 -- 偏转角

  }, {
    key: "setHeading",
    value: function setHeading(val) {
      if (!val) return;
      this.heading = 0;
      if (this.vfPrimitive) this.vfPrimitive.heading = Number(val);
    } // 设置锥体姿态 -- 仰俯角

  }, {
    key: "setPitch",
    value: function setPitch(val) {
      if (!val) return;
      this.pitch = Number(val);
      if (this.vfPrimitive) this.vfPrimitive.pitch = Number(val);
    } // 计算两点朝向

  }, {
    key: "computeAngle",
    value: function computeAngle(p1, p2) {
      if (!p1 || !p2) return;
      var lng_a = p1.longitude;
      var lat_a = p1.latitude;
      var lng_b = p2.longitude;
      var lat_b = p2.latitude;
      var y = Math.sin(lng_b - lng_a) * Math.cos(lat_b);
      var x = Math.cos(lat_a) * Math.sin(lat_b) - Math.sin(lat_a) * Math.cos(lat_b) * Math.cos(lng_b - lng_a);
      var bearing = Math.atan2(y, x);
      bearing = bearing * 180.0 / Math.PI;

      if (bearing < -180) {
        bearing = bearing + 360;
      }

      return bearing;
    } // 坐标拾取

  }, {
    key: "getCatesian3FromPX",
    value: function getCatesian3FromPX(px) {
      var picks = this.viewer.scene.drillPick(px);
      this.viewer.scene.render();
      var cartesian;
      var isOn3dtiles = false;

      for (var i = 0; i < picks.length; i++) {
        if (picks[i] && picks[i].primitive && picks[i].primitive instanceof Cesium.Cesium3DTileset) {
          //模型上拾取
          isOn3dtiles = true;
          break;
        }
      }

      if (isOn3dtiles) {
        cartesian = this.viewer.scene.pickPosition(px);
      } else {
        var ray = this.viewer.camera.getPickRay(px);
        if (!ray) return null;
        cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
      }

      return cartesian;
    }
  }, {
    key: "clear",
    value: function clear() {
      if (this.vfPrimitiv) {
        this.viewer.scene.primitives.remove(this.vfPrimitive);
        this.vfPrimitive = null;
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.clear();

      if (this.handler) {
        this.handler.destroy();
        this.handler = null;
      }

      if (this.prompt) {
        this.prompt.destroy();
        this.prompt = null;
      }
    }
  }]);

  return VisualTool;
}();

// 日照分析
var Sunshine = /*#__PURE__*/function () {
  function Sunshine(viewer, opt) {
    _classCallCheck(this, Sunshine);

    this.viewer = viewer;
    this.opt = opt || {};
    this._startTime = opt.startTime || Cesium.JulianDate.fromDate(new Date().setHours(8), new Cesium.JulianDate());
    if (this._startTime instanceof Date) this._startTime = Cesium.JulianDate.fromDate(this._startTime, new Cesium.JulianDate());
    this._endTime = opt.endTime;
    if (this._endTime instanceof Date) this._endTime = Cesium.JulianDate.fromDate(this._endTime, new Cesium.JulianDate());
    this.oldShouldAnimate = this.viewer.clock.shouldAnimate;
    this.multiplier = opt.multiplier || 60;
  }

  _createClass(Sunshine, [{
    key: "start",
    value: function start() {
      this.viewer.clock.currentTime = this._startTime.clone();
      this.viewer.clock.startTime = this._startTime.clone();
      this.viewer.clock.shouldAnimate = true;
      this.viewer.clock.multiplier = this.multiplier;
      this.viewer.scene.globe.enableLighting = true;
      this.viewer.shadows = true;
      this.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
      if (this._endTime) this.viewer.clock.endTime = this._endTime.clone();
    }
  }, {
    key: "end",
    value: function end() {
      this.viewer.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
      this.viewer.clock.shouldAnimate = this.oldShouldAnimate;
      this.viewer.clock.multiplier = 1;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      this.viewer.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
      this.viewer.clock.shouldAnimate = this.oldShouldAnimate;
      this.viewer.clock.multiplier = 1;
    } // 暂停继续

  }, {
    key: "pause",
    value: function pause() {
      this.viewer.clock.shouldAnimate = !this.viewer.clock.shouldAnimate;
    }
  }, {
    key: "startTime",
    get: function get() {
      return this._startTime;
    },
    set: function set(time) {
      if (!time) return;

      if (this._startTime instanceof Date) {
        this._startTime = Cesium.JulianDate.fromDate(this._startTime, new Cesium.JulianDate());
      } else {
        this._startTime = time.clone();
      }

      this.start();
    }
  }, {
    key: "endTime",
    get: function get() {
      return this._endTime;
    },
    set: function set(time) {
      if (!time) return;

      if (this._endTime instanceof Date) {
        this._endTime = Cesium.JulianDate.fromDate(this._startTime, new Cesium.JulianDate());
      } else {
        this._endTime = time.clone();
      }

      this.start();
    }
  }]);

  return Sunshine;
}();

function FlowLineMaterial$1(opt) {
  this.defaultColor = new Cesium.Color(0, 0, 0, 0);
  opt = opt || {};
  this._definitionChanged = new Cesium.Event();
  this._color = undefined;
  this.color = opt.color || this.defaultColor; //颜色

  this._duration = opt.duration || 1000; //时长

  this.url = opt.image; //材质图片

  this._time = undefined;
  this.repeat = opt.repeat || new Cesium.Cartesian2(1.0, 1.0);
}

FlowLineMaterial$1.prototype.getType = function (time) {
  return "FlowLine";
};

FlowLineMaterial$1.prototype.getValue = function (time, result) {
  if (!Cesium.defined(result)) {
    result = {};
  }

  result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, this.defaultColor, result.color);
  result.image = this.url;

  if (this._time === undefined) {
    this._time = new Date().getTime();
  }

  result.time = (new Date().getTime() - this._time) / this._duration;
  result.repeat = this.repeat;
  return result;
};

FlowLineMaterial$1.prototype.equals = function (other) {
  return this === other || other instanceof FlowLineMaterial$1 && Cesium.Property.equals(this._color, other._color) && this._image._value == other._image._value && this.repeat.equals(other.repeat);
};

function FlyLineMaterial$1(opt) {
  this.defaultColor = new Cesium.Color(0, 0, 0, 0);
  this._definitionChanged = new Cesium.Event();
  this._color = undefined;
  this.color = opt.color || this.defaultColor;
  this.duration = opt.duration || 3000;
  this.image = opt.image;

  if (!this.image) {
    console.warn("缺少材质图片！");
  }
}

FlyLineMaterial$1.prototype.getType = function (time) {
  return 'FlyLine';
};

FlyLineMaterial$1.prototype.getValue = function (time, result) {
  if (!Cesium.defined(result)) {
    result = {};
  }

  if (!this._time) {
    this._time = new Date().getTime();
  }

  result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
  result.image = this.image;
  result.time = (new Date().getTime() - this._time) % this.duration / this.duration;
  return result;
};

FlyLineMaterial$1.prototype.equals = function (other) {
  return this === other || other instanceof FlyLineMaterial$1 && Cesium.Property.equals(this._color, other._color) && this._image._value == other._image._value && this.repeat.equals(other.repeat);
};

function AnimateWall(obj) {
  this._definitionChanged = new Cesium.Event();
  this.color = obj.color;
  this.duration = obj.duration;
  this._time = new Date().getTime();

  if (!obj.image) {
    console.log("未传入材料图片！");
  }

  this.image = obj.image;
  this.repeat = obj.repeat || new Cesium.Cartesian2(5, 1);
  this.axisY = obj.axisY;
}

AnimateWall.prototype.getType = function (time) {
  return 'AnimateWall';
};

AnimateWall.prototype.getValue = function (time, result) {
  if (!Cesium.defined(result)) {
    result = {};
  }

  result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
  result.image = this.image;
  result.time = (new Date().getTime() - this._time) % this.duration / this.duration;
  result.axisY = this.axisY;
  result.repeat = this.repeat;
  return result;
};

AnimateWall.prototype.equals = function (other) {
  return this === other || other instanceof AnimateWall && Cesium.Property.equals(this._color, other._color) && this._image._value == other._image._value && this.repeat.equals(other.repeat);
};

// 锥体扫描
function AnimateWave(opt) {
  this._definitionChanged = new Cesium.Event();
  this._color = undefined;
  this.defaultColor = Cesium.Color.fromCssColorString("#02ff00");
  this.color = Cesium.defaultValue(opt.color, this.defaultColor); //颜色

  this._duration = opt.duration || 1000; //时长

  this._time = undefined;
}

AnimateWave.prototype.color = function () {
  return Cesium.createPropertyDescriptor('color');
};

AnimateWave.prototype.getType = function () {
  return 'AnimateWave';
};

AnimateWave.prototype.getValue = function (time, result) {
  if (!Cesium.defined(result)) {
    result = {};
  }

  result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, this.color, result.color);

  if (this._time === undefined) {
    this._time = new Date().getTime();
  }

  result.time = (new Date().getTime() - this._time) / this._duration;
  return result;
};

AnimateWave.prototype.equals = function (other) {
  return this === other || other instanceof AnimateWave && Cesium.Property.equals(this._color, other._color);
};

var Cesium$1 = require('cesium/Cesium.js');

function registerAnimate() {
  Object.defineProperties(FlowLineMaterial$1.prototype, {
    isConstant: {
      get: function get() {
        return false;
      }
    },
    definitionChanged: {
      get: function get() {
        return this._definitionChanged;
      }
    },
    color: Cesium$1.createPropertyDescriptor('color')
  });

  Cesium$1.Material._materialCache.addMaterial("FlowLine", {
    fabric: {
      type: "FlowLine",
      uniforms: {
        color: new Cesium$1.Color(1, 0, 0, 1.0),
        image: '',
        time: 0,
        repeat: new Cesium$1.Cartesian2(1.0, 1.0)
      },
      source: "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                {\n\
                    czm_material material = czm_getDefaultMaterial(materialInput);\n\
                    vec2 st = repeat * materialInput.st;\n\
                    vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
                    if(color.a == 0.0)\n\
                    {\n\
                        material.alpha = colorImage.a;\n\
                        material.diffuse = colorImage.rgb; \n\
                    }\n\
                    else\n\
                    {\n\
                        material.alpha = colorImage.a * color.a;\n\
                        material.diffuse = max(color.rgb * material.alpha * 3.0, color.rgb); \n\
                    }\n\
                    return material;\n\
                }"
    },
    translucent: function translucent() {
      return true;
    }
  });

  Object.defineProperties(FlyLineMaterial$1.prototype, {
    isConstant: {
      get: function get() {
        return false;
      }
    },
    definitionChanged: {
      get: function get() {
        return this._definitionChanged;
      }
    },
    color: Cesium$1.createPropertyDescriptor('color')
  });

  Cesium$1.Material._materialCache.addMaterial("FlyLine", {
    fabric: {
      type: "FlyLine",
      uniforms: {
        color: new Cesium$1.Color(1.0, 0.0, 0.0, 0.5),
        image: '',
        time: 0
      },
      source: "\n            czm_material czm_getMaterial(czm_materialInput materialInput)\n            {\n                    czm_material material = czm_getDefaultMaterial(materialInput);\n                    vec2 st = materialInput.st;\n                    vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n                    material.alpha = colorImage.a * color.a;\n                    material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n                    return material;\n                }\n    "
    },
    translucent: function translucent(material) {
      return true;
    }
  });

  Object.defineProperties(AnimateWall.prototype, {
    isConstant: {
      get: function get() {
        return false;
      }
    },
    definitionChanged: {
      get: function get() {
        return this._definitionChanged;
      }
    },
    color: Cesium$1.createPropertyDescriptor('color')
  });

  Cesium$1.Material._materialCache.addMaterial('AnimateWall', {
    fabric: {
      type: 'AnimateWall',
      uniforms: {
        color: new Cesium$1.Color(1.0, 1.0, 1.0, 0.5),
        image: "",
        time: 0,
        repeat: new Cesium$1.Cartesian2(5, 1),
        axisY: false
      },
      source: "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                            {\n\
                                czm_material material = czm_getDefaultMaterial(materialInput);\n\
                                vec2 st = repeat * materialInput.st;\n\
                                vec4 colorImage = texture2D(image, vec2(fract((axisY?st.s:st.t) - time), st.t));\n\
                                if(color.a == 0.0)\n\
                                {\n\
                                    material.alpha = colorImage.a;\n\
                                    material.diffuse = colorImage.rgb; \n\
                                }\n\
                                else\n\
                                {\n\
                                    material.alpha = colorImage.a * color.a;\n\
                                    material.diffuse = max(color.rgb * material.alpha * 3.0, color.rgb); \n\
                                }\n\
                                material.emission = colorImage.rgb;\n\
                                return material;\n\
                            }"
    },
    translucent: function translucent(material) {
      return true;
    }
  });

  Object.defineProperties(AnimateWave.prototype, {
    isConstant: {
      get: function get() {
        return false;
      }
    },
    definitionChanged: {
      get: function get() {
        return this._definitionChanged;
      }
    }
  });

  Cesium$1.Material._materialCache.addMaterial("AnimateWave", {
    fabric: {
      type: "AnimateWave",
      uniforms: {
        color: new Cesium$1.Color(1, 0, 0, 1.0),
        time: 10
      },
      source: "czm_material czm_getMaterial(czm_materialInput materialInput)\n                {\n                    czm_material material = czm_getDefaultMaterial(materialInput);\n                    material.diffuse = 1.5 * color.rgb;\n                    vec2 st = materialInput.st;\n                    float dis = distance(st, vec2(0.5, 0.5));\n                    float per = fract(time);\n                    if(dis > per * 0.5){\n                        discard;\n                    }else {\n                        material.alpha = color.a  * dis / per / 2.0;\n                    }\n                    return material;\n                }\n            "
    },
    translucent: function translucent() {
      return true;
    }
  });

  return {
    FlowLineMaterial: FlowLineMaterial$1,
    FlyLineMaterial: FlyLineMaterial$1,
    AnimateWall: AnimateWall,
    AnimateWave: AnimateWave
  };
}

var analysis = {
  VisualTool: VisualTool,
  Sunshine: Sunshine
}; // 自定义天气

var weather = {
  fog: fog,
  rain: rain,
  snow: snow
};

var rganimate = registerAnimate();
var animate = {
  Wall: rganimate.AnimateWall,
  FlowLine: rganimate.FlowLineMaterial
}; // 构建viewer

var MapViewer = /*#__PURE__*/function () {
  function MapViewer(domId, opt) {
    _classCallCheck(this, MapViewer);

    if (!domId) return;
    this.domId = domId;
    this.opt = opt || {};
    this._viewer = null;
    this.baseLayerTool = null;
    this.operateLayerTool = null;
    this.operatePlotTool = null;
    this.rightTool = null;
    this.bottomLnglatTool = null;
    this.popupTooltipTool = null;
    this.createViewer();
    this.loadbaseLayers();
    this.loadOperateLayers();
    this.terrainUrl = '';
    var terrain = this.opt.map.terrain;
    if (terrain && terrain.url && terrain.show) this.loadTerrain(terrain.url);
    /*  if (this.opt.map.cameraView) cUtil.setCameraView(this.opt.map.cameraView, this._viewer); */

    if (this.opt.map.bottomLnglatTool) this.openBottomLnglatTool();
    if (this.opt.map.rightTool) this.openRightTool();
    if (this.opt.map.popupTooltipTool) this.openPopupTooltip();
    if (this.opt.map.navigationTool) this.openNavigationTool();

    if (this.opt.map.worldAnimate) {
      this.openWorldAnimate();
    } else {
      if (this.opt.map.cameraView) cUtil$1.setCameraView(this.opt.map.cameraView, this._viewer);
    }
  }

  _createClass(MapViewer, [{
    key: "viewer",
    get: function get() {
      return this._viewer;
    } // 构建地图

  }, {
    key: "createViewer",
    value: function createViewer() {
      var viewerConfig = this.opt.map.viewerConfig;
      this._viewer = new window.Cesium.Viewer(this.domId, viewerConfig);

      this._viewer.imageryLayers.removeAll(); // 是否展示cesium官方logo


      this._viewer._cesiumWidget._creditContainer.style.display = "none";
      this._viewer.mapConfig = this.opt;

      this._viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

      this.viewer.scene.globe.depthTestAgainstTerrain = this.opt.map.depthTestAgainstTerrain;
    } // 构建图层

  }, {
    key: "loadbaseLayers",
    value: function loadbaseLayers() {
      var _ref = this.opt || [],
          baseLayers = _ref.baseLayers;

      for (var i = 0; i < baseLayers.length; i++) {
        var layer = baseLayers[i];

        if (!layer.type) {
          console.log("缺少基础图层的图层类型", layer);
          return;
        }

        if (layer.type == "group") continue; // 添加id

        layer.id = layer.id || new Date().getTime() + "" + Number(Math.random() * 1000).toFixed(0);
        if (!this.baseLayerTool) this.baseLayerTool = new LayerTool(this._viewer);
        this.baseLayerTool.add(layer);
      }
    } // 构建业务图层

  }, {
    key: "loadOperateLayers",
    value: function loadOperateLayers() {
      var _ref2 = this.opt || [],
          operateLayers = _ref2.operateLayers; // 递归查到所有的图层


      var allOperateLayers = [];

      function dg(layers) {
        for (var i = 0; i < layers.length; i++) {
          var layer = layers[i]; // 添加id

          layer.id = layer.id || new Date().getTime() + "" + Number(Math.random() * 1000).toFixed(0);
          layer.alpha = layer.alpha == undefined ? 1 : layer.alpha;

          if (layer.children && layer.children.length > 0) {
            dg(layer.children);
          } else {
            allOperateLayers.push(layer);
          }
        }
      }
      dg(operateLayers);

      for (var i = 0; i < allOperateLayers.length; i++) {
        var layer = allOperateLayers[i];

        if (!layer.type) {
          console.log("缺少基础图层的图层类型", layer);
          return;
        }

        if (layer.type == "group") continue;

        if (layer.type == "plot" && layer.show) {
          // 兼容单个类型标绘在文件中配置
          if (!this.operatePlotTool) {
            this.operatePlotTool = new DrawTool(this._viewer, {
              canEdit: false
            });
          }

          layer.type = layer.plotType;
          this.operatePlotTool.createByPositions(layer);
        } else {
          if (!this.operateLayerTool) this.operateLayerTool = new LayerTool(this._viewer);
          this.operateLayerTool.add(layer);
        }
      }
    } // 加载地形

  }, {
    key: "loadTerrain",
    value: function loadTerrain(url) {
      // 移除原地形
      this._viewer.scene.terrainProvider = new Cesium.EllipsoidTerrainProvider({});
      this.terrainUrl = url;
      if (!url) return;
      var terrainProvider = new Cesium.CesiumTerrainProvider({
        url: url
      });
      this._viewer.scene.terrainProvider = terrainProvider;
    } // 设置地形的显示隐藏

  }, {
    key: "setTerrainVisible",
    value: function setTerrainVisible(visible) {
      if (!visible) {
        this._viewer.scene.terrainProvider = new Cesium.EllipsoidTerrainProvider({});
      } else {
        this.loadTerrain(this.terrainUrl);
      }

      this._viewer.scene.render();
    } // 开启右键工具

  }, {
    key: "openRightTool",
    value: function openRightTool() {
      if (!this.rightTool) {
        this.rightTool = new RightTool(this.viewer, {});
      }
    }
  }, {
    key: "closeRightTool",
    value: function closeRightTool() {
      if (this.rightTool) {
        this.rightTool.destroy();
        this.rightTool = null;
      }
    } // 打开实体鼠标提示

  }, {
    key: "openPopupTooltip",
    value: function openPopupTooltip() {
      if (!this.popupTooltip) {
        this.popupTooltip = new PopupTooltipTool(this.viewer, {});
        this.popupTooltip.autoBindTooltip();
        this.popupTooltip.autoBindPopup();
      }
    } // 开启地图坐标提示

  }, {
    key: "openBottomLnglatTool",
    value: function openBottomLnglatTool() {
      if (!this.bottomLnglatTool) this.bottomLnglatTool = new LatlngNavigation(this._viewer);
    }
  }, {
    key: "closeBottomLnglatTool",
    value: function closeBottomLnglatTool() {
      if (this.bottomLnglatTool) {
        this.bottomLnglatTool.destroy();
        this.bottomLnglatTool = null;
      }
    } // 开启地球动画

  }, {
    key: "openWorldAnimate",
    value: function openWorldAnimate() {
      var that = this;
      easy3dView.setRotate({
        x: this.opt.map.cameraView.x,
        y: this.opt.map.cameraView.y
      }, function () {
        if (that.opt.map.cameraView) {
          cUtil$1.setCameraView(that.opt.map.cameraView);
        }
      });
    } // 构建指北针

  }, {
    key: "openNavigationTool",
    value: function openNavigationTool() {
      new CesiumNavigation(this._viewer, {
        enableCompass: true,
        // 罗盘
        enableZoomControls: true,
        // 缩放控制器
        enableDistanceLegend: true,
        // 比例尺
        enableCompassOuterRing: true,
        // 罗盘外环
        view: this.viewer.mapConfig.map && this.viewer.mapConfig.map.cameraView
      });
    } // 销毁

  }, {
    key: "destroy",
    value: function destroy() {
      if (this.baseLayerTool) {
        this.baseLayerTool.destroy();
        this.baseLayerTool = null;
      }

      if (this.operateLayerTool) {
        this.operateLayerTool.destroy();
        this.operateLayerTool = null;
      }

      if (this.operatePlotTool) {
        this.operatePlotTool.destroy();
        this.operatePlotTool = null;
      }

      if (this.bottomLnglatTool) {
        this.bottomLnglatTool.destroy();
        this.bottomLnglatTool = null;
      }

      if (this._viewer) {
        this._viewer.destroy();

        this._viewer = null;
      }
    }
  }]);

  return MapViewer;
}();

var easy3d_export = {
  cUtil: cUtil$1,
  cTool: cTool,
  MapViewer: MapViewer,
  DrawTool: DrawTool,
  LayerTool: LayerTool,
  MeasureTool: MeasureTool,
  Prompt: Prompt$1,
  gadgets: gadgets,
  RoamTool: RoamTool,
  ZoomTool: ZoomTool,
  OverviewMap: OverviewMap,
  weather: weather,
  animate: animate,
  analysis: analysis
};

module.exports = easy3d_export;
