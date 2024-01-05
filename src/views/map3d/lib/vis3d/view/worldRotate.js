const worldRotate = {
    start(viewer, obj, callback) { //传入所需定位的经纬度 及旋转的速度 旋转的圈数
        if (!obj.x || !obj.y) {
            console.log("设定地球旋转时，并未传入经纬度！");
            return;
        }
        var v = obj.v || 1;
        var i = 0;
        var q = obj.q || 2;
        var x = obj.x;
        var y = obj.y;
        var z = obj.z;
        var interVal = window.setInterval(function () {
            x = x + v;
            if (x >= 179) {
                x = -180;
                i++;
            }
            viewer.scene.camera.setView({
                destination: new Cesium.Cartesian3.fromDegrees(x, y, z || 20000000)
            });

            if (i == q) { //此处有瑕疵  未修改
                clearInterval(interVal);
                callback();
            }
        }, 16);
    }
}


export default worldRotate;