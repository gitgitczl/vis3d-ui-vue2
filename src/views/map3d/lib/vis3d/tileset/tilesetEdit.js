class TilesetEdit {
  constructor(viewer, opt) {
    this.viewer = viewer
    this.opt = opt || {}
    this.tileset = opt.tileset
    if (!opt.tileset) {
      console.log("缺少模型！")
      return
    }
    this.initTransform = this.tileset._root.transform.clone()
    this.initTransform_inverse = Cesium.Matrix4.inverse(this.initTransform.clone(), new Cesium.Matrix4())

    let centerMtx = Cesium.Transforms.eastNorthUpToFixedFrame(this.tileset.boundingSphere.center.clone())
    this.centerMtx_inverse = Cesium.Matrix4.inverse(centerMtx.clone(), new Cesium.Matrix4())
    this.newCenter = Cesium.Matrix4.multiplyByPoint(
      this.centerMtx_inverse.clone(),
      this.tileset.boundingSphere.center.clone(),
      new Cesium.Cartesian3()
    )

    this.rotate = {
      xMatrix: undefined,
      yMatrix: undefined,
      zMatrix: undefined
    }
    this.scale = {
      xMatrix: undefined,
      yMatrix: undefined,
      zMatrix: undefined
    }
    this.hprMatrix = undefined;
    this.translation = undefined;
    this.centerPosition = this.tileset.boundingSphere.center.clone();
  }

  // 计算平移矩阵
  setPosition(position) {
    if (!(position instanceof Cesium.Cartesian3)) {
      position = Cesium.Cartesian3.fromDegrees(Number(position[0]), Number(position[1]), Number(position[2] || 0))
    }
    this.centerPosition = position.clone();
    // 局部坐标系下坐标
    let newPosition = Cesium.Matrix4.multiplyByPoint(
      this.centerMtx_inverse.clone(),
      position.clone(),
      new Cesium.Cartesian3()
    )
    // 当前相对起点的偏移量
    let translation = Cesium.Cartesian3.subtract(newPosition.clone(), this.newCenter.clone(), new Cesium.Cartesian3())
    this.translation = translation.clone();
    this.update();
  }

  update() {
    // 还原
    this.tileset._root.transform = this.initTransform.clone();
    // 1、平移
    if (this.translation) {
      const nowMovelMtx = Cesium.Matrix4.fromTranslation(this.translation.clone(), new Cesium.Matrix4())
      Cesium.Matrix4.multiply(this.tileset._root.transform, nowMovelMtx.clone(), this.tileset._root.transform)
    }

    // 2、旋转
    if (this.rotate.xMatrix) {
      const nowRotationMtx = Cesium.Matrix4.fromRotation(this.rotate.xMatrix, new Cesium.Matrix4())
      Cesium.Matrix4.multiply(this.tileset._root.transform, nowRotationMtx.clone(), this.tileset._root.transform)
    }

    if (this.rotate.yMatrix) {
      const nowRotationMtx = Cesium.Matrix4.fromRotation(this.rotate.yMatrix, new Cesium.Matrix4())
      Cesium.Matrix4.multiply(this.tileset._root.transform, nowRotationMtx.clone(), this.tileset._root.transform)
    }

    if (this.rotate.zMatrix) {
      const nowRotationMtx2 = Cesium.Matrix4.fromRotation(this.rotate.zMatrix, new Cesium.Matrix4())
      Cesium.Matrix4.multiply(this.tileset._root.transform, nowRotationMtx2.clone(), this.tileset._root.transform)
    }

    if (this.hprMatrix) {
      Cesium.Matrix4.multiply(this.tileset._root.transform, this.hprMatrix.clone(), this.tileset._root.transform)
    }

    // 3、缩放
    if (this.scale.xMatrix) {
      Cesium.Matrix4.multiply(this.tileset._root.transform, this.scale.xMatrix.clone(), this.tileset._root.transform)
    }

    if (this.scale.yMatrix) {
      Cesium.Matrix4.multiply(this.tileset._root.transform, this.scale.yMatrix.clone(), this.tileset._root.transform)
    }

    if (this.scale.zMatrix) {
      Cesium.Matrix4.multiply(this.tileset._root.transform, this.scale.zMatrix.clone(), this.tileset._root.transform)
    }


  }

  // 根据hpr来设置模型姿态
  // setHPR(opt) {
  //   const { heading, pitch, roll } = opt || {}
  //   let center = this.centerPosition.clone();
  //   const hpr = new Cesium.HeadingPitchRoll(
  //     Cesium.Math.toRadians(heading || 0),
  //     Cesium.Math.toRadians(pitch || 0),
  //     Cesium.Math.toRadians(roll || 0)
  //   );
  //   const quaternion = Cesium.Transforms.headingPitchRollQuaternion(center, hpr);
  //   const mtx3 = Cesium.Matrix3.fromQuaternion(quaternion, new Cesium.Matrix3());

  //   this.hprMatrix = Cesium.Matrix4.fromRotation(mtx3, new Cesium.Matrix4())
  //   this.update();

  // }

  // 计算缩放矩阵
  setScale(scale) {
    this.setScaleX(scale);
    this.setScaleY(scale);
    this.setScaleZ(scale);
  }

  setScaleX(sc) {
    let scale = new Cesium.Cartesian3(sc, 1, 1)
    let nowScaleMtx = Cesium.Matrix4.fromScale(scale.clone(), new Cesium.Matrix4())
    this.scale.xMatrix = nowScaleMtx.clone();
    this.update()
  }

  setScaleY(sc) {
    let scale = new Cesium.Cartesian3(1, sc, 1)
    let nowScaleMtx = Cesium.Matrix4.fromScale(scale.clone(), new Cesium.Matrix4())
    this.scale.yMatrix = nowScaleMtx.clone();
    this.update()
  }

  setScaleZ(sc) {
    let scale = new Cesium.Cartesian3(1, 1, sc)
    let nowScaleMtx = Cesium.Matrix4.fromScale(scale.clone(), new Cesium.Matrix4())
    this.scale.zMatrix = nowScaleMtx.clone();
    this.update()
  }

  // 计算旋转矩阵
  setRotateX(angle) {
    console.log("edit x==>", angle)
    let rotation = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(angle))
    this.rotate.xMatrix = rotation.clone();
    this.update()
  }

  setRotateY(angle) {
    console.log("edit y==>", angle)
    let rotation = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(angle))
    this.rotate.yMatrix = rotation.clone();
    this.update()
  }

  setRotateZ(angle) {
    let rotation = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(angle))
    console.log("edit z==>", angle)
    this.rotate.zMatrix = rotation.clone();
    this.update()
  }

  reset() {
    this.tileset._root.transform = this.initTransform.clone();
    this.rotate = {
      xMatrix: undefined,
      yMatrix: undefined,
      zMatrix: undefined
    }
    this.scale = {
      xMatrix: undefined,
      yMatrix: undefined,
      zMatrix: undefined
    }
    this.hprMatrix = undefined;
    this.translation = undefined;
  }

}

export default TilesetEdit
