
 function getPostStageFragmentShader(viewShed, isTerrain) {
    var usesDepthTexture = viewShed._usesDepthTexture;
    var polygonOffsetSupported = viewShed._polygonOffsetSupported;
    var isPointLight = viewShed._isPointLight;
    var isSpotLight = viewShed._isSpotLight;
    var hasCascades = viewShed._numberOfCascades > 1;
    var debugCascadeColors = viewShed.debugCascadeColors;
    var softShadows = viewShed.softShadows;

    var fsSource = '';

    if (isPointLight) { 
        fsSource += '#define USE_CUBE_MAP_SHADOW\n';
    } else if (usesDepthTexture) {
        fsSource += '#define USE_SHADOW_DEPTH_TEXTURE\n';
    }

    if (softShadows && !isPointLight) {
        fsSource += '#define USE_SOFT_SHADOWS\n';
    }

    // 定义阴影贴图参数
    var shadowParameters = `struct sg_shadowParameters{ 
        #ifdef USE_CUBE_MAP_SHADOW\n
            vec3 texCoords;\n
        #else\n
            vec2 texCoords;\n
        #endif\n
            float depthBias;
            float depth;
            float nDotL;
            vec2 texelStepSize;
            float normalShadingSmooth;
            float darkness;
        };\n`;

    var shadowVisibility = '#ifdef USE_CUBE_MAP_SHADOW\n' +
        // 获取当前纹理的的深度
        'float sg_sampleShadowMap(samplerCube shadowMap, vec3 d)\n' +
        '{\n' +
        '    return czm_unpackDepth(textureCube(shadowMap, d));\n' +
        '}\n' +
        // 比较当前深度和某坐标点深度
        'float sg_shadowDepthCompare(samplerCube shadowMap, vec3 uv, float depth)\n' +
        '{\n' +
        '    return step(depth, sg_sampleShadowMap(shadowMap, uv));\n' +
        '}\n' +
        
        'float sg_shadowVisibility(samplerCube shadowMap, sg_shadowParameters shadowParameters)\n' +
        '{\n' +
        '    float depthBias = shadowParameters.depthBias;\n' +
        '    float depth = shadowParameters.depth;\n' +
        '    float nDotL = shadowParameters.nDotL;\n' +
        '    float normalShadingSmooth = shadowParameters.normalShadingSmooth;\n' +
        '    float darkness = shadowParameters.darkness;\n' +
        '    vec3 uvw = shadowParameters.texCoords;\n' +
        '\n' +
        '    depth -= depthBias;\n' +
        '    float visibility = sg_shadowDepthCompare(shadowMap, uvw, depth);\n' +
        '    return visibility;\n' +
        '}\n' +
        '#else\n' +
        'float sg_sampleShadowMap(sampler2D shadowMap, vec2 uv)\n' +
        '{\n' +
        '#ifdef USE_SHADOW_DEPTH_TEXTURE\n' +
        '    return texture2D(shadowMap, uv).r;\n' +
        '#else\n' +
        '    return czm_unpackDepth(texture2D(shadowMap, uv));\n' +
        '#endif\n' +
        '}\n' +
        'float sg_shadowDepthCompare(sampler2D shadowMap, vec2 uv, float depth)\n' +
        '{\n' +
        '    return step(depth, sg_sampleShadowMap(shadowMap, uv));\n' +
        '}\n' +
        'float sg_shadowVisibility(sampler2D shadowMap, sg_shadowParameters shadowParameters)\n' +
        '{\n' +
        '    float depthBias = shadowParameters.depthBias;\n' +
        '    float depth = shadowParameters.depth;\n' +
        '    float nDotL = shadowParameters.nDotL;\n' +
        '    float normalShadingSmooth = shadowParameters.normalShadingSmooth;\n' +
        '    float darkness = shadowParameters.darkness;\n' +
        '    vec2 uv = shadowParameters.texCoords;\n' +
        '\n' +
        '    depth -= depthBias;\n' +
        '#ifdef USE_SOFT_SHADOWS\n' +
        '    vec2 texelStepSize = shadowParameters.texelStepSize;\n' +
        '    float radius = 1.0;\n' +
        '    float dx0 = -texelStepSize.x * radius;\n' +
        '    float dy0 = -texelStepSize.y * radius;\n' +
        '    float dx1 = texelStepSize.x * radius;\n' +
        '    float dy1 = texelStepSize.y * radius;\n' +
        '    float visibility = (\n' +
        '        sg_shadowDepthCompare(shadowMap, uv, depth) +\n' +
        '        sg_shadowDepthCompare(shadowMap, uv + vec2(dx0, dy0), depth) +\n' +
        '        sg_shadowDepthCompare(shadowMap, uv + vec2(0.0, dy0), depth) +\n' +
        '        sg_shadowDepthCompare(shadowMap, uv + vec2(dx1, dy0), depth) +\n' +
        '        sg_shadowDepthCompare(shadowMap, uv + vec2(dx0, 0.0), depth) +\n' +
        '        sg_shadowDepthCompare(shadowMap, uv + vec2(dx1, 0.0), depth) +\n' +
        '        sg_shadowDepthCompare(shadowMap, uv + vec2(dx0, dy1), depth) +\n' +
        '        sg_shadowDepthCompare(shadowMap, uv + vec2(0.0, dy1), depth) +\n' +
        '        sg_shadowDepthCompare(shadowMap, uv + vec2(dx1, dy1), depth)\n' +
        '    ) * (1.0 / 9.0);\n' +
        '#else\n' +
        '    float visibility = sg_shadowDepthCompare(shadowMap, uv, depth);\n' +
        '#endif\n' +
        '\n' +
        '    return visibility;\n' +
        '}\n' +
        '#endif\n';

    var getPostionEC = 'vec4 getPositionEC(float depth) \n' +
        '{ \n' +
        '    vec2 xy = vec2((v_textureCoordinates.x * 2.0 - 1.0), (v_textureCoordinates.y * 2.0 - 1.0));\n' +
        '    float z = (depth - czm_viewportTransformation[3][2]) / czm_viewportTransformation[2][2];\n' +
        '    vec4 posInCamera = czm_inverseProjection * vec4(xy, z, 1.0);\n' +
        '    posInCamera = posInCamera / posInCamera.w;\n' +
        '    return posInCamera;\n' +
        '} \n'

    fsSource += 'uniform sampler2D colorTexture;\n' +
        'uniform sampler2D depthTexture;\n';

    if (isPointLight) {
        fsSource += 'uniform samplerCube shadowMap_textureCube; \n';
    } else {
        fsSource += 'uniform sampler2D shadowMap_texture; \n';
    }

    fsSource +=
        'uniform mat4 shadowMap_matrix; \n' +
        'uniform vec3 shadowMap_lightDirectionEC; \n' +
        'uniform vec4 shadowMap_lightPositionEC; \n' +
        'uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness; \n' +
        'uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth; \n' +
        'uniform vec4 viewShed_frontColor; \n' +
        'uniform vec4 viewShed_backColor; \n' +
        'uniform float viewShed_Fov; \n' +
        'uniform float viewShed_Far;\n' +
        '\n' +
        'varying vec2 v_textureCoordinates;\n' +
        '\n' +
        shadowParameters +
        shadowVisibility +
        getPostionEC +
        'vec3 getNormalEC() \n' +
        '{ \n' +
        '    return vec3(1.0); \n' +
        '} \n' +
        '\n';

    fsSource +=
        'void main() \n' +
        '{ \n' +
        '    float depth = czm_readDepth(depthTexture, v_textureCoordinates);\n' +
        '    if(depth > 0.999999)\n' +
        '    {\n' +
        '        gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n' +
        '        return;\n' +
        '    }\n' +
        '    vec4 positionEC = getPositionEC(depth); \n' +
        '    vec3 normalEC = getNormalEC(); \n' +
        '    float z = -positionEC.z; \n';

    fsSource +=
        '    sg_shadowParameters shadowParameters; \n' +
        '    shadowParameters.texelStepSize = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy; \n' +
        '    shadowParameters.depthBias = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z; \n' +
        '    shadowParameters.normalShadingSmooth = shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w; \n' +
        '    shadowParameters.darkness = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w; \n';

    if (isTerrain) {
        // Scale depth bias based on view distance to reduce z-fighting in distant terrain
        fsSource += '    shadowParameters.depthBias *= max(z * 0.01, 1.0); \n';
    } else if (!polygonOffsetSupported) {
        // If polygon offset isn't supported push the depth back based on view, however this
        // causes light leaking at further away views
        fsSource += '    shadowParameters.depthBias *= mix(1.0, 100.0, z * 0.0015); \n';
    }

    if (isPointLight) {
        fsSource +=
            '    vec3 directionEC = positionEC.xyz - shadowMap_lightPositionEC.xyz; \n' +
            '    float distance = length(directionEC); \n' +
            '    directionEC = normalize(directionEC); \n' +
            '    float radius = shadowMap_lightPositionEC.w; \n' +
            '    // Stop early if the fragment is beyond the point light radius \n' +
            '    if (distance > radius) \n' +
            '    { \n' +
            '        gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n' +
            '        return; \n' +
            '    } \n' +
            '    vec3 directionWC  = czm_inverseViewRotation * directionEC; \n' +
            '    shadowParameters.depth = distance / radius; \n' +
            '    shadowParameters.texCoords = directionWC; \n' +
            '    float visibility = sg_shadowVisibility(shadowMap_textureCube, shadowParameters); \n';
    } else if (isSpotLight) {
        fsSource +=
            '    vec3 directionEC = positionEC.xyz - shadowMap_lightPositionEC.xyz; \n' +
            '    float distance = length(directionEC); \n' +
            '    if(distance > viewShed_Far)\n' +
            '    {\n' +
            '        gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n' +
            '        return;\n' +
            '    }\n' +
            '    vec4 shadowPosition = shadowMap_matrix * positionEC; \n' +
            '    // Spot light uses a perspective projection, so perform the perspective divide \n' +
            '    shadowPosition /= shadowPosition.w; \n' +

            '    // Stop early if the fragment is not in the shadow bounds \n' +
            '    if (any(lessThan(shadowPosition.xyz, vec3(0.0))) || any(greaterThan(shadowPosition.xyz, vec3(1.0)))) \n' +
            '    { \n' +
            '        gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n' +
            '        return; \n' +
            '    } \n' +
            '    shadowParameters.texCoords = shadowPosition.xy; \n' +
            '    shadowParameters.depth = shadowPosition.z; \n' +
            '    float visibility = sg_shadowVisibility(shadowMap_texture, shadowParameters); \n';
    } else if (hasCascades) {
        fsSource +=
            '    float maxDepth = shadowMap_cascadeSplits[1].w; \n' +

            '    // Stop early if the eye depth exceeds the last cascade \n' +
            '    if (z > maxDepth) \n' +
            '    { \n' +
            '        gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n' +
            '        return; \n' +
            '    } \n' +

            '    // Get the cascade based on the eye-space z \n' +
            '    vec4 weights = czm_cascadeWeights(z); \n' +

            '    // Transform position into the cascade \n' +
            '    vec4 shadowPosition = czm_cascadeMatrix(weights) * positionEC; \n' +

            '    // Get visibility \n' +
            '    shadowParameters.texCoords = shadowPosition.xy; \n' +
            '    shadowParameters.depth = shadowPosition.z; \n' +
            '    float visibility = sg_shadowVisibility(shadowMap_texture, shadowParameters); \n' +

            '    // Fade out shadows that are far away \n' +
            '    float shadowMapMaximumDistance = shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.z; \n' +
            '    float fade = max((z - shadowMapMaximumDistance * 0.8) / (shadowMapMaximumDistance * 0.2), 0.0); \n' +
            '    visibility = mix(visibility, 1.0, fade); \n';
    } else {
        fsSource +=
            '    vec4 shadowPosition = shadowMap_matrix * positionEC; \n' +

            '    // Stop early if the fragment is not in the shadow bounds \n' +
            '    if (any(lessThan(shadowPosition.xyz, vec3(0.0))) || any(greaterThan(shadowPosition.xyz, vec3(1.0)))) \n' +
            '    { \n' +
            '        gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n' +
            '        return; \n' +
            '    } \n' +

            '    shadowParameters.texCoords = shadowPosition.xy; \n' +
            '    shadowParameters.depth = shadowPosition.z; \n' +
            '    float visibility = sg_shadowVisibility(shadowMap_texture, shadowParameters); \n';
    }

    fsSource +=
        '    vec4 color = texture2D(colorTexture, v_textureCoordinates);\n' +
        ((hasCascades && debugCascadeColors) ? '    color *= czm_cascadeColor(weights); \n' : '') +
        '    if(visibility > 0.0) \n' +
        '        gl_FragColor = vec4(color.rgb * (1.0 - viewShed_frontColor.a) + viewShed_frontColor.rgb * viewShed_frontColor.a, color.a); \n' +
        '    else \n' +
        '        gl_FragColor = vec4(color.rgb * (1.0 - viewShed_backColor.a) + viewShed_backColor.rgb * viewShed_backColor.a, color.a); \n' +
        '} \n';

    return fsSource;
};

export default getPostStageFragmentShader;