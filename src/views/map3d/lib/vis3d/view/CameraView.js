//相机视角记录及处理类，含 上一视图 下一视图 等
class CameraView {
    constructor(viewer, opts) {
        this.viewer = viewer;
        this.opts = opts || {};

        this.maxCount = Cesium.defaultValue(this.opts.maxCount, 99); //最多记录数
        this.views = [];    // 保存视角
        this.step = 0;      // 记录当前的视角在数组中的位置

        //显示限定范围的边界
        if (this.opts.limit && this.opts.limit.debugExtent) {
            this.debugExtent = this.opts.limit.debugExtent;
        }
        this.limitGlobe();

        // 绑定相机事件 
        this.viewer.camera.moveStart.addEventListener(this._cameraMoveStartHandler, this)
        this.viewer.camera.moveEnd.addEventListener(this._cameraMoveEndHandler, this)
    }
    //========== 对外属性 ==========  
    //是否显示限定范围的边界
    get debugExtent() {
        return this.opts.limit && this.opts.limit.debugExtent;
    }
    set debugExtent(val) {
        if (!this.opts.limit) return;
        this.opts.limit.debugExtent = val;

        if (!this.debugExtentEntity) {
            var radius = this.opts.limit.radius
            var position = this.opts.limit.position
            this.debugExtentEntity = this.viewer.entities.add({
                position: position,
                orientation: Cesium.Transforms.headingPitchRollQuaternion(position, new Cesium.HeadingPitchRoll(0, 0, 0)),
                rectangularSensor: new mars3d.RectangularSensorGraphics({
                    radius: radius, //传感器的半径
                    xHalfAngle: Cesium.Math.toRadians(90),  //传感器水平半角
                    yHalfAngle: Cesium.Math.toRadians(90), //传感器垂直半角 
                    material: new Cesium.Color(0.0, 1.0, 1.0, 0),  //目前用的统一材质
                    lineColor: new Cesium.Color(0.0, 1.0, 1.0, 1.0), //线的颜色 
                    showScanPlane: false,  //是否显示扫描面 
                    showThroughEllipsoid: false
                })
            });
        }
        this.debugExtentEntity.show = val
    }

    //========== 方法 ========== 
    _cameraMoveStartHandler() {
        this.isInPush = true;
        //console.log("cameraMoveStart");
        this.lastCameraView = mars3d.point.getCameraView(this.viewer);
    }
    _cameraMoveEndHandler() {
        this.limitGlobe();
        if (!this.isInPush) return;

        //console.log("cameraMoveEnd");
        this._addCameraView();
    }


    //限定在指定范围球内
    limitGlobe() {
        if (!this.opts.limit) return;

        var position = this.opts.limit.position
        var radius = this.opts.limit.radius

        var camera_distance = Cesium.Cartesian3.distance(position, this.viewer.camera.position);
        if (this.opts.limit.debugExtent) console.log(`视距为：${camera_distance}米`);

        if (camera_distance <= radius) return;


        var that = this;
        this.isInPush = false;
        if (this.lastCameraView) {
            this.viewer.mars.centerAt(this.lastCameraView, {
                duration: 0.5,
                complete: function () {
                    that.lastCameraView = null;
                    that.isInPush = true;
                }
            });
        }
        else {
            this.viewer.mars.centerPoint(position, {
                radius: radius * 0.6, //距离目标点的距离
                pitch: -60,     //相机方向
                duration: 0.5,
                complete: function () {
                    that.lastCameraView = null;
                    that.isInPush = true;
                }
            });
        }
    }


    _addCameraView() {
        //console.log("添加新的视角记录");
        var cameraV = mars3d.point.getCameraView(this.viewer);
        this.views.push(cameraV);

        if (this.views.length > this.maxCount)
            this.views.splice(0, 1);

        this.step = this.views.length - 1;

        if (this.opts.onChange) {
            this.opts.onChange(this.views, this.step);
        }
    }
    _goHistoryView() {
        var that = this;

        //console.log("开始切换历史视角");

        this.viewer.camera.moveStart.removeEventListener(this._cameraMoveStartHandler, this)
        this.viewer.camera.moveEnd.removeEventListener(this._cameraMoveEndHandler, this)

        this.isInPush = false;
        this.viewer.mars.centerAt(this.views[this.step], {
            complete: function () {
                //console.log("完成切换历史视角");

                that.viewer.camera.moveStart.addEventListener(that._cameraMoveStartHandler, that)
                that.viewer.camera.moveEnd.addEventListener(that._cameraMoveEndHandler, that)

                if (that.opts.onChange) {
                    that.opts.onChange(that.views, that.step);
                }
            }
        });
    }

    // 下一视角
    goNext() {
        if (this.step >= this.views.length - 1) { //当前已是最后一页了 
            return false;
        }
        else {
            this.step++;
            this._goHistoryView();
            return true;
        }
    }
    // 上一视角
    goLast() {
        if (this.step <= 0) {//当前已是第一页了 
            return false;
        }
        else {
            this.step--;
            this._goHistoryView();
            return true;
        }
    }
    // 回到当前视角（记录的最后一个视角）
    goNow() {
        if (this.step == this.views.length - 1) { //当前已是最后一页了 
            return false;
        }
        else {
            this.step = this.views.length - 1;
            this._goHistoryView();
            return true;
        }
    }


    // 销毁
    destroy() {
        // 绑定相机事件
        this.viewer.camera.moveStart.removeEventListener(this._cameraMoveStartHandler, this)
        this.viewer.camera.moveEnd.removeEventListener(this._cameraMoveEndHandler, this)

        this.views = [];

        if (this.debugExtentEntity) {
            this.viewer.entities.remove(this.debugExtentEntity)
            delete this.debugExtentEntity
        }
    }
}