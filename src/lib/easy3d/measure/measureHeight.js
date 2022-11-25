//高度测量js
import BaseMeasure from "./baseMeasure";
import '../prompt/prompt.css'
import Prompt from '../prompt/prompt.js'
class MeasureHeight extends BaseMeasure {
  constructor(viewer, opt) {
    super(viewer, opt);
    if (!opt) opt = {};
    this.unitType = "length";
    this.style = opt.style || {};
    this.viewer = viewer;
    this.polyline = null;
    this.floatLabel = null;
    this.positions = [];
  }

  //开始测量
  start(callback) {
    if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt(this.viewer, this.promptStyle);
    this.state = "startCreate";
    let that = this;
    this.handler.setInputAction(function (evt) { //单击开始绘制
      that.state = "creating"
      var cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
      if (!cartesian) return;

      if (that.positions.length == 2) {
        that.positions[1] = cartesian.clone();
        if (that.handler) {
          that.handler.destroy();
          that.handler = null;
        }
        if (that.prompt) {
          that.prompt.destroy();
          that.prompt = null;
        }
        let point = that.createPoint(cartesian.clone());
        point.wz = 1;
        that.controlPoints.push(point);
        that.state = "endCreate";
        if (callback) callback();
      } else {
        that.polyline = that.createLine(that.positions, false);
        that.polyline.objId = that.objId;
        if (!that.floatLabel) that.floatLabel = that.createLabel(cartesian.clone(), "");
        that.positions.push(cartesian.clone());
        let point = that.createPoint(cartesian.clone());
        point.wz = 0;
        that.controlPoints.push(point);
      }

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.handler.setInputAction(function (evt) {
      let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
      that.state = "creating"
      if (that.positions.length < 1) {
        that.prompt.update(evt.endPosition, "单击开始测量");
        return;
      }
      that.prompt.update(evt.endPosition, "单击结束");
      if (!cartesian) return;
      if (that.positions.length < 2) {
        that.positions.push(cartesian.clone());
      } else {
        that.positions[1] = cartesian.clone();
      }

      let heightAndCenter = that.getHeightAndCenter(that.positions[0], that.positions[1]);
      let text = that.formateLength(heightAndCenter.height, that.unit);
      that.floatLabel.label.text = "高度差：" + text;
      that.floatLabel.length = heightAndCenter.height;
      if (heightAndCenter.center) that.floatLabel.position.setValue(heightAndCenter.center);
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  startEdit(callback) {
    if (!((this.state == "endCrerate" || this.state == "endEdit") && this.polyline)) return;
    this.state = "startEdit";;
    if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    let that = this;
    for (let i = 0; i < that.controlPoints.length; i++) {
      let point = that.controlPoints[i];
      if (point) point.show = true;
    }
    this.modifyHandler.setInputAction(function (evt) {
      let pick = that.viewer.scene.pick(evt.position);
      if (Cesium.defined(pick) && pick.id) {
        if (!pick.id.objId)
          that.modifyPoint = pick.id;
        that.forbidDrawWorld(true);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    this.modifyHandler.setInputAction(function (evt) {
      if (that.positions.length < 1 || !that.modifyPoint) return;
      let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
      if (!cartesian) return;
      that.modifyPoint.position.setValue(cartesian.clone());

      that.positions[that.modifyPoint.wz] = cartesian.clone();
      let heightAndCenter = that.getHeightAndCenter(that.positions[0], that.positions[1]);
      let text = that.formateLength(heightAndCenter.height, that.unit);
      that.floatLabel.label.text = "高度差：" + text;
      that.floatLabel.length = heightAndCenter.height;
      if (heightAndCenter.center) that.floatLabel.position.setValue(heightAndCenter.center);

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

  endEdit() {
    let that = this;
    this.state = "endEdit";;
    if (this.modifyHandler) {
      this.modifyHandler.destroy();
      this.modifyHandler = null;
    }
    for (let i = 0; i < that.controlPoints.length; i++) {
      let point = that.controlPoints[i];
      if (point) point.show = false;
    }
  }

  //清除测量结果
  destroy() {
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
  getHeightAndCenter(p1, p2) {
    if (!p1 || !p2) return;
    var cartographic1 = Cesium.Cartographic.fromCartesian(p1);
    var cartographic2 = Cesium.Cartographic.fromCartesian(p2);
    var height = Math.abs(cartographic1.height - cartographic2.height);
    return {
      height: height,
      center: Cesium.Cartesian3.midpoint(p1, p2, new Cesium.Cartesian3())
    };
  }

  setUnit(unit) {
    let text = this.formateLength(this.floatLabel.length, unit);
    this.floatLabel.label.text = "高度差：" + text;
    this.unit = unit;
  }
}

export default MeasureHeight;