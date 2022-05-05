window.mapConfig = {
    "baseServer": "http://localhost:1119/",
    "map": {
        "cesiumCredit": false,
        "cameraView": {
            "heading": 1.7234487708310804,
            "pitch": -46.19933951363875,
            "roll": 359.9934306040618,
            "x": 117.32016417871111,
            "y": 29.77087956748227,
            "z": 246214.16759452876,
            "duration": 0
        },
        "worldAnimate": false,
        "navigation": true,
        "bottomLnglatTool": true,
        "rightClickTool": true,
        "viewerConfig": {
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
        "terrain": {
            "url": "http://data.marsgis.cn/terrain",
            "show": true
        }
    },
    "baseLayers": [
        {
            "name": "arcgis底图",
            "type": "mapserver",
            "url": "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
            "show": true
        },
        {
            "name": "天地图",
            "type": "tdt",
            "layerName": "img",
            "show": false,
            "iconImg": "./easy3d/images/baseMap/tdt.png",
            "key": "a217b99b7be68b98104548d78e9a679a"
        }
    ],
    "operateLayers": [
        {
            "name": "测试图层",
            "type": "group",
            "open": true,
            "children": [
                {
                    "name": "arcgis底图",
                    "type": "mapserver",
                    "url": "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
                    "show": false,
                    "alpha": 0.5
                },
                {
                    "name": "天地图",
                    "type": "tdt",
                    "layerName": "img",
                    "show": false,
                    "key": "a217b99b7be68b98104548d78e9a679a",
                    "compare": true
                },
                {
                    "name": "单张地图",
                    "type": "singleImage",
                    "url": "./easy3d/images/layer/world.jpg",
                    "iconImg": "./easy3d/images/layer/world.jpg",
                    "show": false,
                    "layerSplit": true,
                    "alpha": 1,
                    "rectangle": [
                        -180,
                        -90,
                        180,
                        90
                    ]
                }
            ]
        },
        {
            "name": "三维模型",
            "type": "group",
            "open": true,
            "children": [
                {
                    "name": "化工厂",
                    "type": "3dtiles",
                    "url": "http://localhost:9000/model/a21b1710c1f711ec8e1af93423d539a1/tileset.json",
                    "show": true,
                    "view": {
                        "heading": 18.037134901725636,
                        "pitch": -22.501592395868563,
                        "roll": 0.00038618494202808594,
                        "x": 117.33862298840332,
                        "y": 33.23609010113041,
                        "z": 163.56449255825012,
                        "duration": 2
                    },
                    "maximumScreenSpaceError": 8
                }
            ]
        }
    ]
}
