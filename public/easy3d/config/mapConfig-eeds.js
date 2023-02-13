// 视频投射配置
window.videoList = [
  {
    name: "党政大楼A座",
    lnglat: [109.776484, 39.608116, 1348.52],
    url: "/data/video/jk.mp4",
    videoId: "",
    distance: 60,
    heading: 30,
    pitch: 0
  },
  {
    name: "xx大楼",
    lnglat: [109.7766484, 39.608116, 1348.52],
    url: "/data/video/jk.mp4",
    videoId: "",
    distance: 60,
    heading: 60,
    pitch: 0
  }
]

window.baseServer = "http://10.33.136.4:8000/";
window.mapConfig = {
  baseServer: "http://localhost:1119/",
  map: {
    center: {
      z: 45,
    },
    cameraView: {
      "x": 109.78491121339628,
      "y": 39.59418588577863,
      "z": 1670.770607636914,
      "heading": 336.455360438797,
      "pitch": -23.844710366813693,
      "roll": 0.00021972616203269372,
      duration: 0,
    },
    brightness: 1.3, // 场景亮度
    debugShowFramesPerSecond: true,
    errorRender: true,
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
      url: "http://10.33.136.4:8000/data/terrain",
      show: true,
    },
  },
  baseLayers: [
    {
      name: "中国",
      type: "xyz",
      iconImg: "./easy3d/images/baseMap/arcgis.png",
      show: true,
      url: "http://10.33.136.4:8000/data/layer/china/{z}/{x}/{y}.jpg",
    },
  ],
  operateLayers: [
    {
      name: "影像",
      open: true,
      type: "group",
      children: [
        {
          name: "鄂尔多斯地图",
          type: "xyz",
          show: true,
          url: "http://10.33.136.4:8000/data/layer/erds1/{z}/{x}/{y}.png",
        },
        {
          name: "康巴什地图",
          type: "xyz",
          show: true,
          url: "http://10.33.136.4:8000/data/layer/kangbashiqu/{z}/{x}/{y}.png",
        },
        {
          name: "伊金霍洛旗地图",
          type: "xyz",
          show: true,
          url: "http://10.33.136.4:8000/data/layer/yijinghuoluoqi/{z}/{x}/{y}.png",
        },
        {
          name: "东胜区地图",
          type: "xyz",
          show: true,
          url: "http://10.33.136.4:8000/data/layer/dongshengqu/{z}/{x}/{y}.png",
        },
      ],
    },
    {
      name: "三维模型",
      type: "group",
      open: true,
      children: [
        {
          name: "东胜区大场景模型",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/eeds-dsq/tileset.json",
          show: false,
          maximumScreenSpaceError: 12,
          maximumMemoryUsage: 512,
          center: {
            z: 45,
          },
          view: {
            "x": 109.97186209486445,
            "y": 39.731936855245536,
            "z": 4325.120187124126,
            "heading": 1.3303417233926018,
            "pitch": -21.67830855703843,
            "roll": 359.9967777981803
          },
        },
        {
          name: "东胜区小模型测试数据",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/eeds-dsqlib1/tileset.json",
          show: false,
          maximumScreenSpaceError: 12,
          maximumMemoryUsage: 512,
          center: {
            z: 45,
          },
          view: {
            "x": 109.98464735801883,
            "y": 39.79822684641184,
            "z": 2267.5819124250647,
            "heading": 354.8604155004149,
            "pitch": -20.54662458153191,
            "roll": 0.0016318925750000138
          },
        },
        {
          name: "康巴什伊旗大场景模型",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/eeds-kbsnew/tileset.json",
          show: false,
          maximumScreenSpaceError: 12,
          maximumMemoryUsage: 512,
          center: {
            z: 45,
          },
          view: {
            "x": 109.78491121339628,
            "y": 39.59418588577863,
            "z": 1670.770607636914,
            "heading": 336.455360438797,
            "pitch": -23.844710366813693,
            "roll": 0.00021972616203269372,

          },
        },
      ],
    },
    {
      name: "康巴什伊旗三维模型",
      type: "group",
      open: false,
      children: [
        {
          name: "康巴什模型1",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/eeds-kbsx/11/tileset.json",
          show: false,
          maximumScreenSpaceError: 12,
          maximumMemoryUsage: 512,
          center: {
            z: 45,
          },
          view: {
            "x": 109.78491121339628,
            "y": 39.59418588577863,
            "z": 1670.770607636914,
            "heading": 336.455360438797,
            "pitch": -23.844710366813693,
            "roll": 0.00021972616203269372,

          }
        },
        {
          name: "康巴什模型2",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/eeds-kbsx/22/tileset.json",
          show: false,
          maximumScreenSpaceError: 12,
          maximumMemoryUsage: 512,
          center: {
            z: 45,
          },
          view: {
            "x": 109.78491121339628,
            "y": 39.59418588577863,
            "z": 1670.770607636914,
            "heading": 336.455360438797,
            "pitch": -23.844710366813693,
            "roll": 0.00021972616203269372,

          }
        },
        {
          name: "康巴什模型3",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/eeds-kbsx/33/tileset.json",
          show: false,
          maximumScreenSpaceError: 12,
          maximumMemoryUsage: 512,
          center: {
            z: 45,
          },
          view: {
            "x": 109.78491121339628,
            "y": 39.59418588577863,
            "z": 1670.770607636914,
            "heading": 336.455360438797,
            "pitch": -23.844710366813693,
            "roll": 0.00021972616203269372,

          }
        },
        {
          name: "康巴什模型4",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/eeds-kbsx/44/tileset.json",
          show: false,
          maximumScreenSpaceError: 12,
          maximumMemoryUsage: 512,
          center: {
            z: 45,
          },
          view: {
            "x": 109.78491121339628,
            "y": 39.59418588577863,
            "z": 1670.770607636914,
            "heading": 336.455360438797,
            "pitch": -23.844710366813693,
            "roll": 0.00021972616203269372,

          }
        },
        {
          name: "康巴什模型5",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/eeds-kbsx/55/tileset.json",
          show: false,
          maximumScreenSpaceError: 12,
          maximumMemoryUsage: 512,
          center: {
            z: 45,
          },
          view: {
            "x": 109.78491121339628,
            "y": 39.59418588577863,
            "z": 1670.770607636914,
            "heading": 336.455360438797,
            "pitch": -23.844710366813693,
            "roll": 0.00021972616203269372,

          }
        },
        {
          name: "康巴什模型6",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/eeds-kbsx/66/tileset.json",
          show: false,
          maximumScreenSpaceError: 12,
          maximumMemoryUsage: 512,
          center: {
            z: 45,
          },
          view: {
            "x": 109.78491121339628,
            "y": 39.59418588577863,
            "z": 1670.770607636914,
            "heading": 336.455360438797,
            "pitch": -23.844710366813693,
            "roll": 0.00021972616203269372,

          }
        },
        {
          name: "康巴什模型7",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/eeds-kbsx/77/tileset.json",
          show: false,
          maximumScreenSpaceError: 12,
          maximumMemoryUsage: 512,
          center: {
            z: 45,
          },
          view: {
            "x": 109.78491121339628,
            "y": 39.59418588577863,
            "z": 1670.770607636914,
            "heading": 336.455360438797,
            "pitch": -23.844710366813693,
            "roll": 0.00021972616203269372,

          }
        },
        {
          name: "康巴什模型8",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/eeds-kbsx/88/tileset.json",
          show: false,
          maximumScreenSpaceError: 12,
          maximumMemoryUsage: 512,
          center: {
            z: 45,
          },
          view: {
            "x": 109.78491121339628,
            "y": 39.59418588577863,
            "z": 1670.770607636914,
            "heading": 336.455360438797,
            "pitch": -23.844710366813693,
            "roll": 0.00021972616203269372,

          }
        },
        {
          name: "康巴什模型9",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/eeds-kbsx/99/tileset.json",
          show: false,
          maximumScreenSpaceError: 12,
          maximumMemoryUsage: 512,
          center: {
            z: 45,
          },
          view: {
            "x": 109.78491121339628,
            "y": 39.59418588577863,
            "z": 1670.770607636914,
            "heading": 336.455360438797,
            "pitch": -23.844710366813693,
            "roll": 0.00021972616203269372,

          }
        },
        {
          name: "康巴什模型10",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/eeds-kbsx/10/tileset.json",
          show: false,
          maximumScreenSpaceError: 12,
          maximumMemoryUsage: 512,
          center: {
            z: 45,
          },
          view: {
            "x": 109.78491121339628,
            "y": 39.59418588577863,
            "z": 1670.770607636914,
            "heading": 336.455360438797,
            "pitch": -23.844710366813693,
            "roll": 0.00021972616203269372,

          }
        },
        {
          name: "康巴什模型11",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/eeds-kbsx/11/tileset.json",
          show: false,
          maximumScreenSpaceError: 12,
          maximumMemoryUsage: 512,
          center: {
            z: 45,
          },
          view: {
            "x": 109.78491121339628,
            "y": 39.59418588577863,
            "z": 1670.770607636914,
            "heading": 336.455360438797,
            "pitch": -23.844710366813693,
            "roll": 0.00021972616203269372,

          }
        },
        {
          name: "康巴什模型12",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/eeds-kbsx/12/tileset.json",
          show: false,
          maximumScreenSpaceError: 12,
          maximumMemoryUsage: 512,
          center: {
            z: 45,
          },
          view: {
            "x": 109.78491121339628,
            "y": 39.59418588577863,
            "z": 1670.770607636914,
            "heading": 336.455360438797,
            "pitch": -23.844710366813693,
            "roll": 0.00021972616203269372,

          }
        },
        {
          name: "康巴什模型13",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/eeds-kbsx/13/tileset.json",
          show: true,
          maximumScreenSpaceError: 12,
          maximumMemoryUsage: 512,
          center: {
            z: 45,
          },
          view: {
            "x": 109.78491121339628,
            "y": 39.59418588577863,
            "z": 1670.770607636914,
            "heading": 336.455360438797,
            "pitch": -23.844710366813693,
            "roll": 0.00021972616203269372,

          }
        },
      ],
    },
    {
      name: "东胜区三维模型",
      type: "group",
      open: false,
      children: [
        {
          name: "东胜区模型1",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/eeds-dsqnew/module1/tileset.json",
          show: false,
          maximumScreenSpaceError: 1
        },
        {
          name: "东胜区模型2",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/eeds-dsqnew/module2/tileset.json",
          show: false,
          maximumScreenSpaceError: 1
        },
        {
          name: "东胜区模型3",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/eeds-dsqnew/module3/tileset.json",
          show: false,
          maximumScreenSpaceError: 12
          
        },
        {
          name: "东胜区模型4",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/eeds-dsqnew/module4/tileset.json",
          show: false,
          maximumScreenSpaceError: 12,
          maximumMemoryUsage: 512,
          center: {
            z: 45,
          }
        },
        {
          name: "东胜区模型5",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/eeds-dsqnew/module5/tileset.json",
          show: false,
          maximumScreenSpaceError: 12,
          maximumMemoryUsage: 512,
          center: {
            z: 45,
          }
        }
      ],
    }, {
      name: "党政大楼精细三维模型",
      type: "group",
      open: false,
      children: [
        {
          name: "党政大楼模型1",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/DZDL3dtiles/3dtiles/tileset.json",
          show: false,
          maximumScreenSpaceError: 12,
          maximumMemoryUsage: 512,
          center: {
            z: 65,
          },
          view: {
            "x": 109.78039071839373,
            "y": 39.601761652566154,
            "z": 1673.5436136827823,
            "heading": 336.45536215088663,
            "pitch": -23.844701477002065,
            "roll": 0.00021549103220949698


          }
        },
        {
          name: "党政大楼模型2",
          type: "3dtiles",
          url: "http://10.33.136.4:8000/data/model/DZDL3dtiles/3dtilesshu/tileset.json",
          show: false,
          maximumScreenSpaceError: 12,
          maximumMemoryUsage: 512,
          center: {
            z: 65,
          },
          view: {
            "x": 109.78039071839373,
            "y": 39.601761652566154,
            "z": 1673.5436136827823,
            "heading": 336.45536215088663,
            "pitch": -23.844701477002065,
            "roll": 0.00021549103220949698

          }
        },
      ],
    }
    /* , {
        name: "东胜区三维模型",
        type: "group",
        open: false,
        children: [
          {
            name: "东胜区模型1",
            type: "3dtiles",
            url: "http://10.33.136.4:8000/data/model/eeds-kbsx/22/tileset.json",
            show: false,
            maximumScreenSpaceError: 16,
            maximumMemoryUsage: 512,
            center: {
              z: 45,
            },
            view: {
              "x": 109.7884118470029,
              "y": 39.590384952017764,
              "z": 1565.7899788867958,
              "heading": 331.1978494043747,
              "pitch": -8.45296669256617,
              "roll": 0.00043210090111595544,
  
            },
          },
          {
            name: "东胜区模型2",
            type: "3dtiles",
            url: "http://10.33.136.4:8000/data/model/eeds-kbsx/22/tileset.json",
            show: false,
            maximumScreenSpaceError: 12,
            maximumMemoryUsage: 512,
            center: {
              z: 45,
            },
            view: {
              "x": 109.7884118470029,
              "y": 39.590384952017764,
              "z": 1565.7899788867958,
              "heading": 331.1978494043747,
              "pitch": -8.45296669256617,
              "roll": 0.00043210090111595544,
  
            },
          },
          {
            name: "东胜区模型3",
            type: "3dtiles",
            url: "http://10.33.136.4:8000/data/model/eeds-kbsx/33/tileset.json",
            show: false,
            maximumScreenSpaceError: 12,
            maximumMemoryUsage: 512,
            center: {
              z: 45,
            },
            view: {
              "x": 109.7884118470029,
              "y": 39.590384952017764,
              "z": 1565.7899788867958,
              "heading": 331.1978494043747,
              "pitch": -8.45296669256617,
              "roll": 0.00043210090111595544,
  
            },
          },
          {
            name: "东胜区模型4",
            type: "3dtiles",
            url: "http://10.33.136.4:8000/data/model/eeds-kbsx/44/tileset.json",
            show: false,
            maximumScreenSpaceError: 12,
            maximumMemoryUsage: 512,
            center: {
              z: 45,
            },
            view: {
              "x": 109.7884118470029,
              "y": 39.590384952017764,
              "z": 1565.7899788867958,
              "heading": 331.1978494043747,
              "pitch": -8.45296669256617,
              "roll": 0.00043210090111595544,
  
            },
          },
          {
            name: "东胜区模型5",
            type: "3dtiles",
            url: "http://10.33.136.4:8000/data/model/eeds-kbsx/55/tileset.json",
            show: false,
            maximumScreenSpaceError: 12,
            maximumMemoryUsage: 512,
            center: {
              z: 45,
            },
            view: {
              "x": 109.7884118470029,
              "y": 39.590384952017764,
              "z": 1565.7899788867958,
              "heading": 331.1978494043747,
              "pitch": -8.45296669256617,
              "roll": 0.00043210090111595544,
  
            },
          },
          {
            name: "东胜区模型6",
            type: "3dtiles",
            url: "http://10.33.136.4:8000/data/model/eeds-kbsx/66/tileset.json",
            show: false,
            maximumScreenSpaceError: 12,
            maximumMemoryUsage: 512,
            center: {
              z: 45,
            },
            view: {
              "x": 109.7884118470029,
              "y": 39.590384952017764,
              "z": 1565.7899788867958,
              "heading": 331.1978494043747,
              "pitch": -8.45296669256617,
              "roll": 0.00043210090111595544,
  
            },
          },
          {
            name: "东胜区模型7",
            type: "3dtiles",
            url: "http://10.33.136.4:8000/data/model/eeds-kbsx/77/tileset.json",
            show: false,
            maximumScreenSpaceError: 12,
            maximumMemoryUsage: 512,
            center: {
              z: 45,
            },
            view: {
              "x": 109.7884118470029,
              "y": 39.590384952017764,
              "z": 1565.7899788867958,
              "heading": 331.1978494043747,
              "pitch": -8.45296669256617,
              "roll": 0.00043210090111595544,
  
            },
          },
          {
            name: "东胜区模型8",
            type: "3dtiles",
            url: "http://10.33.136.4:8000/data/model/eeds-kbsx/88/tileset.json",
            show: false,
            maximumScreenSpaceError: 12,
            maximumMemoryUsage: 512,
            center: {
              z: 45,
            },
            view: {
              "x": 109.7884118470029,
              "y": 39.590384952017764,
              "z": 1565.7899788867958,
              "heading": 331.1978494043747,
              "pitch": -8.45296669256617,
              "roll": 0.00043210090111595544,
  
            },
          },
          {
            name: "东胜区模型9",
            type: "3dtiles",
            url: "http://10.33.136.4:8000/data/model/eeds-kbsx/99/tileset.json",
            show: false,
            maximumScreenSpaceError: 12,
            maximumMemoryUsage: 512,
            center: {
              z: 45,
            },
            view: {
              "x": 109.7884118470029,
              "y": 39.590384952017764,
              "z": 1565.7899788867958,
              "heading": 331.1978494043747,
              "pitch": -8.45296669256617,
              "roll": 0.00043210090111595544,
  
            },
          },
          {
            name: "东胜区模型10",
            type: "3dtiles",
            url: "http://10.33.136.4:8000/data/model/eeds-kbsx/10/tileset.json",
            show: false,
            maximumScreenSpaceError: 12,
            maximumMemoryUsage: 512,
            center: {
              z: 45,
            },
            view: {
              "x": 109.7884118470029,
              "y": 39.590384952017764,
              "z": 1565.7899788867958,
              "heading": 331.1978494043747,
              "pitch": -8.45296669256617,
              "roll": 0.00043210090111595544,
  
            },
          },
          {
            name: "东胜区模型11",
            type: "3dtiles",
            url: "http://10.33.136.4:8000/data/model/eeds-kbsx/11/tileset.json",
            show: false,
            maximumScreenSpaceError: 12,
            maximumMemoryUsage: 512,
            center: {
              z: 45,
            },
            view: {
              "x": 109.7884118470029,
              "y": 39.590384952017764,
              "z": 1565.7899788867958,
              "heading": 331.1978494043747,
              "pitch": -8.45296669256617,
              "roll": 0.00043210090111595544,
  
            },
          },
          {
            name: "东胜区模型12",
            type: "3dtiles",
            url: "http://10.33.136.4:8000/data/model/eeds-kbsx/12/tileset.json",
            show: false,
            maximumScreenSpaceError: 12,
            maximumMemoryUsage: 512,
            center: {
              z: 45,
            },
            view: {
              "x": 109.7884118470029,
              "y": 39.590384952017764,
              "z": 1565.7899788867958,
              "heading": 331.1978494043747,
              "pitch": -8.45296669256617,
              "roll": 0.00043210090111595544,
  
            },
          },
          {
            name: "东胜区模型13",
            type: "3dtiles",
            url: "http://10.33.136.4:8000/data/model/eeds-kbsx/13/tileset.json",
            show: false,
            maximumScreenSpaceError: 12,
            maximumMemoryUsage: 512,
            center: {
              z: 45,
            },
            view: {
              "x": 109.7884118470029,
              "y": 39.590384952017764,
              "z": 1565.7899788867958,
              "heading": 331.1978494043747,
              "pitch": -8.45296669256617,
              "roll": 0.00043210090111595544,
  
            },
          },
        ],
      }, {
        name: "三维历史模型",
        type: "group",
        open: false,
        children: [
          {
            name: "康巴什历史模型1",
            type: "3dtiles",
            url: "http://10.33.136.4:8000/data/model/eeds-block1/tileset.json",
            show: false,
            maximumScreenSpaceError: 1,
            maximumMemoryUsage: 256,
            center: {
              z: 34,
            },
          },
          {
            name: "康巴什历史模型2",
            type: "3dtiles",
            url: "http://10.33.136.4:8000/data/model/eeds-block2/tileset.json",
            show: false,
            maximumScreenSpaceError: 1,
            maximumMemoryUsage: 256,
            center: {
              z: 34,
            },
          },
          {
            name: "康巴什历史模型3",
            type: "3dtiles",
            url: "http://10.33.136.4:8000/data/model/eeds-block3/tileset.json",
            show: false,
            maximumScreenSpaceError: 1,
            maximumMemoryUsage: 256,
            center: {
              z: 34,
            },
          },
        ],
      }, */
  ],
};
