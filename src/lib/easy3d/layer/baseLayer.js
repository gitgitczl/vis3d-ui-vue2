import cUtil from "../cUtil";
// 图层管理父类
class BaseLayer {
    constructor(viewer, opt) {
        this.viewer = viewer;
        this.opt = opt || {};
        this.id = opt.id || Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
        if (!opt.url && opt.type != "tdt" && opt.type != "grid") {
            console.log("缺少服务地址！", opt);
            return;
        }
        // 所加载的范围
        this.providerAttr = {};
        if (this.opt.rectangle) {
            this.opt.rectangle = new Cesium.Rectangle(
                Cesium.Math.toRadians(this.opt.rectangle[0]),
                Cesium.Math.toRadians(this.opt.rectangle[1]),
                Cesium.Math.toRadians(this.opt.rectangle[2]),
                Cesium.Math.toRadians(this.opt.rectangle[3]));
            this.providerAttr.rectangle = this.opt.rectangle; // 控制加载的范围
        }
        // 控制加载的层级
        if (this.opt.minimumLevel) this.providerAttr.minimumLevel = this.opt.minimumLevel;
        if (this.opt.maximumLevel) this.providerAttr.maximumLevel = this.opt.maximumLevel;
        this.providerAttr.url = opt.url;
        this._layer = null;
        this._provider = {};
    }

    get layer() {
        return this._layer;
    }

    // 定义方法
    load() {
        if (!this._provider || this._provider == {}) return;
        let options = {
            rectangle: this.opt.rectangle,
            /*  cutoutRectangle : this.opt.rectangle, */
            alpha: this.opt.alpha || 1, // 控制显示的层级
            brightness: this.opt.brightness || 1,
            show: this.opt.show == undefined ? true : this.opt.show
        }
        if (this.opt.minimumTerrainLevel) options.minimumTerrainLevel = this.opt.minimumTerrainLevel; // 控制显示的层级
        if (this.opt.maximumTerrainLevel) options.maximumTerrainLevel = this.opt.maximumTerrainLevel;  // 控制显示的层级
        this._layer = new Cesium.ImageryLayer(this._provider, options);
        this.viewer.imageryLayers.add(this._layer, this.opt.zIndex);
        this._layer.attr = this.opt; // 保存配置信息
    }

    getLayer() {
        return this._layer;
    }

    remove() {
        if (this._layer) this.viewer.imageryLayers.remove(this._layer);
    }

    show() {
        if (this._layer) {
            this._layer.show = true;
            this._layer.attr.show = true;
        }
    }

    hide() {
        if (this._layer) {
            this._layer.show = false;
            this._layer.attr.show = false;
        }
    }

    setVisible(visible) {
        visible = visible == undefined ? true : visible;
        if (visible) {
            this.show();
        } else {
            this.hide();
        }
    }

    zoomTo() {
        if (this.opt.view) {
            cUtil.setCameraView(this.opt.view);
        } else {
            this.viewer.zoomTo(this._layer);
        }
    }

    // 设置透明度
    setAlpha(alpha) {
        if (!this._layer) return;
        alpha = alpha == undefined ? 1 : alpha;
        this._layer.alpha = alpha;
    }

    lowerLayer() {
        if (this._layer) this.viewer.imageryLayers.lower(this._layer);
    }
    lowerLayerToBottom() {
        if (this._layer) this.viewer.imageryLayers.lowerToBottom(this._layer);
    }
    raiseLayer() {
        if (this._layer) this.viewer.imageryLayers.raise(this._layer);
    }
    raiselayerToTop() {
        if (this._layer) this.viewer.imageryLayers.raiseToTop(this._layer);
    }



}

export default BaseLayer;