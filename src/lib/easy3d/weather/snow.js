
//定义下雪场景 着色器
export default {
    snowProcs:null,
    isActivate:false,
    activate:function(){
        if(this.isActivate) return;
        this.isActivate = true;
        var fs_snow = this.initSnow();
        this.snowProcs = new Cesium.PostProcessStage({
            name: 'czm_snow',
            fragmentShader: fs_snow
        });
        viewer.scene.postProcessStages.add(this.snowProcs);
    },
    disable:function(){
        if(!this.isActivate) return;
        this.isActivate = false;
        if(this.snowProcs){
            viewer.scene.postProcessStages.remove(this.snowProcs);
            this.snowProcs = null;
        }
    },
    initSnow:function(){
        return "uniform sampler2D colorTexture;\n\
                varying vec2 v_textureCoordinates;\n\
                \n\
                float snow(vec2 uv,float scale)\n\
                {\n\
                float time = czm_frameNumber / 60.0;\n\
                float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;\n\
                uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;\n\
                uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;\n\
                p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);\n\
                k=smoothstep(0.,k,sin(f.x+f.y)*0.01);\n\
                return k*w;\n\
                }\n\
                \n\
                void main(void){\n\
                vec2 resolution = czm_viewport.zw;\n\
                vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
                vec3 finalColor=vec3(0);\n\
                float c = 0.0;\n\
                c+=snow(uv,30.)*.0;\n\
                c+=snow(uv,20.)*.0;\n\
                c+=snow(uv,15.)*.0;\n\
                c+=snow(uv,10.);\n\
                c+=snow(uv,8.);\n\
                c+=snow(uv,6.);\n\
                c+=snow(uv,5.);\n\
                finalColor=(vec3(c)); \n\
                gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.3); \n\
                \n\
                }\n\
            ";
    }
}
