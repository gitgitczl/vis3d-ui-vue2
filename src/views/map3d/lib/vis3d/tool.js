/**
 * 常用工具、和地图无关的方法
 * @exports tool
 * @alias tool
 */
let tool = {}
/**
 * 文本或json等下载方法
 * @param {String} fileName 文件名称，后缀需要加类型，如.txt / .json等
 * @param {String} datastr 文本字符串
 * @example tool.downloadFile("测试.json",JSON.stringify(data));
*/
tool.downloadFile = function (fileName, datastr) {
    var blob = new Blob([datastr]);
    _download(fileName, blob);
}

/**
 * 图片下载方法
 * @param {String} fileName 图片名称
 * @param {Canvas} canvas dom canvas对象
*/
tool.downloadImage = function (fileName, canvas) {
    var base64 = canvas.toDataURL("image/png");
    var blob = base64Img2Blob(base64);
    _download(fileName + '.png', blob);
}

/**
 * 树形结构转线性
 */
tool.tree2line = (data, fieldName) => {
    fieldName = fieldName || 'children';
    if (!data) return [];
    let arr = [];
    function recurse(item) {
        let itemCopy = JSON.parse(JSON.stringify(item));
        delete itemCopy[fieldName];
        if (item[fieldName] && item[fieldName].length > 0) {
            for (let i = 0; i < item[fieldName].length; i++) {
                let one = item[fieldName][i];
                one.parentAttr = itemCopy; // 保存父级属性
                recurse(one)
            }
        } else {
            arr.push(itemCopy)
        }
    }

    recurse(data);
    return arr;
}


function _download(fileName, blob) {
    var aLink = document.createElement('a');
    aLink.download = fileName;
    aLink.href = URL.createObjectURL(blob);
    document.body.appendChild(aLink);
    aLink.click();
    document.body.removeChild(aLink);
}

function base64Img2Blob(code) {
    var parts = code.split(';base64,');
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);
    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }
    return new Blob([uInt8Array], {
        type: contentType
    });
}

export default tool;