// 鼠标提示框
class Prompt {
    /**
     * opt
     *      type : 1  位置变化提示框  默认为1
     *             2  固定坐标提示框
     *      position: 固定坐标提示框的坐标 cartesian3 / [101,30] 
     *      anchor ： true 是否显示下方锚点
     *      closeBtn: true 是否显示关闭按钮
     *      content ： 弹窗内容
     *      close ： 点击退出回调函数
     *      offset :  偏移参数
     *          x:
     *          y
     *      style：
     *          background ： 弹窗背景色 默认为white
    */
    constructor(viewer, opt) {
        this.viewer = viewer;
        if (!this.viewer) return;
        this.type = "prompt";
        // 默认值
        opt = opt || {};
        const promptType = opt.type == undefined ? 1 : opt.type;
        let defaultOpt = {
            id: (new Date().getTime() + "" + Math.floor(Math.random() * 10000)),
            type: promptType,
            anchor: promptType == 2 ? true : false,
            closeBtn: promptType == 2 ? true : false,
            offset: promptType == 2 ? { x: 0, y: -20 } : { x: 30, y: 20 },
            content: "",
            show: true,
            style: {
                background: "rgba(0,0,0,0.5)",
                color: "white"
            }


        }
        this.opt = Object.assign(defaultOpt, opt);
        const mapid = this.viewer.container.id;
        this.isShow = this.opt.show == undefined ? true : this.opt.show; // 是否显示

        let anchorHtml = ``;
        let closeHtml = ``;

        const background = this.opt.style.background;
        const color = this.opt.style.color;

        if (this.opt.anchor) {
            anchorHtml += `
            <div class="prompt-anchor-container">
                <div class="prompt-anchor" style="background:${background} !important;">
                </div>
            </div>
            `;
        }

        if (this.opt.closeBtn) { // 移动提示框 不显示关闭按钮
            closeHtml = `<a class="prompt-close" attr="${this.opt.id}" id="prompt-close-${this.opt.id}" href="#close">x</a>`;
        }
        const promptId = "prompt-" + this.opt.id;
        const promptConenet = `
                <!-- 文本内容 -->
                <div class="prompt-content-container" style="background:${background} !important;color:${color} !important">
                    <div class="prompt-content" id="prompt-content-${this.opt.id}">
                        ${this.opt.content}
                    </div>
                </div>
                <!-- 锚 -->
                ${anchorHtml}
                <!-- 关闭按钮 -->
                ${closeHtml}
        `;
        // 构建弹窗元素 
        this.promptDiv = window.document.createElement("div");
        this.promptDiv.className = "easy3d-prompt";
        this.promptDiv.id = promptId;
        this.promptDiv.innerHTML = promptConenet;
        let mapDom = window.document.getElementById(mapid);
        mapDom.appendChild(this.promptDiv);
        const clsBtn = window.document.getElementById(`prompt-close-${this.opt.id}`);
        let that = this;
        if (clsBtn) {
            clsBtn.addEventListener("click", (e) => {
                that.hide();
                if (that.close) that.close();
            })
        }
        this.promptDom = window.document.getElementById(promptId);
        this.contentW = this.promptDom.offsetWidth; // 宽度
        this.contentH = this.promptDom.offsetHeight; // 高度
        this.position = this.transPosition(this.opt.position);
        if (promptType == 2) {
            this.bindRender(); // 固定位置弹窗 绑定实时渲染 当到地球背面时 隐藏
        }

        if (this.opt.show == false) {
            this.hide();
        }
    }
    // 销毁
    destroy() {
        if (this.promptDiv) {
            window.document.getElementById(this.viewer.container.id).removeChild(this.promptDiv);
            this.promptDiv = null;
        }
        if (this.rendHandler) {
            this.rendHandler();
            this.rendHandler = null;
        }
    }
    // 实时监听
    bindRender() {
        let that = this;
        this.rendHandler = this.viewer.scene.postRender.addEventListener(function () {
            if (!that.isShow) {
                if (that.promptDom) that.promptDom.style.display = "none";
                return;
            }
            if (that.position) {
                const px = Cesium.SceneTransforms.wgs84ToWindowCoordinates(that.viewer.scene, that.position);
                if (!px) return;
                const occluder = new Cesium.EllipsoidalOccluder(that.viewer.scene.globe.ellipsoid, that.viewer.scene.camera.position);
                // 当前点位是否可见
                const res = occluder.isPointVisible(that.position);

                if (res) {
                    if (that.promptDom) that.promptDom.style.display = "block";
                } else {
                    if (that.promptDom) that.promptDom.style.display = "none";
                }
                that.setByPX({
                    x: px.x,
                    y: px.y
                });
            }
        }, this);
    }
    setVisible(isShow) {
        this.isShow = isShow === undefined ? true : isShow;
        if (isShow) {
            if (this.promptDom) this.promptDom.style.display = "block";
        } else {
            if (this.promptDom) this.promptDom.style.display = "none";
        }
    }
    show() {
        this.setVisible(true);
    }
    hide() {
        this.setVisible(false);
    }
    setContent(content) {
        let pc = window.document.getElementById(`prompt-content-${this.opt.id}`);
        pc.innerHTML = content;
    }
    update(px, html) {
        if (px instanceof Cesium.Cartesian3) {
            this.position = px.clone();
            px = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, px);
        } else {
            this.position = this.viewer.scene.pickPosition(px)
        }
        if (px) this.setByPX(px);
        if (html) this.setContent(html);
    }

    setByPX(opt) {
        if (!opt) return;
        if (this.promptDom) {
            this.promptDom.style.left = ((Number(opt.x) + Number(this.opt.offset.x || 0)) - Number(this.contentW) / 2) + "px";
            this.promptDom.style.top = ((Number(opt.y) + Number(this.opt.offset.y || 0)) - Number(this.contentH)) + "px";
        }
    }


    // 坐标转换
    transPosition(p) {
        let position;
        if (p instanceof Cesium.Cartesian3) {
            position = p;
        } else if (Array.isArray(p)) {
            const posi = Cesium.Cartesian3.fromDegrees(p[0], p[1], p[2] || 0);
            position = posi.clone();
        } else {
            position = p;
        }
        return position;
    }
}

export default Prompt;