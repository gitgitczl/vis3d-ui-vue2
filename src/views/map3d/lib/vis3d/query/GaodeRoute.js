/**
 * @class
 * @description 高德路径规划查询，参考文档：https://lbs.amap.com/api/webservice/guide/api/search
 */
import axios from "axios";
class GaodeRoute {
    /**
     * @param {Object} opt 
     * @param {Array | String} opt.keys 高德key，可不传key、传key数组以及key字符串
     */
    constructor(opt) {
        this.opt = opt || {};
        const defaultKeys = ['a73e387f642573295b498d7fd6b4c537'];
        this._key = undefined;
        // 支持不传key、传key数组以及key字符串
        if (!this.opt.keys || this.opt.keys.length == 0) {
            this._key = defaultKeys[Math.floor(Math.random() * defaultKeys.length)]
        } else {
            if (this.opt.keys instanceof Array) {
                this._key = this.opt.keys[Math.floor(Math.random() * this.opt.keys.length)]
            } else {
                this._key = this.opt.keys;
            }
        }

    }

    get key() {
        return this._key;
    }

    set key(key) {
        this._key = key;
    }

    /**
    * 驾车路线规划
    * @param {Object} options  参数，可参考高德官网配置
    * @param {Array} options.origin  起点经纬度坐标
    * @param {Array} options.destination  终点经纬度坐标
    * @param {Array} options.avoidpolygons  避让区域坐标
    * @param {Function} success 成功后的回调函数 
    */
    queryDriving(options, success, error) {
        options = options || {};
        if (!options.origin) {
            alert("缺少起点坐标！");
            return;
        }
        if (!options.destination) {
            alert("缺少终点坐标！");
            return;
        }

        let origin = options.origin;
        let gcj_origin = this.wgs2gcj(origin);
        gcj_origin = gcj_origin[0] + "," + gcj_origin[1];
        delete options.origin;

        let destination = options.destination;
        let gcj_destination = this.wgs2gcj(destination);
        gcj_destination = gcj_destination[0] + "," + gcj_destination[1];
        delete options.destination;

        let avoidpolygons = ''; // 避让区域
        if (options.avoidpolygons) {
            for (let i = 0; i < options.avoidpolygons.length; i++) {
                const avoidpolygon = options.avoidpolygons[i];
                let firstLnglat = '';
                let polygonstr = '';
                for (let j = 0; j < avoidpolygon.length; j++) {
                    let lnglat = avoidpolygon[j];
                    lnglat = this.wgs2gcj(lnglat);
                    polygonstr += lnglat[0] + ',' + lnglat[1] + ','
                    if (j == 0) firstLnglat = lnglat[0] + ',' + lnglat[1]
                }
                polygonstr = polygonstr + firstLnglat;

                if (i == options.avoidpolygons.length - 1) {
                    avoidpolygons += polygonstr;
                } else {
                    avoidpolygons += polygonstr + '|';
                }


            }
        }
        delete options.avoidpolygons;

        let url = "https://restapi.amap.com/v5/direction/driving";
        let params = {
            key: this._key,
            origin: gcj_origin,
            destination: gcj_destination,
            strategy: 0, // 默认距离优先
            avoidpolygons: avoidpolygons,// 避让区不可超过81平方公里 避让去顶点不可超过16个
            show_fields: "polyline"
        }
        params = Object.assign(params, options || {});
        let that = this;

        axios.get(url, {
            params: params
        }).then((res) => {
            if (res.status != 200 || res.data.infocode != '10000') {
                console.log("查询失败！");
                if (error) error(res.data);
                return;
            }
            const allroute = that.transformData(origin, destination, res.data.route);
            if (success) success(allroute);
        })
    }

    queryUndriving(url, options, success, error) {
        options = options || {};
        if (!options.origin) {
            alert("缺少起点坐标！");
            return;
        }
        if (!options.destination) {
            alert("缺少终点坐标！");
            return;
        }

        let origin = options.origin;
        let gcj_origin = this.wgs2gcj(origin);
        gcj_origin = origin[0] + "," + origin[1];
        delete options.origin;

        let destination = options.destination;
        let gcj_destination = this.wgs2gcj(destination);
        gcj_destination = destination[0] + "," + destination[1];
        delete options.destination;

        let params = {
            key: this._key,
            origin: gcj_origin,
            destination: gcj_destination,
            show_fields: "polyline"
        }
        params = Object.assign(params, options || {});
        let that = this;
        axios.get(url, {
            params: params
        }).then((res) => {
            if (res.status != 200) {
                console.log("查询失败！");
                if (error) error(res.data);
                return;
            }
            const allroute = that.transformData(origin, destination, res.data.data || res.data.route);
            if (success) success(allroute);
        })

    }


    // 开始搜索
    /**
     * @param {Number} type 搜索类型（1、驾车路线；2、骑行路线；3、步行路线）
     * @param {Object} params 搜索参数
     * @param {Function} success 成功后的回调函数
     */
    query(type, params, success, error) {
        type = Number(type || 1);
        let url = '';
        if (type == 1) { // 驾车
            this.queryDriving(params, success, error)
        } else if (type == 2) { // 骑行
            url = 'https://restapi.amap.com/v4/direction/bicycling';
            this.queryUndriving(url, params, success, error)
        } else if (type == 3) { // 步行
            url = 'https://restapi.amap.com/v3/direction/walking';
            this.queryUndriving(url, params, success, error)
        } else {
            alert("路径查询类型有误");
            return;
        }
    }

    transformWD(lng, lat) {
        const PI = 3.1415926535897932384626;
        var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
        ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(lat * PI) + 40.0 * Math.sin(lat / 3.0 * PI)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(lat / 12.0 * PI) + 320 * Math.sin(lat * PI / 30.0)) * 2.0 / 3.0;
        return ret;
    }
    transformJD(lng, lat) {
        const PI = 3.1415926535897932384626;
        var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
        ret += (20.0 * Math.sin(6.0 * lng * PI) + 20.0 * Math.sin(2.0 * lng * PI)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(lng * PI) + 40.0 * Math.sin(lng / 3.0 * PI)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(lng / 12.0 * PI) + 300.0 * Math.sin(lng / 30.0 * PI)) * 2.0 / 3.0;
        return ret;
    }
    wgs2gcj(arrdata) {
        const a = 6378245.0;
        const ee = 0.00669342162296594323;
        const PI = 3.1415926535897932384626;
        var lng = Number(arrdata[0]);
        var lat = Number(arrdata[1]);
        var dlat = this.transformWD(lng - 105.0, lat - 35.0);
        var dlng = this.transformJD(lng - 105.0, lat - 35.0);
        var radlat = lat / 180.0 * PI;
        var magic = Math.sin(radlat);
        magic = 1 - ee * magic * magic;
        var sqrtmagic = Math.sqrt(magic);
        dlat = dlat * 180.0 / (a * (1 - ee) / (magic * sqrtmagic) * PI);
        dlng = dlng * 180.0 / (a / sqrtmagic * Math.cos(radlat) * PI);
        var mglat = lat + dlat;
        var mglng = lng + dlng;

        mglng = Number(mglng.toFixed(6));
        mglat = Number(mglat.toFixed(6));
        return [mglng, mglat];

    }

    gcj2wgs(arrdata) {
        const a = 6378245.0;
        const ee = 0.00669342162296594323;
        const PI = 3.1415926535897932384626;
        var lng = Number(arrdata[0]);
        var lat = Number(arrdata[1]);
        var dlat = this.transformWD(lng - 105.0, lat - 35.0);
        var dlng = this.transformJD(lng - 105.0, lat - 35.0);
        var radlat = lat / 180.0 * PI;
        var magic = Math.sin(radlat);
        magic = 1 - ee * magic * magic;
        var sqrtmagic = Math.sqrt(magic);
        dlat = dlat * 180.0 / (a * (1 - ee) / (magic * sqrtmagic) * PI);
        dlng = dlng * 180.0 / (a / sqrtmagic * Math.cos(radlat) * PI);

        var mglat = lat + dlat;
        var mglng = lng + dlng;

        var jd = lng * 2 - mglng;
        var wd = lat * 2 - mglat;

        jd = Number(jd.toFixed(6));
        wd = Number(wd.toFixed(6));
        return [jd, wd];
    }

    transformData(start, end, route) {
        let paths = route.paths; // 所有路径
        let allroute = [];
        for (let i = 0; i < paths.length; i++) {
            let path = paths[i];
            let lnglats = [];
            let instructions = [];
            const distance = path.distance;
            for (let j = 0; j < path.steps.length; j++) { // 单个路径的坐标数组
                let item = path.steps[j];
                let instruction = path.steps[j].instruction;
                let polyline = item.polyline;
                polyline = polyline.split(";");
                polyline.forEach(element => {
                    element = element.split(",");
                    element = this.gcj2wgs(element);
                    lnglats.push([element[0], element[1]]);
                });
                instructions.push(instruction);
            }

            // 加上起点和终点
            lnglats.unshift(start);
            lnglats.push(end)
            allroute.push({
                lnglats, instructions, distance
            })
        }

        return allroute;
    }

}

export default GaodeRoute;