//高度 POI查询 工具类
import axios from "axios";
/**
 * @class
 * @description 高德poi查询，参考文档：https://lbs.amap.com/api/webservice/guide/api/search
 */
class GaodePOI {
    /**
     * 
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
     * 关键字搜索
     * @param {Object} options  参数，可参考高德官网配置
     * @param {Function} success 成功后的回调函数 
     */
    queryText(options, success) {
        let url = "https://restapi.amap.com/v3/place/text";
        let params = {
            key: this._key,
            offset: options.pageSize || 25, // 每页条数
            page: options.pageNumber|| 1  // 当前页数
        }
        params = Object.assign(params, options || {});
        let that = this;

        axios.get(url, {
            params: params
        }).then((res) => {
            let pois = res.data.pois || [];
            for (let i = 0; i < pois.length; i++) {
                let poi = pois[i];
                let location = poi.location;
                location = location.split(",");
                const coor = that.gcj2wgs(location);
                poi.lnglat = coor;
            }
            if (success) success(res.data.pois);
        });

    }
    /**
     * 周边搜索
     * @param {Object} options  参数，可参考高德官网配置
     * @param {Array} options.center  中心点经纬度坐标
     * @param {Function} success 成功后的回调函数 
     */
    queryAround(options, success) {
        if (!options || !options.center) {
            alert("缺少搜索中心点！");
            return;
        }
        const location = this.wgs2gcj(options.center);
        let url = "https://restapi.amap.com/v3/place/around";
        let params = {
            key: this._key,
            location: location[0] + "," + location[1],
            offset: options.pageSize || 25, // 每页条数
            page: options.pageNumber|| 1,  // 当前页数
            radius: options.radius // 默认半径 单位 米
        }

        let that = this;
        axios.get(url, {
            params: params
        }).then((res) => {
            let pois = res.data.pois || [];
            for (let i = 0; i < pois.length; i++) {
                let poi = pois[i];
                let location = poi.location;
                location = location.split(",");
                const coor = that.gcj2wgs(location);
                poi.lnglat = coor;
            }
            if (success) success(res.data.pois);
        })

    }
    /**
     * 范围搜索
     * @param {Object} options  参数，可参考高德官网配置
     *  @param {Object} options.lnglats  范围面经纬度坐标数组
     * @param {Function} success 成功后的回调函数 
     */
    queryPolygon(options, success) {
        if (!options || !options.lnglats || options.lnglats.length < 3) {
            alert("缺少搜索范围！");
            return;
        }
        let polygon = '';
        for (let i = 0; i < options.lnglats.length; i++) {
            let lnglat = options.lnglats[i];
            lnglat = this.wgs2gcj(lnglat);
            polygon += lnglat[0] + ',' + lnglat[1] + "|";
        }
        const firstlnglat = this.wgs2gcj(options.lnglats[0]);
        polygon += firstlnglat[0] + "," + firstlnglat[1];

        let url = "https://restapi.amap.com/v3/place/polygon";
        let params = {
            key: this._key,
            polygon: polygon,
            offset: options.pageSize || 25, // 每页条数
            page: options.pageNumber|| 1  // 当前页数
        }

        let that = this;

        axios.get(url, {
            params: params
        }).then((res) => {
            let pois = res.data.pois || [];
            for (let i = 0; i < pois.length; i++) {
                let poi = pois[i];
                let location = poi.location;
                location = location.split(",");
                const coor = that.gcj2wgs(location);
                poi.lnglat = coor;
            }
            if (success) success(res.data.pois);
        });

    }

    // 开始搜索
    /**
     * @param {Number} type 搜索类型（1、关键字搜索；2、周边搜索；3、范围搜索）
     * @param {Object} params 搜索参数
     */
    query(type, params, success) {
        type = Number(type || 1);
        if (type == 1) {
            this.queryText(params, success)
        } else if (type == 2) {
            this.queryAround(params, success)
        } else if (type == 3) {
            this.queryPolygon(params, success)
        } else {
            alert("poi查询类型有误");
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

}

export default GaodePOI;