window.mapConfig = {
  baseServer: "http://localhost:1119/",
  map: {
    cameraView:{
      "x" : 117.11652300702349,
      "y" : 31.822531554698113,
      "z" : 249.22424831865297,
      "heading" : 92.73801048659865,
      "pitch" : -78.63126631978243,
      "roll" : 359.9999069885447,
      "duration" : 0
      },
    errorRender: false, // 是否开启崩溃刷新
    debugShowFramesPerSecond : false, // 是否显示帧数
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
    }
  ],
  operateLayers: [
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
          name: "全国地图（深色）",
          type: "xyz",
          show: false,
          url: "http://8.142.20.247:25548/layer/chengdu/{z}/{x}/{y}.png",
        }
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
