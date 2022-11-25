class ModelClip {
    constructor(viewer, opt) {
        this.viewer = viewer;
        this.opt = opt;
        this.tileset = opt.tileset;
        if (!this.viewer || !this.tileset) return;
        this.planeEntities = [];

        if (opt.dir) { // 按某个方向裁剪
            this.dir = Cesium.Cartesian3.normalize(opt.dir.clone(), new Cesium.Cartesian3());
        } else if (opt.angle != undefined) { // 按某个角度裁剪
            let defaultDir = new Cesium.Cartesian3(1.0, 0.0, 0.0);
            defaultDir = this.angle2dir(Number(this.opt.angle), defaultDir.clone());
            this.dir = Cesium.Cartesian3.normalize(defaultDir.clone(), new Cesium.Cartesian3());
        } else { // 竖直方向裁剪
            this.dir = Cesium.Cartesian3.normalize(new Cesium.Cartesian3(0.0, 0.0, -1.0), new Cesium.Cartesian3());
            this.isrelyx = true;
        }
        this.distance = opt.distance || 0;
        this.selectedPlane = undefined;
        this.downHandler = undefined;
        this.upHandler = undefined;;
        this.moveHandler = undefined;
        this.isreverse = this.computeReverse(this.dir);
    }

    start() {
        this.createClippingPlanes();
        this.bindHandler();
        this.viewer.scene.render();
    }

    end() {
        if (this.downHandler) {
            this.downHandler.destroy();
            this.downHandler = undefined;
        }
        if (this.upHandler) {
            this.upHandler.destroy();
            this.upHandler = undefined;
        }
        if (this.moveHandler) {
            this.moveHandler.destroy();
            this.moveHandler = undefined;
        }

        this.planeEntities.forEach(function (ent) {
            ent.show = false;
        });
        this.selectedPlane = undefined;
        this.distance = 0;
    }

    destroy() {
        if (this.downHandler) {
            this.downHandler.destroy();
            this.downHandler = undefined;
        }
        if (this.upHandler) {
            this.upHandler.destroy();
            this.upHandler = undefined;
        }
        if (this.moveHandler) {
            this.moveHandler.destroy();
            this.moveHandler = undefined;
        }

        this.selectedPlane = undefined;

        let that = this;
        this.planeEntities.forEach(function (ent) {
            that.viewer.entities.remove(ent);
        });
        this.planeEntities = [];
        this.tileset.clippingPlanes = new Cesium.ClippingPlaneCollection();
    }

    // 构建模型切割面
    createClippingPlanes() {
        let clippingPlanes = new Cesium.ClippingPlaneCollection({
            planes: [
                new Cesium.ClippingPlane(this.dir, 0.0),
            ],
            edgeWidth: 1.0
        });
        this.tileset.clippingPlanes = clippingPlanes;
        let that = this;
        for (var i = 0; i < clippingPlanes.length; ++i) {
            let clipplane = clippingPlanes.get(i);
            let planeEntity = this.viewer.entities.add({
                position: this.tileset.boundingSphere.center,
                plane: {
                    dimensions: new Cesium.Cartesian2(
                        this.tileset.boundingSphere.radius * 1,
                        this.tileset.boundingSphere.radius * 1
                    ),
                    material: Cesium.Color.RED.withAlpha(1),
                    plane: new Cesium.CallbackProperty(
                        that.createPlaneUpdateFunction(clipplane),
                        false
                    ),
                    outline: true,
                    outlineColor: Cesium.Color.RED,
                }
            });
            this.planeEntities.push(planeEntity);
        }
    }

    // 绑定事件
    bindHandler() {
        let that = this;
        if (!this.downHandler) this.downHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        if (!this.upHandler) this.upHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        if (!this.moveHandler) this.moveHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

        this.downHandler.setInputAction(function (movement) {
            var pickedObject = that.viewer.scene.pick(movement.position);
            if (
                Cesium.defined(pickedObject) &&
                Cesium.defined(pickedObject.id) &&
                Cesium.defined(pickedObject.id.plane)
            ) {
                that.selectedPlane = pickedObject.id.plane;
                that.selectedPlane.material = Cesium.Color.RED.withAlpha(0.1);
                that.selectedPlane.outlineColor = Cesium.Color.RED;
                that.viewer.scene.screenSpaceCameraController.enableInputs = false; // 禁止当前操作外的其它操作 防止操作的混淆
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        this.upHandler.setInputAction(function () {
            if (Cesium.defined(that.selectedPlane)) {
                that.selectedPlane.material = Cesium.Color.RED.withAlpha(0.1);
                that.selectedPlane.outlineColor = Cesium.Color.RED;
                that.selectedPlane = undefined;
            }
            that.viewer.scene.screenSpaceCameraController.enableInputs = true;
        }, Cesium.ScreenSpaceEventType.LEFT_UP);

        this.moveHandler.setInputAction(function (movement) {
            if (Cesium.defined(that.selectedPlane)) {
                let delta;
                if (that.isrelyx) {
                    delta = -1 * (movement.endPosition.y - movement.startPosition.y);
                } else {
                    delta = movement.endPosition.x - movement.startPosition.x;
                    if (!that.isreverse) delta = -1 * delta;
                }
                that.distance += delta;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    }
    createPlaneUpdateFunction(plane) {
        let that = this;
        return function () {
            plane.distance = that.distance;
            return plane;
        };
    }

    angle2dir(angle, olddir) {
        var m = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(angle));
        let dir = Cesium.Matrix3.multiplyByVector(m, olddir, new Cesium.Cartesian3());
        dir = Cesium.Cartesian3.normalize(dir, new Cesium.Cartesian3());
        return dir;
    }

    // 判断是否要对计算进行反转
    computeReverse(dir) {
        let north = new Cesium.Cartesian3(1, 0, 0);
        let east = new Cesium.Cartesian3(0, 1, 0);
        const res1 = Cesium.Cartesian3.dot(dir.clone(), north.clone());
        const res2 = Cesium.Cartesian3.dot(dir.clone(), east.clone());

        let reverse = false;
        if (res2 == 1) { // ==90
            reverse = true;
        } else if (res2 == -1) { // ==270
            reverse = false;
        } else if (res1 == 1 || res1 == -1) { // ==0 || ==180
            reverse = false;
        } else if (res1 > 0 && res2 > 0) {  // 1. <90
            reverse = false;
        } else if (res1 < 0 && res2 > 0) { // 2. >90 <180
            reverse = true;
        } else if (res1 < 0 && res2 < 0) { // 3. >180 <270
            reverse = true;
        } else if (res1 > 0 && res2 < 0) {  // 4. >270 <360
            reverse = false;
        } else if (res1 == 1 && res2 == 0) {
            reverse = false;
        } else {

        }
        return reverse;
    }

}