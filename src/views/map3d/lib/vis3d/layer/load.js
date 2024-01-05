/**
 * 加载图层方法
 */
import LayerToool from "./layerTool";
let layerTool = undefined;
/**
 * 新增图层
 * @param {Object} opt 
 * @param {Cesium.Viewer} viewer 地图对象 
 * @returns {Object} 图层obj对象
 */
const add = (opt, viewer) => {
    if (!layerTool) {
        layerTool = new LayerToool(viewer);
    }

    return layerTool.add(opt);
}

/**
 * 移除单个图层
 * @param {*} layerObj 图层obj对象
 * @returns 
 */
const remove = (layerObj) => {
    if (!layerObj || !layerTool) return;
    layerTool.removeLayerObj(layerObj)
}

/**
 * 移除全部
 */
const removeAll = () => {
    if (!layerObj) return;
    layerTool.removeAll()
}

export {
    add, remove, removeAll
}