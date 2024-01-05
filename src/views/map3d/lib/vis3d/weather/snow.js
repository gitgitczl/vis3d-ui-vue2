
/**
 * 下雪场景
 * @property {Boolean} isActivate 是否激活
 * @property {Function} activate 开启场景
 * @property {Function} disable 关闭场景
 */
let snow = {
    snowProcs: null,
    /**
     * 是否激活
     */
    isActivate: false,

    /**
     * 激活
     */
    activate: function (viewer) {
        this.viewer = viewer || window.viewer;
        if (this.isActivate) return;
        this.isActivate = true;
        var fs_snow = this.initSnow();
        this.snowProcs = new Cesium.PostProcessStage({
            name: 'czm_snow',
            fragmentShader: fs_snow
        });
        this.viewer.scene.postProcessStages.add(this.snowProcs);
    },

    /**
     * 销毁释放
     */
    disable: function () {
        if (!this.isActivate) return;
        this.isActivate = false;
        if (this.snowProcs) {
            this.viewer.scene.postProcessStages.remove(this.snowProcs);
            this.snowProcs = null;
        }
    },
    initSnow: function () {
        return `
        uniform sampler2D colorTexture;
        in vec2 v_textureCoordinates;
        float snow(vec2 uv,float scale){
            float time = czm_frameNumber / 60.0;
            float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;
            uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;
            uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;
            p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);
            k=smoothstep(0.,k,sin(f.x+f.y)*0.01);
            return k*w;
        }
        
        void main(void){
            vec2 resolution = czm_viewport.zw;
            vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);
            vec3 finalColor=vec3(0);
            float c = 0.0;
            c+=snow(uv,30.)*.0;
            c+=snow(uv,20.)*.0;
            c+=snow(uv,15.)*.0;
            c+=snow(uv,10.);
            c+=snow(uv,8.);
            c+=snow(uv,6.);
            c+=snow(uv,5.);
            finalColor=(vec3(c)); 
            out_FragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.3); 
        }
        `;
    }
}

export default snow;
