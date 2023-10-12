// 配置文件预处理 会读取window下的配置 
import _mapConfig from "./mapConfig"
import _workConfig from "./workConfig"
// 深度合并对象
function deepAssign(...param) {
    let result = Object.assign({}, ...param);
    for (let item of param) {
        for (let [idx, val] of Object.entries(item)) {
            if (typeof val === 'object') {
                result[idx] = deepAssign(result[idx], val);
            }
        }
    }
    return result;
}


const mapConfig = deepAssign({}, _mapConfig, window.mapConfig || {});
const workConfig = deepAssign({}, _mapConfig, window.mapConfig || {});

export {
    mapConfig, workConfig
}