/**
 * @param {Object} opt 参数
 * @param {Array | Cesium.Cartesian3} [opt.startPosition] 起点坐标
 * @param {Array | Cesium.endPosition} [opt.endPosition] 终点坐标
 * @param {Number} topRadius 顶部半径
 * @param {Number} bottomRadius 底部半径
 * @param {String | Cesium.Color} color 颜色
 */
class TrackCylinderGraphic {
    constructor(opt) {
        this.opt = opt || {};
        if (!this.opt.startPosition || !this.opt.endPosition) {
            console.log("缺少坐标信息");
            return;
        }
        this._startPosition = this.opt.startPosition instanceof Cesium.Cartesian3 ?
            this.opt.startPosition :
            Cesium.Cartesian3.fromDegrees(this._startPosition[0], this._startPosition[1], this._startPosition[2]);
        this._endPosition = this.opt.endPosition instanceof Cesium.Cartesian3 ?
            this.opt.endPosition :
            Cesium.Cartesian3.fromDegrees(this._endPosition[0], this._endPosition[1], this._endPosition[2])

        let that = this;
        let color = this.opt.color || "#ffffff";
        if (!(color instanceof Cesium.Color)) {
            color = Cesium.Color.fromCssColorString(color);
        }

        this.entity = new Cesium.Entity({
            position: new Cesium.CallbackProperty(function () {
                return Cesium.Cartesian3.midpoint(that._startPosition.clone(), that._endPosition.clone(), new Cesium.Cartesian3())
            }, false),
            orientation: new Cesium.CallbackProperty(function () {
                let hpr = that.getHPR(that._startPosition, that._endPosition);
                return Cesium.Transforms.headingPitchRollQuaternion(
                    that._startPosition,
                    new Cesium.HeadingPitchRoll(
                        Cesium.Math.toRadians(hpr.heading),
                        Cesium.Math.toRadians(hpr.pitch - 90),
                        Cesium.Math.toRadians(hpr.roll)
                    )
                )
            }, false),
            cylinder: {
                length: new Cesium.CallbackProperty(function () {
                    return Cesium.Cartesian3.distance(that._startPosition.clone(), that._endPosition.clone())
                }, false),
                topRadius: this.opt.topRadius || 200,
                bottomRadius: this.opt.bottomRadius || 0,
                outline : this.opt.outline,
                numberOfVerticalLines :this.opt.numberOfVerticalLines || 8,
                outlineColor: this.opt.outlineColor || Cesium.Color.BLACK.withAlpha(.7),
                outlineWidth : this.opt.outlineWidth || 1,
                material: color
            }
        })
        /*  return this.entity; */
    }

    set startPosition(p) {
        if(!p) return ;
        this._startPosition = p.clone();
    }

    set endPosition(p) {
        if(!p) return ;
        this._endPosition = p.clone();
    }

    getHPR(origin, end) {
        // 计算朝向
        let qc = Cesium.Cartesian3.subtract(end.clone(), origin.clone(), new Cesium.Cartesian3());
        qc = Cesium.Cartesian3.normalize(qc.clone(), new Cesium.Cartesian3());
        // 计算向量旋转矩阵
        const rotationMatrix3 = Cesium.Transforms.rotationMatrixFromPositionVelocity(
            origin,
            qc,
            Cesium.Ellipsoid.WGS84
        );
        // 转4维矩阵
        let modelMatrix4 = Cesium.Matrix4.fromRotationTranslation(
            rotationMatrix3,
            origin
        );
        // 局部坐标矩阵
        let m1 = Cesium.Transforms.eastNorthUpToFixedFrame(
            origin,
            Cesium.Ellipsoid.WGS84,
            new Cesium.Matrix4()
        );
        let m3 = Cesium.Matrix4.multiply(
            Cesium.Matrix4.inverse(m1, new Cesium.Matrix4()),
            modelMatrix4,
            new Cesium.Matrix4()
        );
        // 得到旋转矩阵
        let mat3 = Cesium.Matrix4.getMatrix3(m3, new Cesium.Matrix3());
        // 计算四元数
        let q = Cesium.Quaternion.fromRotationMatrix(mat3);
        let hpr = Cesium.HeadingPitchRoll.fromQuaternion(q);

        let heading = Cesium.Math.toDegrees(hpr.heading);
        let pitch = Cesium.Math.toDegrees(hpr.pitch);
        let roll = Cesium.Math.toDegrees(hpr.roll);
        return { heading, pitch, roll }
    }

}

export default TrackCylinderGraphic;