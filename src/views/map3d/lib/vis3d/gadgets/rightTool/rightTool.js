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

        const toolContainer = document.getElementById(`vis3d-right-tool-${this.randomId}`);
        this.toolMenu = toolContainer.querySelector("ul");


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
        this.scale = this.opt.scale || [1, 1];
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
        this.toolMenu.appendChild(dom);

        let rightToolLnglat = document.getElementById(`right-tool-lnglat-${this.randomId}`);
        rightToolLnglat.addEventListener('click', evt => {
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

        const dom = this.createElement('li', {
            class: `right-tool-view`,
            id: `right-tool-view-${this.randomId}`,
            html: `<span>相机视角</span>`
        })
        this.toolMenu.appendChild(dom);

        const rightToolView = document.getElementById(`right-tool-view-${this.randomId}`);
        rightToolView.addEventListener('click', function () {

            let camera = that.viewer.camera;
            let position = camera.position;
            let heading = camera.heading;
            let pitch = camera.pitch;
            let roll = camera.roll;
            let lnglat = Cesium.Cartographic.fromCartesian(position);
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
        })

    }
    crateDepthTool() {
        let that = this;
        const oldDepth = this.viewer.scene.globe.depthTestAgainstTerrain;
        let depthVal = !oldDepth ? "深度检测（开）" : "深度检测（关）";

        const dom = this.createElement('li', {
            class: `right-tool-view`,
            id: `right-tool-view-${this.randomId}`,
            html: ` <span class="right-tool-depth" id="right-tool-depth-${this.randomId}">
                        ${depthVal}
                    </span>`
        })
        this.toolMenu.appendChild(dom);

        const depthDom = document.getElementById(`right-tool-depth-${this.randomId}`);
        depthDom.addEventListener('click', function (evt, res) {
            const tool = document.getElementsByClassName('vis3d-right-tool');
            if (tool[0]) tool[0].style.display = "none";

            const text = depthDom.innerText;
            if (text.indexOf("开") != -1) { // 表示当前是开启状态
                depthDom.innerText = "深度检测（关）";
                that.viewer.scene.globe.depthTestAgainstTerrain = true;
            } else {
                depthDom.innerText = "深度检测（开）";
                that.viewer.scene.globe.depthTestAgainstTerrain = false;
            }
        })

    }

    refreshDepthVal() {
        const oldDepth = this.viewer.scene.globe.depthTestAgainstTerrain;
        let depthVal = !oldDepth ? "深度检测（开）" : "深度检测（关）";
        document.getElementById(`right-tool-depth-${this.randomId}`).innerHTML = depthVal;
    }

    bindHandler() {
        let that = this;
        this.rightClickHandler.setInputAction(function (evt) {
            evt.position.x = evt.position.x / that.scale[0];
            evt.position.y = evt.position.y / that.scale[1];

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
            that._clickPX = evt.position;
            // 获取其相对于屏幕左上角的位置
            const bcr = that.mapContainer.getBoundingClientRect()
            const dom = document.getElementById(`vis3d-right-tool-${that.randomId}`);
            dom.style.left = Number(evt.position.x + 10) + bcr.left + "px";
            dom.style.top = Number(evt.position.y + 10) + bcr.top + "px";
            dom.style.display = "block";
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    destroy() {
        if (this.rightClickHandler) {
            this.rightClickHandler.destroy();
            this.rightClickHandler = null;
        }
        const dom = document.getElementById(`vis3d-right-tool-${this.randomId}`);
        dom.parentNode.removeChild(dom);

        const dom2 = document.getElementById(`vis3d-right-content-${this.randomId}`);
        dom2.parentNode.removeChild(dom2);

    }

    // 构建结果面板
    crerateResultHtml(title, result) {
        // 关闭菜单栏
        const tool = document.getElementsByClassName('vis3d-right-tool');
        if (tool[0]) tool[0].style.display = "none";

        const resele = this.createElement('div', {
            class: `vis3d-right-content`,
            id: `vis3d-right-content-${this.randomId}`,
            html: `
            <span class="right-content-close" id="right-content-close-${this.randomId}" alt="" title="点击关闭">x</span>
            <div class="right-content-result scrollbar">
                <div class="content-result-title" style="font-weight:bold;">${title}：</div>
                <div class="content-result-line"></div>
                <div class="content-result-info">${result}</div>
            </div>
            `
        })

        const body = document.getElementsByTagName('body')[0];
        body.appendChild(resele);

        let rightContentClose = document.getElementById(`right-content-close-${this.randomId}`);
        let rightContent = document.getElementById(`vis3d-right-content-${this.randomId}`);
        rightContentClose.addEventListener('click', function () {
            if (rightContent) rightContent.parentNode.removeChild(rightContent);
        })

    }

    // 扩展右键菜单
    extend(opt) {
        let id = opt.id || new Date().getTime();
        const customId = opt.id || `right-tool-extend-${id}`
        const dom = this.createElement('li',{
            id : customId,
            class : opt.class || 'right-tool-extend',
            html : opt.content
        })
        this.toolMenu.appendChild(dom);
        document.getElementById(customId).addEventListener('click',function(){
            if (opt.click) opt.click();
        })
    }
}

export default RightTool;
