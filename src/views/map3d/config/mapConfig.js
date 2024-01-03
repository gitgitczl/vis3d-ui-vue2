// 内置地图相关配置文件
import img_world from "../images/baseMap/world.jpg";
import img_arcgis from "../images/baseMap/arcgis.png";
import img_caise from "../images/baseMap/caise.png";
import img_geoq from "../images/baseMap/geoq.png";
import img_tdt from "../images/baseMap/tdt.png";
import img_tencent from "../images/baseMap/tencent.png";
import img_baidu from "../images/baseMap/baidu.png";
import img_gaode from "../images/baseMap/gaode.png";


export default {
    baseServer: "http://localhost:1119/",
    map: {
        cameraView: {
            "x": 119.03180964296718,
            "y": 33.590498112009996,
            "z": 233.82760350909686,
            "heading": 359.9999999999401,
            "pitch": -28.65096138512803,
            "roll": 360,
            duration: 0
        },
        brightness: 1.0, // 亮度设置
        errorRender: true, // 是否开启崩溃刷新
        debugShowFramesPerSecond: true, // 是否显示帧数
        worldAnimate: false,
        lnglatNavigation: true, // 经纬度及相机位置提示
        rightTool: true, // 是否开启右键功能
        popupTooltipTool: true, // 是否开启气泡窗
        navigationTool: true, // 导航球及比例尺
        depthTestAgainstTerrain: true, // 是否开启深度监测
        viewer: {
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
        terrain: {
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
                },
                {
                    name: "大楼",
                    type: "3dtiles",
                    url: "http://mapgl.com/data/model/max-loudong/tileset.json",
                    show: false,
                    maximumScreenSpaceError: 16,
                    center: {
                        z: 120
                    }
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