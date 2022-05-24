window.mapConfig = {
    "baseServer": "http://localhost:1119/",
    "map": {
        "cameraView": {
            "x": 120.23489052314471,
            "y": 35.988737950087234,
            "z": 6137.747059134269,
            "heading": 351.34704629855594,
            "pitch": -45.628475600570006,
            "roll": 359.99253564205463
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
                },
                {
                    "name": "行政区划（geojson）",
                    "type": "geojson",
                    "show": true,
                    "url": "data/area.json",
                    "style": {

                        "point": {
                            "color": "#00FFFF",
                            /*  "color": {  // 支持多种方式赋值
                                 "field": "name",
                                 "conditions": [
                                     ['${name} >= "东部战区"', '#000000'],
                                     ['true', 'color("blue")']
                                 ]
                             }, */
                            /*  "color": "random", */ // 随机
                            "colorAlpha": 1,
                            "outlineWidth": 1,
                            "outlineColor": "#000000",
                            "outlineColorAlpha": 1,
                            "pixelSize": 20
                        },
                        "polyline": {
                            "color": "#FFFF00",
                            "colorAlpha": 1,
                            "width": 3,
                            "clampToGround": 1
                        },
                        "polygon": {
                            "heightReference": 1,
                            "fill": true,
                            /* "color": "#00FFFF", */
                            "color": {  // 支持多种方式赋值
                                "field": "name",
                                "conditions": [
                                    ['${name} == "东部战区"', '#000000'],
                                    ['${name} == "北部战区"', '#0000ff'],
                                    ['true', '#ff0000']
                                ]
                            },
                            "colorAlpha": 1,
                            "outline": true,
                            "outlineWidth": 1,
                            "outlineColor": "#FFFF00",
                            "outlineColorAlpha": 1
                        }
                    },
                    "tooltip": [
                        {
                            "field": "name",
                            "fieldName": "名称"
                        },
                        {
                            "field": "ADCODE99",
                            "fieldName": "编号"
                        }
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
                    "name": "城区模型",
                    "type": "3dtiles",
                    "url": "http://8.141.58.76:6814/data/3dtiles/tileset.json",
                    "show": false,
                    "center": {
                        "z": 50
                    },
                    "maximumScreenSpaceError": 8
                }
            ]
        }
    ]
}
