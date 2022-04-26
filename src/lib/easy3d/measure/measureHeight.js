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
    this.height = 0;
  }

  //开始测量
  start() {
    if (!this.prompt) this.prompt = new Prompt(viewer, { offset: { x: 30, y: 30 } });
    this.status = "startCreate";
    let that = this;
    this.handler.setInputAction(function (evt) { //单击开始绘制
      that.status = "creating"
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
        that.status = "endCreate";
      }

      that.positions.push(cartesian);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.handler.setInputAction(function (evt) {
      let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
      if (!cartesian) return;

      that.status = "creating"
      if (that.positions.length < 1) {
        that.prompt.update(evt.endPosition, "单击开始测量");
        return;
      } else {
        that.prompt.update(evt.endPosition, "单击结束");

        if (that.positions.length == 2 && !Cesium.defined(that.polyline)) {
          that.polyline = that.createLine(that.positions, false);
          if (!that.floatLabel) that.floatLabel = that.createLabel(cartesian, "");
        }

        let heightAndCenter = that.getHeightAndCenter(that.positions[0], that.positions[1]);
        let text = that.formateLength(heightAndCenter.height,that.unit);
        that.height = heightAndCenter.height;
        that.floatLabel.label.text = "高度差：" + text;
        that.floatLabel.length = heightAndCenter.height;
        if (heightAndCenter.center) that.floatLabel.position.setValue(heightAndCenter.center);

      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
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

    this.status = "no";
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