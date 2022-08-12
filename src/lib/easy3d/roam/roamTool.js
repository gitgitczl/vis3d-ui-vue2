import Roam from "./roam";
class RoamTool {
    constructor(viewer, opt) {
        this.viewer = viewer;
        this.opt = opt || {};

        this.startRoamFun = null;
        this.endRoamFun = null;
        this.roamingFun = null;
        this.stopRoamFun = null;
        this.goonRoamFun = null;
        this.endCreateFun = null;

        this.roamList = [];
        this.nowStartRoam = null;
    }

    // 事件绑定
    on(type, fun) {
        let that = this;
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

    // 创建漫游
    create(opt, callback) {
        opt = opt || {};
        let { roamType, positions } = opt;
        positions = this.transfromPositions(positions);
        let roam = null;

        let roamAttr = {
            times: opt.times,
            speed: opt.speed,
            endRoamCallback: this.endRoamFun,
            roamingCallback: this.roamingFun,
            viewType: opt.viewType
        }
        if (!opt.times && !opt.speed) roamAttr.times = 60; // 不设置速度和时长 默认以60s时长飞完

        roamAttr = Object.assign(opt, roamAttr);

        let that = this;
        switch (roamType) {
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
        if (!positions || positions.length < 2) return;
        let newPositions = [];
        positions.forEach(position => {
            let ctgc = Cesium.Cartographic.fromCartesian(position.clone());
            ctgc.height = height;
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

    // 根据构建时指定的属性获取当前漫游对象
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

    removeRoam(roam) {
        if (!roam) return;
        let roamId = roam.objId;
        this.removeRoamById(roamId);
    }

    // 开始漫游
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

    endRoam() {
        if (this.nowStartRoam) {
            this.nowStartRoam.end();
            this.nowStartRoam = null;
        }
    }

    getNowroamAttr() {
        if (!this.nowStartRoam) return {};
        let attr = Object.assign(this.nowStartRoam.attr, this.nowStartRoam.getAttr());
        return attr;
    }

    destroy() {
        for (let i = this.roamList.length - 1; i >= 0; i--) {
            let roam = this.roamList[i];
            roam.destroy();
        }
        this.roamList = [];
    }

    // 转化为json
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