/**
 * 雾场景
 * @property {Boolean} isActivate 是否激活
 * @property {Function} activate 开启场景
 * @property {Function} disable 关闭场景
 */
let fog = {
    fogProcs: null,
    /**
    * 是否激活
    */
    isActivate: false,
    /**
     * 能见度（0-1）
     */
    fogVal: 0.50,
    /**
     * 激活
     * @function
     */
    activate: function () {
        if (this.isActivate) return;
        this.isActivate = true;
        var fs_fog = this.initfog();
        //整个场景通过后期渲染变亮 1为保持不变 大于1变亮 0-1变暗 uniforms后面为对应glsl里面定义的uniform参数
        // this.fogProcs.uniforms.brightness=2;
        this.fogProcs = new Cesium.PostProcessStage({
            name: 'czm_fog',
            fragmentShader: fs_fog
        });
        viewer.scene.postProcessStages.add(this.fogProcs);
    },
    /**
     * 销毁释放
     */
    disable: function () {
        if (!this.isActivate) return;
        this.isActivate = false;
        if (this.fogProcs) {
            viewer.scene.postProcessStages.remove(this.fogProcs);
            this.fogProcs.destroy();
            this.fogProcs = null;
        }
    },
    initfog: function () {
        return "  uniform sampler2D colorTexture;\n" +
            "  uniform sampler2D depthTexture;\n" +
            "  varying vec2 v_textureCoordinates;\n" +
            "  void main(void)\n" +
            "  {\n" +
            "      vec4 origcolor=texture2D(colorTexture, v_textureCoordinates);\n" +
            "      vec4 fogcolor=vec4(0.8,0.8,0.8,0.2);\n" +
            "\n" +
            "      vec4 depthcolor = texture2D(depthTexture, v_textureCoordinates);\n" +
            "\n" +
            "      float f=(depthcolor.r-0.22)/" + this.fogVal + ";\n" +
            "      if(f<0.0) f=0.0;\n" +
            "      else if(f>1.0) f=1.0;\n" +
            "      gl_FragColor = mix(origcolor,fogcolor,f);\n" +
            "   }";
    }
}

export default fog;