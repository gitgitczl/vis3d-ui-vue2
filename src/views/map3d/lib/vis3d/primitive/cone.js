/**
 * @description 自定义锥体
 * @class
 * @param {Cesium.Viewer} viewer
 * @param {Object} opt 
 * @param {Cesium.Cartesian3} opt.position 顶点坐标
 * @param {Number} opt.distance 锥体长度
 * @param {Number} opt.fov 水平张角
 * @param {Number} opt.aspect 宽高比
 * @param {Cesium.Color} opt.color 颜色
 * @param {Number} opt.heading 偏转角
 * @param {Number} opt.pitch 仰俯角
 * @param {Number} opt.roll 翻滚角
 * @param {Cesium.Color} opt.outlineColor 边框颜色
 * @param {Cesium.Color} opt.rectMaterial 底部材质
 * @param {Boolean} opt.coneVisible 锥体是否显示 
 * @param {Boolean} opt.rectangleVisible 底部矩形是否显示 
 * @param {Number} opt.radius 半径
 * @param {Number} opt.speed 速度
 */
class ConePrimitive {
  constructor(viewer, opt) {
    this.viewer = viewer;
    opt = opt || {};
    this.position = opt.position; // 顶点坐标
    this.distance = opt.distance || 1000; // 长度
    this.direction = opt.direction || new Cesium.Cartesian3(1, 0, 0);
    this.fov = opt.fov || 60; // 水平张角
    this.aspect = opt.aspect || 2; // 宽高比
    /**
     * @property 锥体
     */
    this._primitive = undefined;

    this.heading = opt.heading || 0;
    this.pitch = opt.pitch || 0;
    this.roll = opt.roll || 0;

    this.positions = [];
    /**
     * @property 底部矩形
     */
    this.rectangle = undefined;
    this.outlineColor = opt.outlineColor || Cesium.Color.YELLOW.withAlpha(.5);
    this.rectMaterial = opt.rectMaterial || Cesium.Color.YELLOW;
    this.rectOnGround =
      opt.rectOnGround == undefined ? false : opt.rectOnGround;
    this.coneVisible = opt.coneVisible == undefined ? true : opt.coneVisible;
    this.rectangleVisible = opt.rectangleVisible;
    /*  this.polygonStyle = opt.polygon || {}; */
    this.stRotation = 0;
    this._visible = true;
  }

  getGeometry(dis, fov, aspect, primitiveType) {
    let positions = new Float64Array(5 * 3);
    fov = Cesium.Math.toRadians(fov / 2);
    const tanfov = Math.tan(fov);
    const halfw = tanfov * dis;
    const halfh = halfw / aspect;

    // 如果想要heading pitch roll 正常，则建立正东方向的geometry
    // 点0 坐标
    positions[0] = 0.01;
    positions[1] = 0.01;
    positions[2] = 0.01;

    // 点1 坐标
    positions[3] = 1.0 * dis;
    positions[4] = 1.0 * halfw;
    positions[5] = 1.0 * halfh;

    // 点2 坐标
    positions[6] = 1.0 * dis;
    positions[7] = -1.0 * halfw;
    positions[8] = 1.0 * halfh;

    // 点3 坐标
    positions[9] = 1.0 * dis;
    positions[10] = -1.0 * halfw;
    positions[11] = -1.0 * halfh;

    // 点4 坐标
    positions[12] = 1.0 * dis;
    positions[13] = 1.0 * halfw;
    positions[14] = -1.0 * halfh;

    // 创建顶点属性中的坐标
    const attributes = new Cesium.GeometryAttributes({
      position: new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.DOUBLE,
        componentsPerAttribute: 3,
        values: positions,
      }),
    });

    // 点的索引
    const indices = new Uint16Array(18);

    indices[0] = 0;
    indices[1] = 1;
    indices[2] = 0;
    indices[3] = 2;
    indices[4] = 0;
    indices[5] = 3;
    indices[6] = 0;
    indices[7] = 4;

    indices[8] = 1;
    indices[9] = 2;
    indices[10] = 2;
    indices[11] = 3;

    indices[12] = 3;
    indices[13] = 4;
    indices[14] = 4;
    indices[15] = 1;

    let geometry = new Cesium.Geometry({
      attributes: attributes,
      indices: indices,
      primitiveType: Cesium.PrimitiveType.LINES,
      boundingSphere: Cesium.BoundingSphere.fromVertices(positions),
    });

    return geometry;
  }

  update(context, frameState, commandList) {
    var geometry = this.getGeometry(this.distance, this.fov, this.aspect);
    if (!geometry) {
      return;
    }
    if (this._primitive) {
      this._primitive.destroy();
      this._primitive = undefined;
    }

    let headingPitchRoll = new Cesium.HeadingPitchRoll(
      Cesium.Math.toRadians(this.heading),
      Cesium.Math.toRadians(this.pitch),
      Cesium.Math.toRadians(this.roll)
    );

    var hprmtx = Cesium.Transforms.headingPitchRollToFixedFrame(
      this.position.clone(),
      headingPitchRoll
    );

    this._primitive = new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: geometry,
        attributes: {
          color: Cesium.ColorGeometryInstanceAttribute.fromColor(
            this.outlineColor
          ),
        },
      }),
      appearance: new Cesium.PerInstanceColorAppearance({
        translucent: true,
        flat: true,
      }),
      modelMatrix: hprmtx,
      asynchronous: false,
      show: this.coneVisible,
    });

    if (this.rectangleVisible) this.updateRectangle(hprmtx);
    this._primitive.update(context, frameState, commandList);
  }

  updateRectangle(hprmtx) {
    this.hierarchy = [];
    const angle = Cesium.Math.toRadians(this.fov / 2);
    const tanfov = Math.tan(angle);
    const halfw = tanfov * this.distance;
    const halfh = halfw / this.aspect;

    let modelMatrix_inverse = Cesium.Matrix4.inverse(
      hprmtx,
      new Cesium.Matrix4()
    );

    let model_center = Cesium.Matrix4.multiplyByPoint(
      modelMatrix_inverse,
      this.position.clone(),
      new Cesium.Cartesian3()
    );

    let newP1 = new Cesium.Cartesian3(
      model_center.x + this.distance,
      model_center.y + halfw,
      model_center.z + halfh
    );
    let pp1 = Cesium.Matrix4.multiplyByPoint(
      hprmtx,
      newP1.clone(),
      new Cesium.Cartesian3()
    );

    let newP2 = new Cesium.Cartesian3(
      model_center.x + this.distance,
      model_center.y - halfw,
      model_center.z + halfh
    );
    let pp2 = Cesium.Matrix4.multiplyByPoint(
      hprmtx,
      newP2.clone(),
      new Cesium.Cartesian3()
    );

    let newP3 = new Cesium.Cartesian3(
      model_center.x + this.distance,
      model_center.y - halfw,
      model_center.z - halfh
    );
    let pp3 = Cesium.Matrix4.multiplyByPoint(
      hprmtx,
      newP3.clone(),
      new Cesium.Cartesian3()
    );

    let newP4 = new Cesium.Cartesian3(
      model_center.x + this.distance,
      model_center.y + halfw,
      model_center.z - halfh
    );
    let pp4 = Cesium.Matrix4.multiplyByPoint(
      hprmtx,
      newP4.clone(),
      new Cesium.Cartesian3()
    );

    let that = this;
    that.positions = [pp4, pp3, pp2, pp1];
    if (!that.rectangle) {
      that.rectangle = that.viewer.entities.add({
        polygon: {
          hierarchy: new Cesium.CallbackProperty(function () {
            return new Cesium.PolygonHierarchy(that.positions);
          }, false),
          material: this.rectMaterial,
          perPositionHeight: !this.rectOnGround,
        },
        show: this.rectangleVisible,
      });
    }

    /* this.rectangle.polygon.stRotation = Cesium.Math.toRadians(
      this.stRotation || 90
    ); */
  }

  destroy() {
    if (this.rectangle) {
      this.viewer.entities.remove(this.rectangle);
      this.rectangle = undefined;
    }
  }

  /**
   * 设置锥体顶点坐标
   * @param {Cesium.Cartesian3} position 
   */
  setPosition(position) {
    this.position = position;
  }

  /**
   * 设置锥体姿态
   * @param {Number} heading 偏转角
   * @param {Number} pitch 仰俯角
   * @param {Number} roll 翻滚角
   */
  setHeadingPitchRoll(heading, pitch,roll) {
    if (heading != undefined) this.heading = heading;
    if (pitch != undefined) this.pitch = pitch;
    if (roll != undefined) this.roll = roll;
  }

  /**
   * 设置视频材质方向
   * @param {Number} angle 
   */
  setPolygonRotation(angle) {
    this.stRotation = angle || 0;
  }

  get visible() {
    return this.__visible;
  }

  set visible(visible) {
    this.coneVisible = this.rectangleVisible = visible;
    this._visible = visible;
    if (this.rectangle) this.rectangle.show = visible;
  }
}

export default ConePrimitive;