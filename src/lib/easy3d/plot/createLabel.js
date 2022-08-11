import '../prompt/prompt.css'
import Prompt from '../prompt/prompt.js'
import BasePlot from './basePlot';
import cUtil from "../cUtil"
class CreateLabel extends BasePlot {
  constructor(viewer, style) {
    super(viewer, style);
    this.type = "label";
    this.objId = Number(
      new Date().getTime() + "" + Number(Math.random() * 1000).toFixed(0)
    );
    this.viewer = viewer;
    this.style = style;
    this.position = null;
  }


  start(callBack) {
    if (!this.prompt && this.promptStyle.show)
      this.prompt = new Prompt(this.viewer,this.promptStyle);
    let that = this;
    this.state = "startCreate";
    this.handler.setInputAction(function (evt) {
      //单击开始绘制
      let cartesian = that.getCatesian3FromPX(evt.position, that.viewer);
      if (!cartesian) return;
      that.prompt.update(evt.position, `
        <ul class="label-context-${that.objId}" objId="${that.objId}">
          <li>名称：<input type="text" objId="${that.objId}" id="label-name-${that.objId}" /></li>
          <li>
              <input type="button" value="确定" objId="${that.objId}" id="label-confirm-${that.objId}"/>
              <input type="button" value="取消" objId="${that.objId}" id="label-reset-${that.objId}"/>
          </li>
        <ul>
      `);
      // 事件绑定
      let confirmBtn = document.getElementById(`label-confirm-${that.objId}`);
      let resetBtn = document.getElementById(`label-reset-${that.objId}`);
      confirmBtn.addEventListener("click", function () {
        let objId = confirmBtn.getAttribute("objId");
        const inputName = document.getElementById(`label-name-${objId}`);
        const labelName = inputName.innerText();
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
        let objId = resetBtn.getAttribute("objId");
        that.destroy();
      });


    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.handler.setInputAction(function (evt) {
      //单击开始绘制
      that.prompt.update(evt.endPosition, "单击新增");
      that.state = "startCreate";
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }



  createByPositions(lnglatArr, callBack) {
    if (!lnglatArr) return;
    this.state = "startCreate";
    let position =
      lnglatArr instanceof Cesium.Cartesian3
        ? lnglatArr
        : Cesium.Cartesian3.fromDegrees(
          lnglatArr[0],
          lnglatArr[1],
          lnglatArr[2]
        );
    this.position = position;
    if (!position) return;
    this.entity = this.createLabel(position, this.style.text);
    if (callBack) callBack(this.entity);
    this.state = "endCreate";
  }

  // 设置相关样式
  setStyle(style) {
    if (!style) return;
    if (style.fillColor) {
      let fillColor =
        style.fillColor instanceof Cesium.Color
          ? style.fillColor
          : Cesium.Color.fromCssColorString(style.fillColor || "#ffff00");
      fillColor = fillColor.withAlpha(style.fillColorAlpha || 1);
      this.entity.label.fillColor = fillColor;
    }

    this.entity.label.outlineWidth = style.outlineWidth;

    if (style.backgroundColor) {
      let backgroundColor =
        style.backgroundColor instanceof Cesium.Color
          ? style.backgroundColor
          : Cesium.Color.fromCssColorString(style.backgroundColor || "#000000");
      backgroundColor = backgroundColor.withAlpha(
        style.backgroundColorAlpha || 1
      );
      this.entity.label.backgroundColor = backgroundColor;
    }

    if (style.heightReference != undefined)
      this.entity.label.heightReference = Number(style.heightReference);
    if (style.pixelOffset) this.entity.label.pixelOffset = style.pixelOffset;

    if (style.text) this.entity.label.text = style.text;

    if (style.showBackground != undefined)
      this.entity.label.showBackground = Boolean(style.showBackground);

    this.style = Object.assign(this.style, style);
  }
  // 获取相关样式
  getStyle() {
    let obj = {};
    let label = this.entity.label;

    let fillColor = label.fillColor.getValue();
    obj.fillColorAlpha = fillColor.alpha;
    obj.fillColor = new Cesium.Color(
      fillColor.red,
      fillColor.green,
      fillColor.blue,
      1
    ).toCssHexString();

    obj.outlineWidth = label.outlineWidth._value;

    let backgroundColor = label.backgroundColor.getValue();
    obj.backgroundColorAlpha = backgroundColor.alpha;
    obj.backgroundColor = new Cesium.Color(
      backgroundColor.red,
      backgroundColor.green,
      backgroundColor.blue,
      1
    ).toCssHexString();

    obj.showBackground = Boolean(label.showBackground.getValue());

    if (label.heightReference != undefined)
      obj.heightReference = label.heightReference.getValue();
    obj.pixelOffset = label.pixelOffset;

    obj.text = label.text.getValue();
    return obj;
  }
  getPositions(isWgs84) {
    return isWgs84 ? cUtil.cartesianToLnglat(this.position) :this.position ;
  }

  startEdit() {
    if (this.state == "startEdit" || this.state == "editing" || !this.entity)
      return;
    this.state = "startEdit";
    if (!this.modifyHandler)
      this.modifyHandler = new Cesium.ScreenSpaceEventHandler(
        this.viewer.scene.canvas
      );
    let that = this;
    let editLabel;
    this.modifyHandler.setInputAction(function (evt) {
      let pick = that.viewer.scene.pick(evt.position);
      if (Cesium.defined(pick) && pick.id) {
        editLabel = pick.id;
        that.forbidDrawWorld(true);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    this.modifyHandler.setInputAction(function (evt) {
      if (!editLabel) return;
      let cartesian = that.getCatesian3FromPX(evt.endPosition, that.viewer);
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
  endEdit(callback) {
    if (this.modifyHandler) {
      this.modifyHandler.destroy();
      this.modifyHandler = null;
      if (callback) callback(this.entity);
    }
    this.forbidDrawWorld(false);
    this.state = "endEdit";
  }
  createLabel(cartesian, text) {
    if (!cartesian) return;
    let label = this.viewer.entities.add({
      position: cartesian,
      label: {
        text: text || "",
        fillColor: this.style.fillColor
          ? Cesium.Color.fromCssColorString(this.style.fillColor).withAlpha(
            this.style.fillColorAlpha || 1
          )
          : Cesium.Color.WHITE,
        backgroundColor: this.style.backgroundColor
          ? Cesium.Color.fromCssColorString(
            this.style.backgroundColor
          ).withAlpha(this.style.backgroundColorAlpha || 1)
          : Cesium.Color.WHITE,
        style: Cesium.LabelStyle.FILL,
        outlineWidth: this.style.outlineWidth || 4,
        scale: this.style.scale || 1,
        pixelOffset: this.style.pixelOffset || Cesium.Cartesian2.ZERO,
        showBackground: this.style.showBackground,
        heightReference: this.style.heightReference || 0,
      },
    });
    label.objId = this.objId;
    return label;
  }

};

export default CreateLabel;
