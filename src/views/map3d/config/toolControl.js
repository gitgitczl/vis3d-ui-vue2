
const buildTime = "2024-01-11 10:00"
const setConsoleLog = () => {
    console.group('平台说明（🗺 三维地图开发平台）：');
    console.log(`%c 公司官网 ：http://mapgl.com`, `color: red; font-weight: bold`);
    console.log(`%c 编译日期 ：${buildTime}`, `color: red; font-weight: bold`);
    console.log(`%c 版本信息 ：Cesium：${Cesium.VERSION}; vis3d：${window.vis3d?.VERSION || "--"}`, `color: #03A9F4; font-weight: bold`);
    console.log(`%c 其    它 ：
        1、如当前版本出现问题，请联系：15156540451（微信同号）
        2、当前控制台禁止清除，如需清除请联系开发者`, `color: #03A9F4; font-weight: bold`);
    console.groupEnd();

    window.console.clear = function () {
        alert("无版权，禁止清除控制台！");
    }
}
setConsoleLog();

// 模块控制器
export default {
    components: [],
    toolsState: {},  // 记录模块状态 true 打开 / false 关闭
    componentsArr: [],
    // 初始化
    init(workConfig, fun) {
        let { tools } = workConfig;
        let toolsObj = {};
        for (let i = 0; i < tools.length; i++) {
            let tool = tools[i];
            if (!tool.toolName) {
                console.log("当前模块配置有误，缺少toolName", tool);
                continue;
            }
            tool.domShow = true;
            toolsObj[tool.toolName] = tool;
            this.components.push(tool.component);
        }

        let that = this;
        Promise.all(this.components).then((modules) => {
            // 构建对应组件标签
            for (let i = 0; i < modules.length; i++) {
                let module = modules[i];
                const toolName = workConfig.tools[i].toolName;
                module.default.name = toolName;
                let attr = toolsObj[toolName];
                if (!attr) continue;
                attr.module = module.default;
                that.componentsArr.push(attr);
            }
            if (fun) fun(that.componentsArr)
        });
    },
    // 关闭单个模块 当前模块  其它模块
    closeToolByName(name, dutoName) {
        if (!name) {
            console.log("缺少菜单名称===>", name);
            return;
        }
        console.log("closeTool===>", name, dutoName);
        let toolAttr = this.getComponentByName(name);
        /*  if(!toolAttr) return ; */
        // 是否能被其他模块释放 默认为true  与closeDisableExcept互斥
        if (dutoName) {
            toolAttr.disableByOthers =
                toolAttr.disableByOthers == undefined
                    ? true
                    : toolAttr.disableByOthers;
            if (!toolAttr.disableByOthers) return;
        }

        // 表示不能通过dutoName模块关闭当前模块 与disableByOthers互斥
        if (
            toolAttr.closeDisableExcept &&
            toolAttr.closeDisableExcept.indexOf(dutoName) != -1
        )
            return;
        // 释放时 是否销毁自己
        if (
            toolAttr.closeDisableSelf == undefined ||
            toolAttr.closeDisableSelf == true
        ) {
            toolAttr.show = false;
            toolAttr.domShow = false;
        } else {
            toolAttr.domShow = false;
        }

        this.toolsState[name] = false;
    },
    // 打开单个模块
    openToolByName(name, attr) {
        if (this.toolsState[name] && this.toolsState[name] === true) return; // 防止二次打开
        let toolAttr = this.getComponentByName(name);
        if (!toolAttr) return;
        // 打开某个模块
        toolAttr.show = true;
        toolAttr.domShow = true;
        if (attr) toolAttr.attr = attr; // 用于打开组件时 传参
        // 打开的时候 关闭其他模块
        if (toolAttr.openDisableAnothers) {
            for (let i = 0; i < this.componentsArr.length; i++) {
                let ct = this.componentsArr[i];
                if (ct.toolName != name && ct.show) {
                    this.closeToolByName(ct.toolName, name); // 打开当前模块时 关闭其他模块
                }
            }
        }
        this.toolsState[name] = true;
    },
    getComponentByName(name) {
        if (!name) return;
        let component = null;
        for (let i = 0; i < this.componentsArr.length; i++) {
            let cpnt = this.componentsArr[i];
            if (cpnt.toolName == name) {
                component = cpnt;
                break;
            }
        }
        return component;
    }
}
