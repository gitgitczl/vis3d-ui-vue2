
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
/**
 * 绘制控制类
 * @class
 * @example
 * let drawTool = new easy3d.DrawTool(window.viewer, {
    canEdit: true,
  });
  plotDrawTool.on("endCreate", function (entObj, ent) {});
  plotDrawTool.start({
      "name": "面",
      "type": "polygon",
      "style": {
          "color": "#0000ff",
          "outline": true,
          "outlineColor": "#ff0000",
          "heightReference": 1
      }
  })
 */
class DrawTool {
  /**
   * 
   * @param {Cesium.viewer} viewer 地图viewer对象 
   * @param {Object} obj 相关属性配置
   * @param {Boolean} obj.canEdit 是否可编辑
   */
  constructor(viewer, obj) {
    if (!viewer) {
      console.warn("缺少必要参数！--viewer");
      return;
    }
    obj = obj || {};
    this.viewer = viewer;
    /**
     * 
     * @property {Array} entityObjArr 标绘对象数组
     */
    this.entityObjArr = [];
    this.handler = null;
    this.removeHandler = new Cesium.ScreenSpaceEventHandler(
      this.viewer.scene.canvas
    );
    /* this.show = obj.drawEndShow == undefined ? true : obj.drawEndShow; */

    /**
     * @property {Object} nowEditObj 当前编辑对象
     */
    this.nowEditObj = null;

    this.startEditFun = null;
    this.endEditFun = null;
    this.removeFun = null;

    this.deleteEntityObj = null;

    // 无论如何 进来先监听点击修改 与 右键删除事件 通过控制canEdit来判断要不要向下执行
    this.bindEdit();
    this.bindRemove();
    this.deletePrompt = null;

    /**
     * @property {Boolear} canEdit 绘制的对象，是否可编辑
     */
    this.canEdit = obj.canEdit == undefined ? true : obj.canEdit;; // 是否可以编辑
    this.lastEntityObj = null;
    this.lastStartEntityObj = null;
  }

  /** 
   * 事件绑定
   * @param {String} type 事件类型（startEdit 开始编辑时 / endEdit 编辑结束时 / remove 删除对象时 / endCreate 创建完成后）
   * @param {Function} fun 绑定函数
  */
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

  /**
   * 开启编辑功能
   */
  openEdit() {
    this.endEdit();
    this.canEdit = true;
  }

  /**
  * 关闭编辑功能
  */
  closeEdit() {
    this.canEdit = false;
  }

  /**
   * 开始绘制
   * @param {Object} opt 相关属性
   * @param {String} opt.type 绘制类型 polyline、polygon、billboard、circle、rectangle、gltfModel、point、label、arrow
   * @param {Object} opt.style 当前绘制对象的样式配置，具体配置见{@link style};
   * @returns {Object} entityObj 当前绘制对象
   */
  start(opt) {
    if (!opt || !opt.type) {
      return;
    }
    opt.id = opt.id || Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
    let that = this;
    this.endEdit(); // 绘制前  结束编辑

    if (this.lastStartEntityObj && this.lastStartEntityObj.state == "startCreate") { // 禁止一次绘制多个
      this.lastStartEntityObj.destroy();
      this.lastStartEntityObj = null;
    }
    let entityObj = this.createByType(opt);
    if (!entityObj) return;
    entityObj.attr = opt || {}; // 保存开始绘制时的属性

    const fireEdit = opt.fireEdit == undefined ? true : opt.fireEdit;
    // 开始绘制
    entityObj.start(function (entity) {
      that.entityObjArr.push(entityObj);
      // endCreateFun 和 success 无本质区别，若构建时 两个都设置了 当心重复
      if (opt.success) opt.success(entityObj, entity);
      if (that.endCreateFun) that.endCreateFun(entityObj, entity);

      if (opt.show == false) entityObj.setVisible(false);

      // 如果可以编辑 则绘制完成打开编辑
      if (that.canEdit && fireEdit) {
        entityObj.startEdit();
        if (that.startEditFun) that.startEditFun(entityObj, entity);
        that.lastEntityObj = entityObj;
      }
    });

    this.lastStartEntityObj = entityObj;
    return entityObj;
  }

  /**
   * 结束当前操作
  */
  end() {
    if (this.lastStartEntityObj && this.lastStartEntityObj.state == "startCreate") { // 禁止一次绘制多个
      this.lastStartEntityObj.destroy();
      this.lastStartEntityObj = null;
    }
    this.endEdit();
  }

  /**
  * 开始编辑绘制对象
  * @param {Object} entityObj 绘制的对象
 */
  startEditOne(entityObj) {
    if (!this.canEdit) return;
    if (this.lastEntityObj) {
      // 结束除当前选中实体的所有编辑操作
      this.lastEntityObj.endEdit();
      if (this.endEditFun) {
        this.endEditFun(this.lastEntityObj, this.lastEntityObj.getEntity()); // 结束事件
      }
      this.lastEntityObj = null;
    }
    if (entityObj) {
      entityObj.startEdit();
      if (this.startEditFun)
        this.startEditFun(entityObj, entityObj.getEntity());
      this.lastEntityObj = entityObj;
    }
  }

  /**
   * 修改绘制对象的样式
   * @param {Object} entityObj 绘制的对象
   * @param {Object} style 样式
  */
  updateOneStyle(entityObj, style) {
    if (entityObj) {
      entityObj.setStyle(style);
    }
  }

  /**
   * 根据坐标构建绘制对象
   * @param {Object} opt 绘制的对象
   * @param {Cesium.Cartesian3[] | Array} opt.positions 坐标数组
   * @param {Object} opt.style 当前绘制对象的样式配置，具体配置见{@link style};
   * @param {Funtion} opt.success 创建完成的回调函数
   * @param {Boolean} [opt.show] 创建完成后，是否展示
   * @param {Boolean} [opt.fireEdit] 创建完成后，是否进入编辑状态
  */
  createByPositions(opt) {
    opt = opt || {};
    if (!opt) opt = {};
    if (!opt.positions) return;
    opt.id = opt.id || Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
    let that = this;
    let entityObj = this.createByType(opt);
    if (!entityObj) return;
    entityObj.attr = opt; // 保存开始绘制时的属性
    entityObj.createByPositions(opt.positions, function (entity) {
      that.entityObjArr.push(entityObj);
      entityObj.setStyle(opt.style); // 设置相关样式
      // endCreateFun 和 success 无本质区别，若构建时 两个都设置了 当心重复
      if (opt.success) opt.success(entityObj, entity);
      if (that.endCreateFun) that.endCreateFun(entityObj, entity);
      if (opt.show == false) entityObj.setVisible(false);
      // 如果可以编辑 则绘制完成打开编辑 
      if (that.canEdit && opt.fireEdit) {
        entityObj.startEdit();
        if (that.startEditFun) that.startEditFun(entityObj, entity);
        that.lastEntityObj = entityObj;
      }
    });
    return entityObj;
  }
  
  /**
   * 由geojson格式数据创建对象
   * @param {Object} data geojson格式数据
  */
  createByGeojson(data) {
    let { features } = data;
    for (let i = 0; i < features.length; i++) {
      let feature = features[i];
      const { properties, geometry } = feature;
      let plotType = properties.plotType;
      const geoType = geometry.type;
      const coordinates = geometry.coordinates;
      let positions = [];
      let drawType = "";
      switch (geoType) {
        case "LineString":
          positions = cUtil.lnglatsToCartesians(coordinates);
          drawType = "polyline";
          break;
        case "Polygon":
          positions = cUtil.lnglatsToCartesians(coordinates[0]);
          drawType = "polygon";
          break;
        case "Point":
          positions = cUtil.lnglatsToCartesians([coordinates])[0];
          drawType = plotType;
          break;
        default: ;
      }
      this.createByPositions({
        type: drawType,
        styleType: plotType,
        positions: positions,
        style: properties.style
      })
    }
  }
  
  /**
   * 转为geojson格式
   * @returns {Object} featureCollection geojson格式数据
   */
  toGeojson() {
    let featureCollection = {
      type: "FeatureCollection",
      features: [],
    };
    if (this.entityObjArr.length == 0) return null;
    for (let i = 0; i < this.entityObjArr.length; i++) {
      let item = this.entityObjArr[i];
      let coordinates = item.getPositions(true);
      let style = item.getStyle();
      let geoType = this.transType(item.type);
      let feature = {
        "type": "Feature",
        "properties": {
          "plotType": item.type,
          "style": style,
        },
        "geometry": {
          "type": geoType,
          "coordinates": []
        }
      }
      switch (geoType) {
        case "Polygon":
          feature.geometry.coordinates = [coordinates];
          break;
        case "Point":
          feature.geometry.coordinates = coordinates;
          break;
        case "LineString":
          feature.geometry.coordinates = coordinates;
          break;
        case "":

        default: ;
      }
      feature.properties = Object.assign(feature.properties, item.properties);
      featureCollection.features.push(feature);
    }
    return featureCollection;
  }

  // 标绘类型和geojson数据类型相互转换
  transType(plotType) {
    let geoType = '';
    switch (plotType) {
      case "polyline":
        geoType = "LineString";
        break;
      case "polygon":
        geoType = "Polygon";
        break;
      case "point":
      case "gltfModel":
      case "label":
      case "Billboard":
        geoType = "Point";
        break;
      default:
        geoType = plotType;
    }
    return geoType;
  }

  /**
   * 销毁
   */
  destroy() {
    // 取消当前绘制
    if (this.lastStartEntityObj) {
      this.lastStartEntityObj.destroy();
      this.lastStartEntityObj = null;
    }
    for (let i = 0; i < this.entityObjArr.length; i++) {
      this.entityObjArr[i].destroy();
    }
    this.entityObjArr = [];
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

  /**
   * 移除某个绘制对象
   * @param {Object} entityObj 绘制对象
   */
  removeOne(entityObj) {
    if (!entityObj) return;
    this.removeById(entityObj.objId);
  }

  /**
   * 移除全部绘制对象
   */
  removeAll() {
    // 取消当前绘制
    if (this.lastStartEntityObj) {
      this.lastStartEntityObj.destroy();
      this.lastStartEntityObj = null;
    }
    for (let i = 0; i < this.entityObjArr.length; i++) {
      let obj = this.entityObjArr[i];
      obj.destroy();
    }
    this.entityObjArr = [];
    this.nowEditObj = null;
  }

   /**
   * 是否包含某个对象
   * @param {Object} entityObj 绘制对象
   */
  hasEntityObj(entityObj) {
    if (!entityObj) return false;
    let obj = this.getEntityObjByObjId(entityObj.objId);
    return obj != {} ? true : false;
  }

   /**
   * 根据id移除创建的对象
   * @param {String | Number} id 对象id
   */
  removeById(id) {
    let obj = this.getEntityObjByObjId(id);
    this.entityObjArr.splice(obj.index, 1);
    // 触发on绑定的移除事件
    if (this.removeFun)
      this.removeFun(obj.entityObj, obj.entityObj.getEntity());
    if (obj.entityObj) {
      obj.entityObj.destroy();
    }
  }

   /**
   * 根据id缩放至绘制的对象
   * @param {String} id 对象id
   */
  zoomToById(id) {
    let obj = this.getEntityObjByObjId(id);
    if (obj.entityObj) {
      obj.entityObj.zoomTo();
    }
  }
  

  /**
   * 根据属性字段获取对象
   * @param {String} fieldName 属性字段名称
   * @param {String} [fieldValue] 属性值，若不填，则默认以id进行查询
   * @returns {Object} obj 对象在数组中位置以及对象
   */

  getEntityObjByField(fieldName, fieldValue) {
    let obj = {};
    if (!fieldValue) {
      // 如果缺少第二个参数 则默认以attr.id进行查询
      for (let i = 0; i < this.entityObjArr.length; i++) {
        let item = this.entityObjArr[i];
        if (item.attr.id == fieldName) {
          obj.entityObj = item;
          obj.index = i;
          break;
        }
      }
    } else {
      // 否则 以键值对的形式进行查询
      for (let ind = 0; ind < this.entityObjArr.length; ind++) {
        let item = this.entityObjArr[ind];
        if (item.attr[fieldName] == fieldValue) {
          obj.entityObj = item;
          obj.index = ind;
          break;
        }
      }
    }
    return obj;
  }

  /**
   * 根据id设置对象的显示隐藏
   * @param {String | Number} id 对象id
   * @param {Boolean} visible 是否展示
   */
  setVisible(id, visible) {
    let obj = this.getEntityObjByField("id", id);
    if (obj.entityObj) obj.entityObj.setVisible(visible);
  }

  /**
   * 根据id获取对象
   * @param {String | Number} id 对象id
   * @returns {Object} obj 对象在数组中位置以及对象
   */
  getEntityObjByObjId(id) {
    if (!id) return;
    let obj = {};
    for (let i = 0; i < this.entityObjArr.length; i++) {
      let item = this.entityObjArr[i];
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
    if (!this.handler) this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.handler.setInputAction(function (evt) {
      //单击开始绘制
      if (!that.canEdit) return;
      let pick = that.viewer.scene.pick(evt.position);
      if (Cesium.defined(pick) && pick.id) {
        // 选中实体
        for (let i = 0; i < that.entityObjArr.length; i++) {
          if (
            pick.id.objId == that.entityObjArr[i].objId &&
            (that.entityObjArr[i].state != "startCreate" ||
              that.entityObjArr[i].state != "creating" ||
              that.entityObjArr[i].state != "endEdit")
          ) {
            if (that.lastEntityObj) {
              // 结束除当前选中实体的所有编辑操作
              that.lastEntityObj.endEdit();
              if (that.endEditFun) {
                that.endEditFun(
                  that.lastEntityObj,
                  that.lastEntityObj.getEntity()
                ); // 结束事件
              }
              that.lastEntityObj = null;
            }
            // 开始编辑
            that.entityObjArr[i].startEdit();
            that.nowEditObj = that.entityObjArr[i];
            if (that.startEditFun) that.startEditFun(that.nowEditObj, pick.id); // 开始编辑
            that.lastEntityObj = that.entityObjArr[i];
            break;
          }
        }
      } else {
        // 未选中实体 则结束全部绘制
        if (that.lastEntityObj) {
          that.lastEntityObj.endEdit();
          if (that.endEditFun) {
            that.endEditFun(
              that.lastEntityObj,
              that.lastEntityObj.getEntity()
            ); // 结束事件
          }
          that.lastEntityObj = null;
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
  
  /**
   * 结束编辑
   */
  endEdit() {
    if (this.lastEntityObj) {
      // 结束除当前选中实体的所有编辑操作
      this.lastEntityObj.endEdit();
      if (this.endEditFun) {
        this.endEditFun(
          this.lastEntityObj,
          this.lastEntityObj.getEntity()
        ); // 结束事件
      }
      this.lastEntityObj = null;
    }
    for (let i = 0; i < this.entityObjArr.length; i++) {
      this.entityObjArr[i].endEdit();
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
        show: true
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
        that.entityObjArr.splice(that.deleteEntityObj.index, 1);
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
        for (let i = 0; i < that.entityObjArr.length; i++) {
          if (
            pick.id.objId == that.entityObjArr[i].objId &&
            (that.entityObjArr[i].state == "endCreate" ||
              that.entityObjArr[i].state == "startEdit" ||
              that.entityObjArr[i].state == "endEdit")
          ) {
            // 结束编辑或结束构建才给删
            that.deleteEntityObj = {
              entityObj: that.entityObjArr[i],
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

  /**
   * 获取当前所有对象
   * @returns {Array} entityObjArr
   */
  getEntityObjArr() {
    return this.entityObjArr;
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


