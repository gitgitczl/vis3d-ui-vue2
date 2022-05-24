// wfs geojson 格式 均可使用此类
import cUtil from "../cUtil"
class GeojsonLayer {
    constructor(viewer, opt) {
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
        })
        /* let promise = Cesium.GeoJsonDataSource.load(this.url,{
            clampToGround : true
        });
        promise.then(function (dataSource) {
            that._layer = dataSource;
            that.viewer.dataSources.add(dataSource);
            let entities = dataSource.entities.values;
            for (let i = 0; i < entities.length; i++) {
                let entity = entities[i];
                let entityType = '';
                if (entity.point) {
                    entityType = "point";
                } else if (entity.polygon) {
                    entityType = "polygon";
                } else {
                    entityType = "polyline";
                }
                let style = that.style[entityType];
                that.changeStyle(entity, style);
            }
            if (fun) fun(dataSource);
        }) */
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

    /*  
    
    changeStyle(entity, style) {
        let newStyle = {};
        let properties = entity.properties;
        for (let i in style) {
            if (style[i].conditions && style[i].conditions instanceof Array) {
                let field = style[i].field;
                let conditions = style[i].conditions;
                let val = properties[field];
                newStyle[i] = this.getStyleValue(field + '', val, conditions);
            }
        }
        style = Object.assign(style, newStyle);

        if (entity.poiont) { // 修改点的样式
            this.setPointStyle(entity, style);
        }

        if (entity.polyline) {
            this.setPolylineStyle(entity, style);
        }

        if (entity.polygon) {
            this.setPolygonStyle(entity, style);
        }
    }

    setPointStyle(entity, style) {
         if (!style) return;
         if (style.color) {
             let color = Cesium.Color.fromCssColorString(style.color || "#ffff00");
             color = color.withAlpha(style.colorAlpha);
             entity.point.color = color;
         }
         entity.point.outlineWidth = Number(style.outlineWidth);
         if (style.outlineColor) {
             let outlineColor = Cesium.Color.fromCssColorString(style.outlineColor || "#000000");
             outlineColor = outlineColor.withAlpha(style.outlineColorAlpha)
             entity.point.outlineColor = outlineColor;
         }
         entity.point.heightReference = 1;
         entity.point.pixelSize = Number(style.pixelSize);
     }
 
     setPolylineStyle(entity, style) {
         if (!style) return;
         let material = undefined;
         if (style.lineType) {
             material = this.getMaterial(style.lineType, style);
         } else {
             let color = Cesium.Color.fromCssColorString(style.color || "#000000");
             if (style.colorAlpha) {
                 material = color.withAlpha(style.colorAlpha);
             }
         }
 
         entity.polyline.material = material;
         entity.polyline.clampToGround = true;
         if (style.width) entity.polyline.width = style.width || 3;
         this.style = Object.assign(this.style, style);
     }
 
     setPolygonStyle(entity, style) {
         if (!style) return;
         let color = style.color instanceof Cesium.Color ? style.color : Cesium.Color.fromCssColorString(style.color);
         let material = color.withAlpha(style.colorAlpha || 1);
         entity.polygon.material = material;
         entity.polygon.height = undefined;
         entity.polygon.heightReference = 1;
     } */

    createPoint(position, style, properties) {
        let newStyle = {};
        if (properties) {
            for (let i in style) {
                if (style[i].conditions && style[i].conditions instanceof Array) {
                    let field = style[i].field;
                    let conditions = style[i].conditions;
                    let val = properties[field];
                    newStyle[i] = this.getStyleValue(field + '', val, conditions);
                }
            }
        }

        style = Object.assign(style, newStyle);

        let color = null;
        if (style.color) {
            color = Cesium.Color.fromCssColorString(style.color || "#ffff00");
            color = color.withAlpha(style.colorAlpha);
        }
        let outlineColor = null;
        if (style.outlineColor) {
            outlineColor = Cesium.Color.fromCssColorString(style.outlineColor || "#000000");
            outlineColor = outlineColor.withAlpha(style.outlineColorAlpha)
        }

        return this._layer.entities.add({
            position: position,
            point: {
                color: color,
                outlineColor: outlineColor,
                outlineWidth: style.outlineWidth || 1,
                pixelSize: style.pixelSize || 6,
                heightReference: 1
            }
        });
    }
    createPolygon(positions, style, properties) {
        let newStyle = {};
        if (properties) {
            for (let i in style) {
                if (style[i].conditions && style[i].conditions instanceof Array) {
                    let field = style[i].field;
                    let conditions = style[i].conditions;
                    let val = properties[field];
                    newStyle[i] = this.getStyleValue(field + '', val, conditions);
                }
            }
        }
        style = Object.assign(style, newStyle);

        let color = null;
        if (style.color) {
            color = Cesium.Color.fromCssColorString(style.color || "#ffff00");
            color = color.withAlpha(style.colorAlpha);
        }
        let outlineColor = null;
        if (style.outlineColor) {
            outlineColor = Cesium.Color.fromCssColorString(style.outlineColor || "#000000");
            outlineColor = outlineColor.withAlpha(style.outlineColorAlpha)
        }

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

        return this._layer.entities.add(grapicOpt)
    }
    createPolyline(positions, style, properties) {
        let newStyle = {};
        if (properties) {
            for (let i in style) {
                if (style[i].conditions && style[i].conditions instanceof Array) {
                    let field = style[i].field;
                    let conditions = style[i].conditions;
                    let val = properties[field];
                    newStyle[i] = this.getStyleValue(field + '', val, conditions);
                }
            }
        }
        style = Object.assign(style, newStyle);
        let color = null;
        if (style.color) {
            color = Cesium.Color.fromCssColorString(style.color || "#ffff00");
            color = color.withAlpha(style.colorAlpha);
        }

        return this._layer.entities.add({
            polyline: {
                positions: positions,
                material: color,
                width: style.width || 3,
                clampToGround: true
            }
        })
    }


}

export default GeojsonLayer;