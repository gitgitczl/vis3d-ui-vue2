
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
    nowRoamAttr: {}, // 飞行漫游属性
    isToolOpen: true, // 工具栏是否打开
    baseLayers : {}, // 监听底图
    operateLayers :{}, // 监听业务图层
    plotEntityObjId : "", // 当前编辑的对象id
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

    setNowRoamAttr: (state, nowRoamAttr) => {
      state.nowRoamAttr = nowRoamAttr
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

    setPlotEntityObjId : (state, plotEntityObjId) => {
      state.plotEntityObjId = plotEntityObjId
    },

  },
  actions: {
  },
  modules: {

  }
}

export default easy3dStore;
