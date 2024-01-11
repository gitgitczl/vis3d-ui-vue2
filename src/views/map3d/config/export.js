// 配置文件预处理 会读取window下的配置 
import defaulte_mapConfig from "./mapConfig"
// 深度合并对象
function deepAssign(obj1, obj2) {
    let _this = this
    for (let key in obj2) {
        obj1[key] = obj1[key] && obj1[key].toString() === "[object Object]" ? _this.deepMerge(obj1[key], obj2[key]) : obj1[key] = obj2[key]
    }
    return obj1
}

const mapConfig = deepAssign(defaulte_mapConfig, window.mapConfig || {});

export {
    mapConfig
}