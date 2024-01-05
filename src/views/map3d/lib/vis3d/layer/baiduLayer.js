// arcgis online 切片
import BaseLayer from './baseLayer.js';

function BaiduImageryProvider(options) {
    this._errorEvent = new Cesium.Event();
    this._tileWidth = 256;
    this._tileHeight = 256;
    this._maximumLevel = 18;
    this._minimumLevel = 1;
    var southwestInMeters = new Cesium.Cartesian2(-33554054, -33746824);
    var northeastInMeters = new Cesium.Cartesian2(33554054, 33746824);
    this._tilingScheme = new Cesium.WebMercatorTilingScheme({
        rectangleSouthwestInMeters: southwestInMeters,
        rectangleNortheastInMeters: northeastInMeters
    });
    this._rectangle = this._tilingScheme.rectangle;
    var resource = Cesium.Resource.createIfNeeded(options.url);
    this._resource = resource;
    this._tileDiscardPolicy = undefined;
    this._credit = undefined;
    this._readyPromise = undefined;
}

Object.defineProperties(BaiduImageryProvider.prototype, {
    url: {
        get: function () {
            return this._resource.url;
        }
    },
    proxy: {
        get: function () {
            return this._resource.proxy;
        }
    },
    tileWidth: {
        get: function () {
            if (!this.ready) {
                throw new Cesium.DeveloperError('tileWidth must not be called before the imagery provider is ready.');
            }
            return this._tileWidth;
        }
    },

    tileHeight: {
        get: function () {
            if (!this.ready) {
                throw new Cesium.DeveloperError('tileHeight must not be called before the imagery provider is ready.');
            }
            return this._tileHeight;
        }
    },

    maximumLevel: {
        get: function () {
            if (!this.ready) {
                throw new Cesium.DeveloperError('maximumLevel must not be called before the imagery provider is ready.');
            }
            return this._maximumLevel;
        }
    },

    minimumLevel: {
        get: function () {
            if (!this.ready) {
                throw new Cesium.DeveloperError('minimumLevel must not be called before the imagery provider is ready.');
            }
            return this._minimumLevel;
        }
    },

    tilingScheme: {
        get: function () {
            if (!this.ready) {
                throw new Cesium.DeveloperError('tilingScheme must not be called before the imagery provider is ready.');
            }
            return this._tilingScheme;
        }
    },

    tileDiscardPolicy: {
        get: function () {
            if (!this.ready) {
                throw new Cesium.DeveloperError('tileDiscardPolicy must not be called before the imagery provider is ready.');
            }
            return this._tileDiscardPolicy;
        }
    },

    rectangle: {
        get: function () {
            if (!this.ready) {
                throw new Cesium.DeveloperError('rectangle must not be called before the imagery provider is ready.');
            }
            return this._rectangle;
        }
    },

    errorEvent: {
        get: function () {
            return this._errorEvent;
        }
    },
    ready: {
        get: function () {
            return this._resource;
        }
    },
    readyPromise: {
        get: function () {
            return this._readyPromise;
        }
    },
    credit: {
        get: function () {
            if (!this.ready) {
                throw new Cesium.DeveloperError('credit must not be called before the imagery provider is ready.');
            }
            return this._credit;
        }
    },
});

BaiduImageryProvider.prototype.requestImage = function (x, y, level, request) {
    var r = this._tilingScheme.getNumberOfXTilesAtLevel(level);
    var c = this._tilingScheme.getNumberOfYTilesAtLevel(level);
    var s = this.url.replace("{x}", x - r / 2).replace("{y}", c / 2 - y - 1).replace("{z}", level).replace("{s}", Math.floor(10 * Math.random()));
    return Cesium.ImageryProvider.loadImage(this, s);
};

/**
 * mapserver 类型图层
 * @class
 * @augments BaseLayer
 * @alias BaseLayer.BaiduLayer
 */
class BaiduLayer extends BaseLayer {
    /**
     * @param {Cesium.Viewer} viewer 地图viewer对象 
     * @param {Object} opt 基础配置，其它参数见{@link BaseLayer}的Parameters。
     * @param {String} opt.url 地图服务地址
     * @param {String} [opt.token] 地图服务token
     * @param {String} [opt.layers] 服务中图层名称
     * @param {Boolean} [opt.enablePickFeatures=true] 是否可通过鼠标拾取元素
     * @param {Number} [opt.tileWidth=256] 服务切片宽度
     * @param {Number} [opt.tileHeight=256] 服务切片高度
     * @param {Number} [opt.maximumLevel] 地图服务最大层级
     */
    constructor(viewer, opt) {
        super(viewer, opt);

        /**
        * @property {String} type 类型
        */
        this.type = "baidu";
        let pattr = Object.assign(this.providerAttr || {}, {
            url: "http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1"
        });
        this._provider = new BaiduImageryProvider(pattr)
    }
}

export default BaiduLayer;