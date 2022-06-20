class TilesetEdit {
    constructor(viewer, opt) {
        this.viewer = viewer;
        this.tileset = opt.tileset;
        if (!opt.tileset) {
            console.log("缺少模型！");
            return;
        }
        this.mtxHpr = opt.mtxHpr || {};
        this.tileset.mtxHpr = this.mtxHpr;
    }

    setPosition(position, callback) {
        if (!position) return;
        if (!(position instanceof Cesium.Cartesian3)) {
            position = Cesium.Cartesian3.fromDegrees(position[0], position[1], position[2] || 0);
        }
        this.tileset.boundingSphere.center = position;
        // 此处不能只建立正东正北的局部坐标系 因为可能旋转 再进行平移
        var mtx;
        if (Object.keys(this.mtxHpr).length == 0) {
            mtx = Cesium.Transforms.eastNorthUpToFixedFrame(position);
        } else {
            var hpr = new Cesium.HeadingPitchRoll(
                Cesium.Math.toRadians(this.mtxHpr.heading || 0),
                Cesium.Math.toRadians(this.mtxHpr.pitch || 0),
                Cesium.Math.toRadians(this.mtxHpr.roll || 0));
            mtx = Cesium.Transforms.headingPitchRollToFixedFrame(position, hpr);
        }
        this.tileset._root.transform = mtx;

        if (callback) callback(this.tileset)
    }
    setScale(scale) {
        Cesium.Matrix4.multiplyByUniformScale(this.tileset._root.transform, scale,
            this.tileset._root.transform);
    }
    setHeight(h) {
        if (h === undefined) return;
        var lnglat = cUtil.cartesianToLnglat(this.tileset.boundingSphere.center);
        var lng = lnglat[0];
        var lat = lnglat[1];
        var c3 = Cesium.Cartesian3.fromDegrees(lng, lat, h);
        this.setPosition(c3);
    }
    setRoate(opt) {
        if (opt.rx) {
            var mx = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(opt.rx)); //绕x轴旋转
            var rotationX = Cesium.Matrix4.fromRotationTranslation(mx);
            this.tileset._root.transform = Cesium.Matrix4.multiply(this.tileset._root.transform.clone(), rotationX, new Cesium.Matrix4());
            this.mtxHpr.roll = opt.rx;
        }
        // 表示绕x轴旋转
        if (opt.ry) {
            var my = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(opt.ry)); //绕x轴旋转
            var rotationY = Cesium.Matrix4.fromRotationTranslation(my);
            this.tileset._root.transform = Cesium.Matrix4.multiply(this.tileset._root.transform.clone(), rotationY, new Cesium.Matrix4());
            this.mtxHpr.pitch = -opt.ry;
        }
        // 表示绕x轴旋转
        if (opt.rz) {
            var mz = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(opt.rz)); //绕x轴旋转
            var rotationZ = Cesium.Matrix4.fromRotationTranslation(mz);
            this.tileset._root.transform = Cesium.Matrix4.multiply(this.tileset._root.transform.clone(), rotationZ, new Cesium.Matrix4());
            this.mtxHpr.heading = -opt.rz;
        }
    }
}
