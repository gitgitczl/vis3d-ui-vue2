// wfs geojson 格式 均可使用此类
import cUtil from "../cUtil"
import BaseLayer from './baseLayer';
/**
 * geojson类型图层数据加载
 * @class
 * @augments BaseLayer
 */
class GeojsonLayer extends BaseLayer{
    constructor(viewer, opt) {
        super(viewer, opt);
        this.type = "geojson";
        this.viewer = viewer;
        this.opt = opt || {};
        let defaultStyleVal = {
            "point": {
                "color": "#00FFFF",
                "colorAlpha": 1,
                "outlineWidth": 1,
                "outlineColor": "#000000",
                "outlineColorAlpha": 1,
                "pixelSize": 20
            },
            "polyline": {
                "color": "#FFFF00",
                "colorAlpha": 1,
                "width": 3,
                "clampToGround": 1
            },
            "polygon": {
                "heightReference": 1,
                "fill": true,
                "color": "#00FFFF",
                "colorAlpha": 1,
                "outline": true,
                "outlineWidth": 1,
                "outlineColor": "#FFFF00",
                "outlineColorAlpha": 1
            }
        };
        this.style = Object.assign(defaultStyleVal, opt.style || {});
        this.url = this.opt.url || "";
        if (this.url.indexOf("WFS") != -1) { // wfs服务
            this.url = this.opt.url + `?service=WFS&version=1.0.0&request=GetFeature&typeName=${this.opt.typeName}&maxFeatures=50&outputFormat=application%2Fjson`;
        }
        this._layer = new Cesium.CustomDataSource(this.opt.typeName || ("geojson" + (new Date().getTime())));
        this._layer.attr = this.opt; // 绑定配置信息
        this.viewer.dataSources.add(this._layer);
    }

    // 加载
    load(fun) {
        let that = this;
        let resourece = Cesium.Resource.fetchJson({
            url: this.url
        });
        resourece.then((data) => {
            let { features } = data;
            for (let i = 0; i < features.length; i++) {
                let feature = features[i];
                const { geometry, properties } = feature;
                if (!geometry) continue;
                const { type, coordinates } = geometry
                let positions = [];
                switch (type) {
                    case "Point": // 当geojson是单点时  可能创建点 图标点 单个模型
                        let position = cUtil.lnglatToCartesian(coordinates);
                        let point = that.createPoint(position, that.style["point"], properties);
                        point.properties = properties;
                        if (that.opt.popup) point.popup = that.getContent(properties, that.opt.popup);
                        if (that.opt.tooltip) point.tooltip = that.getContent(properties, that.opt.tooltip);
                        break;
                    case "MultiPoint":
                        for (let i = 0; i < coordinates.length; i++) {
                            let position = cUtil.lnglatToCartesian(coordinates[i]);
                            let point = that.createPoint(position, that.style["point"], properties);
                            point.properties = properties;
                            if (that.opt.popup) point.popup = that.getContent(properties, that.opt.popup);
                            if (that.opt.tooltip) point.tooltip = that.getContent(properties, that.opt.tooltip);
                        }
                        break;
                    case "LineString":
                        positions = cUtil.lnglatsToCartesians(coordinates);
                        let polyline = that.createPolyline(positions, that.style["polyline"], properties);
                        polyline.properties = properties;
                        if (that.opt.popup) polyline.popup = that.getContent(properties, that.opt.popup);
                        if (that.opt.tooltip) polyline.tooltip = that.getContent(properties, that.opt.tooltip);
                        // 构建折线
                        break;
                    case "MultiLineString":
                        for (let i = 0; i < coordinates.length; i++) {
                            let positions_lineString = cUtil.lnglatsToCartesians(coordinates[i]);
                            let polyline = that.createPolyline(positions_lineString, that.style["polyline"], properties);
                            polyline.show = (that.opt.show == undefined ? true : that.opt.show);
                            polyline.properties = properties;
                            if (that.opt.popup) polyline.popup = that.getContent(properties, that.opt.popup);
                            if (that.opt.tooltip) polyline.tooltip = that.getContent(properties, that.opt.tooltip);
                        }
                        break;
                    case "Polygon":
                        positions = cUtil.lnglatsToCartesians(coordinates[0]);
                        let polygon = that.createPolygon(positions, that.style["polygon"], properties);
                        polygon.show = (that.opt.show == undefined ? true : that.opt.show);
                        polygon.properties = properties;
                        if (that.opt.popup) polygon.popup = that.getContent(properties, that.opt.popup);
                        if (that.opt.tooltip) polygon.tooltip = that.getContent(properties, that.opt.tooltip);
                        break;
                    case "MultiPolygon":
                        for (let i = 0; i < coordinates.length; i++) {
                            let positions_mulitipolygon = cUtil.lnglatsToCartesians(coordinates[i][0]);
                            let polygon = that.createPolygon(positions_mulitipolygon, that.style["polygon"], properties);
                            polygon.show = (that.opt.show == undefined ? true : that.opt.show);
                            polygon.properties = properties;
                            if (that.opt.popup) polygon.popup = that.getContent(properties, that.opt.popup);
                            if (that.opt.tooltip) polygon.tooltip = that.getContent(properties, that.opt.tooltip);
                        }
                        break;
                    default:
                        ;
                }
            }

            if(fun) fun();
        })
    }
    zoomTo() {
        if (!this._layer) return;
        if (this._layer.attr.view) {
            cUtil.setCameraView(opt.view);
        } else {
            this.viewer.zoomTo(this._layer.entities)
        }
    }
    // 移除
    remove() {
        if (this._layer) {
            this.viewer.dataSources.remove(this._layer);
        }
    }
    // 显示
    show() {
        if (this._layer) {
            this._layer.show = true;
            this._layer.attr.show = true;
        }
    }
    // 隐藏
    hide() {
        if (this._layer) {
            this._layer.attr.show = false;
            this._layer.show = false;
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
            `
        }
        return `
            <table>${html}</table>
        `;
    }



    getStyleValue(key, value, conditions) {
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
            let str = condition[0].replace(replaceStr, "\"" + value + "\"");
            console.log("eval===>", str, eval(str));
            if (eval(str)) {
                styleValue = condition[1];
                break;
            }
        }
        return styleValue;
    }

    setAlpha(alpha) {
        let entities = this._layer.entities.values;
        entities.forEach(function (entity) {
            let style = entity.style;
            let color = null;
            color = Cesium.Color.fromCssColorString(style.color);
            color = color.withAlpha(alpha || 1);
            let outlineColor = null;
            outlineColor = Cesium.Color.fromCssColorString(style.outlineColor);
            outlineColor = outlineColor.withAlpha(alpha || 1);

            if (entity.point) {
                entity.point.color = color;
                entity.point.outlineColor = outlineColor;
            }

            if (entity.polygon) {
                entity.polygon.material = color;
            }

            if (entity.polyline) {
                entity.polyline.material = outlineColor;
            }
        });
    }

    createPoint(position, style, properties) {
        style = this.getNewStyle(style, properties);
        let color = null;

        style.color = style.color || "#ffff00";
        style.colorAlpha = style.colorAlpha || 1;
        color = Cesium.Color.fromCssColorString(style.color);
        color = color.withAlpha(style.colorAlpha);

        let outlineColor = null;
        style.outlineColor = style.outlineColor || "#000000"
        style.outlineColorAlpha = style.outlineColorAlpha || 1;
        outlineColor = Cesium.Color.fromCssColorString(style.outlineColor);
        outlineColor = outlineColor.withAlpha(style.outlineColorAlpha);

        let ent = this._layer.entities.add({
            position: position,
            point: {
                color: color,
                outlineColor: outlineColor,
                outlineWidth: style.outlineWidth || 1,
                pixelSize: style.pixelSize || 6,
                heightReference: 1
            }
        });
        ent.style = style;
        return ent;
    }
    createPolygon(positions, style, properties) {
        style = this.getNewStyle(style, properties);
        let color = null;
        style.color = style.color || "#ffff00";
        style.colorAlpha = style.colorAlpha || 1;
        color = Cesium.Color.fromCssColorString(style.color);
        color = color.withAlpha(style.colorAlpha);

        let outlineColor = null;
        style.outlineColor = style.outlineColor || "#000000"
        style.outlineColorAlpha = style.outlineColorAlpha || 1;
        outlineColor = Cesium.Color.fromCssColorString(style.outlineColor);
        outlineColor = outlineColor.withAlpha(style.outlineColorAlpha)

        let grapicOpt = {};
        grapicOpt.polygon = {
            hierarchy: new Cesium.PolygonHierarchy(positions),
            heightReference: 1,
            material: color
        }
        if (style.outline) {
            grapicOpt.polyline = {
                positions: new Cesium.CallbackProperty(function () {
                    return positions
                }, false),
                material: outlineColor,
                width: style.outlineWidth || 1,
                clampToGround: true
            }
        }

        let ent = this._layer.entities.add(grapicOpt);
        ent.style = style;
        return ent;
    }
    createPolyline(positions, style, properties) {
        style = this.getNewStyle(style, properties);
        let color = null;

        style.color = style.color || "#ffff00";
        style.colorAlpha = style.colorAlpha || 1;
        color = Cesium.Color.fromCssColorString(style.color);
        color = color.withAlpha(style.colorAlpha);

        let ent = this._layer.entities.add({
            polyline: {
                positions: positions,
                material: color,
                width: style.width || 3,
                clampToGround: true
            }
        })
        ent.style = style;
        return ent;
    }

    getRandomColor() {
        var color = "#";
        var arr = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
        for (var i = 0; i < 6; i++) {
            var num = parseInt(Math.random() * 16);
            color += arr[num];
        }
        return color;
    }

    getNewStyle(style, properties) {
        style = JSON.parse(JSON.stringify(style || {}));
        let newStyle = {};
        if (!properties) return style;
        for (let i in style) {
            if (style[i].conditions && style[i].conditions instanceof Array) {
                let field = style[i].field;
                let conditions = style[i].conditions;
                let val = properties[field];
                newStyle[i] = this.getStyleValue(field + '', val, conditions);
            } else if (style[i] instanceof String) {
                newStyle[i] = style[i];
            } else if (style[i].conditions == "random") { // 标识根据字段设置随机值

                if (style[i].type == "color") {
                    newStyle[i] = this.getRandomColor();
                }
                if (style[i].type == "number") {
                    newStyle[i] = Math.random() * 100;
                }
            }
        }
        style = Object.assign(style, newStyle);
        return style;
    }

}

export default GeojsonLayer;