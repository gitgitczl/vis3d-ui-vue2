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
  start(callback) {
    let that = this;
    this.state = "startCreate";
    if (!this.prompt && this.promptStyle.show) this.prompt = new Prompt(this.viewer, this.promptStyle);

    this.handler.setInputAction(function (evt) { //单击开始绘制
      let cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
      if (!cartesian) return;
      if (that.positions.length == 2) {
        that.positions.pop();
        let point = that.createPoint(cartesian.clone());
        point.wz = 1;
        that.controlPoints.push(point);
        that.state = "endCreate";
        if (that.prompt) {
          that.prompt.destroy();
          that.prompt = null;
        }
        if (that.handler) {
          that.handler.destroy();
          that.handler = null;
        }

        if (callback) callback(that.azimutht);
      }

      if (!that.polyline) {
        that.polyline = that.createLine(that.positions, true);
        that.polyline.objId = that.objId;
        that.polyline.polyline.width = 6;
        that.polyline.polyline.material = new Cesium.PolylineArrowMaterialProperty(Cesium.Color.YELLOW);
      }

      that.positions.push(cartesian);
      if (that.positions.length == 1) {
        that.mtx = Cesium.Transforms.eastNorthUpToFixedFrame(that.positions[0].clone());
        that.floatLabel = that.createLabel(cartesian, "");
        let point = that.createPoint(cartesian.clone());
        point.wz = 0;
        that.controlPoints.push(point);

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
      } else {
        that.positions[1] = cartesian.clone();
      }

      if (that.floatLabel) {
        that.azimutht = that.getAzimuthtAndCenter(that.mtx, that.positions);
        that.floatLabel.label.text = "方位角：" + that.azimutht.toFixed(2);
      }
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
      if (that.modifyPoint.wz == 0) {
        that.floatLabel.position.setValue(cartesian.clone());
        that.mtx = Cesium.Transforms.eastNorthUpToFixedFrame(that.positions[0].clone());
      }
      that.positions[that.modifyPoint.wz] = cartesian.clone();
      that.azimutht = that.getAzimuthtAndCenter(that.mtx, that.positions);
      that.floatLabel.label.text = "方位角：" + that.azimutht.toFixed(2);
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

