// arcgis 自定义切片
import BaseLayer from './baseLayer';
/**
 * arcgis 切片类型图层（一般由arcmap切片后的数据发布）
 * @class
 * @augments BaseLayer
 * @example 
 * let arcgisLayer = new easy3d.ArcgiscacheLayer(viewer,{
    url: "http://112.86.147.194:9009/data/demnewtile/L{arc_z}/R{arc_y}/C{arc_x}.png",
    minimumLevel: 1,
    maximumLevel: 19,
    minimumTerrainLevel: 1,
    view: {
        x: 118.73263653438936,
        y: 31.971959788539053,
        z: 6643.463555185671,
        heading: 341.6647257262609,
        pitch: -36.54290725763041,
        roll: 359.9323408763138,
    },
});
arcgisLayer.load();
 */
class ArcgiscacheLayer extends BaseLayer {
    /**
     * @param {Cesium.Viewer} viewer 地图viewer对象 
     * @param {Object} opt 基础配置
     * @param {String} opt.url 模型服务地址
     * @param {Number} opt.minimumLevel 地图服务最小层级
     * @param {Number} opt.maximumLevel 地图服务最大层级
     * @param {Number} [opt.tileWidth=256] 服务切片宽度
     * @param {Number} [opt.tileHeight=256] 服务切片高度
     * @param {Boolean} [opt.enablePickFeatures=true] 是否可通过鼠标拾取元素
     */
    constructor(viewer, opt) {
        super(viewer, opt);
        this.type = "arcgiscache";
        if (!Cesium.UrlTemplateImageryProvider.prototype.padLeft0) {
            Cesium.UrlTemplateImageryProvider.prototype.padLeft0 = function (numStr, n) {
                numStr = String(numStr);
                var len = numStr.length;
                while (len < n) {
                    numStr = "0" + numStr;
                    len++;
                }
                return numStr;
            };
        }
        
        let customTags = {
            //小写
            "arc_x": function arc_x(imageryProvider, x, y, level) {
                return imageryProvider.padLeft0(x.toString(16), 8);
            },
            "arc_y": function arc_y(imageryProvider, x, y, level) {
                return imageryProvider.padLeft0(y.toString(16), 8);
            },
            "arc_z": function arc_z(imageryProvider, x, y, level) {
                return imageryProvider.padLeft0(level.toString(), 2);
            },
            "arc_z4490": function arc_z4490(imageryProvider, x, y, level) {
                return imageryProvider.padLeft0((level + 1).toString(), 2);
            },
            //大写
            "arc_X": function arc_X(imageryProvider, x, y, level) {
                return imageryProvider.padLeft0(x.toString(16), 8).toUpperCase();
            },
            "arc_Y": function arc_Y(imageryProvider, x, y, level) {
                return imageryProvider.padLeft0(y.toString(16), 8).toUpperCase();
            },
            "arc_Z": function arc_Z(imageryProvider, x, y, level) {
                return imageryProvider.padLeft0(level.toString(), 2).toUpperCase();
            },
            "arc_Z4490": function arc_Z4490(imageryProvider, x, y, level) {
                return imageryProvider.padLeft0((level + 1).toString(), 2).toUpperCase();
            }
        };
        let pattr = Object.assign(this.providerAttr, {
            customTags: customTags
        })
        this._provider = new Cesium.UrlTemplateImageryProvider(pattr);;
    }
}

export default ArcgiscacheLayer;