import BaseLayer from './baseLayer';
class TilesetLayer extends BaseLayer {
    constructor(viewer, opt) {
        super(viewer, opt);
        this.opt = opt || {};
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
        let test = this.viewer.scene.primitives.add(
            new Cesium.Cesium3DTileset({
                maximumScreenSpaceError: this.opt.maximumScreenSpaceError || 1,
                url: this.opt.url,
                maximumMemoryUsage: 1024,
                /* debugShowBoundingVolume:true, */
                /*  preloadWhenHidden: true, */
                /*  preferLeaves : true, */
                /*  skipLevelOfDetail: true,
                 immediatelyLoadDesiredLevelOfDetail: true, */
            })
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

            if (that.opt.style) that.updateStyle(tileset, that.opt.style);

            if (fun) fun(tileset);

        }).otherwise(function (error) { })

    }
    remove() {
        if (this._layer) {
            this.viewer.scene.primitives.remove(this._layer);
        }
    }
    show() {
        if (this._layer) {
            this._layer.show = true;
            this._layer.layerConfig.show = true;
        }
    }
    hide() {
        if (this._layer) {
            this._layer.show = false;
            this._layer.layerConfig.show = false;
        }
    }
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
    setCenter(opt) {
        const cartographic = Cesium.Cartographic.fromCartesian(this._layer.initBoundingSphere.center);
        const surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0);
        const lng = opt.x || Cesium.Math.toDegrees(cartographic.longitude);
        const lat = opt.y || Cesium.Math.toDegrees(cartographic.latitude);
        const offset = Cesium.Cartesian3.fromDegrees(lng, lat, opt.z || 0);
        const translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
        this._layer.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
    }

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

    updateStyle(tileset, style) {
        if (!tileset || !style) return;
        tileset.style = new Cesium.Cesium3DTileStyle(style);
    }

    setAlpha(alpha) {
        alpha = alpha == undefined ? 1 : alpha;
        this._layer.style = new Cesium.Cesium3DTileStyle({
            color: "color('rgba(255,255,255," + alpha + ")')",
        });
    }
}

export default TilesetLayer;