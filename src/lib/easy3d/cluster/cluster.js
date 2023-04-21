import greenimg from "./img/green.png";
import blueimg from "./img/blue.png";
import yellowimg from "./img/yellow.png";
import redimg from "./img/red.png";
class Cluster {
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
        this.clusterDataSource = new Cesium.CustomDataSource("clusterDataSource");
        this.clusterDataSource.clustering.enabled = this.opt.enabled;
        this.clusterDataSource.clustering.pixelRange = this.opt.pixelRange;
        this.clusterDataSource.clustering.minimumClusterSize = this.opt.minimumClusterSize;
        this.viewer.dataSources.add(this.clusterDataSource);
        this.bindCluster();
    }

    add(ent) {
        if (ent) this.clusterDataSource.entities.add(ent);
    }
    clear() {
        this.clusterDataSource.entities.removeAll();
    }
    destroy() {
        this.clusterDataSource.entities.removeAll();
        this.viewer.dataSources.remove(this.clusterDataSource);
    }
    open() {
        this.clusterDataSource.enableCluster = true;
    }
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