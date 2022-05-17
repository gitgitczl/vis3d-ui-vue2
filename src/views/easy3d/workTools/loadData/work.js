/* Cesium相关 */
import data from "./data.json"
let work = {
    polygons: [],
    mounted() {
        let that = this;
        let list = data.list;
        list.forEach(function (item) {
            let lnglats = item.lnglats;
            let color = Cesium.Color.fromCssColorString(item.color).withAlpha(0.5);
            let polygon = that.createPolygon(lnglats, color);
            if (polygon) {
                polygon.attr = item;
                that.polygons.push(polygon);
            }
        });
        this.bindHeightListen();
    },
    destroyed() {
        this.polygons.forEach(function (item) {
            window.viewer.entities.remove(item);
        })
        this.polygons = [];
    },
    setPolygonVisible(visible) {
        this.polygons.forEach(function (item) {
            item.show = visible;
        })
    },
    createPolygon(lnglats, color) {
        let positions = [];
        for (let i = 0; i < lnglats.length; i++) {
            let lnglat = lnglats[i];
            positions.push(Cesium.Cartesian3.fromDegrees(
                lnglat[0], lnglat[1]
            ))
        }
        return window.viewer.entities.add({
            polygon: {
                hierarchy: new Cesium.PolygonHierarchy(positions),
                heightReference: 1,
                material: color
            }
        })
    },
    // 绑定高度设置
    bindHeightListen() {
        let that = this;
        window.viewer.scene.postRender.addEventListener(function () {
            const cameraP = window.viewer.camera.position;
            const latlngP = that.easy3d.cUtil.cartesianToLnglat(cameraP);
            if (latlngP[2] > 2000) { // 显示面
                that.setPolygonVisible(true);
            } else {
                that.setPolygonVisible(false);
            }
        }, this)
    }
}
export default work;