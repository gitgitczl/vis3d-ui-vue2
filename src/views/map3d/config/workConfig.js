// 内置工具栏配置文件
export default {
    "panel": {
        create: true,
        visible: true
    }, // 是否创建面板
    "tools": [
        {
            "name": "图上标绘",
            "show": false,
            "toolName": "plot",
            "position": {
                "top": 60,
                "left": 10
            },
            "size": {
                "width": 380,
                "height": 480
            },
            "closeDisableSelf": false,
            "closeDisableExcept": [
                "plotStyle"
            ],
            "openDisableAnothers": true
        },
        {
            "name": "标绘属性",
            "show": false,
            "toolName": "plotStyle",
            "position": {
                "bottom": 40,
                "right": 10
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
            "toolName": "measure",
            "position": {
                "top": 60,
                "left": 10
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
            "toolName": "baseMap",
            "position": {
                "top": 60,
                "right": 120
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
            "toolName": "help",
            "position": {
                "top": 60,
                "left": 10
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
            "toolName": "layers",
            "position": {
                "top": 60,
                "left": 10
            },
            "size": {
                "width": 300,
                "height": 600
            },
            "closeDisableSelf": false,
            "openDisableAnothers": false,
            "disableByOthers": false
        },
        {
            "name": "空间分析",
            "show": false,
            "toolName": "analysis",
            "position": {
                "top": 60,
                "left": 10
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
            "toolName": "coordinate",
            "position": {
                "top": 60,
                "left": 10
            },
            "size": {
                "width": 350,
                "height": 300
            },
            "closeDisableSelf": true,
            "openDisableAnothers": false
        },
        {
            "name": "分屏对比",
            "show": false,
            "size": {
                "width": 350,
                "height": 180
            },
            "position": {
                "top": 40,
                "right": 80
            },
            "toolName": "twoScreen",
            "closeDisableSelf": true,
            "openDisableAnothers": false
        },
        {
            "name": "区域导航",
            "show": false,
            "toolName": "region",
            "closeDisableSelf": true,
            "openDisableAnothers": false,
            "size": {
                "height": 120,
                "width": 300
            },
            "position": {
                "top": 60,
                "left": 10
            },
        },
        {
            "name": "路径规划",
            "show": false,
            "toolName": "pathPlan",
            "position": {
                "top": 60,
                "left": 10
            },
            "closeDisableSelf": true,
            "openDisableAnothers": false
        },
        {
            "name": "视角书签",
            "show": false,
            "toolName": "viewBook",
            "closeDisableSelf": true,
            "openDisableAnothers": false,
            "position": {
                "top": 60,
                "left": 10
            }
        },
        {
            "name": "飞行漫游",
            "show": false,
            "toolName": "roam",
            "closeDisableSelf": true,
            "openDisableAnothers": true,
            "closeDisableExcept": [
                "roamStyle"
            ],
            "position": {
                "top": 60,
                "left": 10
            }
        },
        {
            "name": "漫游属性",
            "show": false,
            "toolName": "roamStyle",
            "closeDisableSelf": false,
            "openDisableAnothers": false,
            "position": {
                "bottom": 40,
                "right": 10
            },
            "size": {
                "width": 350,
                "height": 400
            }
        },
        {
            "name": "卷帘对比",
            "show": false,
            "toolName": "layerSplit",
            "closeDisableSelf": true,
            "openDisableAnothers": false,
            "position": {
                "top": 60,
                "left": 10
            },
            "size": {
                "width": 350,
                "height": 180
            }
        },
        {
            "name": "单体化",
            "show": false,
            "toolName": "monomer",
            "closeDisableSelf": true,
            "openDisableAnothers": false,
            "size": {
                "width": 350,
                "height": 320
            },
            "position": {
                "top": 60,
                "left": 10
            }
        }
    ]
}