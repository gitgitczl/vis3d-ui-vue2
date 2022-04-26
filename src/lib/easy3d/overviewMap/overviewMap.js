
import * as L from "leaflet";
import 'leaflet/dist/leaflet.css'
class OverviewMap {
    constructor(viewer, opt) {
        this.viewer = viewer;
        this.opt = opt || {};
        let defaulteStyle = {
            height: 150,
            width: 200,
            bottom: 30,
            right: 60
        }
        this.style = Object.assign(defaulteStyle, this.opt.style);
        this.rectangle = null;
        this.init();
    }

    init() {
        this.mapEle = window.document.createElement("div");
        this.mapEle.setAttribute("id", "map2d");
        this.mapEle.style.height = this.style.height + "px";
        this.mapEle.style.width = this.style.width + "px";
        this.mapEle.style.position = "absolute";
        this.mapEle.style.bottom = this.style.bottom + "px";
        this.mapEle.style.right = this.style.right + "px";
        document.body.appendChild(this.mapEle);
        this.showStyle = {
            color: "#ff7800",
            weight: 1,
            fill: true,
            stroke: true,
            opacity: 1
        };
        this.hideStyle = {
            fill: false,
            opacity: 0
        };

        //根据参数创建鹰眼图  
        let map = L.map('map2d', {
            minZoom: 3,
            maxZoom: 17,
            center: [31.827107, 117.240601],
            zoom: 4,
            zoomControl: false,
            attributionControl: false,
        });
        L.tileLayer("http://a.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

        this.map = map;

        this.viewer.camera.percentageChanged = 0.01;
        this.viewer.camera.changed.addEventListener(this.sceneRenderHandler, this);

        this.sceneRenderHandler();
    }
    sceneRenderHandler() {
        let rectangle = this.viewer.camera.computeViewRectangle();
        let extend = {};
        if(rectangle){
            extend.ymin = Cesium.Math.toDegrees(rectangle.south);
            extend.ymax = Cesium.Math.toDegrees(rectangle.north);
            extend.xmin = Cesium.Math.toDegrees(rectangle.west);
            extend.xmax = Cesium.Math.toDegrees(rectangle.east);
        }else{
            extend.ymin = -90;
            extend.ymax = 90;
            extend.xmin = -180;
            extend.xmin = 180;
        }
        let corner1 = L.latLng(extend.ymin, extend.xmin),
            corner2 = L.latLng(extend.ymax, extend.xmax);
        let bounds = L.latLngBounds(corner1, corner2);
        if (this.rectangle) {
            this.rectangle.setBounds(bounds);
        } else {
            this.rectangle = L.rectangle(bounds, this.showStyle).addTo(this.map);
        }


        if (extend.xmin == -180 && extend.xmax == 180
            && extend.ymax == 90 && extend.ymin == - 90) { //整个地球在视域内 
            this.map.setView([0, 0], 0);
            this.rectangle.setStyle(this.hideStyle);
        } else {
            let padBounds = bounds.pad(0.5);
            this.map.fitBounds(padBounds);
            this.rectangle.setStyle(this.showStyle);
        }
    }

    //关闭鹰眼图
    hide() {
        if (this.mapEle)
            this.mapEle.style.display = "none";
    }
    //打开鹰眼图
    show() {
        if (this.map && this.mapEle)
            this.mapEle.style.display = "block";
    }
    //设置矩形框样式
    setStyle(style) {
        if (!style) return;
        this.showStyle = style;
    }
    destroy() {
        if (this.mapEle) {
            document.body.removeChild(this.mapEle);
        }
        this.viewer.camera.changed.removeEventListener(this.sceneRenderHandler, this);
    }
}

export default OverviewMap;