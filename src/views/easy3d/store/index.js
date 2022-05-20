
/* 模块间的状态管理 */
const easy3dStore = {
  state: {
    operateTool: {}, // 当前打开的工具条
    openBottomLnglatTool: true, // 底图坐标提示栏是否打开
    isZoomIn: false, // 是否点击放大按钮
    isZoomOut: false, // 是否点击缩小按钮
    isReset: false, // 是否点击重置按钮
    isOpenOverviewMap: false, // 是否打开鹰眼图.
    nowPlotStyleAttr: {},
    nowRoamViewType: -1, // 飞行漫游属性
    isPrintMap: false, // 是否打印地图
    isToolOpen: true, // 工具栏是否打开
    operateLayerVisible: {}, // 图层的显示隐藏
    baseLayers : {}, // 监听底图
    operateLayers :{} // 监听业务图层

  },
  mutations: {
    setOperateTool: (state, operateTool) => {
      state.operateTool = operateTool
    },
    setOpenBottomLnglatTool: (state, openBottomLnglatTool) => {
      state.openBottomLnglatTool = openBottomLnglatTool
    },
    setIsZoomIn: (state, isZoomIn) => {
      state.isZoomIn = isZoomIn
    },
    setIsZoomOut: (state, isZoomOut) => {
      state.isZoomOut = isZoomOut
    },
    setIsOpenOverviewMap: (state, isOpenOverviewMap) => {
      state.isOpenOverviewMap = isOpenOverviewMap
    },

    setNowPlotStyleAttr: (state, nowPlotStyleAttr) => {
      state.nowPlotStyleAttr = nowPlotStyleAttr
    },

    setNowRoamViewType: (state, nowRoamViewType) => {
      state.nowRoamViewType = nowRoamViewType
    },

    setIsPrintMap: (state, isPrintMap) => {
      state.isPrintMap = isPrintMap
    },

    setOperateLayerVisible: (state, operateLayerVisible) => {
      state.operateLayerVisible = operateLayerVisible
    },

    setIsToolOpen: (state, isToolOpen) => {
      state.isToolOpen = isToolOpen
    },
    setBaseLayers : (state, baseLayers) => {
      state.baseLayers = baseLayers
    },

    setOperateLayers : (state, operateLayers) => {
      state.operateLayers = operateLayers
    },

  },
  actions: {
  },
  modules: {

  }
}

export default easy3dStore;
