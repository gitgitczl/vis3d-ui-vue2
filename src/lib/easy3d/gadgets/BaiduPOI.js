//百度 POI查询 工具类
//参考文档：http://lbsyun.baidu.com/index.php?title=webapi/guide/webservice-placeapi

class BaiduPOI {
    //构造方法
    constructor(opts) {
        opts = opts || {};

        //请在实际项目中将下面百度KEY换为自己申请的，因为该key不保证长期有效。
        this._keys = opts.key || [
            "c3qarrKcqnB9HbCOPfKOHgneH6AGXCVU",//2020-6-6
            "6g6evLsHT4M0DVZnRXRpXDDq1t95ESrg",
            "4j0HA8IeuvAPCl62ni8xCZkBhc2YGr67",
            "F4CZ3cvHf8vbL8rkuTNtx8w2eflpdzj5",
            "qObioeG8HeeQVrOVAGScPVhDzlmv6rL9",
        ];
        this._region = opts.region || "全国"; //默认全国,可改为具体城市


        this.isFileter = opts.isFileter === undefined ? true : opts.isFileter;
        this._key_index = 0;
    }

    //百度key
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

    //【内部】格式化返回的数据
    _formatPOIData(arr) {
        var arrNew = [];
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            var coor = [];
            if (item.location)
                coor = mars3d.pointconvert.gcj2wgs([item.location.lng, item.location.lat]); //坐标
            arrNew.push({
                id: item.uid,
                name: item.name, //名称
                x: coor[0],
                y: coor[1],
                address: item.address, //地址
                xzqh: item.province + item.city + item.district, //行政区域
                type: item.tag, //类别
                tel: item.telephone || "",
                detail_info: item.detail_info
            });
        }
        return arrNew;
    }

    _getKeywords(text) {
        if (haoutil.isutil.isString(text)) {
            return text.replaceAll(" ", "$").replaceAll(",", "$");
        } else if (haoutil.isutil.isArray(text)) {
            return text.join("$");
        }
        return text;
    }

    //百度搜索提示
    autoTip(opt) {
        var filter = {
            "ak": this.key, //请求服务权限标识 
            "output": "json",
            "ret_coordtype": "gcj02ll",
        };

        if (Cesium.defined(this._region))
            filter.region = this._region;
        if (Cesium.defined(opt.city))
            filter.region = opt.city;

        if (Cesium.defined(opt.citylimit))
            filter.city_limit = opt.citylimit;
        if (opt.text) {
            filter.query = this._getKeywords(opt.text);
        }
        if (opt.location) {
            filter.coord_type = 1//标识是WGS84ll即GPS经纬度
            filter.location = opt.location.y + "," + opt.location.x; //40.04785,116.3135
        }

        console.log(filter);
        var that = this;
        $.ajax({
            url: "http://api.map.baidu.com/place/v2/suggestion",
            type: "GET",
            dataType: "jsonp",
            timeout: 5000,
            //contentType: "application/json;utf-8",
            data: filter,
            success: function (data) {
                if (data.status != 0) {
                    console.log("未查询到相关结果！");
                    return;
                }

                var arr = that._formatPOIData(data.result);
                if (opt.success) opt.success({
                    allcount: data.total,
                    count: arr.length,
                    list: arr
                });
            },
            error: function (data) {
                var msg = "请求出错(" + data.status + ")：" + data.statusText;
                if (opt.error) opt.error(msg);
            }
        });
    }
    //【内部】 二次筛选 保证数据在查询范围内 依赖于turf.js
    //关键字搜索
    /*opt = { 
           text: 关键字
           count：数量
           city: 城市
           page：分页
           error: function (data) //错误或无数据时回调方法
           success: function (data) //有数据时回调方法
   }*/
    queryText(opt) {
        var filter = {
            "ak": this.key, //请求服务权限标识 
            "output": "json",
            "ret_coordtype": "gcj02ll",
            "scope": 2,         //检索结果详细程度。取值为1 或空，则返回基本信息；取值为2，返回检索POI详细信息 
            "page_num": opt.page || 1,
            "page_size": opt.count || 25,
            "tag": opt.types || ""
        };

        if (Cesium.defined(this._region))
            filter.region = this._region;
        if (Cesium.defined(opt.city))
            filter.region = opt.city;

        if (Cesium.defined(opt.citylimit))
            filter.city_limit = opt.citylimit;
        if (opt.text) {
            filter.query = this._getKeywords(opt.text);
        }
        if (opt.location) {
            filter.coord_type = 1//标识是WGS84ll即GPS经纬度
            filter.location = opt.location.y + "," + opt.location.x; //40.04785,116.3135
        }
        if (Cesium.defined(opt.radius)) {
            if (opt.radius > 5000000)
                delete filter.location
            else
                filter.radius = opt.radius;
        }

        var that = this;
        $.ajax({
            url: "http://api.map.baidu.com/place/v2/search",
            type: "GET",
            dataType: "jsonp",
            timeout: 5000,
            //contentType: "application/json;utf-8",
            data: filter,
            success: function (data) {
                if (data.status != 0) {
                    var meg = "POI 请求失败(" + data.status + ")：" + data.message;
                    if (opt.error) opt.error(meg);
                    return;
                }

                if (!data.results || data.results.length == 0) {
                    if (opt._sendCount) {
                        console.log("未查询到相关结果！"); 
                        if (opt.success) opt.success({
                            allcount: 0,
                            count: 0,
                            list: []
                        });
                    }
                    else {
                        delete opt.radius
                        delete opt.location

                        opt._sendCount = 1
                        that.queryText(opt);
                    }
                    return;
                }

                var arr = that._formatPOIData(data.results);
                if (opt.success) opt.success({
                    allcount: data.total,
                    count: arr.length,
                    list: arr
                });
            },
            error: function (data) {
                var msg = "请求出错(" + data.status + ")：" + data.statusText;
                if (opt.error) opt.error(msg);
            }
        });
    }





}