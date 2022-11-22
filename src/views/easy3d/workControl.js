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
            tool.domShow = true;
            toolsObj[tool.workName] = tool;
            this.importTool(tool.workName);
        }

        let that = this;
        debugger
        Promise.all(this.components).then((modules) => {
            // 构建对应组件标签
            for (let i = 0; i < modules.length; i++) {
                let module = modules[i];
                const workName = module.default.name;
                let attr = toolsObj[workName];
                if (!attr) continue;
                attr.module = module.default;
                that.componentsArr.push(attr);
            }

            if (fun) fun(that.componentsArr)
        });
    },
    importTool(name) {
        switch (name) {
            case "plot":
                this.components.push(import("@/views/easy3d/baseTools/plot/Index.vue"));
                break;
            case "plotStyle":
                this.components.push(import("@/views/easy3d/baseTools/plotStyle/Index.vue"));
                break;
            case "layers":
                this.components.push(import("@/views/easy3d/baseTools/layers/Index.vue"));
                break;
            case "measure":
                this.components.push(import("@/views/easy3d/baseTools/measure/Index.vue"));
                break;
            case "analysis":
                this.components.push(import("@/views/easy3d/baseTools/analysis/Index.vue"));
                break;
            case "baseMap":
                this.components.push(import("@/views/easy3d/baseTools/baseMap/Index.vue"));
                break;
            case "coordinate":
                this.components.push(import("@/views/easy3d/baseTools/coordinate/Index.vue"));
                break;
            case "twoScreen":
                this.components.push(import("@/views/easy3d/baseTools/twoScreen/Index.vue"));
                break;
            case "region":
                this.components.push(import("@/views/easy3d/baseTools/region/Index.vue"));
                break;
            case "viewBook":
                this.components.push(import("@/views/easy3d/baseTools/viewBook/Index.vue"));
                break;
            case "pathPlan":
                this.components.push(import("@/views/easy3d/baseTools/pathPlan/Index.vue"));
                break;
            case "roam":
                this.components.push(import("@/views/easy3d/baseTools/roam/Index.vue"));
                break;
            case "roamStyle":
                this.components.push(import("@/views/easy3d/baseTools/roamStyle/Index.vue"));
                break;
            case "layerSplit":
                this.components.push(import("@/views/easy3d/baseTools/layerSplit/Index.vue"));
                break;
            case "monomer":
                this.components.push(import("@/views/easy3d/baseTools/monomer/Index.vue"));
                break;
            case "help":
                this.components.push(import("@/views/easy3d/baseTools/help/Index.vue"));
                break;
            default: ;
        }
    },
    // 关闭单个模块 当前模块  其它模块
    closeToolByName(name, dutoName) {
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
        // 打开某个模块
        toolAttr.show = true;
        toolAttr.domShow = true;
        if (attr) toolAttr.attr = attr; // 用于打开组件时 传参
        // 打开的时候 关闭其他模块
        if (toolAttr.openDisableAnothers) {
            for (let i = 0; i < this.componentsArr.length; i++) {
                let ct = this.componentsArr[i];
                if (ct.workName != name && ct.show) {
                    this.closeToolByName(ct.workName, name);
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
            if (cpnt.workName == name) {
                component = cpnt;
                break;
            }
        }
        return component;
    }
}
