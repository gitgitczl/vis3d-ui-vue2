import Roam from "./roam";

/**
 * 漫游控制类
 * @class
 * @description 漫游控制类，通过此类对象，可直接添加漫游对象，并对添加的漫游对象进行控制，而不用多次new Roam。
 */
class RoamTool {
    /**
     * 
     * @param {Cesium.Viewer} viewer 地图viewer对象 
     * @param {Object} opt 基础配置
     */
    constructor(viewer, opt) {
        this.viewer = viewer;
        this.opt = opt || {};

        this.startRoamFun = null;
        this.endRoamFun = null;
        this.roamingFun = null;
        this.stopRoamFun = null;
        this.goonRoamFun = null;
        this.endCreateFun = null;

        /**
         * 漫游对象数组
         * @property {Array} roamList 漫游对象数组
         */
        this.roamList = [];

        /**
         * @property {Array} nowStartRoam 当前正在漫游对象
         */
        this.nowStartRoam = null;
    }

    /** 
     * 事件绑定
     * @param {String} type 事件类型（startRoam 开始漫游时 / endRoam 结束当前漫游时 / roaming 漫游过程中 / stopRoam 漫游暂停时 / goonRoam 继续漫游时 / endCreate 漫游路线绘制完成时）
     * @param {Function} fun 绑定函数
     */
    on(type, fun) {
        if (type == "startRoam") {
            this.startRoamFun = fun;
        }

        if (type == "endRoam") {
            this.endRoamFun = fun;
        }

        if (type == "roaming") {
            this.roamingFun = fun;
        }

        if (type == "stopRoam") {
            this.stopRoamFun = fun;
        }

        if (type == "goonRoam") {
            this.goonRoamFun = fun;
        }

        if (type == "endCreate") {
            this.endCreateFun = fun;
        }

    }

    /**
     * 
     * @param {Object} opt 
     * @param {Number} [opt.roamType=0] 漫游类型（1~飞行漫游/2~贴地漫游/0~普通漫游）
     * @param {Number} [opt.alltimes=60] 漫游时长，和speed互斥
     * @param {Number} [opt.speed] 漫游速度，和alltimes互斥
     * @param {String} [opt.viewType='no'] 漫游时视角类型
     * @param {Number} opt.height 坐标高度
     * @param {Function} callback 线路绘制完成后的回调，回调函数参数为当前创建的漫游对象
     */
    create(opt, callback) {
        opt = opt || {};
        let { roamType, positions } = opt;
        positions = this.transfromPositions(positions);
        let roam = null;

        let roamAttr = {
            alltimes: opt.alltimes,
            speed: opt.speed,
            endRoamCallback: this.endRoamFun,
            roamingCallback: this.roamingFun,
            viewType: opt.viewType
        }
        if (!opt.alltimes && !opt.speed) roamAttr.alltimes = 60; // 不设置速度和时长 默认以60s时长飞完

        roamAttr = Object.assign(opt, roamAttr);

        let that = this;
        switch (Number(roamType)) {
            case 1:
                // 飞行漫游
                if (!opt.height) {
                    console.log("飞行漫游缺少高度！")
                    return;
                }
                let newPositions = this.updatePositionsHeight(positions, opt.height);
                roamAttr.positions = newPositions;
                roam = new Roam(this.viewer, roamAttr);
                roam.attr = roamAttr;
                this.roamList.push(roam);
                if (callback) callback(roam);
                break;
            case 2:
                // 贴地漫游
                this.getTerrainPositions(positions, function (newPositions) {
                    roamAttr.positions = newPositions;
                    /* roamAttr.modelHeightReference = 1; */
                    roam = new Roam(that.viewer, roamAttr);
                    roam.attr = roamAttr;
                    that.roamList.push(roam);
                    if (callback) callback(roam);
                })
                break;
            case 3:
                // 贴模型漫游
                break;
            default:
                // 默认是普通漫游
                roamAttr.positions = positions;
                roam = new Roam(this.viewer, roamAttr);
                roam.attr = roamAttr;
                this.roamList.push(roam);
                if (callback) callback(roam);
        }
    }

    transfromPositions(positions) {
        if (!positions) return;
        if (positions[0] instanceof Cesium.Cartesian3) {
            return positions;
        } else if (positions[0].x && positions[0].y && positions[0].z) {
            let arr = [];
            positions.forEach(item => {
                arr.push(new Cesium.Cartesian3(item.x, item.y, item.z));
            })
            return arr;
        } else {
            let newPositions = [];
            positions.forEach(element => {
                let p = Cesium.Cartesian3.fromDegrees(element[0], element[1], element[2] || 0);
                newPositions.push(p);
            });
            return newPositions;
        }
    }

    updatePositionsHeight(positions, height) {
        if(height==undefined) return positions;
        if (!positions || positions.length < 2) return;
        let newPositions = [];
        positions.forEach(position => {
            let ctgc = Cesium.Cartographic.fromCartesian(position.clone());
            ctgc.height = Number(height);
            let p = Cesium.Cartographic.toCartesian(ctgc);
            newPositions.push(p);
        });
        return newPositions;
    }

    // 计算贴地高程
    getTerrainPositions(positions, callback) {
        if (!positions || positions.length < 2) return;
        let cgArr = [];
        for (let i = 0; i < positions.length; i++) {
            let cartesian = positions[i];
            let cg = Cesium.Cartographic.fromCartesian(cartesian);
            cgArr.push(cg);
        }
        Cesium.when(Cesium.sampleTerrainMostDetailed(this.viewer.terrainProvider, cgArr), function (updateLnglats) {

            let raisedPositions = ellipsoid.cartographicArrayToCartesianArray(updateLnglats); //转为世界坐标数组
            if (callback) callback(raisedPositions);
        });
    }

    /**
     * 根据构建时指定的属性获取当前漫游对象
     * @param {String} fieldName 字段名称
     * @param {String} fieldValue 字段值
     * @returns {Array} 漫游对象数组
     */
    getRoamByField(fieldName, fieldValue) {
        if (!fieldName) return [];
        let arr = [];
        for (let i = 0; i < this.roamList.length; i++) {
            let roam = this.roamList[i];
            if (roam.attr[fieldName] == fieldValue) {
                arr.push({
                    roam: roam,
                    index: i
                })
            }
        }
        return arr;
    }

    /**
     * 根据id移除漫游对象
     * @param {String | Number} roamId 漫游对象id
     */
    removeRoamById(roamId) {
        if (!roamId) return;
        for (let i = this.roamList.length - 1; i >= 0; i--) {
            let roam = this.roamList[i];
            if (roam.objId == roamId) {
                roam.destroy();
                this.roamList.splice(i, 1);
                break;
            }
        }
    }

    /**
     * 移除漫游对象
     * @param {Object} roam 漫游对象
     */
    removeRoam(roam) {
        if (!roam) return;
        let roamId = roam.objId;
        this.removeRoamById(roamId);
    }

    /**
     * 开始漫游
     * @param {Object} roam 漫游对象
     */
    startRoam(roam) {
        this.endRoam();
        let roamId = roam.objId;
        for (let i = this.roamList.length - 1; i >= 0; i--) {
            let roam = this.roamList[i];
            if (roam.objId == roamId) {
                roam.start();
                this.nowStartRoam = roam;
                if (this.startRoamFun) this.startRoamFun(roam);
                break;
            }
        }
    }

    /**
     * 结束当前漫游
     */
    endRoam() {
        if (this.nowStartRoam) {
            this.nowStartRoam.end();
            this.nowStartRoam = null;
        }
    }

    /**
     * 获取当前漫游的对象属性
     * @returns {Object} 漫游属性
     */
    getNowroamAttr() {
        if (!this.nowStartRoam) return {};
        let attr = Object.assign(this.nowStartRoam.attr, this.nowStartRoam.getAttr());
        return attr;
    }

    /**
     * 销毁
     */
    destroy() {
        for (let i = this.roamList.length - 1; i >= 0; i--) {
            let roam = this.roamList[i];
            roam.destroy();
        }
        this.roamList = [];
        this.startRoamFun = null;
        this.endRoamFun = null;
        this.roamingFun = null;
        this.stopRoamFun = null;
        this.goonRoamFun = null;
        this.endCreateFun = null;
    }

    removeAll() {
        for (let i = this.roamList.length - 1; i >= 0; i--) {
            let roam = this.roamList[i];
            roam.destroy();
        }
        this.roamList = [];
      
    }

    /**
     * 转化为json
     */
    toJson() {
        let arr = [];
        for (let i = this.roamList.length - 1; i >= 0; i--) {
            let roam = this.roamList[i];
            arr.push(roam.getAttr());
        }
        return arr;
    }
}

export default RoamTool;