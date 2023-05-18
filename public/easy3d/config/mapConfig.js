window.mapConfig = {
  baseServer: "http://localhost:1119/",
  map: {
    cameraView: {
      "x": 119.03222038317756,
      "y": 33.5915693135117,
      "z": 107.98639676283688,
      "heading": 354.07486284134643,
      "pitch": -23.759409828465948,
      "roll": 0.000016592901764765016
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
    }
  ],
  operateLayers: [
    {
      name: "倾斜摄影（osgb）",
      type: "group",
      open: true,
      children: [
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
        }
      ]
    }

  ],


};
