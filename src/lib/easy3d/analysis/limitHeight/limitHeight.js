class LimitHeght {
    constructor(viewer, opt) {
        this.viewer = viewer;
        this.positions = opt.positions;
        this.bottomHeight = Number(opt.bottomHeight);
        if (this.bottomHeight == undefined) return;
        this.topHeight = opt.topHeight || (this.bottomHeight + 1000);
        const icolor = opt.color || "#ff0000";
        this.color = icolor instanceof Cesium.Color ? icolor : Cesium.Color.fromCssColorString(icolor);
        this.colorAlpha = opt.alpha || 0.8;
        this.primitive = undefined;
        this.extrudedHeight = this.topHeight - this.bottomHeight;
        this.init();
    }
    init() {
        let polygonInstance = new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
                polygonHierarchy: new Cesium.PolygonHierarchy(this.positions),
                height: this.bottomHeight,
                extrudedHeight: this.extrudedHeight
            }),
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(this.color.withAlpha(this.colorAlpha)),
            }
        });


        this.primitive = this.viewer.scene.primitives.add(new Cesium.ClassificationPrimitive({
            geometryInstances: polygonInstance,
            releaseGeometryInstances: false,
            classificationType: Cesium.ClassificationType.CESIUM_3D_TILE,
        }));
        /* 
        let that = this;
        this.primitive.readyPromise.then((primitive) => {
            this.setHeight();
        }); */
    }

    setHeight(h) {
        if (!this.primitive) return;
        let cartographic = Cesium.Cartographic.fromCartesian(this.primitive._primitive._boundingSpheres[0].center);
        let surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, this.baseHeight);
        let offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, h);
        let translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
        this.primitive._primitive.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    }

    destroy() {
        if (this.primitive) {
            this.viewer.scene.primitives.remove(this.primitive);
            this.primitive = null;
        }
    }

}

export default LimitHeght;