## 平台简介
vis3d-ui是一套基于Cesium的全开源的快速开发平台，毫无保留给个人及企业免费使用。我们将永远保持开源。  

* 1、底图管理。支持底图通过配置文件动态配置，可设置单个图层作为底图。
* 2、图层管理。支持多类型图层通过配置文件动态配置，一次性可选择多个图层。
* 3、图上标绘。支持点、线、面、圆、矩形、gltf/glb小模型的动态标绘、样式设置以及导入导出；支持动态线的标绘。
* 4、军事标绘。支持10余种类型军事箭头及其它类型标绘以及样式设置、导入导出。
* 5、地图量算。支持距离、长度、面积以及三角量算。
* 6、地图分析。支持可视域、高度、方量、模型裁剪、模型压平、模型剖切等类型分析。
* 7、地图打印。支持当前场景下的地图进行打印。
* 8、坐标定位。支持坐标输入以及图上选点定位。
* 9、卷帘对比。支持多种地图数据通过卷帘操作进行相互对比。
* 10、分屏对比。支持多种地图数据通过多屏幕进行相互对比。
* 11、行政区划。支持全国省市县及地区的三级行政区划联动。
* 12、指北针/比例尺。支持指北针以及比例尺配置。
* ......  

[在线体验：http://mapgl.com/3d/](http://mapgl.com/3d/)

## 平台技术栈
vis3d-ui-vue2，是基于vue/cli + vue2搭建的一套纯前端三维地图框架。

* vue/cli + vue2 + Cesium（> 1.103）+ webpack(> 5.0)。

## 平台特色

* 1、界面颜色以及操作面板样式动态可配置。目前系统内置了三种主题颜色（暗夜灰、科技蓝以及活力绿），并且配置三种主题面板样式（条形、下拉以及淡入）。可在src/main.js中，通过如下配置来设置你需要的样式：
```
Vue.prototype.toolStyle = {
  themeType: "dark", // 主题样式颜色 dark（暗色）、blue（科技蓝）、green（生态绿）
  toolsType: 'fade' // 右侧工具条类型 default（条状工具条） 、dropdown（下拉工具）、fade（淡入工具）
}
```
* 2、地图初始化参数、底图、图层树动态可配置。我们在vis3d.js类库中，支持了百度、高德、天地图、Arcgis、xyz、3dtiles、单张图片、wms、wfs等十多种类型的地图服务的加载。在vis3d-ui-vue2平台中，我们通过json类型的配置文件可直接配置所需要加载的地图服务。其中配置的方式有两种：
```
// 第一种方式，打开src/views/map3d/config/mapConfig.json，将所需要的数据直接配置进入即可。
// 第二种方式，在windows下定义window.mapConfig对象，对象属性配置如下：
{
    baseServer: "http://localhost:1119/",
    map: { 
        cameraView: { // 初始化地图视角
            "x": 117.24473608316538,
            "y": 31.473304123104246,
            "z": 50127.83549149741,
            "heading": 4.01216132021934,
            "pitch": -54.02598589122648,
            "roll": 359.9967116865769,
            duration: 0
        },
        brightness: 1.0, // 亮度设置
        errorRender: true, // 是否开启崩溃刷新
        debugShowFramesPerSecond: false, // 是否显示帧数
        worldAnimate: false,
        lnglatNavigation: true, // 经纬度及相机位置提示
        rightTool: true, // 是否开启右键功能
        popupTooltipTool: true, // 是否开启气泡窗
        navigationTool: true, // 导航球及比例尺
        depthTestAgainstTerrain: true, // 是否开启深度监测
        viewer: { // 参考Cesium.js中的Viewer配置
            "animation": false,
            "baseLayerPicker": false,
            "fullscreenButton": false,
            "geocoder": false,
            "homeButton": false,
            "infoBox": false,
            "sceneModePicker": false,
            "selectionIndicator": false,
            "timeline": false,
            "navigationHelpButton": false,
            "scene3DOnly": true,
            "useDefaultRenderLoop": true,
            "showRenderLoopErrors": false,
            "terrainExaggeration": 1
        },
        terrain: { // 地形服务
            url: "http://data.marsgis.cn/terrain",
            show: true,
        },
    },
    baseLayers: [
        {
            name: "单张地图",
            type: "singleImage",
            url: img_world,
            iconImg: img_world,
            show: false,
            alpha: 1,
            rectangle: [-180, -90, 180, 90],
        },
        {
            name: "电子底图",
            type: "mapserver",
            iconImg: img_arcgis,
            url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
            show: true,
        },
        {
            name: "彩色底图",
            type: "mapserver",
            iconImg: img_caise,
            url: "https://services.arcgisonline.com/arcgis/rest/services/World_Physical_Map/MapServer",
            show: false,
        },
        {
            name: "蓝黑底图",
            type: "mapserver",
            iconImg: img_geoq,
            url: "http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer",
            show: false,
        },
        {
            name: "天地图",
            type: "tdt",
            layerName: "img",
            show: false,
            iconImg: img_tdt,
            key: "a217b99b7be68b98104548d78e9a679a",
        },
        {
            name: "腾讯地图",
            type: "tencent",
            layerType: "1",
            iconImg: img_tencent,
            show: false
        },
        {
            name: "百度地图",
            type: "baidu",
            iconImg: img_baidu,
            show: false
        },
        {
            name: "高德地图（影像）",
            type: "urltemplate",
            iconImg: img_gaode,
            url: "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
            // url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}", 矢量
            // url: "http://webst02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8", 注记
            // minimumLevel: 3,
            // maximumLevel: 18,
            show: false
        }
    ],
    operateLayers: [
        {
            name: "测试影像",
            type: "group",
            open: true,
            children: [
                {
                    name: "无人机航飞（1）",
                    type: "xyz",
                    show: false,
                    url: "http://localhost/layer/testTiff/{z}/{x}/{y}.png",
                }
            ]
        },
        {
            name: "倾斜摄影（osgb）",
            type: "group",
            open: true,
            children: [


                {
                    name: "地块（3）",
                    type: "3dtiles",
                    url: "http://mapgl.com/data/model/dikuai/tileset.json",
                    center: {
                        z: 440
                    },
                    show: true,
                    maximumScreenSpaceError: 16
                },
                {
                    name: "寺庙",
                    type: "3dtiles",
                    url: "http://mapgl.com/data/model/qx-simiao/tileset.json",
                    center: {
                        z: 120,
                    },
                    alpha: .5,
                    show: true,
                    maximumScreenSpaceError: 1,
                },
                {
                    name: "大雁塔",
                    type: "3dtiles",
                    url: "http://mapgl.com/data/model/qx-dyt/tileset.json",
                    center: {
                        z: 423,
                    },
                    show: false,
                    maximumScreenSpaceError: 1,
                }
            ],
        },
        {
            name: "手工建模",
            type: "group",
            open: true,
            children: [
                {
                    name: "石化企业（3dmax）",
                    type: "3dtiles",
                    url: "http://mapgl.com/data/model/max-shihua/tileset.json",
                    show: false,
                    center: {
                        z: 80,
                    },
                    maximumScreenSpaceError: 16,
                }
            ]
        },
        {
            name: "点云模型",
            type: "group",
            open: true,
            children: [
                {
                    name: "植被",
                    type: "3dtiles",
                    url: "http://localhost/model/las/zhibei/tileset.json",
                    show: false,
                    maximumScreenSpaceError: 16,
                }
            ]

        }

    ]
}
```
   