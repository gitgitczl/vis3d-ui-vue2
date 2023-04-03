window.mapConfig = {
  baseServer: "http://localhost:1119/",
  map: {
    cameraView: {
      "x" : 103.07063250744633,
      "y" : 32.99504991775686,
      "z" : 11234511.054524641,
      "heading" : 359.26622624290644,
      "pitch" : -89.99713737475427,
      "roll" : 0,
      "duration" : 0
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
      url: "http://data.marsgis.cn/terrain",
      show: true,
    },
  },
  baseLayers: [
    {
      name: "全国地图（0-8）",
      type: "xyz",
      show: false,
      url: "http://localhost/layer/world0-8/{z}/{x}/{y}.jpg",
    },
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
      name: "电子底图",
      type: "mapserver",
      iconImg: "./easy3d/images/baseMap/arcgis.png",
      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
      show: true,
    },
    {
      name: "彩色底图",
      type: "mapserver",
      iconImg: "./easy3d/images/baseMap/caise.png",
      url: "https://services.arcgisonline.com/arcgis/rest/services/World_Physical_Map/MapServer",
      show: false,
    },
    {
      name: "蓝黑底图",
      type: "mapserver",
      iconImg: "./easy3d/images/baseMap/geoq.png",
      url: "http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer",
      show: false,
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
    {
      name: "腾讯地图",
      type: "tencent",
      layerType: "1",
      iconImg: "./easy3d/images/baseMap/tencent.png",
      show: false
    },
    {
      name: "百度地图",
      type: "baidu",
      iconImg: "./easy3d/images/baseMap/baidu.png",
      show: false
    },
    {
      name: "高德地图（影像）",
      type: "urltemplate",
      iconImg: "./easy3d/images/baseMap/gaode.png",
      url: "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
      // url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}", 矢量
      // url: "http://webst02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8", 注记
      // minimumLevel: 3,
      // maximumLevel: 18,
      show: false
    },
   
    {
      name: "OSM地图",
      type: "osm",
      url: "https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png",
      iconImg: "./easy3d/images/baseMap/osm.png",
      show: false
    }
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
        }
       
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
          name: "安徽省",
          type: "geojson",
          url: "./data/anhuiMian.json",
          show: false,
          style: {
            polygon: {
              extrudedHeight: 10000,
              outline: false,
              clampToGround: false,
              color: "#4881a7",
              colorAlpha: 0.3,
              fill: true
            }
          }
        },

        {
          name: "安徽省市区",
          type: "geojson",
          url: "./data/anhuiShi.json",
          show: false,
          style: {
            polygon: {
              outline: true,
              outlineColor: "#ffffff",
              outlineColorAlpha: 1,
              outlineWidth: 3,
              extrudedHeight: undefined,
              clampToGround: false,
              color: "#4881a7",
              colorAlpha: 0.5,
              height: 10000,
              fill: false
            }
          }
        },
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
          url: "http://localhost/layer/world0-8/{z}/{x}/{y}.jpg",
        }

      ],
    },
    {
      name: "三维模型",
      type: "group",
      open: true,
      children: [
        {
          name: "石化企业",
          type: "3dtiles",
          url: "http://localhost/model/max-shihua/tileset.json",
          show: false,
          center: {
            z: 50,
          },
          maximumScreenSpaceError: 16,
        },
        {
          name: "大学",
          type: "3dtiles",
          url: "http://localhost/qinggu/qx-xuexiao/tileset.json",
          show: false,
          center: {
            z: 30,
          },
          maximumScreenSpaceError: 1,
        }

      ],
    }

  ],


};
