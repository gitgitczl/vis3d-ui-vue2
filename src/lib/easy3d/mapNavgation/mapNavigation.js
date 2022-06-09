import { defined, DeveloperError } from 'cesium/Cesium.js'
import CesiumNavigation from './CesiumNavigation'
import './styles/cesium-navigation.css'



function mapNavigation(viewer, options) {
  if (!defined(viewer)) {
    throw new DeveloperError('viewer is required.')
  }

  var cesiumNavigation = init(viewer, options)

  cesiumNavigation.addOnDestroyListener((function (viewer) {
    return function () {
      delete viewer.cesiumNavigation
    }
  })(viewer))

  Object.defineProperties(viewer, {
    cesiumNavigation: {
      configurable: true,
      get: function () {
        return viewer.cesiumWidget.cesiumNavigation
      }
    }
  })
}

/**
 *
 * @param {CesiumWidget} cesiumWidget The cesium widget instance.
 * @param {{}} options The options.
 */
mapNavigation.mixinWidget = function (cesiumWidget, options) {
  return init.apply(undefined, arguments)
}

/**
 * @param {Viewer|CesiumWidget} viewerCesiumWidget The Viewer or CesiumWidget instance
 * @param {{}} options the options
 */
var init = function (viewerCesiumWidget, options) {
  var cesiumNavigation = new CesiumNavigation(viewerCesiumWidget, options)

  var cesiumWidget = defined(viewerCesiumWidget.cesiumWidget) ? viewerCesiumWidget.cesiumWidget : viewerCesiumWidget

  Object.defineProperties(cesiumWidget, {
    cesiumNavigation: {
      configurable: true,
      get: function () {
        return cesiumNavigation
      }
    }
  })

  cesiumNavigation.addOnDestroyListener((function (cesiumWidget) {
    return function () {
      delete cesiumWidget.cesiumNavigation
    }
  })(cesiumWidget))

  return cesiumNavigation
}

export default mapNavigation
