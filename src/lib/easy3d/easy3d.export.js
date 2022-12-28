// easy3d类库暴露方法
import "./easy3d.css";
import cUtil from "./cUtil";
import cTool from "./cTool";
import DrawTool from "./plot/drawTool";

import ArcgiscacheLayer from "./layer/arcgiscacheLayer.js";
import MapserverLayer from './layer/mapserverLayer.js';
import GridLayer from "./layer/gridLayer.js";
import GeojsonLayer from "./layer/geojsonLayer.js";
import TDTLayer from "./layer/tdtLayer.js";
import SingleImageLayer from "./layer/singleImageLayer.js";
import TMSLayer from "./layer/tmsLayer.js";
import XYZLayer from "./layer/xyzLayer.js";
import TilesetLayer from "./layer/tilesetLayer";
import WMSLayer from "./layer/wmsLayer";
import WMTSLayer from "./layer/wmtsLayer";


import LayerTool from "./layer/layerTool";
import "./prompt/prompt.css";
import Prompt from "./prompt/prompt";
import MeasureTool from "./measure/measureTool";
import "./lnglatTool/lnglatNavigation.css";
import gadgets from "./gadgets/gadgets";
import RoamTool from "./roam/roamTool";
import ZoomTool from "./zoomTool/zoomTool";
import OverviewMap from "./overviewMap/overviewMap";
import LayerSplit from "./layerSplit/layerSplit";
// 引入天气
import fog from "./weather/fog";
import rain from "./weather/rain";
import snow from "./weather/snow";
// 引入分析模块
import VisualTool from "./analysis/visualField/visualTool";
import Sunshine from "./analysis/sunshine/sunshine";
import LimitHeight from "./analysis/limitHeight/limitHeight";

import MapViewer from "./mapViewer";


let analysis = {
  VisualTool: VisualTool,
  Sunshine: Sunshine,
  LimitHeight: LimitHeight,
};

// 自定义天气
let weather = {
  fog: fog,
  rain: rain,
  snow: snow,
};

import registerAnimate from "./animateMaterial/animate";
// 注册自定义材质
let rganimate = registerAnimate();
let animate = {
  Wall: rganimate.AnimateWall,
  FlowLine: rganimate.FlowLineMaterial,
};


export default {
  cUtil,
  cTool,
  MapViewer,
  DrawTool,

  ArcgiscacheLayer, MapserverLayer, GridLayer, GeojsonLayer, TDTLayer, SingleImageLayer, TMSLayer, XYZLayer, TilesetLayer, WMSLayer, WMTSLayer,

  LayerTool,

  MeasureTool,
  Prompt,
  gadgets,
  RoamTool,
  ZoomTool,
  OverviewMap,
  weather,
  animate,
  analysis,
  LayerSplit,
};
