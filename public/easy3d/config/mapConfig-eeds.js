

window.baseServer = "http://10.33.136.4:8000/";
window.mapConfig = {
    baseServer: "http://localhost:1119/",
    map: {
        cameraView: {
            "x": 109.79009225909012,
            "y": 39.58401350984549,
            "z": 3012.4173347070664,
            "heading": 336.73215448541265,
            "pitch": -39.23544186730456,
            "roll": 0.0006719978882243381,
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
            show: false,
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
                    name: "康巴什地图",
                    type: "xyz",
                    show: false,
                    url: "http://10.33.136.4:8000/data/layer/kangbashiqu/{z}/{x}/{y}.png",
                },
                {
                    name: "伊金霍洛旗地图",
                    type: "xyz",
                    show: false,
                    url: "http://10.33.136.4:8000/data/layer/yijinghuoluoqi/{z}/{x}/{y}.png",
                },
                {
                    name: "东胜区地图",
                    type: "xyz",
                    show: false,
                    url: "http://10.33.136.4:8000/data/layer/dongshengqu/{z}/{x}/{y}.png",
                },
            ],
        },
        {
            name: "三维大场景模型",
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
            name: "康巴什区三维模型",
            type: "group",
            open: false,
            children: [
                {
                    name: "康巴什区模型1",
                    type: "3dtiles",
                    url: "http://10.33.136.4:8000/data/model/eeds-kbs2023/1/tileset.json",
                    show: true,
                    maximumScreenSpaceError: 12,
                    maximumMemoryUsage: 512,
                    center: {
                        z: 45,
                    },
                    view: {
                        "x": 109.79009225909012,
                        "y": 39.58401350984549,
                        "z": 3012.4173347070664,
                        "heading": 336.73215448541265,
                        "pitch": -39.23544186730456,
                        "roll": 0.0006719978882243381,

                    }
                },
                {
                    name: "康巴什区模型2",
                    type: "3dtiles",
                    url: "http://10.33.136.4:8000/data/model/eeds-kbs2023/2/tileset.json",
                    show: false,
                    maximumScreenSpaceError: 12,
                    maximumMemoryUsage: 512,
                    center: {
                        z: 45,
                    },
                    view: {
                        "x": 109.82478582518483,
                        "y": 39.61498436747165,
                        "z": 3784.5441404376156,
                        "heading": 354.6607877610641,
                        "pitch": -51.44877105270287,
                        "roll": 359.998861414152,

                    }
                },
                {
                    name: "康巴什区模型3",
                    type: "3dtiles",
                    url: "http://10.33.136.4:8000/data/model/eeds-kbs2023/3/tileset.json",
                    show: false,
                    maximumScreenSpaceError: 12,
                    maximumMemoryUsage: 512,
                    center: {
                        z: 45,
                    },
                    view: {
                        "x": 109.83746954191203,
                        "y": 39.58249147853956,
                        "z": 4711.2462917079765,
                        "heading": 354.6607830775505,
                        "pitch": -51.44881098820715,
                        "roll": 359.9988674029056,

                    }
                },
            ],
        },
        {
            name: "伊金霍洛旗三维模型",
            type: "group",
            open: false,
            children: [
                {
                    name: "伊金霍洛旗模型1",
                    type: "3dtiles",
                    url: "http://10.33.136.4:8000/data/model/eeds-kbs2023/4/tileset.json",
                    show: false,
                    maximumScreenSpaceError: 12,
                    maximumMemoryUsage: 512,
                    center: {
                        z: 45,
                    },
                    view: {
                        "x": 109.83281769629306,
                        "y": 39.5595954549198,
                        "z": 4861.696801806762,
                        "heading": 354.66078052083304,
                        "pitch": -51.448832788849,
                        "roll": 359.9988706721481,

                    }
                },
                {
                    name: "伊金霍洛旗模型2",
                    type: "3dtiles",
                    url: "http://10.33.136.4:8000/data/model/eeds-kbs2023/5/tileset.json",
                    show: false,
                    maximumScreenSpaceError: 12,
                    maximumMemoryUsage: 512,
                    center: {
                        z: 45,
                    },
                    view: {

                        "x": 109.80304944457869,
                        "y": 39.560860843306855,
                        "z": 2445.0126426285456,
                        "heading": 337.2132350259972,
                        "pitch": -35.156890039719805,
                        "roll": 0.0019405228468415223,

                    }
                },
                {
                    name: "伊金霍洛旗模型3",
                    type: "3dtiles",
                    url: "http://10.33.136.4:8000/data/model/eeds-kbs2023/6/tileset.json",
                    show: false,
                    maximumScreenSpaceError: 12,
                    maximumMemoryUsage: 512,
                    center: {
                        z: 45,
                    },
                    view: {
                        "x": 109.77922918184036,
                        "y": 39.550163789101774,
                        "z": 2721.3391483116598,
                        "heading": 337.2132314347941,
                        "pitch": -35.15690217759341,
                        "roll": 0.0019467595506655279,

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
                    url: "http://10.33.136.4:8000/data/model/eeds-dsqnew/1_3dtiles/tileset.json",
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

                    }
                },
                {
                    name: "东胜区模型2",
                    type: "3dtiles",
                    url: "http://10.33.136.4:8000/data/model/eeds-dsqnew/module2/tileset.json",
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

                    }
                },
                {
                    name: "东胜区模型3",
                    type: "3dtiles",
                    url: "http://10.33.136.4:8000/data/model/eeds-dsqnew/module3/tileset.json",
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

                    }
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
                    },
                    view: {
                        "x": 109.98464735801883,
                        "y": 39.79822684641184,
                        "z": 2267.5819124250647,
                        "heading": 354.8604155004149,
                        "pitch": -20.54662458153191,
                        "roll": 0.0016318925750000138

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
                    },
                    view: {
                        "x": 109.98464735801883,
                        "y": 39.79822684641184,
                        "z": 2267.5819124250647,
                        "heading": 354.8604155004149,
                        "pitch": -20.54662458153191,
                        "roll": 0.0016318925750000138

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
        }, {
            name: "BIM测试三维模型",
            type: "group",
            open: false,
            children: [
                {
                    name: "乌兰木伦河3号桥模型1",
                    type: "3dtiles",
                    url: "http://10.33.136.4:8000/data/model/BIM/dq-bim/tileset.json",
                    show: false,
                    maximumScreenSpaceError: 12,
                    maximumMemoryUsage: 512,
                    center: {
                        x: 109.775162,
                        y: 39.581811,
                        z: 25,
                    },
                    view: {
                        "x": 109.77403108696133,
                        "y": 39.57847997246558,
                        "z": 1447.5690364950574,
                        "heading": 18.536906021672348,
                        "pitch": -12.75178120596453,
                        "roll": 359.9993775739885


                    }
                },
                {
                    name: "疾病预防大楼bim模型",
                    type: "3dtiles",
                    url: "http://10.33.136.4:8000/data/model/BIM/jbfydl-bim/tileset.json",
                    show: false,
                    maximumScreenSpaceError: 12,
                    maximumMemoryUsage: 512,
                    center: {
                        x: 109.792714,
                        y: 39.605979,
                        z: 1320,
                    },
                    view: {
                        "x": 109.79268656518084,
                        "y": 39.604615005315516,
                        "z": 1359.4670263893229,
                        "heading": 0.11973044582312688,
                        "pitch": -13.883485432247321,
                        "roll": 0.00002397713119429211

                    }
                },
            ],
        }
    ],
};
