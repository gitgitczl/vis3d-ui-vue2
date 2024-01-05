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
     * @property {Boolean} isActivate 是否开启
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
        return `
                uniform sampler2D colorTexture;
                in vec2 v_textureCoordinates;
                
                float hash(float x){
                    return fract(sin(x*23.3)*13.13);
                }
                
                void main(void){
                
                    float time = czm_frameNumber / 60.0;
                    // czm_viewport表示当前窗口的尺寸
                    vec2 resolution = czm_viewport.zw;
                    // gl_FragCoord.xy表示当前窗口坐标,将当前坐标换算到以屏幕中心点为原点的坐标
                    vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);
                    vec3 c=vec3(1.0,1.0,1.0); // 设置雨水颜色
                     
                    float a = -.4;
                    float si = sin(a);
                    float co = cos(a);
                    uv*=mat2(co,-si,si,co);
                    uv*= 3.0;
                    
                    // 横向平铺
                    float uvx = floor(uv.x*100.);
                    float v=(1.-sin(hash(uvx)*2.))/2.0;

                    float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;
                    c*=v*b; 
                    out_FragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(c,1), 0.3);  
                }
        `;
    }
}

export default rain;