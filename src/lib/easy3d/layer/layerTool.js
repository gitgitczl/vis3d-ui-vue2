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
import WMTSLayer from "./wmtsLayer";



/**
 * 图层控制类
 * @description 图层控制类，通过此类对象，可直接添加相关类型图层，并对添加的图层对象进行控制，而不用多次new 不同类型的图层对象。
 * @class
 */
class LayerTool {
    /**
     * @param {Cesium.Viewer} viewer 当前viewer对象 
     * @param {Object} [opt] 其他参数
     */
    constructor(viewer, opt) {
        this.viewer = viewer;
        /**
         * @property {Array} layerObjs 图层对象数组
         */
        this._layerObjs = [];
    }
    get layerObjs() {
        return this._layerObjs;
    }

    /**
     * 新增图层
     * @param {Object} opt 图层属性
     * @param {String | Number} [opt.id] 图层id，如果不传入，则自动生成
     * @param {String} opt.type 图层的类别（xyz、wfs、geojson、mapserver、arcgiscache、tdt、singleImage、tms、3dtiles、wms、grid）
     * @param {String} opt.alpha 图层的透明度
     * @returns {Object} 图层对象
     */
    add(opt) {
        let layerObj = null;
        opt = JSON.parse(JSON.stringify(opt || {}));
        let type = opt.type;

        // 自动设置图层的index
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
            case "wmts":// 模型
                layerObj = new WMTSLayer(this.viewer, opt);
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
        layerObj.attr = opt; // 绑定属性文件 与mapConfig.js进行关联
        return layerObj;
    }

    /**
     * 根据id获取当前图层对象
     * @param {String | Number} id 
     * @returns {Object} layerObj为图层对象，index为图层对象在数组中位置
     */
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
    /* getLayerObj(query) {
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
    } */

    /**
     * 移除图层对象
     * @param {Object} layerObj 图层对象
     */
    removeLayerObj(layerObj) {
        if (!layerObj) return;
        this.removeLayerObjById(layerObj.id);
    }

    /**
     * 根据id移除图层对象
     * @param {String | Number} id 图层对象id
    */
    removeLayerObjById(id) {
        if (!id) return;
        let lyropt = this.getLayerObjById(id);
        if (lyropt && lyropt.layerObj) {
            lyropt.layerObj.remove();
            this._layerObjs.splice(lyropt.index, 1);
        }
    }

    /**
     * 移除所有图层对象
     */
    removeAll() {
        for (let i = 0; i < this._layerObjs.length; i++) {
            this._layerObjs[i].remove();
        }
        this._layerObjs = [];
    }

    /**
     * 销毁
     */
    destroy() {
        this.removeAll();
        this._layerObjs = [];
        delete this._layerObjs
    }

    /**
     * 根据id隐藏图层
     * @param {String | Number} id 图层对象id
     */
    hideById(id) {
        if (!id) return;
        let layerOpt = this.getLayerObjById(id);
        if (layerOpt && layerOpt.layerObj) {
            layerOpt.layerObj.hide();
            layerOpt.layerObj.attr.show = false;
        }
    }

    /**
     * 根据id显示图层
     * @param {String | Number} id 图层对象id
     */
    showById(id) {
        if (!id) return;
        let layerOpt = this.getLayerObjById(id);
        if (layerOpt && layerOpt.layerObj) {
            layerOpt.layerObj.show();
            layerOpt.layerObj.attr.show = true;
        }
    }

    /**
     * 根据id设置图层显示隐藏
     * @param {String | Number} id 图层对象id
     * @param {Boolean} isShow 是否显示 
     */
    setVisible(id, isShow) {
        if (!id) return;
        if (isShow) {
            this.showById(id);
        } else {
            this.hideById(id);
        }
    }
    
    /**
     * 根据图层对象id，缩放到某个图层
     * @param {String | Number} id 图层对象id
    */
    zoomTo(id) {
        if (!id) return;
        let layobj = this.getLayerObjById(id) || {};
        if (layobj && layobj.layerObj)
            layobj.layerObj.zoomTo();
    }

    /**
     * 隐藏所有图层
    */
    hideAll() {
        for (let i = 0; i < this._layerObjs.length; i++) {
            this._layerObjs[i].hide();
        }
    }

    /**
     * 获取当前所有显示的图层
     * @returns {Array} 图层对象数组
    */
    getAllshow() {
        let arr = [];
        for (let i = 0; i < this._layerObjs.length; i++) {
            if (this._layerObjs[i].attr.show) {
                arr.push(this._layerObjs[i]);
            }
        }
        return arr;
    }

    /**
     * 获取当前所有隐藏的图层
     * @returns {Array} 图层对象数组
    */
    getAllhide() {
        let arr = [];
        for (let i = 0; i < this._layerObjs.length; i++) {
            if (!this._layerObjs[i].attr.show) {
                arr.push(this._layerObjs[i]);
            }
        }
        return arr;
    }

    /**
     * 根据图层属性字段来进行查询
     * @param {String} field 字段名称
     * @param {String} val 字段值
     * @returns {Array} 符合查询条件的图层对象数组
    */
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
    /* lowerLayer(opt) {
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
    } */
}

export default LayerTool;