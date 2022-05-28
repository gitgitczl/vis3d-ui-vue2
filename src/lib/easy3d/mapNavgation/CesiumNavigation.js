/* eslint-disable no-unused-vars */
/* let Cesium = require('cesium/Cesium.js'); */
import { defined, Event, knockout, DeveloperError } from 'cesium/Cesium.js'
import registerKnockoutBindings from './core/registerKnockoutBindings'
import DistanceLegendViewModel from './viewModels/DistanceLegendViewModel'
import NavigationViewModel from './viewModels/NavigationViewModel'

var CesiumEvent = Event

/**
 * @alias CesiumNavigation
 * @constructor
 *
 * @param {Viewer|CesiumWidget} viewerCesiumWidget The Viewer or CesiumWidget instance
 */
var CesiumNavigation = function (viewerCesiumWidget) {
  initialize.apply(this, arguments)

  this._onDestroyListeners = []
}

CesiumNavigation.prototype.distanceLegendViewModel = undefined
CesiumNavigation.prototype.navigationViewModel = undefined
CesiumNavigation.prototype.navigationDiv = undefined
CesiumNavigation.prototype.distanceLegendDiv = undefined
CesiumNavigation.prototype.terria = undefined
CesiumNavigation.prototype.container = undefined
CesiumNavigation.prototype._onDestroyListeners = undefined
CesiumNavigation.prototype._navigationLocked = false

CesiumNavigation.prototype.setNavigationLocked = function (locked) {
  this._navigationLocked = locked
  this.navigationViewModel.setNavigationLocked(this._navigationLocked)
}

CesiumNavigation.prototype.getNavigationLocked = function () {
  return this._navigationLocked
}

CesiumNavigation.prototype.destroy = function () {
  if (defined(this.navigationViewModel)) {
    this.navigationViewModel.destroy()
  }
  if (defined(this.distanceLegendViewModel)) {
    this.distanceLegendViewModel.destroy()
  }

  if (defined(this.navigationDiv)) {
    this.navigationDiv.parentNode.removeChild(this.navigationDiv)
  }
  delete this.navigationDiv

  if (defined(this.distanceLegendDiv)) {
    this.distanceLegendDiv.parentNode.removeChild(this.distanceLegendDiv)
  }
  delete this.distanceLegendDiv

  if (defined(this.container)) {
    this.container.parentNode.removeChild(this.container)
  }
  delete this.container

  for (var i = 0; i < this._onDestroyListeners.length; i++) {
    this._onDestroyListeners[i]()
  }
}

CesiumNavigation.prototype.addOnDestroyListener = function (callback) {
  if (typeof callback === 'function') {
    this._onDestroyListeners.push(callback)
  }
}

/**
 * @param {Viewer|CesiumWidget} viewerCesiumWidget The Viewer or CesiumWidget instance
 * @param options
 */
function initialize(viewerCesiumWidget, options) {
  if (!defined(viewerCesiumWidget)) {
    throw new DeveloperError('CesiumWidget or Viewer is required.')
  }

  var cesiumWidget = defined(viewerCesiumWidget.cesiumWidget) ? viewerCesiumWidget.cesiumWidget : viewerCesiumWidget

  // 构件导航球容器
  var container = document.createElement('div')
  container.className = 'cesium-widget-cesiumNavigationContainer'
  cesiumWidget.container.appendChild(container)

  this.terria = viewerCesiumWidget
  this.terria.options = (defined(options)) ? options : {}
  this.terria.afterWidgetChanged = new CesiumEvent()
  this.terria.beforeWidgetChanged = new CesiumEvent()
  this.container = container
  registerKnockoutBindings()


  this.distanceLegendDiv = document.createElement('div')
  container.appendChild(this.distanceLegendDiv)
  this.distanceLegendDiv.setAttribute('id', 'distanceLegendDiv')
  this.distanceLegendViewModel = DistanceLegendViewModel.create({
    container: this.distanceLegendDiv,
    terria: this.terria,
    mapElement: container,
    enableDistanceLegend: this.terria.options.enableDistanceLegend == undefined ? true : this.terria.options.enableDistanceLegend
  })

  this.navigationDiv = document.createElement('div')
  this.navigationDiv.setAttribute('id', 'navigationDiv')
  container.appendChild(this.navigationDiv)
  // Create the navigation controls.
  this.navigationViewModel = NavigationViewModel.create({
    container: this.navigationDiv,
    terria: this.terria,
    enableZoomControls: this.terria.options.enableZoomControls == undefined ? true : this.terria.options.enableZoomControls,
    enableCompass: this.terria.options.enableCompass == undefined ? true : this.terria.options.enableCompass
  })
}

export default CesiumNavigation
