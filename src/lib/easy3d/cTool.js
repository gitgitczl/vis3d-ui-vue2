/*Cesium无关的常用小工具 */

// 图片下载 实现截屏
function downloadCanvasIamge(canvas, name) {
    // 通过选择器获取canvas元素
    var url = canvas.toDataURL('image/png')
    console.log(url);
    // 生成一个a元素
    var a = document.createElement('a')
    // 创建一个单击事件
    var event = new MouseEvent('click')
    // 将a的download属性设置为我们想要下载的图片名称，若name不存在则使用‘下载图片名称’作为默认名称
    a.download = name || '下载图片名称'
    // 将生成的URL设置为a.href属性
    a.href = url
    // 触发a的单击事件
    a.dispatchEvent(event)
}

let file = {
    //============内部私有属性及方法============
    _download(fileName, blob) {
        var aLink = document.createElement('a');
        aLink.download = fileName;
        aLink.href = URL.createObjectURL(blob);
        document.body.appendChild(aLink);
        aLink.click();
        document.body.removeChild(aLink);
    },

    //下载保存文件
    downloadFile(fileName, string) {
        var blob = new Blob([string]);
        this._download(fileName, blob);
    },

    //下载导出图片
    downloadImage(name, canvas) {
        var base64 = canvas.toDataURL("image/png");
        var blob = this.base64Img2Blob(base64);
        this._download(name + '.png', blob);
    },

    base64Img2Blob(code) {
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
}

export default {
    downloadCanvasIamge: downloadCanvasIamge,
    file : file
}