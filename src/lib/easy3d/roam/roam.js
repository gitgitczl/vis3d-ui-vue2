/**
 * opt
 *      positions 坐标
 *      startTime 开始时间
 *      times 全部时间
 *      speed 漫游速度 和times互斥 times优先级高
 *      entityType : 类型（point/model）
 *      entityAttr ： 漫游对象 默认为不显示的point
 *          uri 模型地址
 *          scale 模型大小
 *          ...  同ModelGraphics中配置
 */
import cUtil from "../cUtil";
/**
 * 漫游类
 * @class
 * 
 */
class Roam {
  /**
   * @param {Cesium.Viewer} viewer 地图viewer对象
   * @param {Object} opt 
   * @param {Date} [opt.startTime] 漫游开始时间
   * @param {Cesium.Cartesian3[] | Array} [opt.positions] 路线坐标
   * @param {Functioin} [opt.endRoamCallback] 结束漫游时的回调函数
   * @param {Functioin} [opt.roamingCallback] 漫游过程中的回调函数
   * @param {Number} [opt.alltimes] 漫游总时长（s）
   * @param {Number} [opt.speed] 漫游速度（m/s）
   */
  constructor(viewer, opt) {
    this.viewer = viewer;
    /**
     * @property {Number} objId 唯一标识
     */
    this.objId = Number(
      new Date().getTime() + "" + Number(Math.random() * 1000).toFixed(0)
    );

    this.opt = opt || {};

    /**
     * @property {Cesium.JulianDate} startTime 开始时间
     */
    this.startTime = opt.startTime
      ? Cesium.JulianDate.fromDate(opt.startTime, new Cesium.JulianDate())
      : this.viewer.clock.currentTime.clone();

    /**
     * @property {Cesium.JulianDate} endTime 结束时间
     */
    this.endTime = null;
    if (!this.opt.positions) {
      console.log("缺少漫游坐标");
      return;
    }

    /**
     *  @property {Cesium.Cartesian3[]} positions 漫游坐标
     */
    this.positions = this.transfromPositions(this.opt.positions);

    /**
     * @property {Number} clockSpeed 播放速度
     */
    this.clockSpeed = 1;

    /**
     * @property {Cesium.JulianDate} stopTime 暂停时间
     */
    this.stopTime = null;

    /**
     * @property {Number} alldistance 漫游总距离
     */
    this.alldistance = 0;

    /**
     * @property {Number} alltimes 漫游时间
     */
    this.alltimes = 0;

    /**
     * @property {Number} distanceED 已漫游距离
     */
    this.distanceED = -1;

    /**
     * @property {Number} timesED 已漫游时间
     */
    this.timesED = -1;

    /**
     * @property {Number} speed 漫游速度
     */
    this.speed = 0;

    /**
     * @property {String} viewType 漫游视角（no~不固定视角/gs~跟随视角/dy~第一视角/sd~上帝视角）
     */
    this.viewType = "no";
    this.rendHandler = null;

    /**
     * @property {Boolean} isLockView 是否锁定视角
     */
    this.isLockView = false;
    this.viewXYZ = {
      // 锁定时视角参数
      x: 0,
      y: 0,
      z: 0,
    };

    this.endRoamCallback = opt.endRoamCallback;
    this.roamingCallback = opt.roamingCallback;
    this.fixType = this.opt.alltimes ? "0" : "1" // 0 表示固定时长漫游 1 表示固定速度漫游

    this.init();
    this.setViewType(opt.viewType); // 初始化时 设置视角
  }

  init() {
    let attr = {};
    debugger
    if (this.fixType == "0") {
      // 固定时长漫游
      this.endTime = Cesium.JulianDate.addSeconds(
        this.startTime,
        Number(this.opt.alltimes),
        new Cesium.JulianDate()
      );
      attr = this.createPropertyByTimes(this.positions, this.opt.alltimes);
    } else {
      // 固定速度漫游 (m/s)
      if (!this.opt.speed) {
        console.log("缺少漫游时长或速度参数！");
        return;
      }
      attr = this.createPropertyBySpeed(this.positions, this.opt.speed);
    }
    this.alldistance = attr.alldistance;
    this.alltimes = attr.alltimes;
    this.speed = attr.speed;
    this.roamEntity = this.createRoamEntity(this.opt.entityType, attr.property);
  }

  // 修改漫游的路径
  /**
   * 
   * @param {Cesium.Cartesian3[] | Array} positions 路线坐标
   */
  setPositions(positions) {
    this.destroy();
    this.positions = positions;
    this.init();
  }

  /**
   * 开始漫游
   */
  start() {
    if (this.roamEntity) this.roamEntity.show = true;
    this.clockSpeed = 1;
    this.viewer.clock.currentTime = this.startTime;
    this.viewer.clock.multiplier = this.clockSpeed;
    this.viewer.clock.shouldAnimate = true;
    this.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
    this.computeCamera(); // 设置视角
  }

  /**
   * 结束漫游
   */
  end() {
    if (this.roamEntity) this.roamEntity.show = false;
    this.viewer.clock.currentTime = this.endTime;
    this.viewer.clock.shouldAnimate = false;
    this.distanceED = this.alldistance;
    this.timesED = this.alltimes;
    this.viewer.trackedEntity = undefined;
    this.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    if (this.rendHandler) {
      this.rendHandler();
      this.rendHandler = null;
    }
    if (this.endRoamCallback) this.endRoamCallback(this.opt);
  }

  /**
   * 暂停漫游
   */
  stop() {
    this.stopTime = this.viewer.clock.currentTime.clone();
    this.viewer.clock.shouldAnimate = false;
    if (this.roamingFun) this.roamingFun();
  }

  /**
  * 继续漫游
  */
  goon() {
    debugger
    if (!this.stopTime) return;
    this.viewer.clock.currentTime = this.stopTime.clone();
    this.viewer.clock.shouldAnimate = true;
    this.stopTime = null;
  }

  /**
   * 设置播放速度
   * @param {Number} speed 播放速度
   */
  setSpeed(speed) {
    this.clockSpeed = speed;
    this.viewer.clock.multiplier = this.clockSpeed;
  }

  /**
   * 销毁
   */
  destroy() {
    if (this.roamEntity) {
      this.viewer.entities.remove(this.roamEntity);
      this.roamEntity = null;
    }
    if (this.rendHandler) {
      this.rendHandler();
      this.rendHandler = null;
    }
    this.viewer.clock.multiplier = 1;
    this.isLockView = false;
    this.viewer.trackedEntity = undefined;
    this.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
  }

  createRoamEntity(type, property) {
    let entity = null;
    if (type == "model") {
      if (!this.opt.entityAttr || !this.opt.entityAttr.uri) {
        console.log("漫游缺少模型对象！");
        return;
      }
      entity = this.viewer.entities.add({
        orientation: new Cesium.VelocityOrientationProperty(property),
        position: property,
        model: this.opt.entityAttr,
      });
    } else if (type == "image") {
      if (!this.opt.entityAttr || !this.opt.entityAttr.image) {
        console.log("漫游缺少图片对象！");
        return;
      }
      entity = this.viewer.entities.add({
        orientation: new Cesium.VelocityOrientationProperty(property),
        position: property,
        billboard: this.opt.entityAttr,
      });
    } else {
      entity = this.viewer.entities.add({
        orientation: new Cesium.VelocityOrientationProperty(property),
        position: property,
        point: {
          pixelSize: 0.001,
          color: Cesium.Color.WHITE.withAlpha(0.0001),
        },
      });
    }
    entity.show = false;
    return entity;
  }

  transfromPositions(positions) {
    if (!positions || positions.length < 1) return;
    if (positions[0] instanceof Cesium.Cartesian3) {
      return positions;
    } else {
      let newPositions = [];
      positions.forEach((element) => {
        let p = Cesium.Cartesian3.fromDegrees(
          element[0],
          element[1],
          element[2] || 0
        );
        newPositions.push(p);
      });
      return newPositions;
    }
  }

  reversePositions(positions) {
    if (!positions || positions.length < 1) return;
    if (positions[0] instanceof Cesium.Cartesian3) {
      return cUtil.cartesiansToLnglats(positions, this.viewer);
    } else {
      return positions;
    }
  }

  // 实时计算相机视角
  computeCamera() {
    let that = this;
    let scratch = new Cesium.Matrix4();
    this.distanceED = 0; // 飞过的距离
    this.timeED = 0; // 所用时间
    let lastPosition = null;
    if (!this.rendHandler) {
      this.rendHandler = this.viewer.scene.preRender.addEventListener(function (
        e
      ) {
        if (!that.viewer.clock.shouldAnimate || !that.roamEntity) return;
        let currentTime = that.viewer.clock.currentTime;
        let tiemC = Cesium.JulianDate.compare(that.endTime, currentTime);
        if (tiemC < 0) {
          that.end();
          return;
        }
        if (that.roamingCallback)
          that.roamingCallback(that.distanceED, that.timesED);
        console.log("===>", that.isLockView, that.objId);
        if (that.isLockView) {
          that.getModelMatrix(
            that.roamEntity,
            that.viewer.clock.currentTime,
            scratch
          );
          that.viewer.scene.camera.lookAtTransform(
            scratch,
            new Cesium.Cartesian3(
              -that.viewXYZ.x,
              that.viewXYZ.y,
              that.viewXYZ.z
            )
          );
        }
        that.timeED = Cesium.JulianDate.secondsDifference(
          currentTime,
          that.startTime
        );
        var position = that.roamEntity.position.getValue(currentTime);
        if (position && lastPosition) {
          that.distanceED += Cesium.Cartesian3.distance(position, lastPosition);
        }
        lastPosition = position;
      });
    }
  }

  getModelMatrix(entity, time, result) {
    if (!entity) return;
    let position = Cesium.Property.getValueOrUndefined(
      entity.position,
      time,
      new Cesium.Cartesian3()
    );
    if (!Cesium.defined(position)) return;
    let orientation = Cesium.Property.getValueOrUndefined(
      entity.orientation,
      time,
      new Cesium.Quaternion()
    );
    if (!orientation) {
      result = Cesium.Transforms.eastNorthUpToFixedFrame(
        position,
        undefined,
        result
      );
    } else {
      result = Cesium.Matrix4.fromRotationTranslation(
        Cesium.Matrix3.fromQuaternion(orientation, new Cesium.Matrix3()),
        position,
        result
      );
    }
    return result;
  }

  // 构建漫游的property
  createPropertyByTimes(positions, times) {
    if (!positions || positions.length < 2) return;
    let property = new Cesium.SampledPositionProperty();

    let alldistance = 0; // 总距离
    for (let i = 1; i < positions.length; i++) {
      let p = positions[i - 1];
      let nextP = positions[i];
      let distance = Cesium.Cartesian3.distance(p, nextP);
      alldistance += distance;
    }
    let speed = alldistance / times; // 速度
    let passdistance = 0;
    for (let ind = 0; ind < positions.length; ind++) {
      let nowP = positions[ind];
      let currentTime;
      if (ind == 0) {
        currentTime = this.startTime.clone();
      } else {
        let lastP = positions[ind - 1];
        let distance = Cesium.Cartesian3.distance(nowP, lastP);
        passdistance += distance;
        const times = passdistance / speed;
        currentTime = Cesium.JulianDate.addSeconds(
          this.startTime.clone(),
          Number(times),
          new Cesium.JulianDate()
        );
      }
      property.addSample(currentTime.clone(), nowP.clone());
    }

    return {
      property: property,
      alldistance: alldistance,
      alltimes: times,
      speed: speed,
    };
  }

  createPropertyBySpeed(positions, speed) {
    if (!positions || positions.length < 2) return;
    let property = new Cesium.SampledPositionProperty();

    let alldistance = 0; // 总距离
    for (let i = 1; i < positions.length; i++) {
      let p = positions[i - 1];
      let nextP = positions[i];
      let distance = Cesium.Cartesian3.distance(p, nextP);
      alldistance += distance;
    }

    let passdistance = 0;
    for (let ind = 0; ind < positions.length; ind++) {
      let nowP = positions[ind];
      let currentTime;
      if (ind == 0) {
        currentTime = this.startTime.clone();
      } else {
        let lastP = positions[ind - 1];
        let distance = Cesium.Cartesian3.distance(nowP, lastP);
        passdistance += distance;
        const times = passdistance / speed;
        currentTime = Cesium.JulianDate.addSeconds(
          this.startTime.clone(),
          Number(times),
          new Cesium.JulianDate()
        );
      }
      property.addSample(currentTime.clone(), nowP.clone());
    }

    return {
      property: property,
      alldistance: alldistance,
      alltimes: alldistance / speed,
      speed: speed,
    };
  }

  /**
   * 设置漫游视角
   * @param {String} viewType 漫游视角（no~不固定视角/gs~跟随视角/dy~第一视角/sd~上帝视角）
   */
  setViewType(viewType, customXYZ) {
    this.viewType = viewType;
    switch (this.viewType) {
      case "dy":
        this.isLockView = true;
        this.viewXYZ = {
          x: 100,
          y: 0,
          z: 10,
        };
        break;
      case "sd":
        this.isLockView = true;
        this.viewXYZ = {
          x: 0,
          y: 0,
          z: 5000,
        };
        break;
      case "gs":
        this.isLockView = false;
        this.viewer.trackedEntity = this.roamEntity || undefined;
        break;
      case "custom":
        this.isLockView = true;
        customXYZ = customXYZ || {};
        this.viewXYZ = {
          x: customXYZ.x || 600,
          y: customXYZ.y || 0,
          z: customXYZ.z || 150,
        };
        break;
      default:
        this.isLockView = false;
        this.viewer.trackedEntity = undefined;
        this.viewer.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    }
  }

  /**
   * 设置自定义跟随视角
   * @param {Object} viewXYZ 视角参数
   * @param {Number} viewXYZ.x x方向偏移距离
   * @param {Number} viewXYZ.y y方向偏移距离
   * @param {Number} viewXYZ.x z方向偏移距离
   */
  setTrackView(viewXYZ) {
    this.isLockView = true;
    this.viewXYZ = viewXYZ;
  }

  /**
   * 获取当前漫游的属性
   * @returns {Object} attr 当前漫游属性
   */
  getAttr() {
    let attr = {
      viewType: this.viewType,
      alldistance: this.alldistance,
      alltimes: this.alltimes,
      distanceED: this.distanceED,
      speed: this.speed,
      fixType: this.fixType,
      positions: this.reversePositions(this.positions, this.viewer),
      /*entityType: this.opt.entityType,
              entityAttr: this.opt.entityAttr */
    };
    return Object.assign(this.opt, attr);
  }
}

export default Roam;
