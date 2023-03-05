/**
 * 常用工具、和地图无关的方法
 * @exports cTool
 * @alias cTool
 */
let cTool = {}
/**
 * 文本或json等下载方法
 * @param {String} fileName 文件名称，后缀需要加类型，如.txt / .json等
 * @param {String} datastr 文本字符串
 * @example cTool.downloadFile("测试.json",JSON.stringify(data));
*/
cTool.downloadFile = function (fileName, datastr) {
    var blob = new Blob([datastr]);
    _download(fileName, blob);
}

/**
 * 图片下载方法
 * @param {String} fileName 图片名称
 * @param {Canvas} canvas dom canvas对象
*/
cTool.downloadImage = function (fileName, canvas) {
    var base64 = canvas.toDataURL("image/png");
    var blob = base64Img2Blob(base64);
    _download(fileName + '.png', blob);
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

export default cTool;