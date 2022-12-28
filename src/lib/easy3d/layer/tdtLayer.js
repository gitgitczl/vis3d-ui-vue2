// 天地图服务加载
// 加载当前在线的天地图服务 目前支持以下几种
import BaseLayer from './baseLayer';
/**
 * 天地图在线服务加载
 * @class
 * @augments BaseLayer
 * 
 */
class TDTLayer extends BaseLayer {
    /**
     * @param {Cesium.Viewer} viewer 地图viewer对象 
     * @param {Object} opt 基础配置
     * @param {String | String[]} [opt.keys] 天地图服务密钥（需在天地图官网申请）
     * @param {String} layerName 天地图图层名称（vec（矢量底图）/ cva（矢量注记）/ img（影像底图）/ ter（地形晕渲）cta（地形注记）/ ibo（全球境界）/ eva（矢量英文注记）/ eia（影像英文注记））
     * @param {String | Number} crs 坐标系EPSG（4326/3857）
     * @param {Number} opt.minimumLevel 地图服务最小层级
     * @param {Number} opt.maximumLevel 地图服务最大层级
     * @param {Number} [opt.tileWidth=256] 服务切片宽度
     * @param {Number} [opt.tileHeight=256] 服务切片高度
     * @param {Boolean} [opt.enablePickFeatures=true] 是否可通过鼠标拾取元素
    */
    constructor(viewer, opt) {
        // 内置keys
        const keys = [
            "313cd4b28ed520472e8b43de00b2de56",
            "83b36ded6b43b9bc81fbf617c40b83b5",
            "0ebd57f93a114d146a954da4ecae1e67",
            "6c99c7793f41fccc4bd595b03711913e",
            "56b81006f361f6406d0e940d2f89a39c"
        ];
        super(viewer, opt);
        this.type = "tdt";
        this.opt = opt || {};
        // 设定key 
        if (!this.opt.keys || this.opt.keys.length == 0) {
            let random = Math.random() * keys.length;
            random = Math.floor(random);
            this.key = keys[random];
        } else {
            if (Array.isArray(this.opt.keys)) {
                let random = Math.random() * this.opt.key.length;
                random = Math.floor(random);
                this.key = keys[random];
            } else {
                this.key = this.opt.keys
            }
        }

        // vec（矢量底图）/ cva（矢量注记）/ img（影像底图）/ ter（地形晕渲）
        // cta（地形注记）/ ibo（全球境界）/ eva（矢量英文注记）/ eia（影像英文注记）
        if (!this.opt.layerName) {
            console.log("缺少图层名称");
            return;
        }
        let tileMatrixSetID = "";
        let tdtLayerName = "";
        if (this.opt.crs == 4326) { // 经纬度
            tileMatrixSetID = "c";
            tdtLayerName = this.opt.layerName + "_c";
        } else { // 墨卡托  3857
            tileMatrixSetID = "w";
            tdtLayerName = this.opt.layerName + "_w";
        }
        const url = 'https://t{s}.tianditu.gov.cn/' + tdtLayerName + '/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=' + this.opt.layerName + '&style={style}&tilerow={TileRow}&tilecol={TileCol}&tilematrixset={TileMatrixSet}&format=tiles&tk=' + this.key;
        const maxLevel = 18;
        let tileMatrixLabels = [];
        for (let z = 0; z <= maxLevel; z++) {
            tileMatrixLabels[z] = z.toString();
        }

        let pattr = {
            url: url,
            layer: tdtLayerName,
            style: 'default',
            format: 'tiles',
            tileMatrixSetID: tileMatrixSetID,
            subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
            tileMatrixLabels: tileMatrixLabels,
            tilingScheme: new Cesium.WebMercatorTilingScheme(),
        };
        pattr = Object.assign(this.providerAttr || {}, pattr);
        this._provider = new Cesium.WebMapTileServiceImageryProvider(pattr);
    }
}

export default TDTLayer;