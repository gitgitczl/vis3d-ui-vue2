
import cUtil from "../cUtil"
class Heatmap {
    constructor(viewer, opt) {
        this.viewer = viewer;
        this.opt = opt || {};
        this.list = this.opt.list || [];
        if (!this.list || this.list.length < 2) {
            console.log("热力图点位不得少于3个！");
            return;
        }
        this.dom = undefined;
        this.id = Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
        this.canvasw = 200;
        this.createDom();
        let config = {
            container: document.getElementById(`easy3d-heatmap-${this.id}`),
            radius: this.opt.raduis || 20,
            maxOpacity: .7,
            minOpacity: 0,
            blur: .75,
            gradient: this.opt.gradient || {
                '.1': 'blue',
                '.5': 'yellow',
                '.7' : 'red',
                '.99': 'white'
            }
        };
        this.heatmapInstance = h337.create(config);
        this.init();
    }

    init() {
        this.hierarchy = []
        for (let ind = 0; ind < this.list.length; ind++) {
            let position = Cesium.Cartesian3.fromDegrees(this.list[ind].lnglat[0], this.list[ind].lnglat[1]);
            this.hierarchy.push(position);
        }
        this.polygon = undefined;
        const bound = this.getBound(this.hierarchy);
        if (!bound) return;
        let points = [];
        let x_axios = Cesium.Cartesian3.subtract(bound.rightTop, bound.leftTop, new Cesium.Cartesian3());
        x_axios = Cesium.Cartesian3.normalize(x_axios, new Cesium.Cartesian3());
        let y_axios = Cesium.Cartesian3.subtract(bound.leftBottom, bound.leftTop, new Cesium.Cartesian3());
        y_axios = Cesium.Cartesian3.normalize(y_axios, new Cesium.Cartesian3());
        const girthX = Cesium.Cartesian3.distance(bound.rightTop, bound.leftTop);
        const girthY = Cesium.Cartesian3.distance(bound.leftBottom, bound.leftTop);
        for (let i = 0; i < this.hierarchy.length; i++) {
            const p1 = this.hierarchy[i];
            const p_origin = Cesium.Cartesian3.subtract(p1, bound.leftTop, new Cesium.Cartesian3());
            const diffX = Cesium.Cartesian3.dot(p_origin, x_axios);
            const diffY = Cesium.Cartesian3.dot(p_origin, y_axios);
            points.push({
                x: Number(diffX / girthX * this.canvasw).toFixed(0),
                y: Number(diffY / girthY * this.canvasw).toFixed(0),
                value: this.list[i].value
            })
        }
        this.heatmapInstance.addData(points);
        this.createPolygon([
            bound.leftTop,
            bound.leftBottom,
            bound.rightBottom,
            bound.rightTop
        ]);
    }

    // 以面的形式添加
    createPolygon(positions) {
        this.polygon = this.viewer.entities.add({
            polygon: {
                hierarchy: new Cesium.PolygonHierarchy(positions),
                material: this.heatmapInstance.getDataURL(),
                heightReference: 1
            }
        });
        this.viewer.zoomTo(this.polygon)
    }

    // 以地图服务的形式添加
    createProvider() {

    }

    createDom() {
        this.dom = window.document.createElement("div");
        this.dom.id = `easy3d-heatmap-${this.id}`;
        this.dom.className = `easy3d-heatmap`;
        this.dom.style.width = this.canvasw + "px";
        this.dom.style.height = this.canvasw + "px";
        this.dom.style.position = "absolute";
        this.dom.style.display = "none";
        let mapDom = window.document.getElementById(this.viewer.container.id);

        mapDom.appendChild(this.dom);
    }

    destory() {
        let dom = document.getElementById(`easy3d-heatmap-${this.id}`);
        if (dom) dom.remove();
        if (this.polygon) {
            this.viewer.entities.remove(this.polygon);
            this.polygon = undefined;
        }
    }

    // 扩展边界 防止出现热力图被分割
    getBound(positions) {
        let rect = this.toRectangle(positions); // 转为正方形
        let lnglats = cUtil.cartesiansToLnglats(rect,this.viewer);
        let minLat = Number.MAX_VALUE, maxLat = Number.MIN_VALUE, minLng = Number.MAX_VALUE, maxLng = Number.MIN_VALUE;
        const length = rect.length;
        for (let i = 0; i < length; i++) {
            const lnglat = lnglats[i];
            if (lnglat[0] < minLng) {
                minLng = lnglat[0];
            }
            if (lnglat[0] > maxLng) {
                maxLng = lnglat[0];
            }

            if (lnglat[1] < minLat) {
                minLat = lnglat[1];
            }
            if (lnglat[1] > maxLat) {
                maxLat = lnglat[1];
            }
        }

        const diff_lat = maxLat - minLat;
        const diff_lng = maxLng - minLng;

        minLat = minLat - diff_lat / length;
        maxLat = maxLat + diff_lat / length;
        minLng = minLng - diff_lng / length;
        maxLng = maxLng + diff_lng / length;

        return {
            leftTop: Cesium.Cartesian3.fromDegrees(minLng, maxLat),
            leftBottom: Cesium.Cartesian3.fromDegrees(minLng, minLat),
            rightTop: Cesium.Cartesian3.fromDegrees(maxLng, maxLat),
            rightBottom: Cesium.Cartesian3.fromDegrees(maxLng, minLat),
        }
    }

    // 任何图形均转化为正方形
    toRectangle(hierarchy) {
        if (!hierarchy) return;
        let boundingSphere = Cesium.BoundingSphere.fromPoints(hierarchy, new Cesium.BoundingSphere());
        let center = boundingSphere.center;
        const radius = boundingSphere.radius;

        let modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(center.clone());
        let modelMatrix_inverse = Cesium.Matrix4.inverse(modelMatrix.clone(), new Cesium.Matrix4());
        let roate_y = new Cesium.Cartesian3(0, 1, 0);

        let arr = [];
        for (let i = 45; i <= 360; i += 90) {
            let roateZ_mtx = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(i), new Cesium.Matrix3());
            let yaix_roate = Cesium.Matrix3.multiplyByVector(roateZ_mtx, roate_y, new Cesium.Cartesian3());
            yaix_roate = Cesium.Cartesian3.normalize(yaix_roate, new Cesium.Cartesian3());
            let third = Cesium.Cartesian3.multiplyByScalar(yaix_roate, radius, new Cesium.Cartesian3());
            let poi = Cesium.Matrix4.multiplyByPoint(modelMatrix, third.clone(), new Cesium.Cartesian3());


            arr.push(poi);
        }

        return arr;
    }


}

export default Heatmap;