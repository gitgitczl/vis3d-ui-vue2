/**
 * viewer 三维地图对象 必传
 * hasEdit 是否可编辑

 */
import SituationPlot from './situationPlot';
class SituationTool {
  constructor(viewer, obj) {
    this.viewer = viewer;
    this.hasEdit = obj.hasEdit;
    this.toolArr = [];

    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.lastSelectEntity = null;
    // 属性编辑设置
    this.editAttr = null;
    if (this.hasEdit) {
      this.bindEdit();
    }

    this.endCreateFun = null; // 结束创建
    this.startEditFun = null; // 开始编辑
    this.endEditFun = null; // 结束编辑

  }

  // 事件绑定
  on(type, fun) {
    if (!type) return;
    switch (type) {
      case "endCreate":
        this.endCreateFun = fun;
        break;
      case "startEdit":
        this.startEditFun = fun;
        break;
      case "endEdit":
        this.endEditFun = fun;
        break;
      default: ;
    }
  }

  /**
   * type值及对应的类型：
   *  	1-攻击箭头 2-攻击箭头（平尾）3-攻击箭头（燕尾）4-闭合曲面 5-钳击箭头 
   * 		6-单尖直箭头 7-粗单尖直箭头(带燕尾) 8-集结地 9-弓形面 10-直箭头 
   * 		11-矩形旗 12-扇形 13-三角旗 14-矩形波浪旗 17-多边形 18-圆形
   */
  start(opt) {
    if (!opt.type) {
      console.warn("未传入态势标绘类型！");
      return;
    }
    if (!this.isEnd()) {
      console.warn("前一次标绘未结束！");
      return;
    }

    let arrow = new SituationPlot(this.viewer, {
      situationType: opt.type,
      style: opt.style
    });

    if (opt.success) opt.success(arrow); // 绘制成功后
    let that = this;
    arrow.start(function (ent) {
      if (that.endCreateFun) that.endCreateFun(arrow, ent)
      that.toolArr.push(arrow);
    });
  }
  // 获取当前标记的内容 供保存到本地
  getAllData() {
    var jsonData = {
      toolArr: []
    };
    if (!this.toolArr || this.toolArr.length < 1) return jsonData;
    for (var i = 0; i < this.toolArr.length; i++) {
      var item = this.toolArr[i];
      var obj = {};
      obj.situationType = item.situationType;
      obj.positions = item.positions;
      obj.attr = item.getAttr();
      obj.
        jsonData.toolArr.push(obj);
    }
    return jsonData;
  }
  drawByData(opt) {
    if (!opt.situationType || !opt.positions) return;
    let arrow = new SituationPlot(this.viewer, {
      situationType: item.situationType
    });
    let that = this;
    arrow.createByPositions(opt.positions, function (ent) {
      if (that.endCreateFun) that.endCreateFun(arrow, ent)
      that.toolArr.push(arrow);
    });
    if (opt.color) arrow.setColor(opt.color);
    if (opt.success) opt.success(arrow);
  }
  // 判断上次标绘 是否结束
  isEnd() {
    var end = false;
    if (this.toolArr[this.toolArr.length - 1]
      && (
        this.toolArr[this.toolArr.length - 1].state == "endCreate"
        || this.toolArr[this.toolArr.length - 1].state == "endEdit")) {
      end = true;
    }
    if (this.toolArr.length == 0) {
      end = true;
    }
    return end;
  }
  destroy() {
    this.unbindEdit();
    for (var i = 0; i < this.toolArr.length; i++) {
      var obj = this.toolArr[i];
      obj.destroy();
    }
    this.toolArr = [];

    if (this.handler) {
      this.handler.destroy();
      this.handler = null;
    }

  }
  bindEdit() {
    var that = this;
    this.handler.setInputAction(function (evt) { //单机开始绘制
      var pick = that.viewer.scene.pick(evt.position);
      if (Cesium.defined(pick) && pick.id) {
        for (var i = 0; i < that.toolArr.length; i++) {
          if (
            pick.id.objId == that.toolArr[i].objId &&
            (that.toolArr[i].state != "startCreate" ||
              that.toolArr[i].state != "creating" ||
              that.toolArr[i].state != "endEdit")
          ) {
            if (that.lastSelectEntity) {
              that.lastSelectEntity.endEdit();
            }
            that.nowEditObj = that.toolArr[i];
            that.toolArr[i].startEdit();
            that.lastSelectEntity = that.toolArr[i];
            break;
          }
        }
      } else {
        if (that.endEditFun) that.endEditFun(that.nowEditObj, that.lastSelectEntity);
        that.unbindEdit();
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
  unbindEdit() {
    for (var i = 0; i < this.toolArr.length; i++) {
      this.toolArr[i].endEdit();
    }
  }
  clearById(objId) {
    var index = -1;
    if (!objId) return;
    for (var i = 0; i < this.toolArr.length; i++) {
      if (objId == this.toolArr[i].objId && (this.toolArr[i].state == 1 || this.toolArr[i].state == 2)) {
        this.toolArr[i].destroy();
        index = i;
        break;
      }
    }
    if (index != -1) this.toolArr.splice(index, 1)
  }

}

export default SituationTool;