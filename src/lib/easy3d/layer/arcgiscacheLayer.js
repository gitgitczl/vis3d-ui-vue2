// arcgis 自定义切片
import BaseLayer from './baseLayer';
/**
 * arcgis切片类型图层
 * @augments BaseLayer
 */
class ArcgiscacheLayer extends BaseLayer {
    /**
     * 
     * @param {Object} opt 基础配置，可将
     * @param {Number} opt.minimumLevel 地图服务最小层级
     * @param {Number} opt.maximumLevel 地图服务最大层级
     * 
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