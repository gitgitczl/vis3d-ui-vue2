//方位角测量js
import BaseMeasure from "./baseMeasure";
import '../prompt/prompt.css'
import Prompt from '../prompt/prompt.js'
class MeasureAzimutht extends BaseMeasure {
  constructor(viewer, opt) {
    super(viewer, opt);
    this.style = opt.style || {};
    //线
    this.polyline = null;
    this.floatLabel = null;
    this.positions = [];
    this.mtx = null;
    this.azimutht = null;
  }

  //开始测量
  start(fun) {
    let that = this;
    this.state = "startCreate";
    if (!this.prompt) this.prompt = new Prompt(viewer, { offset: { x: 30, y: 30 } });
    this.handler.setInputAction(function (evt) { //单击开始绘制
      let cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
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
      let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
      if (!cartesian) return;

      if (that.positions.length < 2) {
        that.positions.push(cartesian.clone());
      }else{
        that.positions[1] = cartesian.clone();
      }

      if (that.floatLabel) {
        that.azimutht = that.getAzimuthtAndCenter(that.mtx, that.positions);
        that.floatLabel.label.text = "方位角：" + that.azimutht.toFixed(2);
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
}

export default MeasureAzimutht;

