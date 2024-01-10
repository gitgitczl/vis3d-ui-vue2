
import "./vis3d.css";
/* 地图相关方法 */
import util from "./util"
/* 地图无关方法 */
import tool from "./tool";
/* 标绘相关方法 */
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
const plot = {
  Tool: DrawTool,
  Billboard: CreateBillboard,
  Circle: CreateCircle,
  Model: CreateGltfModel,
  Label: CreateLabel,
  Point: CreatePoint,
  Polygon: CreatePolygon,
  Rectangle: CreateRectangle,
  Polyline: CreatePolyline,
  Arrow: CreateArrow
}
import * as draw from "./plot/draw";

/* 地图服务相关 */
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
import UrltemplateLayer from "./layer/urltemplateLayer";
import BaiduLayer from "./layer/baiduLayer";
import TencentLayer from "./layer/tencentLayer";
import OSMLayer from "./layer/osmLayer";
import LayerTool from "./layer/layerTool";
import * as layerload from "./layer/load"
const layer = {
  Tool: LayerTool,
  Arcgiscache: ArcgiscacheLayer,
  Mapserver: MapserverLayer,
  Grid: GridLayer,
  Geojson: GeojsonLayer,
  TDT: TDTLayer,
  Image: SingleImageLayer,
  TMS: TMSLayer,
  XYZ: XYZLayer,
  Tileset: TilesetLayer,
  WMS: WMSLayer,
  WMTS: WMTSLayer,
  urltemplate: UrltemplateLayer,
  Baidu: BaiduLayer,
  Tencent: TencentLayer,
  OSM: OSMLayer,
  layerload: layerload
}

/* 量算相关 */
import MeasureTool from "./measure/measureTool";
import MeasureAzimutht from "./measure/measureAzimuth";
import MeasureGroundDistance from "./measure/measureGroundDistance";
import MeasureHeight from "./measure/measureHeight";
import MeasureLnglat from "./measure/measureLnglat";
import MeasureTriangle from "./measure/measureTriangle";
import MeasureSpaceDistance from "./measure/measureSpaceDistance";
import MeasureSpaceArea from "./measure/measureSpaceArea";
const measure = {
  Tool: MeasureTool,
  Azimutht: MeasureAzimutht,
  GroundDistance: MeasureGroundDistance,
  Height: MeasureHeight,
  Lnglat: MeasureLnglat,
  Triangle: MeasureTriangle,
  SpaceDistance: MeasureSpaceDistance,
  SpaceArea: MeasureSpaceArea
}

/* 漫游相关 */
import RoamTool from "./roam/roamTool";
import Roam from "./roam/roam";
const roam = {
  Tool: RoamTool,
  Roam: Roam
}

/* 自定义primitive */
import CustomCriclePrimitive from "./primitive/circle"
import CustomWallPrimitive from "./primitive/wall"
import CustomCylinderPrimitive from "./primitive/cylinder"
import ConePrimitive from "./primitive/cone"
const primitive = {
  Circle: CustomCriclePrimitive,
  Wall: CustomWallPrimitive,
  Cylinder: CustomCylinderPrimitive,
  Cone: ConePrimitive
}

/* 自定义graphic */
import TrackCylinderGraphic from "./graphic/trackCylinder";
const graphic = {
  TrackCylinder: TrackCylinderGraphic
}

/* 天气相关 */
import fog from "./weather/fog";
import snow from "./weather/snow";
import rain from "./weather/rain";
const weather = {
  fog, snow, rain
}

/* 自定义材质 */
import material from "./material/animate";

/* 通用方法 */
import Navigation from "./common/navgation/CesiumNavigation"
import ZoomTool from "./common/zoomTool/zoomTool";
import RightTool from "./common/rightTool/rightTool";
import LnglatTool from "./common/lnglatTool/lnglatTool";
import LayerSplit from "./common/layerSplit/layerSplit"
import Cluster from "./common/cluster/cluster"
import Prompt from "./prompt/prompt";
import SkyboxGround from "./common/skyboxGround"
import OverviewMap from "./common/overviewMap/overviewMap";
import selectModel from "./common/selectModel"
const common = {
  Navigation, ZoomTool, RightTool, LnglatTool, LayerSplit,
  Cluster, Prompt, SkyboxGround, OverviewMap, selectModel
}

/* 视角相关 */
import viewAround from "./view/viewAround"
import viewPoint from "./view/viewPoint"
import worldRotate from "./view/worldRotate";
const view = {
  viewAround, viewPoint, worldRotate
}

/* 3dtiles模型相关 */
import Clip from "./tileset/tilesetClip"
import Edit from "./tileset/tilesetEdit"
import PointLight from "./tileset/pointLight"
import Cut from "./tileset/tilesetCut"
import Flat from "./tileset/tilesetFlat"
const tileset = {
  Clip, Edit, PointLight, Cut, Flat
}

/* 分析相关 */
import Sunshine from "./analysis/sunshine/sunshine";
import LimitHeight from "./analysis/limitHeight/limitHeight";
import VisualFieldTool from "./analysis/visualField/visualFieldTool"
const analysis = {
  Sunshine: Sunshine,
  LimitHeight: LimitHeight,
  VisualFieldTool: VisualFieldTool
}

/* 查询工具 */
import GaodePOI from "./query/GaodePOI"
import GaodeRoute from "./query/GaodeRoute"
const query = {
  GaodePOI, GaodeRoute
}

/* 覆盖物 */
import echarts from "./cover/echartsLayer"
import mapv from "./cover/mapvLayer"
import Heatmap from "./cover/heatmap"
import Heatmap3d from "./cover/heatmap3d"
const cover = {
  echarts, mapv,
  Heatmap, Heatmap3d
}

/* 雷达传感器 */
import * as sensor from "./sensor/radar";
import MapViewer from "./mapViewer"


export default {
  MapViewer, sensor, layer, material, layerload,
  util, tool, plot, draw, measure, roam, primitive, graphic,
  weather, common, view, tileset, analysis, query, cover
};
