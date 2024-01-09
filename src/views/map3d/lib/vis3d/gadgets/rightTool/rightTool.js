import $ from "jquery";
import "./rightTool.css"
class RightTool {
    constructor(viewer, opt) {

        opt = opt || {};
        const defaultVal = {
            lnglat: true,
            cameraView: true,
            depth: true
        }
        this.opt = Object.assign(defaultVal, opt);

        if (!viewer) {
            console.log("缺少viewer对象！");
            return;
        }
        this.viewer = viewer;
        const id = this.viewer.container.id;
        this.mapContainer = document.getElementById(id);


        this.rightClickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

        this.randomId = new Date().getTime() + "" + Math.ceil(Math.random() * 10000);

        let tooEle = this.createElement('div', {
            class: 'vis3d-right-tool',
            id: `vis3d-right-tool-${this.randomId}`,
            html: `<ul></ul>`
        })
        this.mapContainer.appendChild(tooEle);

        // 点击其它地方 关闭面板
        document.addEventListener("click", () => {
            const tool = document.getElementsByClassName('vis3d-right-tool');
            if (tool[0]) tool[0].style.display = "none";
        })
        document.getElementById(`vis3d-right-tool-${this.randomId}`).addEventListener("click", (event) => {
            event.stopPropagation();    //  阻止事件冒泡
        })

        if (this.opt.lnglat) {
            this.crateLnglatTool();
        }
        if (this.opt.cameraView) {
            this.createCameraViewTool();
        }
        if (this.opt.depth) {
            this.crateDepthTool();
        }

        this.bindHandler();

        this._clickPX = null;
    }

    createElement(eleType, opt) {
        opt = opt || {};
        let ele = document.createElement(eleType);
        if (opt.class) ele.className = opt.class;
        if (opt.id) ele.setAttribute("id", opt.id);
        ele.innerHTML = opt.html;
        return ele;
    }

    crateLnglatTool() {
        let that = this;

        const dom = this.createElement('li', {
            id: `right-tool-lnglat-${this.randomId}`,
            class: `right-tool-lnglat`,
            html: `<span style="font-weight:bold;">当前坐标</span>`
        })
        const toolContainer = document.getElementById(`vis3d-right-tool-${this.randomId}`);
        const ul = toolContainer.querySelector("ul");
        ul.appendChild(dom);

        let rightToolLnglat = document.getElementById(`right-tool-lnglat-${this.randomId}`);
        rightToolLnglat.addEventListener('click',evt => {
            rightToolLnglat.style.display = 'none';
            if (!that._clickPX) return;
            const picks = that.viewer.scene.drillPick(that._clickPX);
            that.viewer.scene.render();
            let cartesian;
            let isOn3dtiles = false;
            for (let i = 0; i < picks.length; i++) {
                if (
                    picks[i] &&
                    picks[i].primitive &&
                    picks[i].primitive instanceof Cesium.Cesium3DTileset
                ) {
                    //模型上拾取
                    isOn3dtiles = true;
                    break;
                }
            }
            if (isOn3dtiles) {
                cartesian = that.viewer.scene.pickPosition(that._clickPX);
            } else {
                const ray = that.viewer.camera.getPickRay(that._clickPX);
                if (!ray) return null;
                cartesian = that.viewer.scene.globe.pick(ray, that.viewer.scene);
            }

            const ctgc = Cesium.Cartographic.fromCartesian(cartesian.clone());
            const lng = Cesium.Math.toDegrees(ctgc.longitude);
            const lat = Cesium.Math.toDegrees(ctgc.latitude);
            const height = ctgc.height;

            const title = "该点坐标";

            const resultC3 = `[${Number(cartesian.x)} , ${Number(cartesian.y)} , ${Number(cartesian.z)}]`
            const resultJWD = `[${Number(lng).toFixed(6)} , ${Number(lat).toFixed(6)} , ${Number(height).toFixed(2)}]`
            const result = `
                世界坐标：
                <div>${resultC3}</div>
                经纬度：
                <div>${resultJWD}</div>
            `;
            that.crerateResultHtml(title, result);
        })
    }
    createCameraViewTool() {
        let that = this;
        const html = `
          <li class="right-tool-view" id="right-tool-view-${this.randomId}">
                <span>相机视角</span>
          </li>
      `;
        $(`#vis3d-right-tool-${this.randomId} ul`).append(html);
        $(`#right-tool-view-${this.randomId}`).on("click", function () {
            $(`#vis3d-right-tool-${that.randomId}`).hide();

            var camera = that.viewer.camera;
            var position = camera.position;
            var heading = camera.heading;
            var pitch = camera.pitch;
            var roll = camera.roll;
            var lnglat = Cesium.Cartographic.fromCartesian(position);
            let str = `
                <div>{</div>
                <ul style="margin-left:10px;">
                    <li>
                        <span>
                            "x" : ${Cesium.Math.toDegrees(lnglat.longitude)},
                        </span>
                    </li>
                    <li>
                        <span>
                            "y" : ${Cesium.Math.toDegrees(lnglat.latitude)},
                        </span>
                    </li>
                    <li>
                        <span>
                            "z" : ${lnglat.height},
                        </span>
                    </li>
                    <li>
                        <span>
                            "heading" : ${Cesium.Math.toDegrees(heading)},
                        </span>
                    </li>
                    <li>
                        <span>
                            "pitch" : ${Cesium.Math.toDegrees(pitch)},
                        </span>
                    </li>
                    <li>
                        <span>
                        "roll" : ${Cesium.Math.toDegrees(roll)}
                        </span>
                    </li>
                </ul>
                <div>}</div>
            `;
            const title = "当前相机视角";
            that.crerateResultHtml(title, str);
        });
    }
    crateDepthTool() {
        let that = this;
        const oldDepth = this.viewer.scene.globe.depthTestAgainstTerrain;
        let depthVal = !oldDepth ? "深度检测（开）" : "深度检测（关）";
        const html = `
          <li>
            <span class="right-tool-depth" id="right-tool-depth-${this.randomId}">
              ${depthVal}
            </span>
          </li>
      `;
        $(`#vis3d-right-tool-${this.randomId} ul`).append(html);
        $(`#right-tool-depth-${this.randomId}`).on("click", function () {
            $(`#vis3d-right-tool-${that.randomId}`).hide();
            const text = $(this).text();
            if (text.indexOf("开") != -1) { // 表示当前是开启状态
                $(this).text("深度检测（关）");
                that.viewer.scene.globe.depthTestAgainstTerrain = true;
            } else {
                $(this).text("深度检测（开）");
                that.viewer.scene.globe.depthTestAgainstTerrain = false;
            }
        });
    }

    refreshDepthVal() {
        const oldDepth = this.viewer.scene.globe.depthTestAgainstTerrain;
        let depthVal = !oldDepth ? "深度检测（开）" : "深度检测（关）";
        $(`#right-tool-depth-${this.randomId}`).html(depthVal);
    }

    bindHandler() {
        let that = this;
        this.rightClickHandler.setInputAction(function (evt) {
            const pick = that.viewer.scene.pick(evt.position);
            let ent;
            if (pick && pick.primitive && !(pick.primitive instanceof Cesium.Cesium3DTileset)) { // 拾取图元
                ent = pick.primitive;
            }
            if (pick && pick.id && pick.id instanceof Cesium.Entity) {
                ent = pick.id;
            }
            if (ent) return; // 控制不能在已绘制的地方进行右键弹出面板

            that.refreshDepthVal();
            const px = evt.position;
            that._clickPX = evt.position;

            // 获取其相对于屏幕左上角的位置
            const bcr = that.mapContainer.getBoundingClientRect()

            $(`#vis3d-right-tool-${that.randomId}`).css({
                left: Number(px.x + 10) + bcr.left + "px",
                top: Number(px.y + 10) + bcr.top + "px",
                display: "block"
            });
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    destroy() {
        if (this.rightClickHandler) {
            this.rightClickHandler.destroy();
            this.rightClickHandler = null;
        }
        $(`vis3d-right-tool-${this.randomId}`).remove();
    }

    // 构建结果面板
    crerateResultHtml(title, result) {
        const that = this;
        let rightContent = document.getElementById(`vis3d-right-content-${this.randomId}`);
        rightContent.parentNode.removeChild(rightContent);

        this.createShadow();
        const html = `
            <div class="vis3d-right-content" class="vis3d-right-content-${this.randomId}">
                <span class="right-content-close" id="right-content-close-${this.randomId}" alt="" title="点击关闭">x</span>
                <div class="right-content-result scrollbar">
                <div class="content-result-title" style="font-weight:bold;">${title}：</div>
                <div class="content-result-line"></div>
                <div class="content-result-info">${result}</div>
                </div>
            </div>
        `;
        $("body").append(html);
        // 点击关闭
        $(`#right-content-close-${this.randomId}`).off("click").on("click", function () {
            $(this).parent().remove();
            $(`#vis3d-right-tool-shadow-${that.randomId}`).remove();
        })
    }

    //  创建遮罩
    createShadow() {
        let rightToolShadow = document.getElementById(`vis3d-right-tool-shadow-${this.randomId}`);
        rightToolShadow.parentNode.removeChild(rightToolShadow);

        const ele = this.createElement({
            id : `vis3d-right-tool-shadow-${this.randomId}`,
            class : `vis3d-right-tool-shadow`
        })
        document.getElementsByTagName('body').appendChild(ele);
    }

    // 自主创建
    append(opt) {
        let id = opt.id || new Date().getTime();
        let html = `
            <li id="right-tool-${id}">
                ${opt.content}
            </li>
        `;
        $(`#vis3d-right-tool-${this.randomId} ul`).append(html);
        $(`#right-tool-${id}`).on("click", function () {
            if (opt.click) opt.click($(this));
        });


    }
}

export default RightTool;
