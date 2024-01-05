import greenimg from "./img/green.png";
import blueimg from "./img/blue.png";
import yellowimg from "./img/yellow.png";
import redimg from "./img/red.png";
/**
 * 聚合
 * @description 图标、文字等entity聚合类，通过此对象添加的entity都会自动聚合
 * @class
 */
class Cluster {
    /**
     * 
     * @param {Cesium.Viewer} viewer 地图viewer对象 
     * @param {Object} opt
     * @param {Boolean} opt.enabled 是否聚合
     * @param {Number}  opt.pixelRange 聚合的像素范围
     * @param {Number}  opt.minimumClusterSize 聚合的对象最小数量
     * @param {Array}  opt.conditions 聚合的条件数组
     */
    constructor(viewer, opt) {
        this.viewer = viewer;
        this.opt = opt || {};
        const defaultOpt = {
            enabled: true,
            pixelRange: 60,
            minimumClusterSize: 3,
            conditions: [ // 设置聚合条件
                {
                    number: 10,
                    img: greenimg
                },
                {
                    number: 30,
                    img: blueimg
                },
                {
                    number: 100,
                    img: yellowimg
                },
                {
                    number: 300,
                    img: redimg
                }
            ]
        }
        this.opt = Object.assign(defaultOpt, this.opt);
        /**
         * @property {Cesium.CustomDataSource} clusterDataSource 实体容器
         */
        this.clusterDataSource = new Cesium.CustomDataSource("clusterDataSource");
        this.clusterDataSource.clustering.enabled = this.opt.enabled;
        this.clusterDataSource.clustering.pixelRange = this.opt.pixelRange;
        this.clusterDataSource.clustering.minimumClusterSize = this.opt.minimumClusterSize;
        this.viewer.dataSources.add(this.clusterDataSource);
        this.bindCluster();
    }

    /**
     * 添加实体
     * @param {Cesium.Entity} ent 实体对象
     */
    add(ent) {
        if (ent) this.clusterDataSource.entities.add(ent);
    }
     /**
     * 移除实体
     * @param {Cesium.Entity} ent 实体对象
     */
    remove(ent) {
        if (ent) this.clusterDataSource.entities.remove(ent);
    }
    /**
     * 清空
     */
    clear() {
        this.clusterDataSource.entities.removeAll();
    }
    /**
     * 销毁
     */
    destroy() {
        this.clusterDataSource.entities.removeAll();
        this.viewer.dataSources.remove(this.clusterDataSource);
    }

    /**
     * 开启聚合
     */
    open() {
        this.clusterDataSource.enableCluster = true;
    }

    /**
     * 关闭聚合
     */
    close() {
        this.clusterDataSource.enableCluster = false;
    }
    bindCluster() {
        let that = this;
        this.clusterDataSource.clustering.clusterEvent.addEventListener(function (clusteredEntities, cluster) {
            let length = clusteredEntities.length;
            cluster.label.show = false;
            cluster.billboard.show = true;
            cluster.billboard.id = cluster.label.id;
            cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
            that.getClusterImg(length, function (image) {
                cluster.billboard.image = image;
            });
        }, window);
    }
    getClusterImg(length, fun) {
        let img = '';
        for (let i = 0; i < this.opt.conditions.length - 1; i++) {
            if (length <= this.opt.conditions[0].number) {
                img = this.opt.conditions[0].img;
            } else if (length >= this.opt.conditions[this.opt.conditions.length - 1].number) {
                img = this.opt.conditions[this.opt.conditions.length - 1].img;
            } else {
                const nowitem = this.opt.conditions[i];
                const nextitem = this.opt.conditions[i + 1];
                if (length >= nowitem.number && length <= nextitem.number) {
                    img = nextitem.img;
                }
            }
            if (img) break;
        }

        let canvas = document.createElement('canvas');
        // 设置canvas的大小
        canvas.width = 48;
        canvas.height = 48;
        // 获得canva上下文环境
        let ctx = canvas.getContext('2d');
        ctx.fillStyle = "rgb(255,255,255)";
        // 设置文字属性
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        Cesium.Resource.fetchImage(img).then(iconDom => {
            ctx.drawImage(iconDom, 0, 0, canvas.width, canvas.height);
            // 设置背景
            ctx.font = "14px Arial";
            // 设置文字
            const text = length + "";
            const textWidth = 28;
            const textHeight = 28;
            ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 2);
            let image = canvas.toDataURL("image/png");
            fun(image);
        })
    }
}

export default Cluster;