window.workConfig = {
    "panel": true, // 是否创建面板
    "tools": [
        {
            "name": "图上标绘",
            "show": false,
            "workName": "plot",
            "position": {
                "top": 100,
                "left": 40
            },
            "size": {
                "width": 350,
                "height": 420
            },
            "closeDisableSelf": true,
            "closeDisableExcept": [
                "plotStyle"
            ],
            "openDisableAnothers": true
        },
        {
            "name": "标绘属性",
            "show": false,
            "workName": "plotStyle",
            "position": {
                "top": 500,
                "left": 1500
            },
            "size": {
                "width": 350,
                "height": 400
            },
            "closeDisableSelf": true,
            "closeDisableExcept": [],
            "openDisableAnothers": false
        },
        {
            "name": "图上量算",
            "show": false,
            "workName": "measure",
            "position": {
                "top": 200,
                "left": 20
            },
            "size": {
                "width": 352,
                "height": 380
            },
            "closeDisableSelf": true,
            "openDisableAnothers": true
        },
        {
            "name": "底图设置",
            "show": false,
            "workName": "baseMap",
            "position": {
                "top": 200,
                "left": 20
            },
            "size": {
                "width": 350,
                "height": 300
            },
            "closeDisableSelf": false,
            "openDisableAnothers": false
        },
        {
            "name": "帮助说明",
            "show": false,
            "workName": "help",
            "position": {
                "top": 200,
                "left": 20
            },
            "size": {
                "width": 350,
                "height": 200
            },
            "closeDisableSelf": false,
            "openDisableAnothers": false
        },
        {
            "name": "图层管理",
            "show": false,
            "workName": "layers",
            "position": {
                "top": 200,
                "left": 20
            },
            "size": {
                "width": 300,
                "height": 600
            },
            "closeDisableSelf": false,
            "openDisableAnothers": false,
            "disableByOthers" : false
        },
        {
            "name": "空间分析",
            "show": false,
            "workName": "analysis",
            "position": {
                "top": 200,
                "left": 20
            },
            "size": {
                "width": 350,
                "height": 400
            },
            "closeDisableSelf": false,
            "openDisableAnothers": false
        },
        {
            "name": "坐标定位",
            "show": false,
            "workName": "coordinate",
            "position": {
                "top": 200,
                "left": 20
            },
            "closeDisableSelf": true,
            "openDisableAnothers": false
        },
        {
            "name": "图层对比",
            "show": false,
            "workName": "twoScreen",
            "closeDisableSelf": true,
            "openDisableAnothers": false
        },
        {
            "name": "区域导航",
            "show": false,
            "workName": "region",
            "closeDisableSelf": true,
            "openDisableAnothers": false,
            "size": {
                "height": 120,
                "width": 300
            }
        },
        {
            "name": "路径规划",
            "show": false,
            "workName": "pathPlan",
            "position": {
                "top": 200,
                "left": 20
            },
            "closeDisableSelf": true,
            "openDisableAnothers": false
        },
        {
            "name": "视角书签",
            "show": false,
            "workName": "viewBook",
            "closeDisableSelf": true,
            "openDisableAnothers": false
        },
        {
            "name": "飞行漫游",
            "show": false,
            "workName": "roam",
            "closeDisableSelf": true,
            "openDisableAnothers": true,
            "closeDisableExcept": [
                "roamStyle"
            ]
        },
        {
            "name": "漫游属性",
            "show": false,
            "workName": "roamStyle",
            "closeDisableSelf": false,
            "openDisableAnothers": false,
            "position": {
                "top": 500,
                "left": 1500
            },
            "size": {
                "width": 350,
                "height": 400
            }
        },
        {
            "name": "卷帘对比",
            "show": false,
            "workName": "layerSplit",
            "closeDisableSelf": true,
            "openDisableAnothers": false,
            "position": {
                "top": 500,
                "left": 1500
            },
            "size": {
                "width": 350,
                "height": 400
            }
        },
        {
            "name": "单体化",
            "show": false,
            "workName": "monomer",
            "closeDisableSelf": true,
            "openDisableAnothers": false,
            "size": {
                "width": 350,
                "height": 320
            }
        }
    ]
}