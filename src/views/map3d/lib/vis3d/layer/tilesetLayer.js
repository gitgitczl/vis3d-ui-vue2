/**
 * 3tiles模型加载类
 * @class 
 */
import util from "../util";
import TilesetEdit from "../tileset/tilesetEdit";
class TilesetLayer {
    /**
     * 
     * @param {Cesium.Viewer} viewer 地图viewer对象
     * @param {Object} opt 基础配置，其余参数同{@link Cesium.Cesium3DTileset}
     * @param {String} opt.url 模型服务地址
     * @param {Boolean} [opt.show=true] 是否显示
     * @param {Object} [opt.view] 模型定位视角
     * @param {Object} [opt.center] 设置模型中心点,如果只修改高度，x、y可不设置
     * @param {Cesium.Cartesian3 | Object} [opt.position] 模型位置，和center二选一
     * @param {Object} [style] 模型样式
     * @example
     * let tilesetLayer = new vis3d.TilesetLayer(viewer,{
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

        this.tilesetEdit = undefined;
    }

    // 获取当前图层
    get layer() {
        return this._layer;
    }
    // 加载
    async load(fun) {
        let defaultVal = {
            maximumScreenSpaceError: 16,
            skipLevelOfDetail: true,
            preferLeaves: true,
            maximumMemoryUsage: 512
        }

        let tilesetAttr = Object.assign(defaultVal, this.opt);

        let tileset = await Cesium.Cesium3DTileset.fromUrl(tilesetAttr.url, tilesetAttr);
        this.viewer.scene.primitives.add(tileset);
        if (!this.tilesetEdit) this.tilesetEdit = new TilesetEdit(this.viewer, { tileset: tileset });
        this._layer = tileset;
        this._layer.layerConfig = this.opt; // 保存配置信息
        this._layer.initBoundingSphere = tileset.boundingSphere.clone();// 初始化中心
        this._layer.show = this.opt.show == undefined ? true : this.opt.show;
        if (this.opt.center) this.setCenter(this.opt.center);
        if (this.opt.orientation) this.setOrientation(this.opt.orientation);
        if (this.opt.scale) this.setScale(this.opt.scale);
        if (this.opt.flyTo) this.zoomTo();
        if (this.opt.style) this.updateStyle(this.opt.style);
        if (fun) fun(tileset);
        return tileset
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

            if (this.opt.style) this.updateStyle(this.opt.style); // 显示时 要重置样式
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
     * 显示隐藏
     */
    setVisible(visible) {
        if (visible) this.show();
        else this.hide();
    }

    /**
     * 定位至模型
     */
    zoomTo() {
        if (!this._layer) return;
        if (this._layer.layerConfig.view) {
            util.setCameraView(this.opt.view);
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
     * @param {Object|Cesium.Cartesian3} opt 
     * @param {Number} opt.x 经度
     * @param {Number} opt.y 纬度
     * @param {Number} opt.z 高度
     */
    setCenter(opt) {
        opt = opt || {};
        if (opt instanceof Cesium.Cartesian3) {
            this.tilesetEdit.setPosition(opt.clone());
        } else {
            let origin = Cesium.Cartographic.fromCartesian(this._layer.boundingSphere.center);
            opt.x = opt.x || Cesium.Math.toDegrees(origin.longitude);
            opt.y = opt.y || Cesium.Math.toDegrees(origin.latitude);
            this.tilesetEdit.setPosition([opt.x, opt.y, opt.z]);
        }
    }

    /**
     * 设置模型姿态
     * @param {Object|Cesium.Cartesian3} opt 
     * @param {Number} opt.heading 偏转角
     * @param {Number} opt.pitch 仰附角
     * @param {Number} opt.roll 翻滚角
     */
    setOrientation(opt) {
        if (!opt) return;
        let { heading, pitch, roll } = opt || {}
        if (heading != undefined) this.tilesetEdit.setRotateZ(heading);
        if (pitch != undefined) this.tilesetEdit.setRotateY(pitch);
        if (roll != undefined) this.tilesetEdit.setRotateX(roll);
    }

    setScale(opt) {
        if (!opt) return;
        if (isNaN(opt)) {
            const { x, y, z } = opt || {};
            if (x != undefined) this.tilesetEdit.setScaleX(x);
            if (y != undefined) this.tilesetEdit.setScaleY(y);
            if (z != undefined) this.tilesetEdit.setScaleZ(z);
        } else {
            this.tilesetEdit.setScale(Number(opt));
        }
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