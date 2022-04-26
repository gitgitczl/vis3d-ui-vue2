import ArcgiscacheLayer from "./arcgiscacheLayer.js";
import MapserverLayer from './mapserverLayer.js';
import GridLayer from "./gridLayer.js";
import GeojsonLayer from "./geojsonLayer.js";
import TDTLayer from "./tdtLayer.js";
import SingleImageLayer from "./singleImageLayer.js";
import TMSLayer from "./tmsLayer.js";
import XYZLayer from "./xyzLayer.js";
import TilesetLayer from "./tilesetLayer";
class LayerTool {
    constructor(viewer) {
        this.viewer = viewer;
        this._layers = [];
    }
    get layers() {
        return this._layers;
    }
    add(opt) {
        let layer = null;
        let type = opt.type;
        switch (type) {
            case "xyz": //xyz格式切片
                layer = new XYZLayer(this.viewer, opt);
                break;
            case "wfs": // wfs服务
            case "geojson": // geojson格式数据
                layer = new GeojsonLayer(this.viewer, opt);
                break;
            case "mapserver": // arcgis标准mapserver服务
                layer = new MapserverLayer(this.viewer, opt);
                break;
            case "arcgiscache": // arcmap标注wgs84切片
                layer = new ArcgiscacheLayer(this.viewer, opt);
                break;
            case "tdt": // 天地图图层
                layer = new TDTLayer(this.viewer, opt);
                break;
            case "singleImage":// 单张图片  
                layer = new SingleImageLayer(this.viewer, opt);
                break;
            case "tms":// 标准tms类型
                layer = new TMSLayer(this.viewer, opt);
                break;
            case "3dtiles":// 模型
                layer = new TilesetLayer(this.viewer, opt);
                break;
            case "grid":// 网格图层
                layer = new GridLayer(this.viewer, opt);
                break;
            default:
                break;
        }
        if (!layer) return;
        if (layer.type == "3dtiles") {
            layer.load(function () {
                layer.setAlpha(opt.alpha);
                layer.setVisible(opt.show);
            });
        } else {
            layer.load();
            layer.setAlpha(opt.alpha);
            layer.setVisible(opt.show);
        }
        this._layers.push(layer);
        opt.id = opt.id || Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
        opt.alpha = opt.alpha == undefined ? 1 : opt.alpha;
        layer.id = opt.id;
        layer.attr = opt; // 绑定属性文件

        return layer;
    }
    removeLayer(layer){
        if(!layer) return ;
        this.removeLayerById(layer.id);
    }
    removeLayerById(id) {
        if (!id) return;
        let lyropt = this.getLayerById(id);
        if (lyropt && lyropt.layer) {
            lyropt.layer.remove();
            this._layers.splice(lyropt.index, 1);
        }
    }
    removeAll() {
        for (let i = 0; i < this._layers.length; i++) {
            this._layers[i].remove();
        }
        this._layers = [];
    }
    destroy() {
        this.removeAll();
        this._layers = [];
        delete this._layers
    }
    hideById(id) {
        if (!id) return;
        let layerOpt = this.getLayerById(id);
        if (layerOpt && layerOpt.layer) {
            layerOpt.layer.hide();
            layerOpt.layer.attr.show = false;
        }
    }
    showById(id) {
        if (!id) return;
        let layerOpt = this.getLayerById(id);
        if (layerOpt && layerOpt.layer) {
            layerOpt.layer.show();
            layerOpt.layer.attr.show = true;
        }
    }
    getLayerById(id) {
        if (!id) return;
        let obj = {};
        for (let i = 0; i < this._layers.length; i++) {
            if (this._layers[i].id == id) {
                obj = {
                    layer: this._layers[i],
                    index: i
                }
                break;
            }
        }
        return obj;
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
        let layobj = this.getLayerById(id) || {};
        if (layobj && layobj.layer)
            layobj.layer.zoomTo();
    }
    hideAll() {
        for (let i = 0; i < this._layers.length; i++) {
            this._layers[i].hide();
        }
    }

    // 获取当前所有显示的图层
    getAllshowLayers() {
        let arr = [];
        for (let i = 0; i < this._layers.length; i++) {
            if (this._layers[i].attr.show) {
                arr.push(this._layers[i]);
            }
        }
        return arr;
    }
    getAllhideLayers() {
        let arr = [];
        for (let i = 0; i < this._layers.length; i++) {
            if (!this._layers[i].attr.show) {
                arr.push(this._layers[i]);
            }
        }
        return arr;
    }
    // 根据字段来进行查询
    getLayerByField(field, val) {
        if (!field) return;
        let returnData = [];
        for (let i = 0; i < this._layers.length; i++) {
            if (this._layers[i].attr[field] == val) {
                returnData.push(this._layers[i]);
            }
        }
        return returnData;
    }
}

export default LayerTool;