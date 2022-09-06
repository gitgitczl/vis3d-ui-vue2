import $ from "jquery";
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
        this.mapContainer = this.viewer.container;
        this.rightClickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

        this.randomId = new Date().getTime() + "" + Math.ceil(Math.random() * 10000);
        let toolHtml = `
            <div class="easy3d-right-tool" id="easy3d-right-tool-${this.randomId}">
                <ul>
                </ul>
            </div>
        `;
        $(this.mapContainer).append(toolHtml);


        // 点击其它地方 关闭面板
        $(document).off("click").on("click",function(){
            $(".easy3d-right-tool").hide();
        });

        $(".easy3d-right-tool").click(function(event){
            event.stopPropagation();    //  阻止事件冒泡
        });

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

    crateLnglatTool() {
        let that = this;
        const html = `
          <li class="right-tool-lnglat" id="right-tool-lnglat-${this.randomId}">
            <span style="font-weight:bold;">当前坐标</span>
          </li>
        `;
        $(`#easy3d-right-tool-${this.randomId} ul`).append(html);
        $(`#right-tool-lnglat-${this.randomId}`).on("click", function () {
            $(`#easy3d-right-tool-${that.randomId}`).hide();
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
        $(`#easy3d-right-tool-${this.randomId} ul`).append(html);
        $(`#right-tool-view-${this.randomId}`).on("click", function () {
            $(`#easy3d-right-tool-${that.randomId}`).hide();
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
        $(`#easy3d-right-tool-${this.randomId} ul`).append(html);
        $(`#right-tool-depth-${this.randomId}`).on("click", function () {
            $(`#easy3d-right-tool-${that.randomId}`).hide();
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

    refreshDepthVal(){
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
            if(ent) return ; // 控制不能在已绘制的地方进行右键弹出面板

            that.refreshDepthVal();
            const px = evt.position;
            that._clickPX = evt.position;
            $(`#easy3d-right-tool-${that.randomId}`).css({
                left: Number(px.x + 10) + "px",
                top: Number(px.y + 10) + "px",
                display: "block"
            });
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    destroy() {
        if (this.rightClickHandler) {
            this.rightClickHandler.destroy();
            this.rightClickHandler = null;
        }
        $(`easy3d-right-tool-${this.randomId}`).remove();
    }

    // 构建结果面板
    crerateResultHtml(title, result) {
        const that = this;
        $(`#easy3d-right-content-${this.randomId}`).remove();
        this.createShadow();
        const html = `
            <div class="easy3d-right-content" class="easy3d-right-content-${this.randomId}">
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
            $(`#easy3d-right-tool-shadow-${that.randomId}`).remove();
        })
    }

    //  创建遮罩
    createShadow() {
        $(`#easy3d-right-tool-shadow-${this.randomId}`).remove();
        const html = `
            <div class="easy3d-right-tool-shadow" id="easy3d-right-tool-shadow-${this.randomId}"></div>
        `;
        $("body").append(html);
        $(`#easy3d-right-tool-shadow-${this.randomId}`).show();
    }
}

export default RightTool;