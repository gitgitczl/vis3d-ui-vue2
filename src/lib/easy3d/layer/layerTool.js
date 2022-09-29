import ArcgiscacheLayer from "./arcgiscacheLayer.js";
import MapserverLayer from './mapserverLayer.js';
import GridLayer from "./gridLayer.js";
import GeojsonLayer from "./geojsonLayer.js";
import TDTLayer from "./tdtLayer.js";
import SingleImageLayer from "./singleImageLayer.js";
import TMSLayer from "./tmsLayer.js";
import XYZLayer from "./xyzLayer.js";
import TilesetLayer from "./tilesetLayer";
import WMSLayer from "./wmsLayer";
class LayerTool {
    constructor(viewer) {
        this.viewer = viewer;
        this._layerObjs = [];

        this.layerIndex = 0;
    }
    get layers() {
        return this._layerObjs;
    }
    add(opt) {
        let layerObj = null;
        opt = JSON.parse(JSON.stringify(opt || {}));
        let type = opt.type;

        // 自动设置图层的index
        if (type != "geojson" || type != "3dtiles") {
            opt.index = this.layerIndex;
            this.layerIndex++;
        }

        switch (type) {
            case "xyz": //xyz格式切片
                layerObj = new XYZLayer(this.viewer, opt);
                break;
            case "wfs": // wfs服务
            case "geojson": // geojson格式数据
                layerObj = new GeojsonLayer(this.viewer, opt);
                break;
            case "mapserver": // arcgis标准mapserver服务
                layerObj = new MapserverLayer(this.viewer, opt);
                break;
            case "arcgiscache": // arcmap标注wgs84切片
                layerObj = new ArcgiscacheLayer(this.viewer, opt);
                break;
            case "tdt": // 天地图图层
                layerObj = new TDTLayer(this.viewer, opt);
                break;
            case "singleImage":// 单张图片  
                layerObj = new SingleImageLayer(this.viewer, opt);
                break;
            case "tms":// 标准tms类型
                layerObj = new TMSLayer(this.viewer, opt);
                break;
            case "3dtiles":// 模型
                layerObj = new TilesetLayer(this.viewer, opt);
                break;
            case "wms":// 模型
                layerObj = new WMSLayer(this.viewer, opt);
                break;
            case "grid":// 网格图层
                layerObj = new GridLayer(this.viewer, opt);
                break;
            default:
                break;
        }
        if (!layerObj) return;
        if (layerObj.type == "3dtiles" || layerObj.type == "geojson") {
            layerObj.load(function () {
                if (opt.alpha != undefined) layerObj.setAlpha(opt.alpha);
                layerObj.setVisible(opt.show);
            });
        } else {
            layerObj.load();
            if (opt.alpha != undefined) layerObj.setAlpha(opt.alpha);
            layerObj.setVisible(opt.show);
        }
        this._layerObjs.push(layerObj);

        opt.id = opt.id || Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
        opt.alpha = opt.alpha == undefined ? 1 : opt.alpha;
        layerObj.attr = opt; // 绑定属性文件
        return layerObj;
    }
    getLayerObjById(id) {
        if (!id) return;
        let obj = {};
        for (let i = 0; i < this._layerObjs.length; i++) {
            if (this._layerObjs[i].attr.id == id) {
                obj = {
                    layerObj: this._layerObjs[i],
                    index: i
                }
                break;
            }
        }
        return obj;
    }

    /**
     * 获取当前图层对象
     * @param {Object} query 
     */
    getLayerObj(query) {
        let { key, value } = query;
        let obj = {};
        for (let i = 0; i < this._layerObjs.length; i++) {
            if (this._layerObjs[i].attr[key] == value) {
                obj = {
                    layerObj: this._layerObjs[i],
                    index: i
                }
                break;
            }
        }
    }

    removeLayerObj(layerObj) {
        if (!layerObj) return;
        this.removeLayerObjById(layerObj.id);
    }
    removeLayerObjById(id) {
        if (!id) return;
        let lyropt = this.getLayerObjById(id);
        if (lyropt && lyropt.layerObj) {
            lyropt.layerObj.remove();
            this._layerObjs.splice(lyropt.index, 1);
        }
    }
    removeAll() {
        for (let i = 0; i < this._layerObjs.length; i++) {
            this._layerObjs[i].remove();
        }
        this._layerObjs = [];
    }
    destroy() {
        this.removeAll();
        this._layerObjs = [];
        delete this._layerObjs
    }
    hideById(id) {
        if (!id) return;
        let layerOpt = this.getLayerObjById(id);
        if (layerOpt && layerOpt.layerObj) {
            layerOpt.layerObj.hide();
            layerOpt.layerObj.attr.show = false;
        }
    }
    showById(id) {
        if (!id) return;
        let layerOpt = this.getLayerObjById(id);
        if (layerOpt && layerOpt.layerObj) {
            layerOpt.layerObj.show();
            layerOpt.layerObj.attr.show = true;
        }
    }

    setVisible(id, isShow) {
        if (!id) return;
        if (isShow) {
            this.showById(id);
        } else {
            this.hideById(id);
        }
    }
    // 缩放到某个
    zoomTo(id) {
        if (!id) return;
        let layobj = this.getLayerObjById(id) || {};
        if (layobj && layobj.layerObj)
            layobj.layerObj.zoomTo();
    }
    hideAll() {
        for (let i = 0; i < this._layerObjs.length; i++) {
            this._layerObjs[i].hide();
        }
    }

    // 获取当前所有显示的图层
    getAllshow() {
        let arr = [];
        for (let i = 0; i < this._layerObjs.length; i++) {
            if (this._layerObjs[i].attr.show) {
                arr.push(this._layerObjs[i]);
            }
        }
        return arr;
    }
    getAllhide() {
        let arr = [];
        for (let i = 0; i < this._layerObjs.length; i++) {
            if (!this._layerObjs[i].attr.show) {
                arr.push(this._layerObjs[i]);
            }
        }
        return arr;
    }
    // 根据字段来进行查询
    getLayerObjByField(field, val) {
        if (!field) return;
        let returnData = [];
        for (let i = 0; i < this._layerObjs.length; i++) {
            if (this._layerObjs[i].attr[field] == val) {
                returnData.push(this._layerObjs[i]);
            }
        }
        return returnData;
    }
    lowerLayer(opt) {
        if (!opt) return;
        if (opt instanceof String) {
            opt = {
                key: "id",
                value: opt
            }
        }
        let obj = this.getLayerObj(opt);
        if (obj && obj.layerObj) obj.layerObj.lowerLayer()
    }
    lowerLayerToBottom(opt) {
        if (!opt) return;
        if (opt instanceof String) {
            opt = {
                key: "id",
                value: opt
            }
        }
        let obj = this.getLayerObj(opt);
        if (obj && obj.layerObj) obj.layerObj.lowerLayerToBottom()
    }
    raiseLayer() {
        if (!opt) return;
        if (opt instanceof String) {
            opt = {
                key: "id",
                value: opt
            }
        }
        let obj = this.getLayerObj(opt);
        if (obj && obj.layerObj) obj.layerObj.raiseLayer()
    }
    raiselayerToTop() {
        if (!opt) return;
        if (opt instanceof String) {
            opt = {
                key: "id",
                value: opt
            }
        }
        let obj = this.getLayerObj(opt);
        if (obj && obj.layerObj) obj.layerObj.raiselayerToTop()
    }
}

export default LayerTool;