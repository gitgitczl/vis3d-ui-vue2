/**
 * 下雨场景
 * @property {Boolean} isActivate 是否激活
 * @property {Function} activate 开启场景
 * @property {Function} disable 关闭场景
 */
let rain = {
    rainProcs: null,
    /** 
     * 是否开启
     * @property {Boolearn} isActivate 是否开启
     * 
     */
    isActivate: false,
     /**
     * 激活
     */
    activate: function (viewer) {
        this.viewer = viewer || window.viewer;
        if (this.isActivate) return;
        this.isActivate = true;
        var fs_rain = this.initRain();
        this.rainProcs = new Cesium.PostProcessStage({
            name: 'czm_rain',
            fragmentShader: fs_rain
        });
        this.viewer.scene.postProcessStages.add(this.rainProcs);
    },
    /**
     * 销毁释放
     */
    disable: function () {
        if (!this.isActivate) return;
        this.isActivate = false;
        if (this.rainProcs) {
            this.viewer.scene.postProcessStages.remove(this.rainProcs);
            this.rainProcs = null;
        }
    },
    initRain: function () {
        return "uniform sampler2D colorTexture;\n\
                varying vec2 v_textureCoordinates;\n\
                \n\
                float hash(float x){\n\
                    return fract(sin(x*23.3)*13.13);\n\
                }\n\
                \n\
                void main(void){\n\
                \n\
                    float time = czm_frameNumber / 60.0;\n\
                    vec2 resolution = czm_viewport.zw;\n\
                    \n\
                    vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
                    vec3 c=vec3(.6,.7,.8);\n\
                    \n\
                    float a=-.4;\n\
                    float si=sin(a),co=cos(a);\n\
                    uv*=mat2(co,-si,si,co);\n\
                    uv*=length(uv+vec2(0,4.9))*.3+1.;\n\
                    \n\
                    float v=1.-sin(hash(floor(uv.x*100.))*2.);\n\
                    float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;\n\
                    c*=v*b; \n\
                    \n\
                    gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,1), 0.5);  \n\
                }\n\
        ";
    }
}

export default rain;