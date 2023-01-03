/**
 * 限高分析
 * @class
 */
class LimitHeght {
    /**
     * @param {Cesium.Viewer} viewer 地图viewer对象 
     * @param {Object} opt 基础参数
     * @param {Cesium.Cartesian3[]} opt.positions 限制范围
     * @param {Number} opt.bottomHeight 最小高度
     * @param {Number} [opt.topHeight=Number.MAX_VALUE] 最大高度
     * @param {String} [opt.color='#ff0000'] 颜色
     * @param {Number} [opt.alpha=0.8] 颜色透明度
     */
    constructor(viewer, opt) {
        this.viewer = viewer;
        /**
         * @property {Cesium.Cartesian3[]} positions 限制范围
         */
        this.positions = opt.positions;

        /**
         * @property {Number} bottomHeight 最小高度
         */
        this.bottomHeight = Number(opt.bottomHeight);
        if (this.bottomHeight == undefined) return;

        /**
         * @property {Number} topHeight 最大高度
         */
        this.topHeight = opt.topHeight || Number.MAX_VALUE;

        const icolor = opt.color || "#ff0000";
        this.color = icolor instanceof Cesium.Color ? icolor : Cesium.Color.fromCssColorString(icolor);
        this.colorAlpha = opt.alpha || 0.8;
        this.primitive = undefined;
        this.extrudedHeight = this.topHeight - this.bottomHeight;
        this.init();
    }
    /**
     * 初始化
     */
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

    /**
     * 
     * @param {Number} h 限制高度 
     */
    setHeight(h) {
        if (!this.primitive) return;
        let cartographic = Cesium.Cartographic.fromCartesian(this.primitive._primitive._boundingSpheres[0].center);
        let surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, this.baseHeight);
        let offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, h);
        let translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
        this.primitive._primitive.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    }

    /**
     * 销毁
     */
    destroy() {
        if (this.primitive) {
            this.viewer.scene.primitives.remove(this.primitive);
            this.primitive = null;
        }
    }

}

export default LimitHeght;