// 三维模型裁剪
class TilesetCut {
    constructor(tileset, opt) {
        if (!tileset) {
            console.log("缺少模型");
            return;
        }
        this.tileset = tileset;
        this.opt = opt || {};
        /**
         * @property {Boolean} iscutOutter 是否为外部裁剪，默认为内部裁剪
         */
        this._iscutOutter = this.opt.iscutOutter; // 是否为外部裁剪  默认为内部裁剪
        this.cutRegions = []; // 当前裁剪面数组对象
        /* this.modelMatrix = new Cesium.Matrix4(); // 世界坐标系--》模型坐标系
        Cesium.Matrix4.inverseTransformation(this.tileset.root.computedTransform, this.modelMatrix) */
        // 建立模型中心点坐标系
        const center = this.tileset.boundingSphere.center;
        const enuMtx4 = Cesium.Transforms.eastNorthUpToFixedFrame(center);
        this.modelMatrix = Cesium.Matrix4.inverse(enuMtx4, new Cesium.Matrix4());
        this.canvas = undefined;
    }

    get iscutOutter() {
        return this._iscutOutter
    }

    set iscutOutter(val) {
        this._iscutOutter = val;
        this.updateShader();
    }

    /**
     * 添加裁剪面
     * @param {Object} attr 参数
     * @param {Cesium.Cartesian3[]} attr.positions 压平面坐标
     * @param {Number} attr.id 唯一标识
     */
    addRegion(attr) {
        let { positions, id } = attr || {};
        if (!id) id = (new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0);
        if (!positions || positions.length < 3) {
            console.log("缺少裁剪面坐标");
            return;
        }
        const index = this.cutRegions.findIndex(item => item.id === id)
        if (index == -1) {
            this.cutRegions.push({
                id: id,
                positions: positions
            })
        } else {
            this.cutRegions[index].positions = positions;
        }
        this.updateShader()
    }
    /**
     * 移除裁剪面
     * @param {String} id 
     */
    removeRegionById(id) {
        if (id) { // 表示移除所有的裁剪面
            const index = this.cutRegions.findIndex(item => item.id === id)
            if (index != -1) this.cutRegions.splice(index, 1)
        } else { // 表示移除单个的裁剪面
            this.cutRegions = [];
        }
        this.updateShader();
    }

    /**
     * 销毁
     */
    destroy() {
        this.tileset.customShader = undefined;
    }

    /**
     * 修改模型着色器
     */
    updateShader() {
        debugger
        // 定义着色器中裁剪函数
        const fs_textureMapRect = `
            vec4 textureMapRect(vec4 rect, sampler2D map, vec2 xy) {
                // 判断当前图元坐标和多边形关系 如果在多边形内 进行纹素拾取
                if (xy.x >= rect.x && xy.x <= rect.z && xy.y >= rect.y && xy.y <= rect.w) {
                    float w = rect.z - rect.x;
                    float h = rect.w - rect.y;
                    float s = (xy.x - rect.x) / w;
                    float t = (xy.y - rect.y) / h;
                    vec4 color = texture(map, vec2(s, 1.0 - t));
                    return color;
                }
                return vec4(1.0);
            }
        `;

        let allUniforms = {
            u_inverseModel: {
                type: Cesium.UniformType.MAT4,
                value: this.modelMatrix.clone()
            },
            u_unionCutRegions: {
                type: Cesium.UniformType.BOOL,
                value: this._iscutOutter
            }
        }

        // 构建多区域着色器
        let fs = ``;
        this.cutRegions.forEach(element => {
            const uniforms = this.createUniforms(element.positions, element.id)
            allUniforms = Cesium.combine(allUniforms, uniforms)
            fs += `
                vec4 color_${element.id} = textureMapRect(u_rect_${element.id}, u_map_${element.id}, xy);
                cutColor *= color_${element.id};
            `
        })

        fs += `
            if (u_unionCutRegions) {
                material.diffuse *= (vec3(1.0) - cutColor.rgb);
            } else {
                material.diffuse *= cutColor.rgb;
            }
            if (material.diffuse.r <= 0.0001 && material.diffuse.g <= 0.0001 && material.diffuse.b <= 0.0001) {
                discard;
            }
        `;

        this.tileset.customShader = new Cesium.CustomShader({
            uniforms: allUniforms,
            fragmentShaderText: ` 
            ${fs_textureMapRect}
            void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
                vec4 positionMC = u_inverseModel * vec4(fsInput.attributes.positionWC, 1.0);
                vec2 xy = positionMC.xy;
                vec4 cutColor = vec4(1.0);
                ${fs}
            }`
        })

    }

    /**
     * 根据坐标创建片元着色器
     * @param {Cartesian3[]} positions 
     * @param {String} id 
     */
    createUniforms(positions, id) {
        if (!positions || positions.length < 3) {
            console.log("缺少裁剪面坐标");
            return;
        }
        id = id || Math.ceil(Math.random() * 100000) + '_' + Math.ceil(Math.random() * 100000)
        // 根据世界坐标范围计算相对模型坐标范围
        const xs = [], ys = [], zs = []
        // 计算模型坐标系下坐标
        const modelPoints = positions.map(p => {
            const point = Cesium.Matrix4.multiplyByPoint(this.modelMatrix, p, new Cesium.Cartesian3());
            xs.push(point.x)
            ys.push(point.y)
            zs.push(point.z)
            return point
        })
        // 计算当前裁剪面边界范围（模型坐标系下）
        const rect = new Cesium.Cartesian4(Math.min.apply(null, xs), Math.min.apply(null, ys), Math.max.apply(null, xs), Math.max.apply(null, ys))
        const canvas = document.createElement('canvas')
        canvas.width = 1024
        canvas.height = 1024
        const width = rect.z - rect.x
        const height = rect.w - rect.y
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#fff' // 设置整体背景为白色
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.beginPath()

        ctx.moveTo(canvas.width * (modelPoints[0].x - rect.x) / width, canvas.height * (modelPoints[0].y - rect.y) / height)

        for (let i = 1; i < modelPoints.length; i++) {
            ctx.lineTo(canvas.width * (modelPoints[i].x - rect.x) / width, canvas.height * (modelPoints[i].y - rect.y) / height)
        }

        ctx.closePath()
        ctx.fillStyle = '#000' // 根据填充的黑色来裁剪模型
        ctx.fill()

        this.canvas = canvas;

        const uniforms = {}
        uniforms[`u_rect_${id}`] = {
            type: Cesium.UniformType.VEC4,
            value: rect
        }
        uniforms[`u_map_${id}`] = {
            type: Cesium.UniformType.SAMPLER_2D,
            value: new Cesium.TextureUniform({
                url: canvas.toDataURL()
            }),
            minificationFilter: Cesium.TextureMinificationFilter.LINEAR,
            magnificationFilter: Cesium.TextureMagnificationFilter.LINEAR
        }

        return uniforms
    }

}

export default TilesetCut