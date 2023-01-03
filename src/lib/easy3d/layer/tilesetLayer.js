/**
 * 3tiles模型加载类
 * @class 
 */
class TilesetLayer {
    /**
     * 
     * @param {Cesium.Viewer} viewer 地图viewer对象
     * @param {Object} opt 基础配置，其余参数同{@link Cesium.Cesium3DTileset}
     * @param {String} opt.url 模型服务地址
     * @param {Boolearn} [opt.show=true] 是否显示
     * @param {Object} [opt.view] 模型定位视角
     * @param {Object} [opt.center] 设置模型中心点,如果只修改高度，x、y可不设置
     * @param {Cesium.Cartesian3 | Object} [opt.position] 模型位置，和center二选一
     * @param {Object} [style] 模型样式
     * @example
     * let tilesetLayer = new easy3d.TilesetLayer(viewer,{
        url: "http://192.168.21.108:9999/jcjy/jcjy-hb/tileset.json",
        show: true,
        maximumScreenSpaceError: 16,
        maximumMemoryUsage: 1024,
        center: {
        z: 10
        },
        style: {
            color: {
                conditions: [
                    ['${Height} >= 100', 'color("purple", 0.5)'],
                    ['${Height} >= 50', 'color("red")'],
                    ['true', 'color("blue")']
                ]
            },
            show: '${Height} > 0'
        },
        view: {
            "x": 109.7884118470029,
            "y": 39.590384952017764,
            "z": 1565.7899788867958,
            "heading": 331.1978494043747,
            "pitch": -8.45296669256617,
            "roll": 0.00043210090111595544,
            "duration": 0
        }
    });
    tilesetLayer.load();
     */
    constructor(viewer, opt) {
        /* super(viewer, opt); */
        this.viewer = viewer;
        this.opt = opt || {};

        /**
        * @property {String} type 类型
        */
        this.type = "3dtiles";
        if (!this.opt.url) {
            console.log("缺少服务地址！", opt);
        }
        this._layer = undefined;

    }

    // 获取当前图层
    get layer() {
        return this._layer;
    }
    // 加载
    load(fun) {
        let that = this;
        let defaultVal = {
            maximumScreenSpaceError: 16,
            skipLevelOfDetail: true,
            preferLeaves: true,
            maximumMemoryUsage: 512
        }

        let tilesetAttr = Object.assign(defaultVal, this.opt);

        let test = this.viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset(tilesetAttr)
        );

        test.readyPromise.then(function (tileset) {
            that._layer = tileset;
            that._layer.layerConfig = that.opt; // 保存配置信息
            that._layer.initBoundingSphere = tileset.boundingSphere.clone();// 初始化中心
            that._layer.show = that.opt.show == undefined ? true : that.opt.show;

            if (that.opt.center) { // 设定模型中心点
                that.setCenter(that.opt.center);
            }

            if (that.opt.position) { // 设定模型位置
                that.setPosition(that.opt.position)
            }

            if (that.opt.flyTo) { // 是否定位
                that.zoomTo();
            }

            if (that.opt.style) that.updateStyle(that.opt.style);

            if (fun) fun(tileset);

        })
    }

    /**
     * 销毁模型
     */
    destroy() {
        if (this._layer) {
            this.viewer.scene.primitives.remove(this._layer);
        }
    }

    /**
     * 显示模型
     */
    show() {
        if (this._layer) {
            this._layer.show = true;
            this._layer.layerConfig.show = true;
        }
    }

    /**
     * 隐藏模型
     */
    hide() {
        if (this._layer) {
            this._layer.show = false;
            this._layer.layerConfig.show = false;
        }
    }

    /**
     * 定位至模型
     */
    zoomTo() {
        if (!this._layer) return;
        if (this._layer.layerConfig.view) {
            cUtil.setCameraView(this._layer.layerConfig.view);
        } else {
            this.viewer.flyTo(this._layer, new Cesium.HeadingPitchRange(
                Cesium.Math.toRadians(0),
                Cesium.Math.toRadians(-60),
                this._layer.boundingSphere.radius * 5)
            );
        }
    }

    /**
     * 设置模型中心点
     * @param {Object} opt 
     * @param {Number} opt.x 经度
     * @param {Number} opt.y 纬度
     * @param {Number} opt.z 高度
     */
    setCenter(opt) {
        if (!opt) return;
        const cartographic = Cesium.Cartographic.fromCartesian(this._layer.initBoundingSphere.center);
        const surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);
        const lng = opt.x || Cesium.Math.toDegrees(cartographic.longitude);
        const lat = opt.y || Cesium.Math.toDegrees(cartographic.latitude);
        const offset = Cesium.Cartesian3.fromDegrees(Number(lng), Number(lat), opt.z || 0);
        const translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
        this._layer.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    }

    /**
     * 设置模型位置
     * @param {Cesium.Cartesian3 | Object} position 
     */
    setPosition(position) {
        if (!position) {
            return;
        }
        let center;
        if (position instanceof Cesium.Cartesian3) {
            center = position.clone();
        } else {
            center = Cesium.Cartesian3.fromDegrees(position.x, position.y, position.z);
        }
        var mtx = Cesium.Transforms.eastNorthUpToFixedFrame(center);
        this._layer._root.transform = mtx;
    }

    /**
     * 修改模型样式
     * @param {Object} style 
     * @example
     *  style={
        color : {
            conditions : [
                ['${Height} >= 100', 'color("purple", 0.5)'],
                ['${Height} >= 50', 'color("red")'],
                ['true', 'color("blue")']
            ]
        },
        show : '${Height} > 0'
     * }
     */
    updateStyle(style) {
        if (!style) return;
        this._layer.style = new Cesium.Cesium3DTileStyle(style);
    }

    /**
     * 设置模型透明度
     * @param {Number} [alpha=1] 
     */
    setAlpha(alpha) {
        alpha = alpha == undefined ? 1 : alpha;
        this._layer.style = new Cesium.Cesium3DTileStyle({
            color: "color('rgba(255,255,255," + alpha + ")')",
        });
    }
}

export default TilesetLayer;