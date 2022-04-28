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
    this.bindEdit();
    this.bindRemove();
    this.canEdit = obj.canEdit == undefined ? true : obj.canEdit;; // 是否可以编辑
    this.endCreateFun = null; // 结束创建
    this.startEditFun = null; // 开始编辑
    this.endEditFun = null; // 结束编辑
    this.intoEdit = null;
    this.deletePrompt = null;
    this.deleteEntityObj = null;
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
    this.intoEdit = opt.intoEdit == undefined ? true : opt.intoEdit; // 绘制完成后 是否直接进入编辑（能否进入编辑 还得看 canEdit属性）
    let arrow = new SituationPlot(this.viewer, {
      situationType: opt.type,
      style: opt.style
    });
    let that = this;
    arrow.start(function (ent) {
      if (opt.success) opt.success(arrow); // 绘制成功后
      if (that.endCreateFun) that.endCreateFun(arrow, ent)
      if(that.canEdit && that.intoEdit){
        arrow.startEdit(); 
      }
      that.toolArr.push(arrow);
      
    });
  }

  canEdit(isOpen) {
    this.canEdit = isOpen;
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

  // 绑定编辑
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
  // 绑定移除
  bindRemove() {
    let that = this;
    function remove(px) {
      // 构建右键删除鼠标提示
      if (that.deletePrompt) {
        that.deletePrompt.destroy();
        that.deletePrompt = null;
      }
      that.deletePrompt = new Prompt(viewer, {
        content: "<span id='deleteEntity' style='cursor: pointer;'>删除</span>",
        show: true,
        offset: {
          x: 60,
          y: 60,
        },
      });
      let deleteDom = document.getElementById("deleteEntity");
      that.deletePrompt.update(px);
      deleteDom.addEventListener("click", function () {
        // 删除当前对象前 结束之前的编辑
        that.endEdit();
        // 删除事件
        that.deletePrompt.destroy();
        if (!that.deleteEntityObj || that.deleteEntityObj == {}) return;
        let entObj = that.deleteEntityObj.entityObj;
        if (that.removeFun) {
          that.removeFun(entObj, entObj.getEntity());
        }
        entObj.destroy();
        that.toolArr.splice(that.deleteEntityObj.index, 1);
      });
    }

    this.removeHandler.setInputAction(function (evt) {
      //右键取消上一步
      if (!that.canEdit) return;
      // 右键点击当前目标外 销毁提示框
      if (that.deletePrompt) {
        that.deletePrompt.destroy();
        that.deletePrompt = null;
      }
      let pick = that.viewer.scene.pick(evt.position);
      if (Cesium.defined(pick) && pick.id) {
        // 选中实体
        for (let i = 0; i < that.toolArr.length; i++) {
          if (
            pick.id.objId == that.toolArr[i].objId &&
            (that.toolArr[i].state == "endCreate" ||
              that.toolArr[i].state == "startEdit" ||
              that.toolArr[i].state == "endEdit")
          ) {
            // 结束编辑或结束构建才给删
            that.deleteEntityObj = {
              entityObj: that.toolArr[i],
              index: i,
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