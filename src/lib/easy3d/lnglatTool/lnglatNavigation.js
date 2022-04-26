// 底部鼠标及相机坐标信息
class LatlngNavigation {
    constructor(viewer, opt) {
        this.viewer = viewer;
        this.moveHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
        this.initHtml();
        this.bindMouseMoveHandler();
        this.ellipsoid = this.viewer.scene.globe.ellipsoid;
    }

    bindMouseMoveHandler() {
        let that = this;
        this.moveHandler.setInputAction(function (evt) { //单击开始绘制
            const cartesian = that.getCatesian3FromPX(evt.endPosition);
            if (!cartesian) return;
            const lnglat = that.ellipsoid.cartesianToCartographic(cartesian);
            const lat = Cesium.Math.toDegrees(lnglat.latitude);
            const lng = Cesium.Math.toDegrees(lnglat.longitude);
            const height = lnglat.height;
            const cameraV = that.getCameraView();
            that.setHtml({ lng, lat, height }, cameraV);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    destroy() {
        if (this.moveHandler) {
            this.moveHandler.destroy();
            this.moveHandler = null;
        }

        let doms = document.getElementsByClassName("easy3d-lnglatNavigation");
        const id = this.viewer.container.id;
        const mapDom = document.getElementById(id);
        mapDom.removeChild(doms[0]);
    }
    initHtml() {
        const id = this.viewer.container.id;
        const mapDom = document.getElementById(id);
        let ele = document.createElement("div");
        ele.className = 'easy3d-lnglatNavigation';
        ele.innerHTML = ` <ul>
                            <li></li>   
                            <li></li>
                            <li></li>
                            <li></li>
                            <li></li>
                            <li></li>
                            <li></li>
                        <ul>`;
        mapDom.appendChild(ele);
    }
    getCatesian3FromPX(px) {
        const picks = this.viewer.scene.drillPick(px);
        this.viewer.scene.render();
        let cartesian;
        let isOn3dtiles = false;
        for (let i = 0; i < picks.length; i++) {
            if ((picks[i] && picks[i].primitive) && picks[i].primitive instanceof Cesium.Cesium3DTileset) { //模型上拾取
                isOn3dtiles = true;
                break;
            }
        }
        if (isOn3dtiles) {
            cartesian = this.viewer.scene.pickPosition(px);
        } else {
            const ray = this.viewer.camera.getPickRay(px);
            if (!ray) return null;
            cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        }
        return cartesian;
    }
    setHtml(latlngOpt, cameraView) {
        const lng = Number(latlngOpt.lng).toFixed(6);
        const lat = Number(latlngOpt.lat).toFixed(6);
        const height = Number(latlngOpt.height).toFixed(2);
        const heading = Number(cameraView.heading).toFixed(2);
        const pitch = Number(cameraView.pitch).toFixed(2);
        const roll = Number(cameraView.roll).toFixed(2);
        const z = Number(cameraView.z).toFixed(2);
        let eles = document.getElementsByClassName('easy3d-lnglatNavigation');
        if (!eles || eles.length < 1) return;
        let ele = eles[0];
        let lis = ele.children[0].children;
        lis[0].innerHTML = `经度：${lng}`;
        lis[1].innerHTML = `纬度：${lat}`;
        lis[2].innerHTML = `高度：${height}`;
        lis[3].innerHTML = `偏转角：${heading}`;
        lis[4].innerHTML = `仰俯角：${pitch}`;
        lis[5].innerHTML = `翻滚角：${roll}`;
        lis[6].innerHTML = `相机高度：${z}`;
    }

    getCameraView() {
        const camera = this.viewer.camera;
        const position = camera.position;
        const heading = camera.heading;
        const pitch = camera.pitch;
        const roll = camera.roll;
        const lnglat = Cesium.Cartographic.fromCartesian(position);

        return {
            "x": Cesium.Math.toDegrees(lnglat.longitude),
            "y": Cesium.Math.toDegrees(lnglat.latitude),
            "z": lnglat.height,
            "heading": Cesium.Math.toDegrees(heading),
            "pitch": Cesium.Math.toDegrees(pitch),
            "roll": Cesium.Math.toDegrees(roll)
        };
    }


}

export default LatlngNavigation;