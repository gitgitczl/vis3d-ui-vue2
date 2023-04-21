class TilesetEdit {
    constructor(viewer, opt) {
        this.viewer = viewer;
        this.tileset = opt.tileset;
        if (!opt.tileset) {
            console.log("缺少模型！");
            return;
        }
        this.initBoundingSphere = Cesium.BoundingSphere.clone(this.tileset.boundingSphere, new Cesium.BoundingSphere());
        this.initTransform = this.tileset._root.transform.clone();
        this.moveMtx = undefined;
        this.scaleMtx = undefined;
        this.rotationMtx_X = undefined;
        this.rotationMtx_Y = undefined;
        this.rotationMtx_Z = undefined;

        this.scaleMtx_X = undefined;
        this.scaleMtx_Y = undefined;
        this.scaleMtx_Z = undefined;

        let centerMtx = Cesium.Transforms.eastNorthUpToFixedFrame(this.initBoundingSphere.center.clone());
        this.centerMtx_inverse = Cesium.Matrix4.inverse(centerMtx.clone(), new Cesium.Matrix4());
        this.newCenter = Cesium.Matrix4.multiplyByPoint(
            this.centerMtx_inverse.clone(),
            this.initBoundingSphere.center.clone(),
            new Cesium.Cartesian3());
    }

    // 计算平移矩阵
    setPosition(position) {
        if (!(position instanceof Cesium.Cartesian3)) {
            position = Cesium.Cartesian3.fromDegrees(Number(position[0]), Number(position[1]), Number(position[2] || 0));
        }
        // 局部坐标系下坐标
        let newPosition = Cesium.Matrix4.multiplyByPoint(this.centerMtx_inverse.clone(), position.clone(), new Cesium.Cartesian3())
        // 当前相对起点的偏移量
        let translation = Cesium.Cartesian3.subtract(newPosition.clone(), this.newCenter.clone(), new Cesium.Cartesian3());
        let nowMovelMtx = Cesium.Matrix4.fromTranslation(translation.clone(), new Cesium.Matrix4());
        if (this.moveMtx) this.revertTransform(this.moveMtx);
        this.moveMtx = nowMovelMtx.clone();
        Cesium.Matrix4.multiply(this.tileset._root.transform, nowMovelMtx.clone(), this.tileset._root.transform);
    }

    // 计算缩放矩阵
    setScale(scale) {
        let translation = new Cesium.Cartesian3(1, 1, 1);
        if (scale instanceof Cesium.Cartesian3) {
            translation = scale.clone();
        } else {
            translation = new Cesium.Cartesian3(scale, scale, scale);
        }
        let nowScaleMtx = Cesium.Matrix4.fromScale(translation.clone(), new Cesium.Matrix4());
        if (this.scaleMtx) this.revertTransform(this.scaleMtx);
        this.scaleMtx = nowScaleMtx.clone();
        Cesium.Matrix4.multiply(this.tileset._root.transform, nowScaleMtx.clone(), this.tileset._root.transform);
    }

    setScaleX(scale) {
        let translation = new Cesium.Cartesian3(scale, 1, 1);
        let nowScaleMtx = Cesium.Matrix4.fromScale(translation.clone(), new Cesium.Matrix4());
        if (this.scaleMtx_X) this.revertTransform(this.scaleMtx_X);
        this.scaleMtx_X = nowScaleMtx.clone();
        Cesium.Matrix4.multiply(this.tileset._root.transform, nowScaleMtx.clone(), this.tileset._root.transform);
    }

    setScaleY(scale) {
        let translation = new Cesium.Cartesian3(1, scale, 1);
        let nowScaleMtx = Cesium.Matrix4.fromScale(translation.clone(), new Cesium.Matrix4());
        if (this.scaleMtx_Y) this.revertTransform(this.scaleMtx_Y);
        this.scaleMtx_Y = nowScaleMtx.clone();
        Cesium.Matrix4.multiply(this.tileset._root.transform, nowScaleMtx.clone(), this.tileset._root.transform);
    }

    setScaleZ(scale) {
        let translation = new Cesium.Cartesian3(1, 1, scale);
        let nowScaleMtx = Cesium.Matrix4.fromScale(translation.clone(), new Cesium.Matrix4());
        if (this.scaleMtx_Z) this.revertTransform(this.scaleMtx_Z);
        this.scaleMtx_Z = nowScaleMtx.clone();
        Cesium.Matrix4.multiply(this.tileset._root.transform, nowScaleMtx.clone(), this.tileset._root.transform);
    }

    // 计算旋转矩阵
    setRotateX(angle) {
        let mtx = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(angle));
        let nowRotationMtx_X = Cesium.Matrix4.fromRotation(mtx, new Cesium.Matrix4());
        if (this.rotationMtx_X) this.revertTransform(this.rotationMtx_X);
        this.rotationMtx_X = nowRotationMtx_X.clone();
        Cesium.Matrix4.multiply(this.tileset._root.transform, nowRotationMtx_X.clone(), this.tileset._root.transform);
    }

    setRotateY(angle) {
        let mtx = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(angle));
        let nowRotationMtx_Y = Cesium.Matrix4.fromRotation(mtx, new Cesium.Matrix4());
        if (this.rotationMtx_Y) this.revertTransform(this.rotationMtx_Y);
        this.rotationMtx_Y = nowRotationMtx_Y.clone();
        Cesium.Matrix4.multiply(this.tileset._root.transform, nowRotationMtx_Y.clone(), this.tileset._root.transform);
    }

    setRotateZ(angle) {
        let mtx = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(angle));
        let nowRotationMtx_Z = Cesium.Matrix4.fromRotation(mtx, new Cesium.Matrix4());
        if (this.rotationMtx_Z) this.revertTransform(this.rotationMtx_Z);
        this.rotationMtx_Z = nowRotationMtx_Z.clone();
        Cesium.Matrix4.multiply(this.tileset._root.transform, nowRotationMtx_Z.clone(), this.tileset._root.transform);
    }

    reset() {
        this.tileset._root.transform = this.initTransform();
    }

    revertTransform(mtx4) {
        let inverse = Cesium.Matrix4.inverse(mtx4.clone(), new Cesium.Matrix4());
        Cesium.Matrix4.multiply(this.tileset._root.transform, inverse.clone(), this.tileset._root.transform);
    }
}


export default TilesetEdit;