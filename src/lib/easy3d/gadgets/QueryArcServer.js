//ArcGIS Server 矢量服务分页查询类

class QueryArcServer {
    constructor(options) {
        this.options = options;

        this.queryWFS = mars3d.L.esri.query({
            url: options.url
        });
        this.name = Cesium.defaultValue(options.name, "");

        this._pageSize = Cesium.defaultValue(options.pageSize, 10); // 每页条数 
        this._allCount = 0  //总记录数
        this._allPage = 0   //总页数
        this._pageIndex = 1  //当前第几页
        this.arrIDS = [];
    }
    //========== 对外属性 ==========     
    //每页条数
    get pageSize() {
        return this._pageSize;
    }
    set pageSize(val) {
        this._pageSize = val;
    }
    //总记录数
    get allCount() {
        return this._allCount;
    }
    //总页数
    get allPage() {
        return this._allPage;
    }
    //当前第几页
    get pageIndex() {
        return this._pageIndex;
    }
    set pageIndex(val) {
        this._pageIndex = val;
        this.showPage(val);
    }

    //========== 方法 ========== 
    // 首页
    showFirstPage() {
        this.showPage(1);
    }
    // 上一页
    showPretPage() {
        this._pageIndex = this._pageIndex - 1;
        if (this._pageIndex < 1)
            this._pageIndex = 1;

        this.showPage(this._pageIndex);
    }
    // 下一页
    showNextPage() {
        this._pageIndex = this._pageIndex + 1;
        if (this._pageIndex > this.allPage)
            this._pageIndex = this.allPage;
        this.showPage(this._pageIndex);
    }

    showPage(pageIndex) {
        this._pageIndex = pageIndex;
        this._queryPageByIds(this.lastQueryOpts);
    }


    /**  
     * 查询 (公共入口) 
     */
    query(opt) {
        this.lastQueryOpts = opt;

        this._pageIndex = 1;
        this.arrIDS = [];
        this.queryWFS.featureIds(null);

        //查询关键字
        var where = "";
        if (Cesium.defaultValue(opt.like, true)) { // 根据关键字进行查询 
            where = opt.column + "  like '%" + opt.text + "%' ";
        }
        else { //根据某个属性类别进行查询
            where = opt.column + "='" + opt.text + "'";
        }
        this.queryWFS.where(where);

        //限定范围
        if (opt.fwEntity) {
            var drawEntity = opt.fwEntity;
            if (drawEntity.polygon) {
                this.queryWFS.intersects(mars3d.draw.attr.polygon.toGeoJSON(drawEntity));
            }
            else if (drawEntity.rectangle) {
                var coor = mars3d.draw.attr.rectangle.getOutlineCoordinates(drawEntity);
                this.queryWFS.intersects(mars3d.L.latLngBounds(mars3d.L.latLng(coor[0][1], coor[0][0]),
                    mars3d.L.latLng(coor[2][1], coor[2][0])));
            }
            else if (drawEntity.ellipse) {
                //this.queryWFS.nearby(latlngs, distance)   需要ArcGIS Server 10.3+ 

                var radius = drawEntity.ellipse.semiMajorAxis.getValue();
                var buffere = turf.buffer(mars3d.draw.attr.ellipse.toGeoJSON(drawEntity), radius, { units: 'meters' });
                this.queryWFS.intersects(buffere);
            }
        }


        var that = this;
        this.queryWFS.ids(function (error, arrIDS, response) {
            // console.log(arrIDS)
            if (error != null && error.code > 0) {
                if (opt.error) opt.error(error, error.message)
                return;
            }
            if (arrIDS) {
                that.arrIDS = arrIDS;

                that._allCount = arrIDS.length;  //总记录数
                that._allPage = Math.ceil(that._allCount / that._pageSize);  //总页数 
            }
            that._queryPageByIds(opt);
        });
    }

    //根据id数组，进行单页查询数据
    _queryPageByIds(opt) {
        if (!this.arrIDS) return;
        if (this._pageIndex < 1 || this._pageIndex > this.allPage) return;

        //计算 id集合中 该页所在起止位置，找到需要获取的id数组
        var startNum = (this._pageIndex - 1) * this._pageSize;
        var endNum = this._pageIndex * this._pageSize;
        var ids = this.arrIDS.slice(startNum, endNum);
        this.queryWFS.featureIds(ids);//查询该id集合内的数据

        var that = this;
        this.queryWFS.run(function (error, featureCollection, response) {
            if (error != null && error.code > 0) {
                if (opt.error) opt.error(error, error.message)
                return;
            }
            that.processFeatureCollection(featureCollection,opt);
        });
    }


    processFeatureCollection(featureCollection, opt) { 
        var that = this;
        if (featureCollection == undefined
            || featureCollection == null
            || featureCollection.features == null
            || featureCollection.features.length == 0) {
            if (opt.success) opt.success({
                list: null,
                dataSource: null,

                count: 0,
                allCount: that.allCount,

                pageSize: that.pageSize,
                allPage: that.allPage,
                pageIndex: that.pageIndex,
            })
        }
        else {
            //剔除有问题数据 
            var featuresOK = [];
            for (var i = 0; i < featureCollection.features.length; i++) {
                var feature = featureCollection.features[i];
                if (feature == null || feature.geometry == null
                    || feature.geometry.coordinates == null || feature.geometry.coordinates.length == 0)
                    continue;

                featuresOK.push(feature);
            }
            featureCollection.features = featuresOK;

            var dataSource = Cesium.GeoJsonDataSource.load(featureCollection, {
                clampToGround: true
            });
            dataSource.then(function (dataSource) {

                var arrResult = [];
                var entities = dataSource.entities.values;
                for (var i = 0, len = entities.length; i < len; i++) {
                    var entity = entities[i];

                    //属性
                    var attr = mars3d.util.getAttrVal(entity.properties);
                    attr.name = attr[opt.column]
                    attr._entity = entity;
                    arrResult.push(attr);

                    //popup
                    if (that.options.popup) {
                        entity.popup = {
                            html: function (entity) {
                                var attr = entity.properties;
                                return mars3d.util.getPopup(that.options.popup, attr, that.name);
                            },
                            anchor: [0, -15],
                        };
                    }

                    //文字标记
                    var attrLbl = that.options.label;
                    if (attrLbl) {
                        attrLbl.text = attr.name
                        attrLbl.clampToGround = Cesium.defaultValue(attrLbl.clampToGround, true)
                        attrLbl.pixelOffset = Cesium.defaultValue(attrLbl.pixelOffset, [0, -50])
                        attrLbl = mars3d.draw.util.getDefStyle('label', attrLbl)//默认值

                        //entity属性 
                        entity.label = mars3d.draw.attr.label.style2Entity(attrLbl);
                    }
                }

                if (opt.success) opt.success({
                    list: arrResult,
                    dataSource: dataSource,

                    count: arrResult.length,
                    allCount: that.allCount,

                    pageSize: that.pageSize,
                    allPage: that.allPage,
                    pageIndex: that.pageIndex,
                })

            }).otherwise(function (error) {
                if (opt.error) opt.error(error, error.message)
            });
        }
    }


}

function isObject(obj) {
    return (typeof obj == 'object') && obj.constructor == Object;
}