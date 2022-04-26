import '../prompt/prompt.css'
import Prompt from '../prompt/prompt.js'
import BasePlot from './basePlot';
class CreateGltfModel extends BasePlot {
  constructor(viewer, style) {
    super(viewer,style);
    style = style || {};
    this.viewer = viewer;
    if (!style.modelUri) {
      console.warn("请输入模型地址！");
      return;
    }

    let defaultStyle = {
      heading: 0,
      pitch: 0,
      roll: 0,
      minimumPixelSize: undefined,
      maximumScale: undefined
    }
    this.style = Object.assign(defaultStyle, style || {});

    this.modelUri = style.modelUri || "../gltf/weixin.gltf";
    this.entity = null;
  }

  start(callBack) {
    if (!this.prompt) this.prompt = new Prompt(viewer, { offset: { x: 30, y: 30 } });
    this.state = "startCreate";

    let that = this;
    this.handler.setInputAction(function (evt) { //单击开始绘制
      let cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
      if (cartesian) {
        that.gltfModel.position = cartesian;
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
      if (callBack) callBack(that.gltfModel);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.setInputAction(function (evt) { //单击开始绘制
      that.prompt.update(evt.endPosition, "单击新增");
      let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer, [that.gltfModel]);
      if (!cartesian) return;
      if (!that.gltfModel) {
        that.entity = that.createGltfModel(cartesian.clone());
      } else {
        that.gltfModel.position = cartesian;
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }
  createByPositions(lnglatArr, callBack) {
    if (!lnglatArr) return;
    this.state = "startCreate";
    if (lnglatArr instanceof Cesium.Cartesian3) {
      this.position = lnglatArr;
    } else {
      this.position = Cesium.Cartesian3.fromDegrees(lnglatArr[0], lnglatArr[1], lnglatArr[2]);
    }
    this.entity = this.createGltfModel(this.position);
    callBack(this.gltfModel);
    this.state = "endCreate";
  }
  startEdit() {
    if (this.state == "startEdit" || this.state == "editing") return; //表示还没绘制完成
    if (!this.modifyHandler) this.modifyHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    let that = this;
    let eidtModel;
    this.state = "startEdit";
    this.modifyHandler.setInputAction(function (evt) {
      let pick = that.viewer.scene.pick(evt.position);
      if (Cesium.defined(pick) && pick.id) {
        eidtModel = pick.id;
        that.forbidDrawWorld(true);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    this.modifyHandler.setInputAction(function (evt) {
      if (!eidtModel) return;
      let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer, [that.gltfModel]);
      if (!cartesian) return;
      if (that.gltfModel) {
        that.gltfModel.position.setValue(cartesian);
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
  endEdit(callback) {
    if (this.modifyHandler) {
      this.modifyHandler.destroy();
      this.modifyHandler = null;
      if (callback) callback(this.gltfModel);
    }
    this.forbidDrawWorld(false);
    this.state = "endEdit";
  }
  createGltfModel(cartesian) {
    if (!cartesian) return;
    let heading = Cesium.Math.toRadians(this.style.heading);
    let pitch = Cesium.Math.toRadians(this.style.pitch);
    let roll = Cesium.Math.toRadians(this.style.roll);
    let hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    let orientation = Cesium.Transforms.headingPitchRollQuaternion(cartesian, hpr);
    let entity = viewer.entities.add({
      position: cartesian,
      orientation: orientation,
      model: {
        uri: this.modelUri,
        minimumPixelSize: this.style.minimumPixelSize,
        maximumScale: this.style.maximumScale,
        scale: this.style.scale || 1
      }
    });
    entity.objId = this.objId;
    return entity;
  }
  getPositions(isWgs84) {
    return isWgs84 ? cUtil.cartesianToLnglat(this.position) : this.position
  }
  getStyle() {
    let obj = {};
    let model = this.gltfModel.model;
    obj.minimumPixelSize = model.minimumPixelSize.getValue();
    let orientation = this.gltfModel.orientation.getValue();
    let hpr = cUtil.oreatationToHpr(this.gltfModel.position.getValue(), orientation, true) || {};
    obj.heading = hpr.heading || 0;
    obj.pitch = hpr.pitch || 0;
    obj.roll = hpr.roll || 0;
    obj.scale = model.scale.getValue();
    return obj;
  }
  setStyle(style) {
    if (!style) return;
    this.setOrientation(style.heading, style.pitch, style.roll);
    if (style.minimumPixelSize != undefined) this.gltfModel.model.image = style.minimumPixelSize;
    if (style.minimumPixelSize != undefined) this.gltfModel.model.maximumScale = style.maximumScale;
    if (style.minimumPixelSize != undefined) this.gltfModel.model.scale = style.scale;
    this.style = Object.assign(this.style, style);
  }
  remove() {
    if (this.gltfModel) {
      this.state = "no";
      this.viewer.entities.remove(this.gltfModel);
      this.entity = null;
    }
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
    if (this.gltfModel) {
      this.viewer.entities.remove(this.gltfModel);
      this.entity = null;
    }
    this.style = null;
    if (this.prompt) {
      that.prompt.destroy();
      this.prompt = null;
    }
  }

}

export default CreateGltfModel;