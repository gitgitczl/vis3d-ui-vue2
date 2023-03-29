var ParticleSystem = function (viewer, opt) {
    this.viewer = viewer;
    this.opt = opt || {};

    this.allTime = opt.allTime;
    this.position = opt.position;
    this.burstTimes = opt.burstTimes || []; // 设置爆炸时间点
    this.particleSystem = null;
    this.image = opt.image;
    this.oldShouldAnimate = this.viewer.clock.shouldAnimate;
    this.burstScale = opt.burstScale || 500;
}

ParticleSystem.prototype = {
    // 初始化爆炸参数
    start() {
        this.viewer.clock.shouldAnimate = true;
        // 设置部分默认值
        var particleSystemDefault = {
            emissionRate: 3.0, // 粒子发射速率
            gravity: 1.0,
            minimumParticleLife: 1,
            maximumParticleLife: 3,
            minimumSpeed: 1.0,
            maximumSpeed: 2.0,
            startScale: 1.0,
            endScale: 3,
            particleSize: 25.0,
        };

        if (!this.particleSystem) {
            if (!this.image) {
                console.warn("缺少粒子效果图片！");
                return;
            }

            var modelMatrix = new Cesium.Matrix4();
            if (!this.position) {
                console.warn("缺少坐标数据");
            } else {
                // 以position为中心建立局部坐标系 
                modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(this.position);
            }

            var bursts = [];
            this.burstTimes = this.burstTimes || [];
            for (var i = 0; i < this.burstTimes.length; i++) {
                var item = this.burstTimes[i];
                if (!item) continue;
                bursts.push(new Cesium.ParticleBurst({
                    time: item,
                    minimum: 50,
                    maximum: this.burstScale || 500,
                }));
            }
            var gravityScratch = new Cesium.Cartesian3();
            this.particleSystem = this.viewer.scene.primitives.add(
                new Cesium.ParticleSystem({
                    image: this.opt.image,

                    // color: this.opt.color || Cesium.Color.LIGHTSEAGREEN, // 粒子颜色
                    startColor: this.opt.startColor || Cesium.Color.RED.withAlpha(0.7), // 开始颜色
                    endColor: this.opt.endColor || Cesium.Color.YELLOW.withAlpha(1), // 结束颜色

                    startScale: particleSystemDefault.startScale, // 开始时比例
                    endScale: particleSystemDefault.endScale, // 结束时比例

                    // particleLife: this.opt.particleLife || 2, // 粒子存在的时间
                    minimumParticleLife: particleSystemDefault.minimumParticleLife, // 粒子生命周期的最小值
                    maximumParticleLife: particleSystemDefault.maximumParticleLife, // 粒子生命周期的最大值
                    // speed: this.opt.speed || 1, // 粒子飞行速度 和 minimumSpeed、maximumSpeed 不可同时存在 会覆盖这两个参数

                    minimumSpeed: particleSystemDefault.minimumSpeed,
                    maximumSpeed: particleSystemDefault.maximumSpeed,

                    //imageSize: new Cesium.Cartesian2(0, 1), // 粒子图片尺寸  会覆盖原来的尺寸
                    minimumImageSize: new Cesium.Cartesian2(particleSystemDefault.particleSize, particleSystemDefault.particleSize), // 图片尺寸最小值
                    maximumImageSize: new Cesium.Cartesian2(particleSystemDefault.particleSize, particleSystemDefault.particleSize), // 图片尺寸最大值

                    // sizeInMeters: this.opt.sizeInMeters || false, // 设置粒子的尺寸单位 默认为像素单位
                    loop: this.opt.loop || true, // 是否循环播放
                    emissionRate: particleSystemDefault.emissionRate, // 发射速率
                    bursts: bursts,
                    lifetime: this.allTime || 16.0, // 粒子系统生命周期
                    emitter: new Cesium.CircleEmitter(2.0), // 粒子效果形状
                    // emitterModelMatrix: Cesium.Matrix4.fromTranslation( 
                    //     scratchOffset,
                    //     new Cesium.Matrix4()
                    // ), // 粒子发射器矩阵 
                    modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(this.position), // 粒子效果位置矩阵 
                    updateCallback: function (p, dt) { // 更新粒子回调函数
                        var position = p.position;
                        Cesium.Cartesian3.normalize(position, gravityScratch);
                        Cesium.Cartesian3.multiplyByScalar(
                            gravityScratch,
                            particleSystemDefault.gravity * dt,
                            gravityScratch
                        );

                        p.velocity = Cesium.Cartesian3.add(
                            p.velocity,
                            gravityScratch,
                            p.velocity
                        );
                    }
                })
            );
            this.particleSystem.isParticleSystem = true;
        } else {
            this.show();
        }

    },
    show() {
        if (this.particleSystem) this.particleSystem.show = true;
    },
    hide() {
        if (this.particleSystem) this.particleSystem.show = false;
    },
    destroy() {
        if (this.particleSystem) {
            this.viewer.scene.primitives.remove(this.particleSystem);
            this.particleSystem = null;
        }

        this.viewer.clock.shouldAnimate = this.oldShouldAnimate;
    }
}

export default ParticleSystem;