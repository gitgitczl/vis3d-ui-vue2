class TilesetClip {
    
    constructor(viewer, opt) {
        this.viewer = viewer;
        this.tileset = opt.tileset;
        if (!this.tileset) {
            console.warn("请添加模型！");
            return;
        }
        this.clippingPlanes = null;
        this.distance = opt.distance;
        this.createClippingPlanes(opt.direction || "toFront")
        if (opt.distance != undefined) this.setDistance(opt.distance);
    }

    createClippingPlanes(type) {
        type = type || "toDown";
        let dir = new Cesium.Cartesian3(0, 0, 0);
        switch (type) {
            case "toDown": // 从上到下
                dir = new Cesium.Cartesian3(0, 0, -1);
                break;
            case "toTop": // 从下到上
                dir = new Cesium.Cartesian3(0, 0, 1);
                break;
            case "toLeft":
                dir = new Cesium.Cartesian3(-1, 0, 0);
                break;
            case "toRight":
                dir = new Cesium.Cartesian3(1, 0, 0);
                break;
            case "toFront":
                dir = new Cesium.Cartesian3(0, 1, 0);
                break;
            case "toBack":
                dir = new Cesium.Cartesian3(0, -1, 0);
                break;
            default:
                if (type instanceof Cesium.Cartesian3) {
                    dir = Cesium.Cartesian3.normalize(type.clone(), new Cesium.Cartesian3());
                }
        }

        // 模型旋转后 
        if (this.tileset.mtxHpr.heading) {
            let heading = (this.tileset.mtxHpr && this.tileset.mtxHpr.heading) || 0;
            let roateMtx3 = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(heading));
            dir = Cesium.Matrix3.multiplyByVector(roateMtx3, dir.clone(), new Cesium.Cartesian3());
        }

        let planes = [
            new Cesium.ClippingPlane(dir, 1), //z水平面
        ];
        this.clippingPlanes = new Cesium.ClippingPlaneCollection({
            planes: planes,
            edgeWidth: 1.0
        });

        if (!Cesium.Matrix4.equals(this.tileset.root.transform, Cesium.Matrix4.IDENTITY)) {
            // 计算平移
            var transformCenter = Cesium.Matrix4.getTranslation(this.tileset.root.transform, new Cesium.Cartesian3());
            var height = Cesium.Cartesian3.distance(transformCenter, this.tileset.boundingSphere.center);
            this.clippingPlanes.modelMatrix = Cesium.Matrix4.fromTranslation(new Cesium.Cartesian3(0.0, 0.0, height));
        }
        this.tileset.clippingPlanes = this.clippingPlanes;
    }
    setDistance(value) {
        if (this.clippingPlanes == null) return;
        for (var i = 0; i < this.clippingPlanes.length; i++) {
            var plane = this.clippingPlanes.get(i);
            plane.distance = value;
        }
    }
    reset() {
        if (this.clippingPlanes) {
            this.clippingPlanes.removeAll();
            this.clippingPlanes.destroy();
            this.clippingPlanes = null;
        }
    }
    destroy() {
        this.tileset.clippingPlanes = null;
        this.tileset.boundingSphere.center = null;
        this.tileset.boundingSphere = null;
        this.clippingPlanes = null;
    }
}

export default TilesetClip;