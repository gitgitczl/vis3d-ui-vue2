// wfs geojson 格式 均可使用此类
class GeojsonLayer {
    constructor(viewer, opt) {
        this.type = "geojson";
        this.viewer = viewer;
        this.opt = opt || {};
        // 设置默认样式配置
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

        this.tooltip = this.opt.tooltip;
        /* this.load(); */
    }
    get layer() {
        return this._layer;
    }
    // 加载
    load() {
        var that = this;
        $.getJSON(this.url, function (res) {
            var features = res.features;
            for (var i = 0; i < features.length; i++) {
                let { geometry, properties } = features[i];
                if(!geometry) continue;
                var type = geometry.type;
                var coordinates = geometry.coordinates;
                switch (type) {
                    case "Point": // 当geojson是单点时  可能创建点 图标点 单个模型
                        var ent = {};
                        var position = cUtil.lnglatToCartesian(coordinates);
                        ent = that.createPoint(position, that.style["point"]);
                        ent.properties = properties;
                        ent.show = (that.opt.show == undefined ? true : that.opt.show);
                        if (that.opt.popup) ent.popup = that.getContent(properties, that.opt.popup);
                        if (that.opt.tooltip) ent.tooltip = that.getContent(properties, that.opt.tooltip);
                        that._layer.entities.add(ent);
                        break;
                    case "MultiPoint":
                        for (var i = 0; i < coordinates.length; i++) {
                            var ent = {};
                            var position = cUtil.lnglatToCartesian(coordinates[i]);
                            ent = that.createPoint(position, that.style["point"]);
                            ent.show = (that.opt.show == undefined ? true : that.opt.show);
                            ent.properties = properties;
                            if (that.opt.popup) ent.popup = that.getContent(properties, that.opt.popup);
                            if (that.opt.tooltip) ent.tooltip = that.getContent(properties, that.opt.tooltip);
                            that._layer.entities.add(ent);
                        }
                        break;
                    case "LineString":
                        var ent = {};
                        var positions = cUtil.lnglatsToCartesians(coordinates);
                        ent = that.createPolyline(positions, that.style["polyline"]);
                        ent.show = (that.opt.show == undefined ? true : that.opt.show);
                        ent.properties = properties;
                        if (that.opt.popup) ent.popup = that.getContent(properties, that.opt.popup);
                        if (that.opt.tooltip) ent.tooltip = that.getContent(properties, that.opt.tooltip);
                        that._layer.entities.add(ent);
                        // 构建折线
                        break;
                    case "MultiLineString":
                        for (var i = 0; i < coordinates.length; i++) {
                            var ent = {};
                            var positions = cUtil.lnglatsToCartesians(coordinates[i]);
                            ent = that.createPolyline(positions, that.style["polyline"]);
                            ent.show = (that.opt.show == undefined ? true : that.opt.show);
                            ent.properties = properties;
                            if (that.opt.popup) ent.popup = that.getContent(properties, that.opt.popup);
                            if (that.opt.tooltip) ent.tooltip = that.getContent(properties, that.opt.tooltip);
                            that._layer.entities.add(ent);
                        }
                        break;
                    case "Polygon":
                        var ent = {};
                        var positions = cUtil.lnglatsToCartesians(coordinates[0]);
                        ent = that.createPolygon(positions, that.style["polygon"]);
                        ent.show = (that.opt.show == undefined ? true : that.opt.show);
                        ent.properties = properties;
                        if (that.opt.popup) ent.popup = that.getContent(properties, that.opt.popup);
                        if (that.opt.tooltip) ent.tooltip = that.getContent(properties, that.opt.tooltip);
                        that._layer.entities.add(ent);
                        break;
                    case "MultiPolygon":
                        for (var i = 0; i < coordinates.length; i++) {
                            var ent = {};
                            var positions = cUtil.lnglatsToCartesians(coordinates[i][0]);
                            ent = that.createPolygon(positions, that.style["polygon"]);
                            ent.show = (that.opt.show == undefined ? true : that.opt.show);
                            ent.properties = properties;
                            if (that.opt.popup) ent.popup = that.getContent(properties, that.opt.popup);
                            if (that.opt.tooltip) ent.tooltip = that.getContent(properties, that.opt.tooltip);
                            that._layer.entities.add(ent);
                        }
                        break;
                    default:
                        ;
                }
            }
        });
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
    createPoint(position, style) {
        return this.viewer.entities.add({
            position: position,
            point: {
                color: style.color instanceof Cesium.Color ? style.color : (style.color ? Cesium.Color.fromCssColorString(style.color).withAlpha(style.alpha || 1) : Cesium.Color.WHITE),
                outlineColor: style.outlineColor instanceof Cesium.Color ? style.outlineColor : (style.outlineColor ? Cesium.Color.fromCssColorString(style.outlineColor).withAlpha(style.outlineAlpha || 1) : Cesium.Color.BLACK),
                outlineWidth: style.outlineWidth || 2,
                pixelSize: style.pixelSize || 6,
                heightReference: 1
            }
        });
    }
    createPolygon(positions, style) {
        let grapicOpt = {};
        grapicOpt.polygon = {
            hierarchy: new Cesium.CallbackProperty(function () {
                return new Cesium.PolygonHierarchy(positions)
            }, false),
            heightReference: 1,
            fill: style.fill == undefined ? true : style.fill,
            material: style.color instanceof Cesium.Color ? style.color : Cesium.Color.fromCssColorString(style.color).withAlpha(style.alpha || 1)
        }
        if (style.outline) {
            grapicOpt.polyline = {
                positions: new Cesium.CallbackProperty(function () {
                    return positions
                }, false),
                material: style.outlineColor ? Cesium.Color.fromCssColorString(style.outlineColor).withAlpha(style.outlineAlpha || 1) : Cesium.Color.RED,
                width: style.outlineWidth || 3,
                clampToGround: true
            }
        }

        return this.viewer.entities.add(grapicOpt)
    }
    createPolyline(positions, style) {
        return this.viewer.entities.add({
            polyline: {
                positions: new Cesium.CallbackProperty(function () {
                    return positions
                }, false),
                material: style.color instanceof Cesium.Color ? style.color : (style.color ? Cesium.Color.fromCssColorString(style.color).withAlpha(style.alpha || 1) : Cesium.Color.WHITE),
                width: style.width || 3,
                clampToGround: style.clampToGround
            }
        })
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


}

export default GeojsonLayer;