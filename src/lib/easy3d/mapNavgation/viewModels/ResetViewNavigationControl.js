 let Cesium = require('cesium/Cesium.js');
let { defined, Camera, Rectangle, Cartographic ,Math} = Cesium;
import svgReset from '../svgPaths/svgReset'
import NavigationControl from './NavigationControl'

/**
 * The model for a zoom in control in the navigation control tool bar
 *
 * @alias ResetViewNavigationControl
 * @constructor
 * @abstract
 *
 * @param {Terria} terria The Terria instance.
 */
var ResetViewNavigationControl = function (terria) {
  NavigationControl.apply(this, arguments)

  /**
   * Gets or sets the name of the control which is set as the control's title.
   * This property is observable.
   * @type {String}
   */
  this.name = '重置视图'
  this.navigationLocked = false

  /**
   * Gets or sets the svg icon of the control.  This property is observable.
   * @type {Object}
   */
  this.svgIcon = svgReset

  /**
   * Gets or sets the height of the svg icon.  This property is observable.
   * @type {Integer}
   */
  this.svgHeight = 15

  /**
   * Gets or sets the width of the svg icon.  This property is observable.
   * @type {Integer}
   */
  this.svgWidth = 15

  /**
   * Gets or sets the CSS class of the control. This property is observable.
   * @type {String}
   */
  this.cssClass = 'navigation-control-icon-reset'
}

ResetViewNavigationControl.prototype = Object.create(NavigationControl.prototype)

ResetViewNavigationControl.prototype.setNavigationLocked = function (locked) {
  this.navigationLocked = locked
}

ResetViewNavigationControl.prototype.resetView = function () {
  // this.terria.analytics.logEvent('navigation', 'click', 'reset');
  if (this.navigationLocked) {
    return
  }
  var scene = this.terria.scene

  var sscc = scene.screenSpaceCameraController
  if (!sscc.enableInputs) {
    return
  }

  this.isActive = true

  var camera = scene.camera

  if (defined(this.terria.trackedEntity)) {
    // when tracking do not reset to default view but to default view of tracked entity
    var trackedEntity = this.terria.trackedEntity
    this.terria.trackedEntity = undefined
    this.terria.trackedEntity = trackedEntity
  } else {
    // reset to a default position or view defined in the options
    if (this.terria.options.view) {
      this.setCameraView(this.terria.options.view,this.terria)
    } else if (typeof camera.flyHome === 'function') {
      camera.flyHome(1)
    } else {
      camera.flyTo({ 'destination': Camera.DEFAULT_VIEW_RECTANGLE, 'duration': 1 })
    }
  }
  this.isActive = false
}

/**
 * When implemented in a derived class, performs an action when the user clicks
 * on this control
 * @abstract
 * @protected
 */
ResetViewNavigationControl.prototype.activate = function () {
  this.resetView()
}

ResetViewNavigationControl.prototype.setCameraView = function(obj, mapViewer) {
  var viewer = mapViewer || window.viewer;
  if (!obj) return;
  var position = obj.destination || Cesium.Cartesian3.fromDegrees(obj.x, obj.y, obj.z); // 兼容cartesian3和xyz
  viewer.camera.flyTo({
      destination: position,
      orientation: {
          heading: Cesium.Math.toRadians(obj.heading || 0),
          pitch: Cesium.Math.toRadians(obj.pitch || 0),
          roll: Cesium.Math.toRadians(obj.roll || 0)
      },
      duration: obj.duration === undefined ? 3 : obj.duration,
      complete: obj.complete
  });
}

export default ResetViewNavigationControl
