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

export default {
    downloadCanvasIamge: downloadCanvasIamge
}