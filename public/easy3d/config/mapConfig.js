window.mapConfig = {
  baseServer: "http://localhost:1119/",
  map: {
    cameraView: {
      "x": 117.14532335931926,
      "y": 31.80044599763115,
      "z": 2352.9519727092984,
      "heading": 1.9619033536211412,
      "pitch": -54.87331947992363,
      "roll": 0.004195037386755997,
      "duration": 0,
    },
    brightness : 1.0, // 亮度设置
    errorRender: false, // 是否开启崩溃刷新
    debugShowFramesPerSecond: false, // 是否显示帧数
    worldAnimate: false,
    bottomLnglatTool: true, // 经纬度及相机位置提示
    rightTool: true, // 是否开启右键功能
    popupTooltipTool: true, // 是否开启气泡窗
    navigationTool: true, // 导航球及比例尺
    depthTestAgainstTerrain: true, // 是否开启深度监测
    viewerConfig: {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      scene3DOnly: true,
      useDefaultRenderLoop: true,
      showRenderLoopErrors: false,
      terrainExaggeration: 1,
    },
    terrain: {
      // "url": "http://localhost/erdsterrain",
      url: "http://data.marsgis.cn/terrain",
      show: true,
    },
  },
  baseLayers: [
    {
      name: "单张地图",
      type: "singleImage",
      url: "./easy3d/images/layer/world.jpg",
      iconImg: "./easy3d/images/layer/world.jpg",
      show: false,
      alpha: 1,
      rectangle: [-180, -90, 180, 90],
    },
    {
      name: "arcgis底图",
      type: "mapserver",
      iconImg: "./easy3d/images/baseMap/arcgis.png",
      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
      show: true,
    },
    /*  {
            "name": "中国",
            "type": "xyz",
            "iconImg": "./easy3d/images/baseMap/arcgis.png",
            "url": "http://localhost/china/{z}/{x}/{y}.jpg",
            "show": false
        }, */
    {
      name: "天地图",
      type: "tdt",
      layerName: "img",
      show: false,
      iconImg: "./easy3d/images/baseMap/tdt.png",
      key: "a217b99b7be68b98104548d78e9a679a",
    },
  ],
  operateLayers: [
    {
      name: "地图切片",
      open: true,
      type: "group",
      children: [
        {
          name: "水下地形",
          url: "http://112.86.147.194:9009/data/demnewtile/L{arc_z}/R{arc_y}/C{arc_x}.png",
          minimumLevel: 1,
          maximumLevel: 19,
          minimumTerrainLevel: 1,
          view: {
            x: 118.73263653438936,
            y: 31.971959788539053,
            z: 6643.463555185671,
            heading: 341.6647257262609,
            pitch: -36.54290725763041,
            roll: 359.9323408763138,
          },
          type: "arcgiscache",
          show: false,
        },
      ],
    },
    /*  {
            // 兼容标绘类型的数据
            "name": "航标模型",
            "type": "group",
            "open": false,
            "children": [
                {
                    "name": "白灯船",
                    "id": "1010", // 不可少
                    "type": "plot",
                    "plotType": "gltfModel",
                    "styleType": "gltfModel",
                    "positions": [109.769837, 38.285877, 0],
                    "show": 1,
                    "style": {
                        "heightReference": 1,
                        "uri": "./gltf/baidengchuan.glb",
                        "minimumPixelSize": 24,
                        "scale": 5,
                        "heading": 0,
                        "pitch": 0,
                        "roll": 0
                    }
                }
            ]
        }, */

    {
      name: "测试图层",
      type: "group",
      open: true,
      children: [
        {
          name: "天地图",
          type: "tdt",
          layerName: "img",
          show: false,
          key: "a217b99b7be68b98104548d78e9a679a",
          compare: true,
        },
        {
          name: "单张地图",
          type: "singleImage",
          url: "./easy3d/images/layer/world.jpg",
          iconImg: "./easy3d/images/layer/world.jpg",
          show: false,
          layerSplit: true,
          alpha: 1,
          rectangle: [-180, -90, 180, 90],
        },

        {
          name: "网格图",
          type: "grid",
          url: "./easy3d/images/layer/world.jpg",
          iconImg: "./easy3d/images/layer/world.jpg",
          show: false,
          glowColor: "#FF0000",
          alpha: 1,
        },
        {
          name: "全国地图（深色）",
          type: "xyz",
          show: false,
          url: "http://8.142.20.247:25548/layer/chengdu/{z}/{x}/{y}.png",
        },
        {
          name: "行政区划（geojson）",
          type: "geojson",
          show: false,
          url: "data/area.json",
          alpha: 0.5,
          style: {
            point: {
              color: "#00FFFF",
              /*  "color": {  // 支持多种方式赋值
                                 "field": "name",
                                 "conditions": [
                                     ['${name} >= "东部战区"', '#000000'],
                                     ['true', 'color("blue")']
                                 ]
                             }, */
              /* "color":{
                                "field" : "name",
                                "conditions" : "random" , // 可不填 
                                "type" : "Number" // 随机数返回值类型 Number / Color(16进制颜色)
                            }, */
              colorAlpha: 1,
              outlineWidth: 1,
              outlineColor: "#000000",
              outlineColorAlpha: 1,
              pixelSize: 20,
            },
            polyline: {
              color: "#FFFF00",
              colorAlpha: 1,
              width: 3,
              clampToGround: 1,
            },
            polygon: {
              heightReference: 1,
              fill: true,
              /* "color": "#00FFFF", */
              /* "color": {  // 支持多种方式赋值
                                "field": "name",
                                "conditions": [
                                    ['${name} == "东部战区"', '#000000'],
                                    ['${name} == "北部战区"', '#0000ff'],
                                    ['true', '#ff0000']
                                ]
                            }, */
              color: {
                conditions: "random",
                type: "color", // 随机数返回值类型 number / color(16进制颜色)
              },
              colorAlpha: 1,
              outline: true,
              outlineWidth: 1,
              outlineColor: "#FFFF00",
              outlineColorAlpha: 1,
            },
          },

          tooltip: [
            {
              field: "name",
              fieldName: "名称",
            },
            {
              field: "ADCODE99",
              fieldName: "编号",
            },
          ],
        },
      ],
    },
    {
      name: "三维模型",
      type: "group",
      open: true,
      children: [
        {
          name: "城区模型",
          type: "3dtiles",
          url: "http://8.141.58.76:6814/data/3dtiles/tileset.json",
          show: false,
          center: {
            z: 45,
          },
          maximumScreenSpaceError: 1,
        }

      ],
    },
  ],
};
