/* 以下构建属性 均是在geojson的基础上进行拓展的
    如构建properties：
    properties
 */
import '../prompt/prompt.css'
import Prompt from '../prompt/prompt.js'
import CreateBillboard from './createBillboard.js'
import CreateCircle from './createCircle.js'
import CreateGltfModel from './createGltfModel.js'
import CreateLabel from './createLabel.js'
import CreatePoint from './createPoint.js'
import CreatePolygon from './createPolygon.js'
import CreateRectangle from './createRectangle'
import CreatePolyline from './createPolyline.js'
import CreateArrow from "./createArrow";
import cUtil from '../cUtil.js'
class DrawTool {
  constructor(viewer, obj) {
    if (!viewer) {
      console.warn("缺少必要参数！--viewer");
      return;
    }
    obj = obj || {};
    this.viewer = viewer;
    this.toolArr = [];
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.removeHandler = new Cesium.ScreenSpaceEventHandler(
      this.viewer.scene.canvas
    );
    this.show = obj.drawEndShow == undefined ? true : obj.drawEndShow;
    this.nowEditObj = null; // 当前编辑对象

    this.startEditFun = null;
    this.endEditFun = null;
    this.removeFun = null;

    this.deleteEntityObj = null;

    // 无论如何 进来先监听点击修改 与 右键删除事件 通过控制canEdit来判断要不要向下执行
    this.bindEdit();
    this.bindRemove();
    this.deletePrompt = null;
    this.canEdit = obj.canEdit == undefined ? true : obj.canEdit;; // 是否可以编辑
    this.intoEdit = null;
    this.lastSelectEntity = null;
    this.lastStartEntityObj = null;
  }
  // 相关事件绑定
  on(type, fun) {
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
    } else {
    }
  }
  canEdit(isOpen) {
    this.canEdit = isOpen;
  }
  start(opt) {
    if (!opt || !opt.type) {
      return;
    }
    let that = this;
    this.intoEdit = opt.intoEdit == undefined ? true : opt.intoEdit; // 绘制完成后 是否直接进入编辑（能否进入编辑 还得看 canEdit属性）
    this.endEdit(); // 绘制前  结束编辑

    if (this.lastStartEntityObj && this.lastStartEntityObj.state == "startCreate") { // 禁止一次绘制多个
      this.lastStartEntityObj.destroy();
      this.lastStartEntityObj = null;
    }
    let entityObj = this.createByType(opt);

    if (!entityObj) return;
    // 开始绘制
    entityObj.start(function (entity) {
      // endCreateFun 和 success 无本质区别，若构建时 两个都设置了 当心重复
      if (opt.success) opt.success(entityObj, entity);
      if (that.endCreateFun) that.endCreateFun(entityObj, entity);

      if (that.show == false) entityObj.setVisible(false);

      // 如果可以编辑 则绘制完成打开编辑
      if (that.canEdit && that.intoEdit) {
        entityObj.startEdit();
        if (that.startEditFun) that.startEditFun(entityObj, entity);
        that.lastSelectEntity = entityObj;
      }
      entityObj.attr = opt || {};
      that.toolArr.push(entityObj);
    });

    this.lastStartEntityObj = entityObj;
    return entityObj;
  }
  end() {
    if (this.lastStartEntityObj && this.lastStartEntityObj.state == "startCreate") { // 禁止一次绘制多个
      this.lastStartEntityObj.destroy();
      this.lastStartEntityObj = null;
    }
    this.endEdit();
  }
  // 取消当前的状态
  cancel() {
    if (this.lastStartEntityObj && (this.lastStartEntityObj.state != "endCreate" || this.lastStartEntityObj.state != "endEdit")) {
      this.lastStartEntityObj.destroy();
      this.lastStartEntityObj = null;
    }
  }
  // 开始编辑某个
  startEditOne(entityObj) {
    if (!this.canEdit) return;

    if (this.lastSelectEntity) {
      // 结束除当前选中实体的所有编辑操作
      this.lastSelectEntity.endEdit();
      if (this.endEditFun) {
        this.endEditFun(this.lastSelectEntity, this.lastSelectEntity.getEntity()); // 结束事件
      }
      this.lastSelectEntity = null;
    }
    if (entityObj) {
      entityObj.startEdit();
      if (this.startEditFun)
        this.startEditFun(entityObj, entityObj.getEntity());
      this.lastSelectEntity = entityObj;
    }
  }
  // 修改某个的样式
  updateOneStyle(entityObj, style) {
    if (entityObj) {
      entityObj.setStyle(style);
    }
  }
  // 根据坐标来创建
  createByPositions(opt) {
    opt = opt || {};
    if (!opt) opt = {};
    let that = this;
    let entityObj = this.createByType(opt);
    if (!entityObj) return;

    entityObj.createByPositions(opt.positions, function (entity) {
      entityObj.setStyle(opt.style); // 设置相关样式
      // endCreateFun 和 success 无本质区别，若构建时 两个都设置了 当心重复
      if (opt.success) opt.success(entityObj, entity);
      if (that.endCreateFun) that.endCreateFun(entityObj, entity);
      if (that.show == false) entityObj.setVisible(false);

      // 如果可以编辑 则绘制完成打开编辑 
      if (that.canEdit && that.intoEdit) {
        entityObj.startEdit();
        if (that.startEditFun) that.startEditFun(entityObj, entity);
        that.lastSelectEntity = entityObj;
      }
    });
    this.toolArr.push(entityObj);
    return entityObj;
  }
  // 根据geojson构建entity
  createByGeojson(json, style) {
    let that = this;
    // 实际构建方法
    function create(properties, positions) {
      that.createByPositions({
        type: properties.type || "point",
        style: properties.style || {},
        positions: positions,
        properties: properties,
      });
    }
    // 解析json数据
    json = json || {};
    let features = json.features;
    if (!features || features.length < 1) return;
    for (let index = 0; index < features.length; index++) {
      let feature = features[index];

      let type = feature.geometry.type;
      let properties = feature.properties;
      let coordinates = feature.geometry.coordinates;
      switch (type) {
        case "Point": // 当geojson是单点时  可能创建点 图标点 单个模型
          let position = cUtil.lnglatToCartesian(coordinates);
          // 构建单点
          properties.type = "point";
          create(properties, position);
          break;
        case "MultiPoint":
          for (let i = 0; i < coordinates.length; i++) {
            let position = cUtil.lnglatToCartesian(coordinates);
            // 构建单点
            properties.type = "point";
            create(properties, position);
          }
          break;
        case "LineString":
          properties.type = "polyline";
          create(properties, cUtil.lnglatsToCartesians(coordinates));
          // 构建折线
          break;
        case "MultiLineString":
          for (let i = 0; i < coordinates.length; i++) {
            let coor = coordinates[i];
            // 构建折线
            properties.type = "polyline";
            create(properties, cUtil.lnglatsToCartesians(coor));
          }
          break;
        case "Polygon":
          properties.type = "polygon";
          properties.style = style || {
            fill: true,
            heightReference: 1,
            color: "rgba(0,255,255,0.5)",
          };
          create(properties, cUtil.lnglatsToCartesians(coordinates[0]));
          // 构建面
          break;
        case "MultiPolygon":
          for (let i = 0; i < coordinates.length; i++) {
            let coor = coordinates[i][0];
            properties.type = "polygon";
            properties.style = style || {
              fill: true,
              heightReference: 1,
              color: "rgba(0,255,255,0.5)",
            };
            create(properties, cUtil.lnglatsToCartesians(coor));
          }
          break;
        default:
      }
    }
  }
  // 转为geojson
  toGeojson() {
    let json = {
      type: "FeatureCollection",
      features: [],
    };
    for (let i = 0; i < this.toolArr.length; i++) {
      let item = this.toolArr[i];
      let properties = item.getAttribute() || {};
      let style = item.getStyle();
      properties.style = style; // 将样式属性也存入properties
      properties.geojsonType = item.geojsonType;
      properties.type = item.type;
      coordinates = item.getPositions(true);
      if (item.geojsonType == "Polygon") {
        coordinates = [coordinates];
      }

      let feature = {
        type: "Feature",
        geometry: {
          type: item.geojsonType,
          coordinates: coordinates,
        },
        properties: properties,
      };
      json.features.push(feature);
    }
    return json;
  }
  destroy() {
    for (let i = 0; i < this.toolArr.length; i++) {
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
  removeOne(entityObj) {
    if (!entityObj) return;
    this.removeById(entityObj.objId);
  }
  removeAll() {
    for (let i = 0; i < this.toolArr.length; i++) {
      let obj = this.toolArr[i];
      obj.destroy();
    }
    this.toolArr = [];
    this.nowEditObj = null;
  }
  // 是否包含某个对象
  hasEntityObj(entityObj) {
    if (!entityObj) return false;
    let obj = this.getEntityObjById(entityObj.objId);
    return obj != {} ? true : false;
  }
  removeById(id) {
    let obj = this.getEntityObjById(id);
    this.toolArr.splice(obj.index, 1);
    // 触发on绑定的移除事件
    if (this.removeFun)
      this.removeFun(obj.entityObj, obj.entityObj.getEntity());
    if (obj.entityObj) {
      obj.entityObj.destroy();
    }
  }
  locateById(id) {
    let obj = this.getEntityObjById(id);
    if (obj.entityObj) {
      obj.entityObj.locate();
    }
  }
  getEntityObjById(id) {
    if (!id) return;
    let obj = {};
    for (let i = 0; i < this.toolArr.length; i++) {
      let item = this.toolArr[i];
      if (item.objId == id) {
        obj.entityObj = item;
        obj.index = i;
        break;
      }
    }
    return obj;
  }

  // 绑定编辑
  bindEdit() {
    let that = this;
    // 如果是线 面 则需要先选中
    this.handler.setInputAction(function (evt) {
      //单击开始绘制
      if (!that.canEdit) return;
      let pick = that.viewer.scene.pick(evt.position);
      if (Cesium.defined(pick) && pick.id) {
        // 选中实体
        for (let i = 0; i < that.toolArr.length; i++) {
          if (
            pick.id.objId == that.toolArr[i].objId &&
            (that.toolArr[i].state != "startCreate" ||
              that.toolArr[i].state != "creating" ||
              that.toolArr[i].state != "endEdit")
          ) {
            if (that.lastSelectEntity) {
              // 结束除当前选中实体的所有编辑操作
              that.lastSelectEntity.endEdit();
              if (that.endEditFun) {
                that.endEditFun(
                  that.lastSelectEntity,
                  that.lastSelectEntity.getEntity()
                ); // 结束事件
              }
              that.lastSelectEntity = null;
            }
            // 开始编辑
            that.toolArr[i].startEdit();
            that.nowEditObj = that.toolArr[i];
            if (that.startEditFun) that.startEditFun(that.nowEditObj, pick.id); // 开始编辑
            that.lastSelectEntity = that.toolArr[i];
            break;
          }
        }
      } else {
        // 未选中实体 则结束全部绘制
        if (that.lastSelectEntity) {
          that.lastSelectEntity.endEdit();
          if (that.endEditFun) {
            that.endEditFun(
              that.lastSelectEntity,
              that.lastSelectEntity.getEntity()
            ); // 结束事件
          }
          that.lastSelectEntity = null;
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  }

  endEdit() {
    if (this.lastSelectEntity) {
      // 结束除当前选中实体的所有编辑操作
      this.lastSelectEntity.endEdit();
      if (this.endEditFun) {
        this.endEditFun(
          this.lastSelectEntity,
          this.lastSelectEntity.getEntity()
        ); // 结束事件
      }
      this.lastSelectEntity = null;
    }
    for (let i = 0; i < this.toolArr.length; i++) {
      this.toolArr[i].endEdit();
    }
  }

  // 绑定删除事件
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
  getAll() {
    return this.toolArr;
  }
  createByType(opt) {
    let entityObj = undefined;
    let name = "";
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
}

export default DrawTool;


