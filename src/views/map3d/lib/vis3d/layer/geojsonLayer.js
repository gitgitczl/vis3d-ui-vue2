// wfs geojson 格式 均可使用此类
import util from "../util";
import BaseLayer from "./baseLayer";
import { setPointStyle, setLabelStyle, setPolylineStyle, setPolygonStyle } from "../style";
/**
 * geojson/wfs类型图层数据加载
 * @class
 * @augments BaseLayer
 * @alias BaseLayer.GeojsonLayer
 * @example
 * let geojsonLayer = new vis3d.GeojsonLayer(viewer,{
 *  show: false,
    url: "data/area.json",
    alpha: 0.5,
    style: {
    point: {
        color: "#00FFFF",

        colorAlpha: 1,
        outlineWidth: 1,
        outlineColor: "#000000",
        outlineColorAlpha: 1,
        pixelSize: 20,
    },
    polyline: {
        color: "#FFFF00",
        colorAlpha: 1,
        width: 3,
        clampToGround: 1,
    },
    polygon: {
        heightReference: 1,
        fill: true,
        color: {
            conditions: "random",
            type: "color", // 随机数返回值类型 number / color(16进制颜色)
        },
        "color": {  // 支持多种方式赋值
                        "field": "name",
                        "conditions": [
                            ['${name} >= "东部战区"', '#000000'],
                            ['true', 'color("blue")']
                        ]
                    }, 
        "color":{
            "field" : "name",
            "conditions" : "random" , // 可不填 
             }
                            
        colorAlpha: 1,
        outline: true,
        outlineWidth: 1,
        outlineColor: "#FFFF00",
        outlineColorAlpha: 1,
        },
    },
     tooltip: [
    {
        field: "name",
        fieldName: "名称",
    },
    {
        field: "ADCODE99",
        fieldName: "编号",
    },
    ];
  geojsonLayer.load();
 */
class GeojsonLayer extends BaseLayer {
  /**
   *
   * @param {Cesium.viewer} viewer 地图viewer对象
   * @param {Object} opt 基础配置
   * @param {String} opt.url 模型服务地址
   * @param {Object} [opt.style] 要素样式
   * @param {typeName} [opt.typeName] 图层名称
   */
  constructor(viewer, opt) {
    super(viewer, opt);
    /**
     * @property {String} type 类型
     */
    this.type = "geojson";

    this.viewer = viewer;

    this.opt = opt || {};

    let defaultStyleVal = {
      point: {
        color: "#00FFFF",
        colorAlpha: 1,
        outlineWidth: 1,
        outlineColor: "#00FFFF",
        outlineColorAlpha: 1,
        pixelSize: 14,
        heightReference: 1,
        disableDepthTestDistance: Number.MAX_VALUE,
      },
      polyline: {
        color: "#FFFF00",
        colorAlpha: 1,
        width: 3,
        clampToGround: 1,
      },
      polygon: {
        heightReference: 1,
        fill: true,
        color: "#00FFFF",
        colorAlpha: 1,
        outline: true,
        outlineWidth: 1,
        outlineColor: "#FFFF00",
        outlineColorAlpha: 1,
      },
      label: {
        text: '--',
        fillColor: "#ffffff",
        disableDepthTestDistance: Number.MAX_VALUE,
        heightReference: 1,
        showBackground: false,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        outlineColor: "#00FFFF",
        outlineWidth: 1.0,
      },
    };

    /**
     * @property {Object} style 要素样式
     */
    this.featureStyle = opt.style;
    for (let i in opt.style) {
      const feastyle = opt.style[i];
      const defaultStyle = defaultStyleVal[i];
      this.featureStyle[i] = Object.assign(defaultStyle, feastyle);
    }
    this.url = this.opt.url || "";
  }

  /**
   *
   * @callback loadcallback
   * @param {number} responseCode
   * @param {string} responseMessage
   */

  /**
   * 图层加载
   * @param {loadcallback} fun 加载完成后的回调函数
   */

  load(fun) {
    let that = this;
    let dataSource = this.viewer.dataSources.add(
      Cesium.GeoJsonDataSource.load(this.url)
    );
    dataSource.then((ds) => {
      that._layer = ds;
      that._layer.attr = that.opt;
      for (let i = that._layer.entities.values.length - 1; i >= 0; i--) {
        let ent = that._layer.entities.values[i];
        // 获取geojson中的属性
        let properties = ent.properties.getValue(that.viewer.clock.currentTime);

        if (ent.billboard) {
          // geojson中的point会模型转为billboard 转为point
          const position = ent.position.getValue(that.viewer.clock.currentTime);
          if (that.featureStyle.point) {
            let pointStyle = that.featureStyle["point"];
            pointStyle = JSON.parse(JSON.stringify(pointStyle)); // 数据隔离
            pointStyle.color = that.getColorByProperty(
              pointStyle.color,
              properties
            );
            const ent = that._layer.entities.add({
              position: position,
              point: {},
            });
            setPointStyle(ent, pointStyle);
            if (that.opt.tooltip) that.bindTooltip(ent, that.opt.tooltip, properties);
          }

          if (this.featureStyle.label) {
            let labelStyle = that.featureStyle['label'];
            labelStyle = JSON.parse(JSON.stringify(labelStyle)); // 数据隔离
            labelStyle.text = this.featureStyle.label.text.field ? properties[this.featureStyle.label.text.field] : this.featureStyle.label.text;
            const ent = that._layer.entities.add({
              position: position,
              label: {
                text: "----"
              }
            });

            setLabelStyle(ent, labelStyle);
          }

          that._layer.entities.remove(ent); // 此处删去原来的billboard
        } else {
          let style = {};
          if (ent.polyline) {
            let lineStyle = that.featureStyle["polyline"];
            lineStyle = JSON.parse(JSON.stringify(lineStyle));
            lineStyle.color = that.getColorByProperty(lineStyle.color, properties);
            setPolylineStyle(ent, lineStyle)
          } else if (ent.polygon) {
            let polygonStyle = that.featureStyle["polygon"];
            polygonStyle.color = that.getColorByProperty(polygonStyle.color, properties);
            setPolygonStyle(ent, polygonStyle);
          } else {
          }
          if (that.opt.tooltip) that.bindTooltip(ent, that.opt.tooltip, properties);
        }


      }

      if (that.opt.flyTo) that.zoomTo();
      if (fun) fun();
    });
  }

  // entity绑定弹窗
  bindTooltip(ent, tooltipObj, properties) {
    if (!ent) return;
    let content = '';
    if (typeof tooltipObj == 'string') {
      content = tooltipObj
    } else if (tooltipObj instanceof Array) {
      tooltipObj.forEach(item => {
        const { field, fieldName } = item;
        content += `${fieldName}：${properties[field]}<br/>`;
      })
    } else {

    }
    ent.tooltip = content;
  }

  // 根据geojson的属性来设置颜色
  getColorByProperty(colorObj, properties) {
    let color = "";

    colorObj = colorObj || "#ff0000";
    if (colorObj == "random") {
      color = this.getRandomColor();
    } else if (typeof colorObj == "string") {
      color = colorObj;
    } else {
      const field = colorObj.field;
      // "field": "name",
      // "conditions": [
      //     ['${name} >= "东部战区"', '#000000'],
      //     ['true', 'color("blue")']
      // ]
      if (colorObj.conditions instanceof Array) {
        color = this.getConditionValue(
          field,
          properties[field],
          colorObj.conditions
        );
      } else {
        color = this.getRandomColor();
      }
    }
    return color;
  }

  getConditionValue(key, value, conditions) {
    let styleValue = null;
    // 获取默认值
    for (let ind = 0; ind < conditions.length; ind++) {
      if (conditions[ind][0] == "true") {
        styleValue = conditions[ind][1];
        break;
      }
    }
    for (let i = 0; i < conditions.length; i++) {
      let condition = conditions[i];
      let replaceStr = "${" + key + "}";
      let str = condition[0].replace(replaceStr, '"' + value + '"');
      if (eval(str)) {
        styleValue = condition[1];
        break;
      }
    }
    return styleValue;
  }

  getEntityField(field, value) {
    let entity = undefined;
    for (let i = 0; i < this._layer.entities.length; i++) {
      let ent = this._layer.entities[i];
      let properties = ent.properties.getValue(that.viewer.clock.currentTime);
      if (properties[field] == value) {
        entity = ent;
        break;
      }
    }
    return;
  }

  /**
   * 缩放至图层
   */
  zoomTo() {
    if (!this._layer) return;
    if (this._layer.attr.view) {
      util.setCameraView(opt.view);
    } else {
      this.viewer.zoomTo(this._layer);
    }
  }

  /**
   * 移除
   */
  remove() {
    if (this._layer) {
      this.viewer.dataSources.remove(this._layer);
    }
  }

  /**
   * 展示
   */
  show() {
    if (this._layer) {
      this._layer.show = true;
      this._layer.attr.show = true;
    }
  }

  /**
   * 隐藏
   */
  hide() {
    if (this._layer) {
      this._layer.attr.show = false;
      this._layer.show = false;
    }
  }

  /**
   * 销毁
   */
  destroy(){
    if(this._layer){
      this._layer.entities.removeAll();
      this.viewer.dataSources.remove(this._layer);
    }
  }

  getContent(properties, fields) {
    let html = ``;
    for (let i = 0; i < fields.length; i++) {
      const { field, fieldName } = fields[i];
      const value = properties[field];
      html += `
                <tr>
                    <td>${fieldName}：</td>
                    <td>${value}</td>
                </tr>
            `;
    }
    return `
            <table>${html}</table>
        `;
  }

  getRandomColor() {
    var color = "#";
    var arr = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
    ];
    for (var i = 0; i < 6; i++) {
      var num = parseInt(Math.random() * 16);
      color += arr[num];
    }

    return color;
  }
}

export default GeojsonLayer;
