
class SkyboxGround {
    constructor(options) {
        /**
             * 近景天空盒
             * @type Object
             * @default undefined
             */
        this.sources = options.sources;
        this._sources = undefined;

        /**
         * Determines if the sky box will be shown.
         *
         * @type {Boolean}
         * @default true
         */
        this.show = Cesium.defaultValue(options.show, true);

        this._command = new Cesium.DrawCommand({
            modelMatrix: Cesium.Matrix4.clone(Cesium.Matrix4.IDENTITY),
            owner: this
        });
        this._cubeMap = undefined;

        this._attributeLocations = undefined;
        this._useHdr = undefined;

        //片元着色器，直接从源码复制
        this.SkyBoxFS =
            `
            uniform samplerCube u_cubeMap;
            in vec3 v_texCoord;
            void main()
            {
                vec4 color = textureCube(u_cubeMap, normalize(v_texCoord));
                out_FragColor = vec4(czm_gammaCorrect(color).rgb, czm_morphTime);
            }
            `;

        //顶点着色器有修改，主要是乘了一个旋转矩阵
        this.SkyBoxVS =
            `
            in vec3 position;
            out vec3 v_texCoord;
            uniform mat3 u_rotateMatrix;
            void main()
            {
                vec3 p = czm_viewRotation * u_rotateMatrix * (czm_temeToPseudoFixed * (czm_entireFrustum.y * position));
                gl_Position = czm_projection * vec4(p, 1.0);
                v_texCoord = position.xyz;
            }
            `;

    }

    update(frameState, useHdr) {
        const that = this;

        if (!this.show) {
            return undefined;
        }

        if (
            frameState.mode !== Cesium.SceneMode.SCENE3D &&
            frameState.mode !== Cesium.SceneMode.MORPHING
        ) {
            return undefined;
        }

        if (!frameState.passes.render) {
            return undefined;
        }

        const context = frameState.context;

        if (this._sources !== this.sources) {
            this._sources = this.sources;
            const sources = this.sources;

            if (
                !Cesium.defined(sources.positiveX) ||
                !Cesium.defined(sources.negativeX) ||
                !Cesium.defined(sources.positiveY) ||
                !Cesium.defined(sources.negativeY) ||
                !Cesium.defined(sources.positiveZ) ||
                !Cesium.defined(sources.negativeZ)
            ) {
                throw new Cesium.DeveloperError(
                    "this.sources is required and must have positiveX, negativeX, positiveY, negativeY, positiveZ, and negativeZ properties."
                );
            }

            if (
                typeof sources.positiveX !== typeof sources.negativeX ||
                typeof sources.positiveX !== typeof sources.positiveY ||
                typeof sources.positiveX !== typeof sources.negativeY ||
                typeof sources.positiveX !== typeof sources.positiveZ ||
                typeof sources.positiveX !== typeof sources.negativeZ
            ) {
                throw new Cesium.DeveloperError(
                    "this.sources properties must all be the same type."
                );
            }

            if (typeof sources.positiveX === "string") {
                Cesium.loadCubeMap(context, this._sources).then(function (cubeMap) {
                    that._cubeMap = that._cubeMap && that._cubeMap.destroy();
                    that._cubeMap = cubeMap;
                });
            } else {
                this._cubeMap = this._cubeMap && this._cubeMap.destroy();
                this._cubeMap = new Cesium.CubeMap({
                    context: context,
                    source: sources
                });
            }
        }

        const command = this._command;
        
        command.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(
            frameState.camera._positionWC
        );
        if (!Cesium.defined(command.vertexArray) && that._cubeMap) {
            command.uniformMap = {
                u_cubeMap: function () {
                    return that._cubeMap;
                },
                u_rotateMatrix: function () {
                    if (!Cesium.defined(Cesium.Matrix4.getRotation)) {
                        Cesium.Matrix4.getRotation = Cesium.Matrix4.getMatrix3;
                    }

                    return Cesium.Matrix4.getRotation(command.modelMatrix, new Cesium.Matrix3());
                }
            };

            const geometry = Cesium.BoxGeometry.createGeometry(
                Cesium.BoxGeometry.fromDimensions({
                    dimensions: new Cesium.Cartesian3(2.0, 2.0, 2.0),
                    vertexFormat: Cesium.VertexFormat.POSITION_ONLY
                })
            );
            const attributeLocations = (this._attributeLocations = Cesium.GeometryPipeline.createAttributeLocations(
                geometry
            ));

            command.vertexArray = Cesium.VertexArray.fromGeometry({
                context: context,
                geometry: geometry,
                attributeLocations: attributeLocations,
                bufferUsage: Cesium.BufferUsage._DRAW
            });

            command.renderState = Cesium.RenderState.fromCache({
                blending: Cesium.BlendingState.ALPHA_BLEND
            });
        }

        if (!Cesium.defined(command.shaderProgram) || this._useHdr !== useHdr) {
            const fs = new Cesium.ShaderSource({
                defines: [useHdr ? "HDR" : ""],
                sources: [this.SkyBoxFS]
            });
            command.shaderProgram = Cesium.ShaderProgram.fromCache({
                context: context,
                vertexShaderSource: this.SkyBoxVS,
                fragmentShaderSource: fs,
                attributeLocations: this._attributeLocations
            });
            this._useHdr = useHdr;
        }

        if (!Cesium.defined(this._cubeMap)) {
            return undefined;
        }

        return command;
    }

    isDestroyed() {
        return false;
    }

    destroy() {
        const command = this._command;
        command.vertexArray = command.vertexArray && command.vertexArray.destroy();
        command.shaderProgram =
            command.shaderProgram && command.shaderProgram.destroy();
        this._cubeMap = this._cubeMap && this._cubeMap.destroy();
        return Cesium.destroyObject(this);
    }
}

export default SkyboxGround;