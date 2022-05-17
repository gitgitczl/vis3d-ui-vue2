window.mapConfig = {
    "baseServer": "http://localhost:1119/",
    "map": {
        "cameraView": {
            "x": 109.76622427269002,
            "y": 38.29735638720425,
            "z": 2239.880835784429,
            "heading": 212.59690251323107,
            "pitch": -33.64527675694504,
            "roll": 359.998529182336,
            "duration": 0
        },
        "worldAnimate": false,
        "navigation": true,
        "bottomLnglatTool": true,
        "rightTool": true,
        "depthTestAgainstTerrain": true,  // 是否开启深度监测
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
            "terrainExaggeration": 1,

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
            "iconImg": "./easy3d/images/baseMap/arcgis.png",
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
                },
                {
                    "name": "全国地图（深色）",
                    "type": "xyz",
                    "show": false,
                    "url": "http://8.142.20.247:25548/layer/chengdu/{z}/{x}/{y}.png"
                }

            ]
        },
        {
            "name": "三维模型",
            "type": "group",
            "open": true,
            "children": [
                {
                    "name": "城区模型",
                    "type": "3dtiles",
                    "url": "http://8.141.58.76:6814/data/3dtiles/tileset.json",
                    "show": true,
                    "center": {
                        "z": 50
                    },
                    "maximumScreenSpaceError": 8
                }
            ]
        }
    ]
}
