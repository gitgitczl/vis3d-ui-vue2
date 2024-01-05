// 模型点光源
class PointLight {
    constructor(tileset, opt) {
        this.opt = opt || {};
        this.tileset = tileset;
        /**
         * 支持多光源 
         * [
         *  {
         *      id : "" , // 可根据此id来进行单个光源的控制
         *      position : Ceisum.Cartesian3 ,// 光源位置
         *      color : Cesium.Color, // 颜色
         *      length : 1500 , // 光源边界距离
         *      intensity : 50 , // 光照强度
         *  }
         * ]
         */
        this.lights = opt.lights || [];
        if (this.lights.length < 1) return;

        this.customShader = this.getUnformsShader();
        this.tileset.customShader = this.customShader;

    }


    getUnformsShader() {
        let uniforms = {};
        let inputText = ``;
        let ids = [];
        for (let i = 0; i < this.lights.length; i++) {
            const item = this.lights[i];
            let { id, position, targetPosition, color, length, innerRange, outRange, intensity } = item;
            if (!position) continue;
            id = id || new Date().getTime() + "-" + Math.ceil(Math.random() * 1000);
            ids.push(id);
            uniforms[`u_lightPosition_${id}`] = {
                type: Cesium.UniformType.VEC3,
                value: position
            }


            uniforms[`u_lightColor_${id}`] = {
                type: Cesium.UniformType.VEC4,
                value: color || Cesium.Color.RED
            }

            uniforms[`u_length_${id}`] = {
                type: Cesium.UniformType.FLOAT,
                value: length || 500
            }


            uniforms[`u_intensity_${id}`] = {
                type: Cesium.UniformType.FLOAT,
                value: intensity || 10
            }

            inputText += `
                vec4 fcolor_${id} = pointLight(
                    u_lightColor_${id},
                    u_lightPosition_${id},
                    positionWC,
                    positionEC,
                    normalEC,
                    pbrParameters,
                    u_intensity_${id},
                    u_length_${id}
                );
            `
        }

        // 颜色混合
        let mixText = ``;
        if (ids.length > 1) {
            mixText = `
            vec3 finalColor = mix(
                fcolor_${ids[0]}.rgb, 
                fcolor_${ids[1]}.rgb,
                0.5);
            `;

            // 光源混合
            ids.forEach((id, index) => {
                if (index > 1) {
                    mixText += `
                    finalColor = mix(
                            finalColor.rgb,
                            fcolor_${id}.rgb,
                            0.5
                        );
                `;
                }
            })
        } else {
            mixText = `vec3 finalColor = fcolor_${ids[0]}.rgb;`;
        }


        const fragmentShaderText = `
            vec4 pointLight(
                vec4 lightColor,
                vec3 lightPosition,
                vec3 positionWC,
                vec3 positionEC,
                vec3 normalEC,
                czm_pbrParameters pbrParameters,
                float intensity,
                float plength
                ){
                    // 光源-片元向量
                    vec3 lightToPoint = (czm_view * vec4(lightPosition,1.0)).xyz - positionEC;
                    vec3 lightToPoint_dir = normalize(lightToPoint);
                    // 计算光源位置-偏远位置组成的向量 与 光线向量的 点乘，即当前片元的颜色
                    // 颜色插值
                    float inLight = 1.0;;
                    // 判断点光源和片元的位置关系 0-垂直 1-正上方
                    float light = inLight * clamp(dot(normalEC,lightToPoint_dir),0.0,1.0); //漫反射
                    // 光线衰减
                    vec3 light1Dir = positionWC - lightPosition;
                    float lDistance = 1.0;
                    // 根据与光源距离 计算强度
                    lDistance = 1.0 - min( ( length( light1Dir ) / plength ), 1.0 );
                    // 超出范围 变为模型黑色  范围内 光强递减
                    if(lDistance < 0.00001 ) {
                        return vec4(0.0);
                    }else{
                        vec3 diffuseColor = pbrParameters.diffuseColor;
                        // 边缘变黑 如果不想变黑 就去掉light
                        diffuseColor *= light * lightColor.rgb; 
                        diffuseColor *=  lDistance * intensity;
                        return vec4(diffuseColor,lDistance);
                    }
                }

            void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material){
                    material.diffuse = vec3(1.0,1.0,1.0); // 设置模型基地色为白色 防止出现颜色偏差
                    vec3 positionWC = fsInput.attributes.positionWC;
                    vec3 normalEC = fsInput.attributes.normalEC;
                    vec3 positionEC = fsInput.attributes.positionEC;
                    czm_pbrParameters pbrParameters;
                    pbrParameters.diffuseColor = material.diffuse;
                    // 设置反射率
                    pbrParameters.f0 = vec3(0.5);
                    // 设置粗糙程度
                    pbrParameters.roughness = 1.0;
                    // 设置照明参数
                    ${inputText};
                    ${mixText};
                    material.diffuse *= finalColor;
                }
            `;
        const customShader = new Cesium.CustomShader({
            lightingModel: Cesium.LightingModel.UNLIT,
            uniforms: uniforms,
            fragmentShaderText: fragmentShaderText
        });
        return customShader;
    }

   
    destroy() {
        this.tileset.customShader = undefined;
    }


}

export default PointLight