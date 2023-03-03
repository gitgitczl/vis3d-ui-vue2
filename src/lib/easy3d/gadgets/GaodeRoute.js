//高德 路径规划  工具类
//参考文档：https://lbs.amap.com/api/webservice/guide/api/direction
import axios from "axios";
import cUtil from '../cUtil.js'
class GaodeRoute {
    constructor(opts) {
        opts = opts || {};

        //请在实际项目中将下面高德KEY换为自己申请的，因为该key不保证长期有效。
        this._keys = opts.keys || [
            "ae29a37307840c7ae4a785ac905927e0",//2020-6-18
            "888a52a74c55ca47abe6c55ab3661d11",
            "0bc2903efcb3b67ebf1452d2f664a238",
            "0df8f6f984adc49fca5b7b1108664da2",
            "72f75689dff38a781055e68843474751"
        ];

        this.GaodeRouteType = {
            Walking: 1, //步行
            Bicycling: 2, //骑行
            Driving: 3, //驾车
        }
        this._key_index = 0;

    }

    //高德key
    get keys() {
        return this._keys;
    }
    set keys(val) {
        this._keys = val;
    }

    //取单个key（轮询）
    get key() {
        var thisidx = (this._key_index++) % (this._keys.length);
        return this._keys[thisidx];
    }

    //  按指定类别自动查询
    query(opt) {
        var filter = {
            "key": this.key, 
            "output": "json",
        };
        //坐标构造
        var startP = cUtil.wgs2gcj(opt.points[0]);
        var endP = cUtil.wgs2gcj(opt.points[opt.points.length - 1]);
        filter.origin = startP[0] + "," + startP[1];
        filter.destination = endP[0] + "," + endP[1];

        // 如果有避让区域  添加避让区域
        if(opt.avoidareas){
            let avoidStr = '';
            for(let i=0;i<opt.avoidareas.length;i++){
                let item = opt.avoidareas[i];
                avoidStr += `${item[0]},${item[1]};`
            }
            filter.avoidpolygons = avoidStr;
        }

        switch (opt.type) {
            default:
            case this.GaodeRouteType.Walking: //步行
                this.queryWalking(filter,opt);
                break;
            case this.GaodeRouteType.Bicycling: //骑行
                this.queryBicycling(filter,opt);
                break;
            case this.GaodeRouteType.Driving: //驾车
                this.queryDriving(filter,opt);
                break;
        }
    }

    //  一次查询多个路线
    queryList(opt) {
        var that = this;
        var index = -1;

        var newOpts = {};
        for (var key in opt) {
            if (key == "points" || key == "success" || key == "error") continue;
            newOpts[key] = opt[key];
        }
        var arrPoints = opt.points;
        var arrResult = [];

        function queryNextLine() {
            index++;
            newOpts.points = arrPoints[index];
            newOpts.success = function (data) {
                if (data && data.paths && data.paths.length > 0)
                    arrResult.push(data.paths[0]);
                else
                    arrResult.push(null);

                if (index >= arrPoints.length - 1) {
                    if (opt.success) {
                        opt.success(arrResult);
                    }
                } else {
                    queryNextLine();
                }
            };
            newOpts.error = newOpts.success;
            that.query(newOpts);
        }
        queryNextLine();
    }

    //  计算最短距离的线 
    computeMindistanceLine(data) {
        var mindis = Number.MAX_VALUE;
        var lineData = null;
        var index = -1;
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            if (item) {
                if (item.allDistance <= mindis) {
                    lineData = item;
                    index = i;
                    mindis = item.allDistance;
                }
            }
        }
        return {
            lineData: lineData,
            index: index
        };
    }

    // 步行路径规划(单个查询)
    /*opt = { 
           points: 按起点、途经点、终点顺序的坐标数组 [[x1,y1],[x2,y2]] 
           error: function (data) //错误或无数据时回调方法
           success: function (data) //有数据时回调方法
    }*/
    queryWalking(filter,opt) {
        var that = this;
        axios.get('http://restapi.amap.com/v3/direction/walking', {
            params: filter
        }).then(function (res) {
            let data = res.data || {};
            if (data.infocode !== "10000") {
                var msg = "路径规划 请求失败(" + data.infocode + ")：" + data.info;
                if (opt.error) opt.error(msg);
                return;
            }
            if (!data.route || !data.route.paths) {
                var msg = "未查询到相关结果！";
                if (opt.error) opt.error(msg);
                return;
            }

            var result = that._formatRouteData(filter.origin, filter.destination, data.route.paths);

            if (opt.success) opt.success(result);
        }).catch(function (err) {
            if (opt.error) opt.error(err);
        });

    }

    //骑行路径查询
    /*opt = { 
           points: 按起点、途经点、终点顺序的坐标数组 [[x1,y1],[x2,y2]] 
           error: function (data) //错误或无数据时回调方法
           success: function (data) //有数据时回调方法
       }*/
    queryBicycling(filter,opt) {
        var that = this;
        axios.get("https://restapi.amap.com/v4/direction/bicycling", {
            params: filter
        }).then(function (res) {
            let data = res.data || {};
            if (data.infocode !== "10000") {
                var msg = "路径规划 请求失败(" + data.infocode + ")：" + data.info;
                if (opt.error) opt.error(msg);
                return;
            }

            if (!data.route || !data.route.paths) {
                var msg = "未查询到相关结果！";
                if (opt.error) opt.error(msg);
                return;
            }
            var result = that._formatRouteData(filter.origin, filter.destination, data.route.paths);
            if (opt.success) opt.success(result);
        }).catch(function (err) {
            if (opt.error) opt.error(err);
        });

    }


    //驾车路径规划查询
    /*opt = { 
            points: 按起点、途经点、终点顺序的坐标数组 [[x1,y1],[x2,y2]] 
            error: function (data) //错误或无数据时回调方法
            success: function (data) //有数据时回调方法
        }*/
    queryDriving(filter,opt) {
       
        filter.extensions = opt.extensions || "base";
        filter.strategy = opt.strategy || 0; //默认返回一条速度优先的路径
        var that = this;
        axios("https://restapi.amap.com/v3/direction/driving", {
            params: filter
        }).then(function (res) {
            let data = res.data || {};
            if (data.infocode !== "10000") {
                var msg = "路径规划 请求失败(" + data.infocode + ")：" + data.info;
                if (opt.error) opt.error(msg);
                return;
            }

            if (!data.route || !data.route.paths || data.route.paths.length == 0) {
                var msg = "未查询到相关结果！";
                if (opt.error) opt.error(msg);
                return;
            }
            var result = that._formatRouteData(filter.origin, filter.destination, data.route.paths);
            if (opt.success) opt.success(result);
        }).catch(function (err) {
            if (opt.error) opt.error(err);
        })

    }

    // 格式化返回的数据
    _formatRouteData(start, end, resultPaths) {
        var wgs_origin, wgs_destination;
        var paths = [];
        if (start) wgs_origin = cUtil.gcj2wgs(start.split(","));
        if (end) wgs_destination = cUtil.gcj2wgs(end.split(","));
        if (resultPaths && resultPaths.length > 0) {
            for (var i = 0; i < resultPaths.length; i++) {
                var route = [];
                route.push(wgs_origin); //连接起点
                var item = resultPaths[i];
                var steps = item.steps;
                var newSteps = [];
                var roadInfo = []; //途径地方
                for (var index = 0; index < steps.length; index++) {

                    var obj = {
                        instruction: steps[index].instruction, //路段步行指示
                        distance: steps[index].distance, //路段距离 米
                        duration: steps[index].duration, //路段预计时间 秒
                        points: [],
                        route: steps[index].road
                    };
                    var polyline = steps[index].polyline;
                    var polylineArr = polyline.split(";");
                    for (var ind = 0; ind < polylineArr.length; ind++) {
                        var one = polylineArr[ind];
                        var wgs = cUtil.gcj2wgs(one.split(","));
                        route.push(wgs);
                        obj.points.push(wgs);
                    }
                    roadInfo.push(obj.route);
                    newSteps.push(obj);
                }
                route.push(wgs_destination); //连接终点
                paths.push({
                    allDistance: item.distance, //总距离
                    allDuration: item.duration, //全部所需时间
                    steps: newSteps, //每一段的数据
                    points: route, //包含起点和终点的 完整路径的wgs84坐标数组
                    road: roadInfo
                });
            }
        }

        return {
            origin: wgs_origin, //起点
            destination: wgs_destination, //终点
            paths: paths //所有方案
        }
    }
}

export default GaodeRoute;