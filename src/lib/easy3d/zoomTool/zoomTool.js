/**
 * 缩放工具
 * @class
 * 
 */
class ZoomTool {
    /**
     * 
     * @param {Cesium.Viewer} viewer 地图viewer对象
     * @param {Object} opt 基础配置
     * @param {Object} opt.step 缩放步长
     */
    constructor(viewer, opt) {
        this.viewer = viewer;
        this.opt = opt || {};
        /**
         * @property {Number} step 缩放步长
         */
        this.step = this.opt.step || 0.5;
        this.forwardAmount = null;
        this.backwardAmount = null;
        /**
         * @property {Cesium.Cartesian3} position 相机位置
         */
        this.position = null;
    }
    /**
     * 向前移动
     */
    forward() {
        let amount;
        if (this.backwardAmount) {
            amount = this.backwardAmount;
            this.backwardAmount = null;
        } else {
            amount = this.computeLength() || 0;
            amount = amount * this.step;
        }
        this.viewer.camera.moveForward(amount);
        this.forwardAmount = amount;
    }
    /**
     * 向后移动
     */
    backward() {
        let amount;
        if (this.forwardAmount) {
            amount = this.forwardAmount;
            this.forwardAmount = null;
        } else {
            amount = this.computeLength() || 0;
            amount = amount * this.step;
        }
        this.viewer.camera.moveBackward(amount);
        this.backwardAmount = amount;
    }
    // 计算相机距离
    computeLength() {
        this.position = this.viewer.camera.position;
        const lnglat = Cesium.Cartographic.fromCartesian(this.position);
        let height = lnglat.height;
        // 求出相机和地形的高度差
        let cdir = Cesium.Cartesian3.negate(this.position.clone(), new Cesium.Cartesian3());
        Cesium.Cartesian3.normalize(cdir.clone(), cdir);
        let ray = new Cesium.Ray(this.position.clone(), cdir.clone());
        let intersec = this.viewer.scene.globe.pick(ray, this.viewer.scene);
        if (!intersec) return undefined;
        let cctgc = Cesium.Cartographic.fromCartesian(intersec);
        height = lnglat.height - cctgc.height;

        let dir = this.viewer.camera.direction;
        dir = Cesium.Cartesian3.normalize(dir, new Cesium.Cartesian3())

        let reverseZ = new Cesium.Cartesian3(0, 0, -1);
        let cosAngle = Cesium.Cartesian3.dot(dir, reverseZ);
        let angle = Math.asin(cosAngle);
        let length = height / Math.cos(angle);
        return length;
    }
}

export default ZoomTool;