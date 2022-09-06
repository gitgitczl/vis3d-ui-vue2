// 相关小工具控件
import PopupTooltipTool from "./popupTooltip/popupTooltip";
import "./rightTool/rightTool.css";
import RightTool from "./rightTool/rightTool";
import "./lnglatTool/lnglatNavigation.css";
import LatlngNavigation from "./lnglatTool/lnglatNavigation";
import ZoomTool from "./zoomTool/zoomTool"
import OverviewMap from "./overviewMap/overviewMap"
import CesiumNavigation from "./mapNavgation/CesiumNavigation"
import './mapNavgation/styles/cesium-navigation.css'
class MapTool {
    constructor(viewer, opt) {
        this.viewer = viewer;
        this._popupTooltipTool = undefined; // 弹窗提示
        this._rightTool = undefined; // 右键菜单
        this._lnglatTool = undefined; // 坐标提示
        this._overviewMap = undefined; // 鹰眼图
        this._zoomTool = undefined; // 缩放控件
        this._navigationTool = undefined; // 指北针和罗盘
    }

    get popupTooltipTool() {
        return this._popupTooltipTool;
    }

    set popupTooltipTool(val) {
        const isopen = Boolean(val);
        if (isopen) {
            if (!this._popupTooltipTool) {
                this._popupTooltipTool = new PopupTooltipTool(this.viewer, {});
                this._popupTooltipTool.autoBindPopup();
                this._popupTooltipTool.autoBindTooltip();
            }
        } else {
            if (this._popupTooltipTool) {
                this._popupTooltipTool.destroy();
                this._popupTooltipTool = null;
            }
        }
    }

    get rightTool() {
        return this._rightTool;
    }

    set rightTool(val) {
        const isopen = Boolean(val);
        if (isopen) {
            if (!this._rightTool) this._rightTool = new RightTool(this.viewer, {})
        } else {
            if (this._rightTool) {
                this._rightTool.destroy();
                this._rightTool = null;
            }
        }
    }

    get lnglatTool() {
        return this._lnglatTool;
    }

    set lnglatTool(val) {
        const isopen = Boolean(val);
        if (isopen) {
            this._lnglatTool = new LatlngNavigation(this._viewer);
        } else {
            if (this._lnglatTool) {
                this._lnglatTool.destroy();
                this._lnglatTool = null;
            }
        }
    }

    get navigationTool() {
        return this._navigationTool;
    }

    set navigationTool(val) {
        const isopen = Boolean(val);
        if (isopen) {
            this._navigationTool = new CesiumNavigation(this._viewer, {
                enableCompass: true, // 罗盘
                enableZoomControls: true, // 缩放控制器
                enableDistanceLegend: true, // 比例尺
                enableCompassOuterRing: true, // 罗盘外环
                view: this.viewer.mapConfig.map && this.viewer.mapConfig.map.cameraView
            });
        } else {
            if (this._navigationTool) {
                this._navigationTool.destroy();
                this._navigationTool = null;
            }
        }

    }

}

export default MapTool;