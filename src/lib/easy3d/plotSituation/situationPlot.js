//军事标绘
import AttackArrow from './attackArrow.js';
import AttackArrowPW from './attackArrowPW.js';
import AttackArrowYW from './attackArrowYW.js';
import CloseCurve from './closeCurve.js';
import DoubleArrow from './doubleArrow.js';
import FineArrow from './fineArrow.js';
import FineArrowYW from './fineArrowYW.js';
import GatheringPlace from './gatheringPlace.js';
import Lune from './lune.js';
import StraightArrow from './straightArrow.js';
import RectFlag from './rectFlag.js';
import Sector from './sector.js';
import TrangleFlag from './trangleFlag.js';
import CurveFlag from './curveFlag.js';
import Curve from './curve.js';
import LineStraightArrow from './lineStraightArrow.js';
import "../prompt/prompt.css";
import Prompt from "../prompt/prompt"
class SituationPlot {
  constructor(viewer, opt) {
    this.objId = Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
    this.viewer = viewer;
    this.plotType = "situation";
    if (!opt) opt = {};
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.plotEntity = null;
    this.positions = [];
    this.style = opt.style || {};
    this.state = null;  // 标识当前状态 no startCreate creating endCreate startEdit endEdit editing
    this.gonPointArr = [];
    this.modifyPoint = null;
    this.prompt = new Prompt(viewer, {});
    this.situationType = opt.situationType;
    this.arrowObj = this.getSituationByType(opt.situationType);
    if (!this.arrowObj) return;
    this.minPointNum = this.arrowObj.minPointNum;
    this.polyline = null;
    this.movePush = false;
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
  }

  start(callBack) {
    let that = this;
    this.state = "startCreate";
    this.handler.setInputAction(function (evt) { //单机开始绘制
      let cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
      if (!cartesian) return;
      if (that.positions.length >= that.maxPointNum + 1) return;
      if (that.movePush) {
        that.positions.pop();
        that.movePush = false;
      }
      that.positions.push(cartesian);
      let point = that.createPoint(cartesian);
      point.wz = that.gonPointArr.length;
      that.gonPointArr.push(point);
      console.log("click");
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

      if (that.positions.length > 1 && that.positions.length < that.minPointNum) {
        if (!Cesium.defined(that.polyline)) {
          that.polyline = that.createPolyline();
        }
      }

      if (that.positions.length >= that.minPointNum) {
        if (!Cesium.defined(that.plotEntity)) {
          that.plotEntity = that.createEntity(that.style);
          that.plotEntity.isFilter = true;
          that.plotEntity.objId = that.objId;
          // 移除线
          if (that.polyline) {
            that.viewer.entities.remove(that.polyline);
            that.polyline = null;
          }
        }
      }
      console.log("MOUSE_MOVE");
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.handler.setInputAction(function (evt) {
      if (!that.plotEntity) return;
      let cartesian = that.getCatesian3FromPX(evt.position, that.viewer, [that.plotEntity]);
      if (!cartesian) return;
      if (that.positions.length >= that.minPointNum) { //结束

        if (!that.movePush) { // 双击结束
          that.positions.pop();
          that.movePush = false;
          that.viewer.entities.remove(that.gonPointArr[that.gonPointArr.length - 1]);
          that.gonPointArr.pop();
        } 

        if (that.prompt) {
          that.prompt.destroy();
          that.prompt = null;
        }

       /*  that.positions.push(cartesian);
        let point = that.createPoint(cartesian);
        point.wz = that.gonPointArr.length;
        that.gonPointArr.push(point); */
        that.state = "endCreate";
        that.handler.destroy();
        if (callBack) callBack(that.plotEntity);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  }
  createByPositions(positions, callBack) { //通过传入坐标数组创建面
    if (!positions) return;
    this.state = "startCreate";
    this.positions = positions;
    this.plotEntity = this.createEntity();
    this.plotEntity.objId = this.objId;
    for (let i = 0; i < positions.length; i++) {
      let point = this.createPoint(positions[i]);
      point.isFilter = true;
      point.wz = this.gonPointArr.length;
      this.gonPointArr.push(point);
    }
    this.state = "endCreate";
    if (callBack) callBack(this.plotEntity);
  }
  startEdit() {
    if (this.state == "startEdit" || this.state == "editing" || !this.plotEntity) return;
    this.state = "startEdit";
    if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    let that = this;
    for (let i = 0; i < that.gonPointArr.length; i++) {
      let point = that.gonPointArr[i];
      if (point) point.show = true;
    }
    this.modifyHandler.setInputAction(function (evt) {
      let pick = that.viewer.scene.pick(evt.position);
      if (Cesium.defined(pick) && pick.id) {
        if (!pick.id.objId)
          that.modifyPoint = pick.id;
        that.forbidDrawWorld(true);
      } else {
        for (let i = 0; i < that.gonPointArr.length; i++) {
          let point = that.gonPointArr[i];
          if (point) point.show = false;
        }
        if (that.modifyHandler) {
          that.modifyHandler.destroy();
          that.modifyHandler = null;

        }
        that.state = "editing";
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    this.modifyHandler.setInputAction(function (evt) { //移动时绘制面
      if (that.positions.length < 1 || !that.modifyPoint) return;
      let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer, [that.plotEntity, that.modifyPoint]);
      if (!cartesian) return;
      that.modifyPoint.position.setValue(cartesian);
      that.positions[that.modifyPoint.wz] = cartesian;
      that.state = "editing";
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    this.modifyHandler.setInputAction(function (evt) {
      that.forbidDrawWorld(false);
      if (!that.modifyPoint) return;
      let cartesian = that.getCatesian3FromPX(evt.position, that.viewer, [that.plotEntity, that.modifyPoint]);
      if (!cartesian) return;
      that.modifyPoint.position.setValue(cartesian);
      that.positions[that.modifyPoint.wz] = cartesian;
      that.modifyPoint = null;
      that.forbidDrawWorld(false);
      that.state = "editing";
    }, Cesium.ScreenSpaceEventType.LEFT_UP);
  }
  endEdit(callback) {
    for (let i = 0; i < this.gonPointArr.length; i++) {
      let point = this.gonPointArr[i];
      if (point) point.show = false;
    }
    if (this.modifyHandler) {
      this.modifyHandler.destroy();
      this.modifyHandler = null;
    }
    this.state = "endEdit";
    this.forbidDrawWorld(false);
    if (callback) callback(this.plotEntity);
  }
  createPoint(position) {
    if (!position) return;
    return this.viewer.entities.add({
      position: position,
      point: {
        pixelSize: 5,
        color: Cesium.Color.YELLOW,
        outlineWidth: 2,
        outlineColor: Cesium.Color.DARKRED,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      },
      show: false
    });
  }
  createEntity() {
    let that = this;
    if (this.arrowPlot.hasLine) {
      return this.viewer.entities.add({
        polygon: {
          hierarchy: new Cesium.CallbackProperty(function () {
            let newPosition = that.arrowPlot.startCompute(that.positions);
            if (that.arrowPlot.spliceWZ !== null) {
              newPosition.splice(that.arrowPlot.spliceWZ - 1, 1);
            }
            return new Cesium.PolygonHierarchy(newPosition)
          }, false),
          heightReference: this.style.heightReference == undefined ? 0 : 1,
          material: this.style.material || Cesium.Color.AQUA.withAlpha(.8)
        },
        polyline: {
          positions: new Cesium.CallbackProperty(function () {
            let newPosition = that.arrowPlot.startCompute(that.positions);
            if (that.arrowPlot.lineWZ && that.arrowPlot.lineWZ.length > 0) {
              let arr = [];
              for (let i = 0; i < that.arrowPlot.lineWZ.length; i++) {
                arr.push(newPosition[that.arrowPlot.lineWZ[i] - 1]);
              }
              return arr;
            } else {
              return newPosition;
            }
          }, false),
          material: this.style.material || Cesium.Color.AQUA.withAlpha(.8),
          clampToGround: true,
          width: 3
        }
      });
    } else if (this.arrowPlot.onlyLine) {
      return this.viewer.entities.add({
        polyline: {
          positions: new Cesium.CallbackProperty(function () {
            let newPosition = that.arrowPlot.startCompute(that.positions);
            if (that.arrowPlot.lineWZ && that.arrowPlot.lineWZ.length > 0) {
              let arr = [];
              for (let i = 0; i < that.arrowPlot.lineWZ.length; i++) {
                arr.push(newPosition[that.arrowPlot.lineWZ[i] - 1]);
              }
              return arr;
            } else {
              return newPosition;
            }
          }, false),
          material: this.style.material || Cesium.Color.AQUA.withAlpha(.8),
          clampToGround: true,
          width: 3
        }
      });
    } else {
      return this.viewer.entities.add({
        polygon: {
          hierarchy: new Cesium.CallbackProperty(function () {
            let newPs = that.arrowPlot.startCompute(that.positions);
            return new Cesium.PolygonHierarchy(newPs)
          }, false),
          heightReference: this.style.clampToGround == undefined ? 0 : 1,
          material: this.style.material || Cesium.Color.AQUA.withAlpha(.8)
        }

      });
    }
  }
  createPolyline() {
    let that = this;
    return this.viewer.entities.add({
      polyline: {
        positions: new Cesium.CallbackProperty(function () {
          return that.positions
        }, false),
        material: this.style.material,
        clampToGround: true,
        width: 3
      }
    });
  }
  getPositions(isWgs84) {
    return isWgs84 ? cUtil.cartesiansToLnglats(this.positions) : this.positions;
  }

  // 设置相关样式
  setStyle(style) {
    if (!style) return;
    // 由于官方api中的outline限制太多 此处outline为重新构建的polyline
    if (style.outline) {
      this.polygon.polyline.show = Boolean(style.outline);
      this.polygon.polyline.width = style.outlineWidth;
      this.polygon.polyline.clampToGround = Number(style.heightReference);
      let outlineColor = (style.outlineColor instanceof Cesium.Color) ? style.outlineColor : Cesium.Color.fromCssColorString(style.outlineColor);
      let outlineMaterial = outlineColor.withAlpha(style.outlineColorAlpha || 1);
      this.polygon.polyline.material = outlineMaterial;
    }

    this.polygon.polygon.heightReference = Number(style.heightReference);
    let color = style.color instanceof Cesium.Color ? style.color : Cesium.Color.fromCssColorString(style.color);
    let material = color.withAlpha(style.colorAlpha || 1);
    this.polygon.polygon.material = material;

    if (style.fill != undefined) this.polygon.polygon.fill = style.fill;
    this.style = Object.assign(this.style, style);
  }
  // 获取相关样式
  getStyle() {
    if (!this.polygon) return;
    let obj = {};
    let polygon = this.polygon.polygon;

    obj.outline = this.polygon.polyline.show;
    obj.outlineWidth = this.polygon.polyline.width._value;
    let outlineColor = this.polygon.polyline.material.color.getValue();
    obj.outlineColorAlpha = outlineColor.alpha;
    obj.outlineColor = new Cesium.Color(outlineColor.red, outlineColor.green, outlineColor.blue, 1).toCssHexString();

    obj.fill = polygon.fill.getValue();
    if (polygon.heightReference) obj.heightReference = Number(polygon.heightReference.getValue());

    let color = polygon.material.color.getValue();
    obj.colorAlpha = color.alpha;
    obj.color = new Cesium.Color(color.red, color.green, color.blue, 1).toCssHexString();

    return obj;
  }
  remove() {
    if (this.plotEntity) {
      this.state = "no";
      this.viewer.entities.remove(this.plotEntity);
      this.plotEntity = null;
    }
  }
  setVisible(vis) {
    this.plotEntity.show = vis;
  }
  forbidDrawWorld(isForbid) {
    this.viewer.scene.screenSpaceCameraController.enableRotate = !isForbid;
    this.viewer.scene.screenSpaceCameraController.enableTilt = !isForbid;
    this.viewer.scene.screenSpaceCameraController.enableTranslate = !isForbid;
    this.viewer.scene.screenSpaceCameraController.enableInputs = !isForbid;
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
    if (this.plotEntity) {
      this.viewer.entities.remove(this.plotEntity);
      this.plotEntity = null;
    }
    // 移除线
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
    for (let i = 0; i < this.gonPointArr.length; i++) {
      let point = this.gonPointArr[i];
      this.viewer.entities.remove(point);
    }
    this.gonPointArr = [];
    this.state = 'no';
    if (this.prompt) this.prompt.destroy();
    this.movePush = false;

  }
  getCatesian3FromPX(px, viewer) {
    let picks = viewer.scene.drillPick(px);
    let cartesian;
    let isOn3dtiles = false;
    for (let i = 0; i < picks.length; i++) {
      if ((picks[i] && picks[i].primitive) && picks[i].primitive instanceof Cesium.Cesium3DTileset) { //模型上拾取
        isOn3dtiles = true;
        break;
      }
    }
    if (isOn3dtiles) {
      cartesian = viewer.scene.pickPosition(px);
    } else {
      let ray = viewer.camera.getPickRay(px);
      if (!ray) return null;
      cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    }
    return cartesian;
  }
  getSituationByType(type) {
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
        arrowPlot = new AttackArrow(); //攻击箭头
        minPointNum = 3;
        maxPointNum = 999;
        playObj.canPlay = true;
        playObj.pointNum = 1;
        playObj.pointWZ = [maxPointNum];
        break;
      case 2:
        arrowPlot = new AttackArrowPW(); //攻击箭头平尾
        minPointNum = 3;
        maxPointNum = 999;
        playObj.canPlay = true;
        playObj.pointNum = 1;
        playObj.pointWZ = [maxPointNum];
        break;
      case 3:
        arrowPlot = new AttackArrowYW(); //攻击箭头燕尾
        minPointNum = 3;
        maxPointNum = 999;
        playObj.canPlay = true;
        playObj.pointNum = 1;
        playObj.pointWZ = [maxPointNum];
        break;
      case 4:
        arrowPlot = new CloseCurve(); //闭合曲面
        minPointNum = 3;
        maxPointNum = 999;
        playObj.canPlay = true;
        playObj.pointNum = 1;
        playObj.pointWZ = [maxPointNum];
        break;
      case 5:
        arrowPlot = new DoubleArrow(); //钳击箭头
        minPointNum = 3;  // 最小可为三个点 为做动画效果 故写死为5个点
        maxPointNum = 5;
        playObj.canPlay = true;
        playObj.pointNum = 2;
        playObj.pointWZ = [2, 3];
        break;
      case 6:
        arrowPlot = new FineArrow(); //单尖直箭头
        minPointNum = 2;
        maxPointNum = 2;
        playObj.canPlay = true;
        playObj.pointNum = 1;
        playObj.pointWZ = [maxPointNum];
        break;
      case 7:
        arrowPlot = new FineArrowYW(); //粗单尖直箭头(带燕尾)
        minPointNum = 2;
        maxPointNum = 2;
        playObj.canPlay = true;
        playObj.pointNum = 1;
        playObj.pointWZ = [maxPointNum];
        break;
      case 8:
        arrowPlot = new GatheringPlace(); //集结地
        minPointNum = 3;
        maxPointNum = 3;
        playObj.canPlay = true;
        playObj.pointNum = 1;
        playObj.pointWZ = [maxPointNum];
        break;
      case 9:
        arrowPlot = new Lune(); //弓形面
        minPointNum = 3;
        playObj.canPlay = true;
        maxPointNum = 3;
        playObj.canPlay = true;
        playObj.pointNum = 1;
        playObj.pointWZ = [maxPointNum];
        break;
      case 10:
        arrowPlot = new StraightArrow(); //粗直箭头
        minPointNum = 2;
        maxPointNum = 2;
        playObj.canPlay = true;
        playObj.pointNum = 1;
        playObj.pointWZ = [maxPointNum];
        break;
      case 11:
        arrowPlot = new RectFlag(); //矩形旗
        minPointNum = 2;
        maxPointNum = 2;
        arrowPlot.hasLine = true;
        arrowPlot.lineWZ = [1, 4, 5]; // 线坐标位置
        arrowPlot.spliceWZ = [5]; // 面所需要去除点的坐标位置
        playObj.canPlay = false;
        break;
      case 12:
        arrowPlot = new Sector(); //扇形
        minPointNum = 3;
        maxPointNum = 3;
        playObj.canPlay = false;
        break;
      case 13:
        arrowPlot = new TrangleFlag(); //三角旗
        minPointNum = 2;
        maxPointNum = 2;
        arrowPlot.hasLine = true;
        arrowPlot.lineWZ = [1, 3, 4]; // 线坐标位置
        arrowPlot.spliceWZ = [4]; // 面所需要去除点的坐标位
        playObj.canPlay = false;
        break;
      case 14:
        arrowPlot = new CurveFlag(); //扇形
        minPointNum = 2;
        maxPointNum = 2;
        arrowPlot.hasLine = true;
        arrowPlot.lineWZ = [1, 202, 203]; // 线坐标位置
        arrowPlot.spliceWZ = [203]; // 面所需要去除点的坐标位
        playObj.canPlay = false;
        break;
      case 15:
        arrowPlot = new Curve(); //曲线
        minPointNum = 2;
        maxPointNum = 999;
        arrowPlot.onlyLine = true;
        playObj.canPlay = true;
        break;
      case 16:
        arrowPlot = new LineStraightArrow(); //单线箭头
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
}

export default SituationPlot