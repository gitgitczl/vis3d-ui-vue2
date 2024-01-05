// 添加网格图
import BaseLayer from './baseLayer';
/**
 * @class
 * @augments BaseLayer
 * @alias BaseLayer.GridLayer
 * @example 
 *      let gridLayer = new vis3d.GridLayer(viewer,{
                show: true,
                glowColor : "#FF0000",
                alpha: 1,
        });
        gridLayer.load();
 */
class GridLayer extends BaseLayer {
    /**
    * @param {Cesium.Viewer} viewer 地图viewer对象 
    * @param {Object} opt 基础配置，其它参数见{@link BaseLayer}的Parameters。
    * @param {cells} [opt.cells=4] 网格单元的数量
    * @param {String} [opt.color='#33FFFF'] 网格线颜色
    * @param {String} [opt.glowColor='#33FFFF'] 网格线发光色
    * @param {Number} [opt.glowWidth=3] 网格线发光宽度
    * @param {String} [opt.backgroundColor='#CCCCCC'] 背景色
    * @param {Number} [opt.tileWidth=256] 服务切片宽度
    * @param {Number} [opt.tileHeight=256] 服务切片高度
    * @param {Number} [opt.canvasSize==256] 渲染的canvas尺寸
    */
    constructor(viewer, opt) {
        super(viewer, opt);

        /**
        * @property {String} type 类型
        */
        this.type = "grid";
        
        const color = Cesium.Color.fromCssColorString(opt.color || '#33FFFF');
        const glowColor = Cesium.Color.fromCssColorString(opt.glowColor || '#33FFFF');
        const backgroundColor = Cesium.Color.fromCssColorString(opt.backgroundColor || '#CCCCCC');
        this.providerAttr.cells = opt.cells || 4;
        this.providerAttr.glowWidth = opt.glowWidth || 3;
        this.providerAttr.color = color;
        this.providerAttr.glowColor = glowColor;
        this.providerAttr.backgroundColor = backgroundColor;

        this._provider = new Cesium.GridImageryProvider(this.providerAttr);
    }
}

export default GridLayer;