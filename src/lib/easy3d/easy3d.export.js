// easy3d类库暴露方法
import "./easy3d.css";
import cUtil from "./cUtil";
import cTool from "./cTool";

import CreateBillboard from './plot/createBillboard.js'
import CreateCircle from './plot/createCircle.js'
import CreateGltfModel from './plot/createGltfModel.js'
import CreateLabel from './plot/createLabel.js'
import CreatePoint from './plot/createPoint.js'
import CreatePolygon from './plot/createPolygon.js'
import CreateRectangle from './plot/createRectangle'
import CreatePolyline from './plot/createPolyline.js'
import CreateArrow from "./plot/createArrow";
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

import gadgets from "./gadgets/gadgets";
import RoamTool from "./roam/roamTool";
import ZoomTool from "./zoomTool/zoomTool";
import OverviewMap from "./overviewMap/overviewMap";
import LayerSplit from "./layerSplit/layerSplit";

// 引入分析模块
import visualFieldTool from "./analysis/visualField/visualFieldTool";
import VisualField from "./analysis/visualField/visualField";
import Sunshine from "./analysis/sunshine/sunshine";
import LimitHeight from "./analysis/limitHeight/limitHeight";

import MapViewer from "./mapViewer";

import weather from "./weather/weather"

// 版本信息控制
import easy3dVERSION from "./easy3d.version.js"

let analysis = {
  visualFieldTool: visualFieldTool,
  VisualField : VisualField,
  Sunshine: Sunshine,
  LimitHeight: LimitHeight,
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
  CreateBillboard,CreateCircle,CreateGltfModel,CreateLabel,CreatePoint,CreatePolygon,CreateRectangle,CreatePolyline,CreateArrow,
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
