function createCN() {
  var Cesium = window.Cesium;

  var _fails = function (exec) {
    try {
      return !!exec();
    } catch (e) {
      return true;
    }
  };

  var _fails$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _fails,
    __moduleExports: _fails
  });

  var require$$2 = (_fails$1 && _fails) || _fails$1;

  // Thank's IE8 for his funny defineProperty
  var _descriptors = !require$$2(function () {
    return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
  });

  var _descriptors$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _descriptors,
    __moduleExports: _descriptors
  });

  var _isObject = function (it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  };

  var _isObject$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _isObject,
    __moduleExports: _isObject
  });

  var isObject = (_isObject$1 && _isObject) || _isObject$1;

  var _anObject = function (it) {
    if (!isObject(it)) throw TypeError(it + ' is not an object!');
    return it;
  };

  var _anObject$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _anObject,
    __moduleExports: _anObject
  });

  function createCommonjsModule(fn, module) {
    return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var _global = createCommonjsModule(function (module) {
    // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
    var global = module.exports = typeof window != 'undefined' && window.Math == Math
      ? window : typeof self != 'undefined' && self.Math == Math ? self
        // eslint-disable-next-line no-new-func
        : Function('return this')();
    if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
  });

  var _global$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _global,
    __moduleExports: _global
  });

  var require$$0 = (_global$1 && _global) || _global$1;

  var document$1 = require$$0.document;
  // typeof document.createElement is 'object' in old IE
  var is = isObject(document$1) && isObject(document$1.createElement);
  var _domCreate = function (it) {
    return is ? document$1.createElement(it) : {};
  };

  var _domCreate$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _domCreate,
    __moduleExports: _domCreate
  });

  var require$$1 = (_descriptors$1 && _descriptors) || _descriptors$1;

  var require$$1$1 = (_domCreate$1 && _domCreate) || _domCreate$1;

  var _ie8DomDefine = !require$$1 && !require$$2(function () {
    return Object.defineProperty(require$$1$1('div'), 'a', { get: function () { return 7; } }).a != 7;
  });

  var _ie8DomDefine$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _ie8DomDefine,
    __moduleExports: _ie8DomDefine
  });

  // 7.1.1 ToPrimitive(input [, PreferredType])

  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string
  var _toPrimitive = function (it, S) {
    if (!isObject(it)) return it;
    var fn, val;
    if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
    if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
    if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
    throw TypeError("Can't convert object to primitive value");
  };

  var _toPrimitive$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _toPrimitive,
    __moduleExports: _toPrimitive
  });

  var anObject = (_anObject$1 && _anObject) || _anObject$1;

  var IE8_DOM_DEFINE = (_ie8DomDefine$1 && _ie8DomDefine) || _ie8DomDefine$1;

  var toPrimitive = (_toPrimitive$1 && _toPrimitive) || _toPrimitive$1;

  var dP = Object.defineProperty;

  var f = require$$1 ? Object.defineProperty : function defineProperty(O, P, Attributes) {
    anObject(O);
    P = toPrimitive(P, true);
    anObject(Attributes);
    if (IE8_DOM_DEFINE) try {
      return dP(O, P, Attributes);
    } catch (e) { /* empty */ }
    if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
    if ('value' in Attributes) O[P] = Attributes.value;
    return O;
  };

  var _objectDp = {
    f: f
  };

  var _objectDp$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _objectDp,
    __moduleExports: _objectDp,
    f: f
  });

  // 21.2.5.3 get RegExp.prototype.flags

  var _flags = function () {
    var that = anObject(this);
    var result = '';
    if (that.global) result += 'g';
    if (that.ignoreCase) result += 'i';
    if (that.multiline) result += 'm';
    if (that.unicode) result += 'u';
    if (that.sticky) result += 'y';
    return result;
  };

  var _flags$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _flags,
    __moduleExports: _flags
  });

  var require$$0$1 = (_objectDp$1 && _objectDp) || _objectDp$1;

  var $flags = (_flags$1 && _flags) || _flags$1;

  // 21.2.5.3 get RegExp.prototype.flags()
  if (require$$1 && /./g.flags != 'g') require$$0$1.f(RegExp.prototype, 'flags', {
    configurable: true,
    get: $flags
  });

  var _propertyDesc = function (bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var _propertyDesc$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _propertyDesc,
    __moduleExports: _propertyDesc
  });

  var createDesc = (_propertyDesc$1 && _propertyDesc) || _propertyDesc$1;

  var _hide = require$$1 ? function (object, key, value) {
    return require$$0$1.f(object, key, createDesc(1, value));
  } : function (object, key, value) {
    object[key] = value;
    return object;
  };

  var _hide$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _hide,
    __moduleExports: _hide
  });

  var hasOwnProperty = {}.hasOwnProperty;
  var _has = function (it, key) {
    return hasOwnProperty.call(it, key);
  };

  var _has$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _has,
    __moduleExports: _has
  });

  var id = 0;
  var px = Math.random();
  var _uid = function (key) {
    return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
  };

  var _uid$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _uid,
    __moduleExports: _uid
  });

  var _core = createCommonjsModule(function (module) {
    var core = module.exports = { version: '2.6.11' };
    if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
  });
  var _core_1 = _core.version;

  var _core$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _core,
    __moduleExports: _core,
    version: _core_1
  });

  var _library = false;

  var _library$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _library,
    __moduleExports: _library
  });

  var core = (_core$1 && _core) || _core$1;

  var require$$0$2 = (_library$1 && _library) || _library$1;

  var _shared = createCommonjsModule(function (module) {
    var SHARED = '__core-js_shared__';
    var store = require$$0[SHARED] || (require$$0[SHARED] = {});

    (module.exports = function (key, value) {
      return store[key] || (store[key] = value !== undefined ? value : {});
    })('versions', []).push({
      version: core.version,
      mode: require$$0$2 ? 'pure' : 'global',
      copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
    });
  });

  var _shared$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _shared,
    __moduleExports: _shared
  });

  var require$$0$3 = (_shared$1 && _shared) || _shared$1;

  var _functionToString = require$$0$3('native-function-to-string', Function.toString);

  var _functionToString$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _functionToString,
    __moduleExports: _functionToString
  });

  var hide = (_hide$1 && _hide) || _hide$1;

  var has = (_has$1 && _has) || _has$1;

  var uid = (_uid$1 && _uid) || _uid$1;

  var $toString = (_functionToString$1 && _functionToString) || _functionToString$1;

  var _redefine = createCommonjsModule(function (module) {
    var SRC = uid('src');

    var TO_STRING = 'toString';
    var TPL = ('' + $toString).split(TO_STRING);

    core.inspectSource = function (it) {
      return $toString.call(it);
    };

    (module.exports = function (O, key, val, safe) {
      var isFunction = typeof val == 'function';
      if (isFunction) has(val, 'name') || hide(val, 'name', key);
      if (O[key] === val) return;
      if (isFunction) has(val, SRC) || hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
      if (O === require$$0) {
        O[key] = val;
      } else if (!safe) {
        delete O[key];
        hide(O, key, val);
      } else if (O[key]) {
        O[key] = val;
      } else {
        hide(O, key, val);
      }
      // add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
    })(Function.prototype, TO_STRING, function toString() {
      return typeof this == 'function' && this[SRC] || $toString.call(this);
    });
  });

  var _redefine$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _redefine,
    __moduleExports: _redefine
  });

  var redefine = (_redefine$1 && _redefine) || _redefine$1;

  var TO_STRING = 'toString';
  var $toString$1 = /./[TO_STRING];

  var define = function (fn) {
    redefine(RegExp.prototype, TO_STRING, fn, true);
  };

  // 21.2.5.14 RegExp.prototype.toString()
  if (require$$2(function () { return $toString$1.call({ source: 'a', flags: 'b' }) != '/a/b'; })) {
    define(function toString() {
      var R = anObject(this);
      return '/'.concat(R.source, '/',
        'flags' in R ? R.flags : !require$$1 && R instanceof RegExp ? $flags.call(R) : undefined);
    });
    // FF44- RegExp#toString has a wrong name
  } else if ($toString$1.name != TO_STRING) {
    define(function toString() {
      return $toString$1.call(this);
    });
  }

  var DateProto = Date.prototype;
  var INVALID_DATE = 'Invalid Date';
  var TO_STRING$1 = 'toString';
  var $toString$2 = DateProto[TO_STRING$1];
  var getTime = DateProto.getTime;
  if (new Date(NaN) + '' != INVALID_DATE) {
    redefine(DateProto, TO_STRING$1, function toString() {
      var value = getTime.call(this);
      // eslint-disable-next-line no-self-compare
      return value === value ? $toString$2.call(this) : INVALID_DATE;
    });
  }

  var toString = {}.toString;

  var _cof = function (it) {
    return toString.call(it).slice(8, -1);
  };

  var _cof$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _cof,
    __moduleExports: _cof
  });

  var _wks = createCommonjsModule(function (module) {
    var store = require$$0$3('wks');

    var Symbol = require$$0.Symbol;
    var USE_SYMBOL = typeof Symbol == 'function';

    var $exports = module.exports = function (name) {
      return store[name] || (store[name] =
        USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
    };

    $exports.store = store;
  });

  var _wks$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _wks,
    __moduleExports: _wks
  });

  var cof = (_cof$1 && _cof) || _cof$1;

  var require$$0$4 = (_wks$1 && _wks) || _wks$1;

  // getting tag from 19.1.3.6 Object.prototype.toString()

  var TAG = require$$0$4('toStringTag');
  // ES3 wrong here
  var ARG = cof(function () { return arguments; }()) == 'Arguments';

  // fallback for IE11 Script Access Denied error
  var tryGet = function (it, key) {
    try {
      return it[key];
    } catch (e) { /* empty */ }
  };

  var _classof = function (it) {
    var O, T, B;
    return it === undefined ? 'Undefined' : it === null ? 'Null'
      // @@toStringTag case
      : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
        // builtinTag case
        : ARG ? cof(O)
          // ES3 arguments fallback
          : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
  };

  var _classof$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _classof,
    __moduleExports: _classof
  });

  var classof = (_classof$1 && _classof) || _classof$1;

  // 19.1.3.6 Object.prototype.toString()

  var test = {};
  test[require$$0$4('toStringTag')] = 'z';
  if (test + '' != '[object z]') {
    redefine(Object.prototype, 'toString', function toString() {
      return '[object ' + classof(this) + ']';
    }, true);
  }

  var createFragmentFromTemplate = function createFragmentFromTemplate(htmlString) {
    var holder = document.createElement('div');
    holder.innerHTML = htmlString;
    var fragment = document.createDocumentFragment();

    while (holder.firstChild) {
      fragment.appendChild(holder.firstChild);
    }

    return fragment;
  };

  /* eslint-disable no-unused-vars */
  var getElement = Cesium.getElement;
  var Knockout = Cesium.knockout;

  var loadView = function loadView(htmlString, container, viewModel) {
    container = getElement(container);
    var fragment = createFragmentFromTemplate(htmlString); // Sadly, fragment.childNodes doesn't have a slice function.
    // This code could be replaced with Array.prototype.slice.call(fragment.childNodes)
    // but that seems slightly error prone.

    var nodes = [];
    var i;

    for (i = 0; i < fragment.childNodes.length; ++i) {
      nodes.push(fragment.childNodes[i]);
    }

    container.appendChild(fragment);

    for (i = 0; i < nodes.length; ++i) {
      var node = nodes[i];

      if (node.nodeType === 1 || node.nodeType === 8) {
        Knockout.applyBindings(viewModel, node);
      }
    }

    return nodes;
  };

  var defined = Cesium.defined;
  var DeveloperError = Cesium.DeveloperError;
  var EllipsoidGeodesic = Cesium.EllipsoidGeodesic;
  var Cartesian2 = Cesium.Cartesian2;
  var getTimestamp = Cesium.getTimestamp;
  var EventHelper = Cesium.EventHelper;
  var Knockout$1 = Cesium.knockout;

  var DistanceLegendViewModel = function DistanceLegendViewModel(options) {
    if (!defined(options) || !defined(options.terria)) {
      throw new DeveloperError('options.terria is required.');
    }

    this.terria = options.terria;
    this._removeSubscription = undefined;
    this._lastLegendUpdate = undefined;
    this.eventHelper = new EventHelper();
    this.distanceLabel = undefined;
    this.barWidth = undefined;
    this.enableDistanceLegend = defined(options.enableDistanceLegend) ? options.enableDistanceLegend : true;
    Knockout$1.track(this, ['distanceLabel', 'barWidth']);
    this.eventHelper.add(this.terria.afterWidgetChanged, function () {
      if (defined(this._removeSubscription)) {
        this._removeSubscription();

        this._removeSubscription = undefined;
      }
    }, this); //        this.terria.beforeWidgetChanged.addEventListener(function () {
    //            if (defined(this._removeSubscription)) {
    //                this._removeSubscription();
    //                this._removeSubscription = undefined;
    //            }
    //        }, this);

    var that = this;

    function addUpdateSubscription() {
      if (defined(that.terria)) {
        var scene = that.terria.scene;
        that._removeSubscription = scene.postRender.addEventListener(function () {
          updateDistanceLegendCesium(this, scene);
        }, that);
      }
    }

    addUpdateSubscription();
    this.eventHelper.add(this.terria.afterWidgetChanged, function () {
      addUpdateSubscription();
    }, this); // this.terria.afterWidgetChanged.addEventListener(function() {
    //    addUpdateSubscription();
    // }, this);
  };

  DistanceLegendViewModel.prototype.destroy = function () {
    this.eventHelper.removeAll();
  };

  DistanceLegendViewModel.prototype.show = function (container) {
    var testing;

    if (this.enableDistanceLegend) {
      testing = '<div class="distance-legend" data-bind="visible: distanceLabel && barWidth">' + '<div class="distance-legend-label" data-bind="text: distanceLabel"></div>' + '<div class="distance-legend-scale-bar" data-bind="style: { width: barWidth + \'px\', left: (5 + (125 - barWidth) / 2) + \'px\' }"></div>' + '</div>';
    } else {
      testing = '<div class="distance-legend"  style="display: none;" data-bind="visible: distanceLabel && barWidth">' + '<div class="distance-legend-label"  data-bind="text: distanceLabel"></div>' + '<div class="distance-legend-scale-bar"  data-bind="style: { width: barWidth + \'px\', left: (5 + (125 - barWidth) / 2) + \'px\' }"></div>' + '</div>';
    }

    loadView(testing, container, this); // loadView(distanceLegendTemplate, container, this);
    // loadView(require('fs').readFileSync(__dirname + '/../Views/DistanceLegend.html', 'utf8'), container, this);
  };

  DistanceLegendViewModel.create = function (options) {
    var result = new DistanceLegendViewModel(options);
    result.show(options.container);
    return result;
  };

  var geodesic = new EllipsoidGeodesic();
  var distances = [1, 2, 3, 5, 10, 20, 30, 50, 100, 200, 300, 500, 1000, 2000, 3000, 5000, 10000, 20000, 30000, 50000, 100000, 200000, 300000, 500000, 1000000, 2000000, 3000000, 5000000, 10000000, 20000000, 30000000, 50000000];

  function updateDistanceLegendCesium(viewModel, scene) {
    if (!viewModel.enableDistanceLegend) {
      viewModel.barWidth = undefined;
      viewModel.distanceLabel = undefined;
      return;
    }

    var now = getTimestamp();

    if (now < viewModel._lastLegendUpdate + 250) {
      return;
    }

    viewModel._lastLegendUpdate = now; // Find the distance between two pixels at the bottom center of the screen.

    var width = scene.canvas.clientWidth;
    var height = scene.canvas.clientHeight;
    var left = scene.camera.getPickRay(new Cartesian2(width / 2 | 0, height - 1));
    var right = scene.camera.getPickRay(new Cartesian2(1 + width / 2 | 0, height - 1));
    var globe = scene.globe;
    var leftPosition = globe.pick(left, scene);
    var rightPosition = globe.pick(right, scene);

    if (!defined(leftPosition) || !defined(rightPosition)) {
      viewModel.barWidth = undefined;
      viewModel.distanceLabel = undefined;
      return;
    }

    var leftCartographic = globe.ellipsoid.cartesianToCartographic(leftPosition);
    var rightCartographic = globe.ellipsoid.cartesianToCartographic(rightPosition);
    geodesic.setEndPoints(leftCartographic, rightCartographic);
    var pixelDistance = geodesic.surfaceDistance; // Find the first distance that makes the scale bar less than 100 pixels.

    var maxBarWidth = 100;
    var distance;

    for (var i = distances.length - 1; !defined(distance) && i >= 0; --i) {
      if (distances[i] / pixelDistance < maxBarWidth) {
        distance = distances[i];
      }
    }

    if (defined(distance)) {
      var label;

      if (distance >= 1000) {
        label = (distance / 1000).toString() + ' km';
      } else {
        label = distance.toString() + ' m';
      }

      viewModel.barWidth = distance / pixelDistance | 0;
      viewModel.distanceLabel = label;
    } else {
      viewModel.barWidth = undefined;
      viewModel.distanceLabel = undefined;
    }
  }

  var _aFunction = function (it) {
    if (typeof it != 'function') throw TypeError(it + ' is not a function!');
    return it;
  };

  var _aFunction$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _aFunction,
    __moduleExports: _aFunction
  });

  var aFunction = (_aFunction$1 && _aFunction) || _aFunction$1;

  // optional / simple context binding

  var _ctx = function (fn, that, length) {
    aFunction(fn);
    if (that === undefined) return fn;
    switch (length) {
      case 1: return function (a) {
        return fn.call(that, a);
      };
      case 2: return function (a, b) {
        return fn.call(that, a, b);
      };
      case 3: return function (a, b, c) {
        return fn.call(that, a, b, c);
      };
    }
    return function (/* ...args */) {
      return fn.apply(that, arguments);
    };
  };

  var _ctx$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _ctx,
    __moduleExports: _ctx
  });

  var ctx = (_ctx$1 && _ctx) || _ctx$1;

  var PROTOTYPE = 'prototype';

  var $export = function (type, name, source) {
    var IS_FORCED = type & $export.F;
    var IS_GLOBAL = type & $export.G;
    var IS_STATIC = type & $export.S;
    var IS_PROTO = type & $export.P;
    var IS_BIND = type & $export.B;
    var target = IS_GLOBAL ? require$$0 : IS_STATIC ? require$$0[name] || (require$$0[name] = {}) : (require$$0[name] || {})[PROTOTYPE];
    var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
    var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
    var key, own, out, exp;
    if (IS_GLOBAL) source = name;
    for (key in source) {
      // contains in native
      own = !IS_FORCED && target && target[key] !== undefined;
      // export native or passed
      out = (own ? target : source)[key];
      // bind timers to global for call from export context
      exp = IS_BIND && own ? ctx(out, require$$0) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
      // extend global
      if (target) redefine(target, key, out, type & $export.U);
      // export
      if (exports[key] != out) hide(exports, key, exp);
      if (IS_PROTO && expProto[key] != out) expProto[key] = out;
    }
  };
  require$$0.core = core;
  // type bitmap
  $export.F = 1;   // forced
  $export.G = 2;   // global
  $export.S = 4;   // static
  $export.P = 8;   // proto
  $export.B = 16;  // bind
  $export.W = 32;  // wrap
  $export.U = 64;  // safe
  $export.R = 128; // real proto method for `library`
  var _export = $export;

  var _export$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _export,
    __moduleExports: _export
  });

  // fallback for non-array-like ES3 and non-enumerable old V8 strings

  // eslint-disable-next-line no-prototype-builtins
  var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
    return cof(it) == 'String' ? it.split('') : Object(it);
  };

  var _iobject$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _iobject,
    __moduleExports: _iobject
  });

  // 7.2.1 RequireObjectCoercible(argument)
  var _defined = function (it) {
    if (it == undefined) throw TypeError("Can't call method on  " + it);
    return it;
  };

  var _defined$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _defined,
    __moduleExports: _defined
  });

  var IObject = (_iobject$1 && _iobject) || _iobject$1;

  var defined$1 = (_defined$1 && _defined) || _defined$1;

  // to indexed object, toObject with fallback for non-array-like ES3 strings


  var _toIobject = function (it) {
    return IObject(defined$1(it));
  };

  var _toIobject$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _toIobject,
    __moduleExports: _toIobject
  });

  // 7.1.4 ToInteger
  var ceil = Math.ceil;
  var floor = Math.floor;
  var _toInteger = function (it) {
    return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
  };

  var _toInteger$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _toInteger,
    __moduleExports: _toInteger
  });

  var toInteger = (_toInteger$1 && _toInteger) || _toInteger$1;

  // 7.1.15 ToLength

  var min = Math.min;
  var _toLength = function (it) {
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  };

  var _toLength$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _toLength,
    __moduleExports: _toLength
  });

  var max = Math.max;
  var min$1 = Math.min;
  var _toAbsoluteIndex = function (index, length) {
    index = toInteger(index);
    return index < 0 ? max(index + length, 0) : min$1(index, length);
  };

  var _toAbsoluteIndex$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _toAbsoluteIndex,
    __moduleExports: _toAbsoluteIndex
  });

  var toIObject = (_toIobject$1 && _toIobject) || _toIobject$1;

  var toLength = (_toLength$1 && _toLength) || _toLength$1;

  var toAbsoluteIndex = (_toAbsoluteIndex$1 && _toAbsoluteIndex) || _toAbsoluteIndex$1;

  // false -> Array#indexOf
  // true  -> Array#includes



  var _arrayIncludes = function (IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = toIObject($this);
      var length = toLength(O.length);
      var index = toAbsoluteIndex(fromIndex, length);
      var value;
      // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare
      if (IS_INCLUDES && el != el) while (length > index) {
        value = O[index++];
        // eslint-disable-next-line no-self-compare
        if (value != value) return true;
        // Array#indexOf ignores holes, Array#includes - not
      } else for (; length > index; index++) if (IS_INCLUDES || index in O) {
        if (O[index] === el) return IS_INCLUDES || index || 0;
      } return !IS_INCLUDES && -1;
    };
  };

  var _arrayIncludes$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _arrayIncludes,
    __moduleExports: _arrayIncludes
  });

  var shared = require$$0$3('keys');

  var _sharedKey = function (key) {
    return shared[key] || (shared[key] = uid(key));
  };

  var _sharedKey$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _sharedKey,
    __moduleExports: _sharedKey
  });

  var require$$0$5 = (_arrayIncludes$1 && _arrayIncludes) || _arrayIncludes$1;

  var require$$0$6 = (_sharedKey$1 && _sharedKey) || _sharedKey$1;

  var arrayIndexOf = require$$0$5(false);
  var IE_PROTO = require$$0$6('IE_PROTO');

  var _objectKeysInternal = function (object, names) {
    var O = toIObject(object);
    var i = 0;
    var result = [];
    var key;
    for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while (names.length > i) if (has(O, key = names[i++])) {
      ~arrayIndexOf(result, key) || result.push(key);
    }
    return result;
  };

  var _objectKeysInternal$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _objectKeysInternal,
    __moduleExports: _objectKeysInternal
  });

  // IE 8- don't enum bug keys
  var _enumBugKeys = (
    'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
  ).split(',');

  var _enumBugKeys$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _enumBugKeys,
    __moduleExports: _enumBugKeys
  });

  var $keys = (_objectKeysInternal$1 && _objectKeysInternal) || _objectKeysInternal$1;

  var enumBugKeys = (_enumBugKeys$1 && _enumBugKeys) || _enumBugKeys$1;

  // 19.1.2.14 / 15.2.3.14 Object.keys(O)



  var _objectKeys = Object.keys || function keys(O) {
    return $keys(O, enumBugKeys);
  };

  var _objectKeys$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _objectKeys,
    __moduleExports: _objectKeys
  });

  var getKeys = (_objectKeys$1 && _objectKeys) || _objectKeys$1;

  var _objectDps = require$$1 ? Object.defineProperties : function defineProperties(O, Properties) {
    anObject(O);
    var keys = getKeys(Properties);
    var length = keys.length;
    var i = 0;
    var P;
    while (length > i) require$$0$1.f(O, P = keys[i++], Properties[P]);
    return O;
  };

  var _objectDps$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _objectDps,
    __moduleExports: _objectDps
  });

  var document$2 = require$$0.document;
  var _html = document$2 && document$2.documentElement;

  var _html$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _html,
    __moduleExports: _html
  });

  var dPs = (_objectDps$1 && _objectDps) || _objectDps$1;

  var require$$2$1 = (_html$1 && _html) || _html$1;

  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



  var IE_PROTO$1 = require$$0$6('IE_PROTO');
  var Empty = function () { /* empty */ };
  var PROTOTYPE$1 = 'prototype';

  // Create object with fake `null` prototype: use iframe Object with cleared prototype
  var createDict = function () {
    // Thrash, waste and sodomy: IE GC bug
    var iframe = require$$1$1('iframe');
    var i = enumBugKeys.length;
    var lt = '<';
    var gt = '>';
    var iframeDocument;
    iframe.style.display = 'none';
    require$$2$1.appendChild(iframe);
    iframe.src = 'javascript:'; // eslint-disable-line no-script-url
    // createDict = iframe.contentWindow.Object;
    // html.removeChild(iframe);
    iframeDocument = iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
    iframeDocument.close();
    createDict = iframeDocument.F;
    while (i--) delete createDict[PROTOTYPE$1][enumBugKeys[i]];
    return createDict();
  };

  var _objectCreate = Object.create || function create(O, Properties) {
    var result;
    if (O !== null) {
      Empty[PROTOTYPE$1] = anObject(O);
      result = new Empty();
      Empty[PROTOTYPE$1] = null;
      // add "__proto__" for Object.getPrototypeOf polyfill
      result[IE_PROTO$1] = O;
    } else result = createDict();
    return Properties === undefined ? result : dPs(result, Properties);
  };

  var _objectCreate$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _objectCreate,
    __moduleExports: _objectCreate
  });

  var $export$1 = (_export$1 && _export) || _export$1;

  var require$$0$7 = (_objectCreate$1 && _objectCreate) || _objectCreate$1;

  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
  $export$1($export$1.S, 'Object', { create: require$$0$7 });

  var dP$1 = require$$0$1.f;
  var FProto = Function.prototype;
  var nameRE = /^\s*function ([^ (]*)/;
  var NAME = 'name';

  // 19.2.4.2 name
  NAME in FProto || require$$1 && dP$1(FProto, NAME, {
    configurable: true,
    get: function () {
      try {
        return ('' + this).match(nameRE)[1];
      } catch (e) {
        return '';
      }
    }
  });

  var svgReset = 'M 7.5,0 C 3.375,0 0,3.375 0,7.5 0,11.625 3.375,15 7.5,15 c 3.46875,0 6.375,-2.4375 7.21875,-5.625 l -1.96875,0 C 12,11.53125 9.9375,13.125 7.5,13.125 4.40625,13.125 1.875,10.59375 1.875,7.5 1.875,4.40625 4.40625,1.875 7.5,1.875 c 1.59375,0 2.90625,0.65625 3.9375,1.6875 l -3,3 6.5625,0 L 15,0 12.75,2.25 C 11.4375,0.84375 9.5625,0 7.5,0 z';

  var defined$2 = Cesium.defined;
  var defineProperties = Object.defineProperties;
  var DeveloperError$1 = Cesium.DeveloperError;
  var Knockout$2 = Cesium.knockout;
  /**
   * The view-model for a control in the user interface
   *
   * @alias UserInterfaceControl
   * @constructor
   * @abstract
   *
   * @param {Terria} terria The Terria instance.
   */

  var UserInterfaceControl = function UserInterfaceControl(terria) {
    if (!defined$2(terria)) {
      throw new DeveloperError$1('terria is required');
    }

    this._terria = terria;
    /**
     * Gets or sets the name of the control which is set as the controls title.
     * This property is observable.
     * @type {String}
     */

    this.name = 'Unnamed Control';
    /**
     * Gets or sets the text to be displayed in the UI control.
     * This property is observable.
     * @type {String}
     */

    this.text = undefined;
    /**
     * Gets or sets the svg icon of the control.  This property is observable.
     * @type {Object}
     */

    this.svgIcon = undefined;
    /**
     * Gets or sets the height of the svg icon.  This property is observable.
     * @type {Integer}
     */

    this.svgHeight = undefined;
    /**
     * Gets or sets the width of the svg icon.  This property is observable.
     * @type {Integer}
     */

    this.svgWidth = undefined;
    /**
     * Gets or sets the CSS class of the control. This property is observable.
     * @type {String}
     */

    this.cssClass = undefined;
    /**
     * Gets or sets the property describing whether or not the control is in the active state.
     * This property is observable.
     * @type {Boolean}
     */

    this.isActive = false;
    Knockout$2.track(this, ['name', 'svgIcon', 'svgHeight', 'svgWidth', 'cssClass', 'isActive']);
  };

  defineProperties(UserInterfaceControl.prototype, {
    /**
     * Gets the Terria instance.
     * @memberOf UserInterfaceControl.prototype
     * @type {Terria}
     */
    terria: {
      get: function get() {
        return this._terria;
      }
    },

    /**
     * Gets a value indicating whether this button has text associated with it.
     * @type {Object}
     */
    hasText: {
      get: function get() {
        return defined$2(this.text) && typeof this.text === 'string';
      }
    }
  });
  /**
   * When implemented in a derived class, performs an action when the user clicks
   * on this control.
   * @abstract
   * @protected
   */

  UserInterfaceControl.prototype.activate = function () {
    throw new DeveloperError$1('activate must be implemented in the derived class.');
  };

  /**
   * The view-model for a control in the navigation control tool bar
   *
   * @alias NavigationControl
   * @constructor
   * @abstract
   *
   * @param {Terria} terria The Terria instance.
   */

  var NavigationControl = function NavigationControl(terria) {
    UserInterfaceControl.apply(this, arguments);
  };

  NavigationControl.prototype = Object.create(UserInterfaceControl.prototype);

  var defined$3 = Cesium.defined;
  var Camera = Cesium.Camera;
  var Rectangle = Cesium.Rectangle;
  var Cartographic = Cesium.Cartographic;
  /**
   * The model for a zoom in control in the navigation control tool bar
   *
   * @alias ResetViewNavigationControl
   * @constructor
   * @abstract
   *
   * @param {Terria} terria The Terria instance.
   */

  var ResetViewNavigationControl = function ResetViewNavigationControl(terria) {
    NavigationControl.apply(this, arguments);
    /**
     * Gets or sets the name of the control which is set as the control's title.
     * This property is observable.
     * @type {String}
     */

    this.name = '重置视图';
    this.navigationLocked = false;
    /**
     * Gets or sets the svg icon of the control.  This property is observable.
     * @type {Object}
     */

    this.svgIcon = svgReset;
    /**
     * Gets or sets the height of the svg icon.  This property is observable.
     * @type {Integer}
     */

    this.svgHeight = 15;
    /**
     * Gets or sets the width of the svg icon.  This property is observable.
     * @type {Integer}
     */

    this.svgWidth = 15;
    /**
     * Gets or sets the CSS class of the control. This property is observable.
     * @type {String}
     */

    this.cssClass = 'navigation-control-icon-reset';
  };

  ResetViewNavigationControl.prototype = Object.create(NavigationControl.prototype);

  ResetViewNavigationControl.prototype.setNavigationLocked = function (locked) {
    this.navigationLocked = locked;
  };

  ResetViewNavigationControl.prototype.resetView = function () {
    // this.terria.analytics.logEvent('navigation', 'click', 'reset');
    if (this.navigationLocked) {
      return;
    }

    var scene = this.terria.scene;
    var sscc = scene.screenSpaceCameraController;

    if (!sscc.enableInputs) {
      return;
    }

    this.isActive = true;
    var camera = scene.camera;

    if (defined$3(this.terria.trackedEntity)) {
      // when tracking do not reset to default view but to default view of tracked entity
      var trackedEntity = this.terria.trackedEntity;
      this.terria.trackedEntity = undefined;
      this.terria.trackedEntity = trackedEntity;
    } else {
      // reset to a default position or view defined in the options
      if (this.terria.options.defaultResetView) {
        if (this.terria.options.defaultResetView && this.terria.options.defaultResetView instanceof Cartographic) {
          camera.flyTo({
            destination: scene.globe.ellipsoid.cartographicToCartesian(this.terria.options.defaultResetView)
          });
        } else if (this.terria.options.defaultResetView && this.terria.options.defaultResetView instanceof Rectangle) {
          try {
            Rectangle.validate(this.terria.options.defaultResetView);
            camera.flyTo({
              destination: this.terria.options.defaultResetView,
              orientation: {
                heading: Cesium.Math.toRadians(5.729578)
              }
            });
          } catch (e) {
            console.log('Cesium-navigation/ResetViewNavigationControl:   options.defaultResetView Cesium rectangle is  invalid!');
          }
        }
      } else if (this.terria.options.cameraView) {
        try {
          cUtil.setCameraView(this.terria.options.cameraView);
        } catch (error) {

        }
      } else if (typeof camera.flyHome === 'function') {
        camera.flyHome(1);
      } else {
        camera.flyTo({
          'destination': Camera.DEFAULT_VIEW_RECTANGLE,
          'duration': 1
        });
      }
    }
    this.isActive = false;
  };
  /**
   * When implemented in a derived class, performs an action when the user clicks
   * on this control
   * @abstract
   * @protected
   */


  ResetViewNavigationControl.prototype.activate = function () {
    this.resetView();
  };

  /* eslint-disable no-unused-vars */
  var defined$4 = Cesium.defined;
  var Ray = Cesium.Ray;
  var Cartesian3 = Cesium.Cartesian3;
  var Cartographic$1 = Cesium.Cartographic;
  var ReferenceFrame = Cesium.ReferenceFrame;
  var SceneMode = Cesium.SceneMode;
  var Utils = {};
  var unprojectedScratch = new Cartographic$1();
  var rayScratch = new Ray();
  /**
   * gets the focus point of the camera
   * @param {Viewer|Widget} terria The terria
   * @param {boolean} inWorldCoordinates true to get the focus in world coordinates, otherwise get it in projection-specific map coordinates, in meters.
   * @param {Cartesian3} [result] The object in which the result will be stored.
   * @return {Cartesian3} The modified result parameter, a new instance if none was provided or undefined if there is no focus point.
   */

  Utils.getCameraFocus = function (terria, inWorldCoordinates, result) {
    var scene = terria.scene;
    var camera = scene.camera;

    if (scene.mode === SceneMode.MORPHING) {
      return undefined;
    }

    if (!defined$4(result)) {
      result = new Cartesian3();
    } // TODO bug when tracking: if entity moves the current position should be used and not only the one when starting orbiting/rotating
    // TODO bug when tracking: reset should reset to default view of tracked entity


    if (defined$4(terria.trackedEntity)) {
      result = terria.trackedEntity.position.getValue(terria.clock.currentTime, result);
    } else {
      rayScratch.origin = camera.positionWC;
      rayScratch.direction = camera.directionWC;
      result = scene.globe.pick(rayScratch, scene, result);
    }

    if (!defined$4(result)) {
      return undefined;
    }

    if (scene.mode === SceneMode.SCENE2D || scene.mode === SceneMode.COLUMBUS_VIEW) {
      result = camera.worldToCameraCoordinatesPoint(result, result);

      if (inWorldCoordinates) {
        result = scene.globe.ellipsoid.cartographicToCartesian(scene.mapProjection.unproject(result, unprojectedScratch), result);
      }
    } else {
      if (!inWorldCoordinates) {
        result = camera.worldToCameraCoordinatesPoint(result, result);
      }
    }

    return result;
  };

  var defined$5 = Cesium.defined;
  var Ray$1 = Cesium.Ray;
  var IntersectionTests = Cesium.IntersectionTests;
  var Cartesian3$1 = Cesium.Cartesian3;
  var SceneMode$1 = Cesium.SceneMode;
  /**
   * The model for a zoom in control in the navigation control tool bar
   *
   * @alias ZoomOutNavigationControl
   * @constructor
   * @abstract
   *
   * @param {Terria} terria The Terria instance.
   * @param {boolean} zoomIn is used for zooming in (true) or out (false)
   */

  var ZoomNavigationControl = function ZoomNavigationControl(terria, zoomIn) {
    NavigationControl.apply(this, arguments);
    /**
     * Gets or sets the name of the control which is set as the control's title.
     * This property is observable.
     * @type {String}
     */

    this.name = 'Zoom ' + (zoomIn ? 'In' : 'Out');
    /**
     * Gets or sets the text to be displayed in the nav control. Controls that
     * have text do not display the svgIcon.
     * This property is observable.
     * @type {String}
     */

    this.text = zoomIn ? '+' : '-';
    /**
     * Gets or sets the CSS class of the control. This property is observable.
     * @type {String}
     */

    this.cssClass = 'navigation-control-icon-zoom-' + (zoomIn ? 'in' : 'out');
    this.relativeAmount = 2;

    if (zoomIn) {
      // this ensures that zooming in is the inverse of zooming out and vice versa
      // e.g. the camera position remains when zooming in and out
      this.relativeAmount = 1 / this.relativeAmount;
    }
  };

  ZoomNavigationControl.prototype.relativeAmount = 1;
  ZoomNavigationControl.prototype = Object.create(NavigationControl.prototype);
  /**
   * When implemented in a derived class, performs an action when the user clicks
   * on this control
   * @abstract
   * @protected
   */

  ZoomNavigationControl.prototype.activate = function () {
    this.zoom(this.relativeAmount);
  };

  var cartesian3Scratch = new Cartesian3$1();

  ZoomNavigationControl.prototype.zoom = function (relativeAmount) {
    // this.terria.analytics.logEvent('navigation', 'click', 'zoomIn');
    this.isActive = true;

    if (defined$5(this.terria)) {
      var scene = this.terria.scene;
      var sscc = scene.screenSpaceCameraController; // do not zoom if it is disabled

      if (!sscc.enableInputs || !sscc.enableZoom) {
        return;
      } // TODO
      //            if(scene.mode == SceneMode.COLUMBUS_VIEW && !sscc.enableTranslate) {
      //                return;
      //            }


      var camera = scene.camera;
      var orientation;

      switch (scene.mode) {
        case SceneMode$1.MORPHING:
          break;

        case SceneMode$1.SCENE2D:
          camera.zoomIn(camera.positionCartographic.height * (1 - this.relativeAmount));
          break;

        default:
          var focus;

          if (defined$5(this.terria.trackedEntity)) {
            focus = new Cartesian3$1();
          } else {
            focus = Utils.getCameraFocus(this.terria, false);
          }

          if (!defined$5(focus)) {
            // Camera direction is not pointing at the globe, so use the ellipsoid horizon point as
            // the focal point.
            var ray = new Ray$1(camera.worldToCameraCoordinatesPoint(scene.globe.ellipsoid.cartographicToCartesian(camera.positionCartographic)), camera.directionWC);
            focus = IntersectionTests.grazingAltitudeLocation(ray, scene.globe.ellipsoid);
            orientation = {
              heading: camera.heading,
              pitch: camera.pitch,
              roll: camera.roll
            };
          } else {
            orientation = {
              direction: camera.direction,
              up: camera.up
            };
          }

          var direction = Cartesian3$1.subtract(camera.position, focus, cartesian3Scratch);
          var movementVector = Cartesian3$1.multiplyByScalar(direction, relativeAmount, direction);
          var endPosition = Cartesian3$1.add(focus, movementVector, focus);

          if (defined$5(this.terria.trackedEntity) || scene.mode === SceneMode$1.COLUMBUS_VIEW) {
            // sometimes flyTo does not work (jumps to wrong position) so just set the position without any animation
            // do not use flyTo when tracking an entity because during animatiuon the position of the entity may change
            camera.position = endPosition;
          } else {
            camera.flyTo({
              destination: endPosition,
              orientation: orientation,
              duration: 0.5,
              convert: false
            });
          }

      }
    } // this.terria.notifyRepaintRequired();


    this.isActive = false;
  };

  var svgCompassOuterRing = 'm 66.5625,0 0,15.15625 3.71875,0 0,-10.40625 5.5,10.40625 4.375,0 0,-15.15625 -3.71875,0 0,10.40625 L 70.9375,0 66.5625,0 z M 72.5,20.21875 c -28.867432,0 -52.28125,23.407738 -52.28125,52.28125 0,28.87351 23.413818,52.3125 52.28125,52.3125 28.86743,0 52.28125,-23.43899 52.28125,-52.3125 0,-28.873512 -23.41382,-52.28125 -52.28125,-52.28125 z m 0,1.75 c 13.842515,0 26.368948,5.558092 35.5,14.5625 l -11.03125,11 0.625,0.625 11.03125,-11 c 8.9199,9.108762 14.4375,21.579143 14.4375,35.34375 0,13.764606 -5.5176,26.22729 -14.4375,35.34375 l -11.03125,-11 -0.625,0.625 11.03125,11 c -9.130866,9.01087 -21.658601,14.59375 -35.5,14.59375 -13.801622,0 -26.321058,-5.53481 -35.4375,-14.5 l 11.125,-11.09375 c 6.277989,6.12179 14.857796,9.90625 24.3125,9.90625 19.241896,0 34.875,-15.629154 34.875,-34.875 0,-19.245847 -15.633104,-34.84375 -34.875,-34.84375 -9.454704,0 -18.034511,3.760884 -24.3125,9.875 L 37.0625,36.4375 C 46.179178,27.478444 58.696991,21.96875 72.5,21.96875 z m -0.875,0.84375 0,13.9375 1.75,0 0,-13.9375 -1.75,0 z M 36.46875,37.0625 47.5625,48.15625 C 41.429794,54.436565 37.65625,63.027539 37.65625,72.5 c 0,9.472461 3.773544,18.055746 9.90625,24.34375 L 36.46875,107.9375 c -8.96721,-9.1247 -14.5,-21.624886 -14.5,-35.4375 0,-13.812615 5.53279,-26.320526 14.5,-35.4375 z M 72.5,39.40625 c 18.297686,0 33.125,14.791695 33.125,33.09375 0,18.302054 -14.827314,33.125 -33.125,33.125 -18.297687,0 -33.09375,-14.822946 -33.09375,-33.125 0,-18.302056 14.796063,-33.09375 33.09375,-33.09375 z M 22.84375,71.625 l 0,1.75 13.96875,0 0,-1.75 -13.96875,0 z m 85.5625,0 0,1.75 14,0 0,-1.75 -14,0 z M 71.75,108.25 l 0,13.9375 1.71875,0 0,-13.9375 -1.71875,0 z';

  var svgCompassGyro = 'm 72.71875,54.375 c -0.476702,0 -0.908208,0.245402 -1.21875,0.5625 -0.310542,0.317098 -0.551189,0.701933 -0.78125,1.1875 -0.172018,0.363062 -0.319101,0.791709 -0.46875,1.25 -6.91615,1.075544 -12.313231,6.656514 -13,13.625 -0.327516,0.117495 -0.661877,0.244642 -0.9375,0.375 -0.485434,0.22959 -0.901634,0.471239 -1.21875,0.78125 -0.317116,0.310011 -0.5625,0.742111 -0.5625,1.21875 l 0.03125,0 c 0,0.476639 0.245384,0.877489 0.5625,1.1875 0.317116,0.310011 0.702066,0.58291 1.1875,0.8125 0.35554,0.168155 0.771616,0.32165 1.21875,0.46875 1.370803,6.10004 6.420817,10.834127 12.71875,11.8125 0.146999,0.447079 0.30025,0.863113 0.46875,1.21875 0.230061,0.485567 0.470708,0.870402 0.78125,1.1875 0.310542,0.317098 0.742048,0.5625 1.21875,0.5625 0.476702,0 0.876958,-0.245402 1.1875,-0.5625 0.310542,-0.317098 0.582439,-0.701933 0.8125,-1.1875 0.172018,-0.363062 0.319101,-0.791709 0.46875,-1.25 6.249045,-1.017063 11.256351,-5.7184 12.625,-11.78125 0.447134,-0.1471 0.86321,-0.300595 1.21875,-0.46875 0.485434,-0.22959 0.901633,-0.502489 1.21875,-0.8125 0.317117,-0.310011 0.5625,-0.710861 0.5625,-1.1875 l -0.03125,0 c 0,-0.476639 -0.245383,-0.908739 -0.5625,-1.21875 C 89.901633,71.846239 89.516684,71.60459 89.03125,71.375 88.755626,71.244642 88.456123,71.117495 88.125,71 87.439949,64.078341 82.072807,58.503735 75.21875,57.375 c -0.15044,-0.461669 -0.326927,-0.884711 -0.5,-1.25 -0.230061,-0.485567 -0.501958,-0.870402 -0.8125,-1.1875 -0.310542,-0.317098 -0.710798,-0.5625 -1.1875,-0.5625 z m -0.0625,1.40625 c 0.03595,-0.01283 0.05968,0 0.0625,0 0.0056,0 0.04321,-0.02233 0.1875,0.125 0.144288,0.147334 0.34336,0.447188 0.53125,0.84375 0.06385,0.134761 0.123901,0.309578 0.1875,0.46875 -0.320353,-0.01957 -0.643524,-0.0625 -0.96875,-0.0625 -0.289073,0 -0.558569,0.04702 -0.84375,0.0625 C 71.8761,57.059578 71.936151,56.884761 72,56.75 c 0.18789,-0.396562 0.355712,-0.696416 0.5,-0.84375 0.07214,-0.07367 0.120304,-0.112167 0.15625,-0.125 z m 0,2.40625 c 0.448007,0 0.906196,0.05436 1.34375,0.09375 0.177011,0.592256 0.347655,1.271044 0.5,2.03125 0.475097,2.370753 0.807525,5.463852 0.9375,8.9375 -0.906869,-0.02852 -1.834463,-0.0625 -2.78125,-0.0625 -0.92298,0 -1.802327,0.03537 -2.6875,0.0625 0.138529,-3.473648 0.493653,-6.566747 0.96875,-8.9375 0.154684,-0.771878 0.320019,-1.463985 0.5,-2.0625 0.405568,-0.03377 0.804291,-0.0625 1.21875,-0.0625 z m -2.71875,0.28125 c -0.129732,0.498888 -0.259782,0.987558 -0.375,1.5625 -0.498513,2.487595 -0.838088,5.693299 -0.96875,9.25 -3.21363,0.15162 -6.119596,0.480068 -8.40625,0.9375 -0.682394,0.136509 -1.275579,0.279657 -1.84375,0.4375 0.799068,-6.135482 5.504716,-11.036454 11.59375,-12.1875 z M 75.5,58.5 c 6.043169,1.18408 10.705093,6.052712 11.5,12.15625 -0.569435,-0.155806 -1.200273,-0.302525 -1.875,-0.4375 -2.262525,-0.452605 -5.108535,-0.783809 -8.28125,-0.9375 -0.130662,-3.556701 -0.470237,-6.762405 -0.96875,-9.25 C 75.761959,59.467174 75.626981,58.990925 75.5,58.5 z m -2.84375,12.09375 c 0.959338,0 1.895843,0.03282 2.8125,0.0625 C 75.48165,71.267751 75.5,71.871028 75.5,72.5 c 0,1.228616 -0.01449,2.438313 -0.0625,3.59375 -0.897358,0.0284 -1.811972,0.0625 -2.75,0.0625 -0.927373,0 -1.831062,-0.03473 -2.71875,-0.0625 -0.05109,-1.155437 -0.0625,-2.365134 -0.0625,-3.59375 0,-0.628972 0.01741,-1.232249 0.03125,-1.84375 0.895269,-0.02827 1.783025,-0.0625 2.71875,-0.0625 z M 68.5625,70.6875 c -0.01243,0.60601 -0.03125,1.189946 -0.03125,1.8125 0,1.22431 0.01541,2.407837 0.0625,3.5625 -3.125243,-0.150329 -5.92077,-0.471558 -8.09375,-0.90625 -0.784983,-0.157031 -1.511491,-0.316471 -2.125,-0.5 -0.107878,-0.704096 -0.1875,-1.422089 -0.1875,-2.15625 0,-0.115714 0.02849,-0.228688 0.03125,-0.34375 0.643106,-0.20284 1.389577,-0.390377 2.25,-0.5625 2.166953,-0.433487 4.97905,-0.75541 8.09375,-0.90625 z m 8.3125,0.03125 c 3.075121,0.15271 5.824455,0.446046 7.96875,0.875 0.857478,0.171534 1.630962,0.360416 2.28125,0.5625 0.0027,0.114659 0,0.228443 0,0.34375 0,0.735827 -0.07914,1.450633 -0.1875,2.15625 -0.598568,0.180148 -1.29077,0.34562 -2.0625,0.5 -2.158064,0.431708 -4.932088,0.754666 -8.03125,0.90625 0.04709,-1.154663 0.0625,-2.33819 0.0625,-3.5625 0,-0.611824 -0.01924,-1.185379 -0.03125,-1.78125 z M 57.15625,72.5625 c 0.0023,0.572772 0.06082,1.131112 0.125,1.6875 -0.125327,-0.05123 -0.266577,-0.10497 -0.375,-0.15625 -0.396499,-0.187528 -0.665288,-0.387337 -0.8125,-0.53125 -0.147212,-0.143913 -0.15625,-0.182756 -0.15625,-0.1875 0,-0.0047 -0.02221,-0.07484 0.125,-0.21875 0.147212,-0.143913 0.447251,-0.312472 0.84375,-0.5 0.07123,-0.03369 0.171867,-0.06006 0.25,-0.09375 z m 31.03125,0 c 0.08201,0.03503 0.175941,0.05872 0.25,0.09375 0.396499,0.187528 0.665288,0.356087 0.8125,0.5 0.14725,0.14391 0.15625,0.21405 0.15625,0.21875 0,0.0047 -0.009,0.04359 -0.15625,0.1875 -0.147212,0.143913 -0.416001,0.343722 -0.8125,0.53125 -0.09755,0.04613 -0.233314,0.07889 -0.34375,0.125 0.06214,-0.546289 0.09144,-1.094215 0.09375,-1.65625 z m -29.5,3.625 c 0.479308,0.123125 0.983064,0.234089 1.53125,0.34375 2.301781,0.460458 5.229421,0.787224 8.46875,0.9375 0.167006,2.84339 0.46081,5.433176 0.875,7.5 0.115218,0.574942 0.245268,1.063612 0.375,1.5625 -5.463677,-1.028179 -9.833074,-5.091831 -11.25,-10.34375 z m 27.96875,0 C 85.247546,81.408945 80.919274,85.442932 75.5,86.5 c 0.126981,-0.490925 0.261959,-0.967174 0.375,-1.53125 0.41419,-2.066824 0.707994,-4.65661 0.875,-7.5 3.204493,-0.15162 6.088346,-0.480068 8.375,-0.9375 0.548186,-0.109661 1.051942,-0.220625 1.53125,-0.34375 z M 70.0625,77.53125 c 0.865391,0.02589 1.723666,0.03125 2.625,0.03125 0.912062,0 1.782843,-0.0048 2.65625,-0.03125 -0.165173,2.736408 -0.453252,5.207651 -0.84375,7.15625 -0.152345,0.760206 -0.322989,1.438994 -0.5,2.03125 -0.437447,0.03919 -0.895856,0.0625 -1.34375,0.0625 -0.414943,0 -0.812719,-0.02881 -1.21875,-0.0625 -0.177011,-0.592256 -0.347655,-1.271044 -0.5,-2.03125 -0.390498,-1.948599 -0.700644,-4.419842 -0.875,-7.15625 z m 1.75,10.28125 c 0.284911,0.01545 0.554954,0.03125 0.84375,0.03125 0.325029,0 0.648588,-0.01171 0.96875,-0.03125 -0.05999,0.148763 -0.127309,0.31046 -0.1875,0.4375 -0.18789,0.396562 -0.386962,0.696416 -0.53125,0.84375 -0.144288,0.147334 -0.181857,0.125 -0.1875,0.125 -0.0056,0 -0.07446,0.02233 -0.21875,-0.125 C 72.355712,88.946416 72.18789,88.646562 72,88.25 71.939809,88.12296 71.872486,87.961263 71.8125,87.8125 z';

  var svgCompassRotationMarker = 'M 72.46875,22.03125 C 59.505873,22.050338 46.521615,27.004287 36.6875,36.875 L 47.84375,47.96875 C 61.521556,34.240041 83.442603,34.227389 97.125,47.90625 l 11.125,-11.125 C 98.401629,26.935424 85.431627,22.012162 72.46875,22.03125 z';

  var defined$6 = Cesium.defined;
  var CesiumMath = Cesium.Math;
  var getTimestamp$1 = Cesium.getTimestamp;
  var EventHelper$1 = Cesium.EventHelper;
  var Transforms = Cesium.Transforms;
  var SceneMode$2 = Cesium.SceneMode;
  var Cartesian2$1 = Cesium.Cartesian2;
  var Cartesian3$2 = Cesium.Cartesian3;
  var Matrix4 = Cesium.Matrix4;
  var BoundingSphere = Cesium.BoundingSphere;
  var HeadingPitchRange = Cesium.HeadingPitchRange;
  var Knockout$3 = Cesium.knockout;

  var NavigationViewModel = function NavigationViewModel(options) {
    this.terria = options.terria;
    this.eventHelper = new EventHelper$1();
    this.enableZoomControls = defined$6(options.enableZoomControls) ? options.enableZoomControls : true;
    this.enableCompass = defined$6(options.enableCompass) ? options.enableCompass : true;
    this.navigationLocked = false; // if (this.showZoomControls)
    //   {

    this.controls = options.controls;

    if (!defined$6(this.controls)) {
      this.controls = [new ZoomNavigationControl(this.terria, true), new ResetViewNavigationControl(this.terria), new ZoomNavigationControl(this.terria, false)];
    } // }


    this.svgCompassOuterRing = svgCompassOuterRing;
    this.svgCompassGyro = svgCompassGyro;
    this.svgCompassRotationMarker = svgCompassRotationMarker;
    this.showCompass = defined$6(this.terria) && this.enableCompass;
    this.heading = this.showCompass ? this.terria.scene.camera.heading : 0.0;
    this.isOrbiting = false;
    this.orbitCursorAngle = 0;
    this.orbitCursorOpacity = 0.0;
    this.orbitLastTimestamp = 0;
    this.orbitFrame = undefined;
    this.orbitIsLook = false;
    this.orbitMouseMoveFunction = undefined;
    this.orbitMouseUpFunction = undefined;
    this.isRotating = false;
    this.rotateInitialCursorAngle = undefined;
    this.rotateFrame = undefined;
    this.rotateIsLook = false;
    this.rotateMouseMoveFunction = undefined;
    this.rotateMouseUpFunction = undefined;
    this._unsubcribeFromPostRender = undefined;
    Knockout$3.track(this, ['controls', 'showCompass', 'heading', 'isOrbiting', 'orbitCursorAngle', 'isRotating']);
    var that = this;

    NavigationViewModel.prototype.setNavigationLocked = function (locked) {
      this.navigationLocked = locked;

      if (this.controls && this.controls.length > 1) {
        this.controls[1].setNavigationLocked(this.navigationLocked);
      }
    };

    function widgetChange() {
      if (defined$6(that.terria)) {
        if (that._unsubcribeFromPostRender) {
          that._unsubcribeFromPostRender();

          that._unsubcribeFromPostRender = undefined;
        }

        that.showCompass = that.enableCompass;
        that._unsubcribeFromPostRender = that.terria.scene.postRender.addEventListener(function () {
          that.heading = that.terria.scene.camera.heading;
        });
      } else {
        if (that._unsubcribeFromPostRender) {
          that._unsubcribeFromPostRender();

          that._unsubcribeFromPostRender = undefined;
        }

        that.showCompass = false;
      }
    }

    this.eventHelper.add(this.terria.afterWidgetChanged, widgetChange, this); // this.terria.afterWidgetChanged.addEventListener(widgetChange);

    widgetChange();
  };

  NavigationViewModel.prototype.destroy = function () {
    this.eventHelper.removeAll(); // loadView(require('fs').readFileSync(baseURLEmpCesium + 'js-lib/terrajs/lib/Views/Navigation.html', 'utf8'), container, this);
  };

  NavigationViewModel.prototype.show = function (container) {
    var testing;

    if (this.enableZoomControls && this.enableCompass) {
      testing = '<div class="compass" title="" data-bind="visible: showCompass, event: { mousedown: handleMouseDown, dblclick: handleDoubleClick }">' + '<div class="compass-outer-ring-background"></div>' + ' <div class="compass-rotation-marker" data-bind="visible: isOrbiting, style: { transform: \'rotate(-\' + orbitCursorAngle + \'rad)\', \'-webkit-transform\': \'rotate(-\' + orbitCursorAngle + \'rad)\', opacity: orbitCursorOpacity }, cesiumSvgPath: { path: svgCompassRotationMarker, width: 145, height: 145 }"></div>' + ' <div class="compass-outer-ring" title="" data-bind="style: { transform: \'rotate(-\' + heading + \'rad)\', \'-webkit-transform\': \'rotate(-\' + heading + \'rad)\' }, cesiumSvgPath: { path: svgCompassOuterRing, width: 145, height: 145 }"></div>' + ' <div class="compass-gyro-background"></div>' + ' <div class="compass-gyro" data-bind="cesiumSvgPath: { path: svgCompassGyro, width: 145, height: 145 }, css: { \'compass-gyro-active\': isOrbiting }"></div>' + '</div>' + '<div class="navigation-controls">' + '<!-- ko foreach: controls -->' + '<div data-bind="click: activate, attr: { title: $data.name }, css: $root.isLastControl($data) ? \'navigation-control-last\' : \'navigation-control\' ">' + '   <!-- ko if: $data.hasText -->' + '   <div data-bind="text: $data.text, css: $data.isActive ?  \'navigation-control-icon-active \' + $data.cssClass : $data.cssClass"></div>' + '   <!-- /ko -->' + '  <!-- ko ifnot: $data.hasText -->' + '  <div data-bind="cesiumSvgPath: { path: $data.svgIcon, width: $data.svgWidth, height: $data.svgHeight }, css: $data.isActive ?  \'navigation-control-icon-active \' + $data.cssClass : $data.cssClass"></div>' + '  <!-- /ko -->' + ' </div>' + ' <!-- /ko -->' + '</div>';
    } else if (!this.enableZoomControls && this.enableCompass) {
      testing = '<div class="compass" title="" data-bind="visible: showCompass, event: { mousedown: handleMouseDown, dblclick: handleDoubleClick }">' + '<div class="compass-outer-ring-background"></div>' + ' <div class="compass-rotation-marker" data-bind="visible: isOrbiting, style: { transform: \'rotate(-\' + orbitCursorAngle + \'rad)\', \'-webkit-transform\': \'rotate(-\' + orbitCursorAngle + \'rad)\', opacity: orbitCursorOpacity }, cesiumSvgPath: { path: svgCompassRotationMarker, width: 145, height: 145 }"></div>' + ' <div class="compass-outer-ring" title="" data-bind="style: { transform: \'rotate(-\' + heading + \'rad)\', \'-webkit-transform\': \'rotate(-\' + heading + \'rad)\' }, cesiumSvgPath: { path: svgCompassOuterRing, width: 145, height: 145 }"></div>' + ' <div class="compass-gyro-background"></div>' + ' <div class="compass-gyro" data-bind="cesiumSvgPath: { path: svgCompassGyro, width: 145, height: 145 }, css: { \'compass-gyro-active\': isOrbiting }"></div>' + '</div>' + '<div class="navigation-controls"  style="display: none;" >' + '<!-- ko foreach: controls -->' + '<div data-bind="click: activate, attr: { title: $data.name }, css: $root.isLastControl($data) ? \'navigation-control-last\' : \'navigation-control\' ">' + '   <!-- ko if: $data.hasText -->' + '   <div data-bind="text: $data.text, css: $data.isActive ?  \'navigation-control-icon-active \' + $data.cssClass : $data.cssClass"></div>' + '   <!-- /ko -->' + '  <!-- ko ifnot: $data.hasText -->' + '  <div data-bind="cesiumSvgPath: { path: $data.svgIcon, width: $data.svgWidth, height: $data.svgHeight }, css: $data.isActive ?  \'navigation-control-icon-active \' + $data.cssClass : $data.cssClass"></div>' + '  <!-- /ko -->' + ' </div>' + ' <!-- /ko -->' + '</div>';
    } else if (this.enableZoomControls && !this.enableCompass) {
      testing = '<div class="compass"  style="display: none;" title="" data-bind="visible: showCompass, event: { mousedown: handleMouseDown, dblclick: handleDoubleClick }">' + '<div class="compass-outer-ring-background"></div>' + ' <div class="compass-rotation-marker" data-bind="visible: isOrbiting, style: { transform: \'rotate(-\' + orbitCursorAngle + \'rad)\', \'-webkit-transform\': \'rotate(-\' + orbitCursorAngle + \'rad)\', opacity: orbitCursorOpacity }, cesiumSvgPath: { path: svgCompassRotationMarker, width: 145, height: 145 }"></div>' + ' <div class="compass-outer-ring" title="" data-bind="style: { transform: \'rotate(-\' + heading + \'rad)\', \'-webkit-transform\': \'rotate(-\' + heading + \'rad)\' }, cesiumSvgPath: { path: svgCompassOuterRing, width: 145, height: 145 }"></div>' + ' <div class="compass-gyro-background"></div>' + ' <div class="compass-gyro" data-bind="cesiumSvgPath: { path: svgCompassGyro, width: 145, height: 145 }, css: { \'compass-gyro-active\': isOrbiting }"></div>' + '</div>' + '<div class="navigation-controls"    >' + '<!-- ko foreach: controls -->' + '<div data-bind="click: activate, attr: { title: $data.name }, css: $root.isLastControl($data) ? \'navigation-control-last\' : \'navigation-control\' ">' + '   <!-- ko if: $data.hasText -->' + '   <div data-bind="text: $data.text, css: $data.isActive ?  \'navigation-control-icon-active \' + $data.cssClass : $data.cssClass"></div>' + '   <!-- /ko -->' + '  <!-- ko ifnot: $data.hasText -->' + '  <div data-bind="cesiumSvgPath: { path: $data.svgIcon, width: $data.svgWidth, height: $data.svgHeight }, css: $data.isActive ?  \'navigation-control-icon-active \' + $data.cssClass : $data.cssClass"></div>' + '  <!-- /ko -->' + ' </div>' + ' <!-- /ko -->' + '</div>';
    } else if (!this.enableZoomControls && !this.enableCompass) {
      testing = '<div class="compass"  style="display: none;" title="" data-bind="visible: showCompass, event: { mousedown: handleMouseDown, dblclick: handleDoubleClick }">' + '<div class="compass-outer-ring-background"></div>' + ' <div class="compass-rotation-marker" data-bind="visible: isOrbiting, style: { transform: \'rotate(-\' + orbitCursorAngle + \'rad)\', \'-webkit-transform\': \'rotate(-\' + orbitCursorAngle + \'rad)\', opacity: orbitCursorOpacity }, cesiumSvgPath: { path: svgCompassRotationMarker, width: 145, height: 145 }"></div>' + ' <div class="compass-outer-ring" title="" data-bind="style: { transform: \'rotate(-\' + heading + \'rad)\', \'-webkit-transform\': \'rotate(-\' + heading + \'rad)\' }, cesiumSvgPath: { path: svgCompassOuterRing, width: 145, height: 145 }"></div>' + ' <div class="compass-gyro-background"></div>' + ' <div class="compass-gyro" data-bind="cesiumSvgPath: { path: svgCompassGyro, width: 145, height: 145 }, css: { \'compass-gyro-active\': isOrbiting }"></div>' + '</div>' + '<div class="navigation-controls"   style="display: none;" >' + '<!-- ko foreach: controls -->' + '<div data-bind="click: activate, attr: { title: $data.name }, css: $root.isLastControl($data) ? \'navigation-control-last\' : \'navigation-control\' ">' + '   <!-- ko if: $data.hasText -->' + '   <div data-bind="text: $data.text, css: $data.isActive ?  \'navigation-control-icon-active \' + $data.cssClass : $data.cssClass"></div>' + '   <!-- /ko -->' + '  <!-- ko ifnot: $data.hasText -->' + '  <div data-bind="cesiumSvgPath: { path: $data.svgIcon, width: $data.svgWidth, height: $data.svgHeight }, css: $data.isActive ?  \'navigation-control-icon-active \' + $data.cssClass : $data.cssClass"></div>' + '  <!-- /ko -->' + ' </div>' + ' <!-- /ko -->' + '</div>';
    }

    loadView(testing, container, this); // loadView(navigatorTemplate, container, this);
    // loadView(require('fs').readFileSync(baseURLEmpCesium + 'js-lib/terrajs/lib/Views/Navigation.html', 'utf8'), container, this);
  };
  /**
   * Adds a control to this toolbar.
   * @param {NavControl} control The control to add.
   */


  NavigationViewModel.prototype.add = function (control) {
    this.controls.push(control);
  };
  /**
   * Removes a control from this toolbar.
   * @param {NavControl} control The control to remove.
   */


  NavigationViewModel.prototype.remove = function (control) {
    this.controls.remove(control);
  };
  /**
   * Checks if the control given is the last control in the control array.
   * @param {NavControl} control The control to remove.
   */


  NavigationViewModel.prototype.isLastControl = function (control) {
    return control === this.controls[this.controls.length - 1];
  };

  var vectorScratch = new Cartesian2$1();

  NavigationViewModel.prototype.handleMouseDown = function (viewModel, e) {
    var scene = this.terria.scene;

    if (scene.mode === SceneMode$2.MORPHING) {
      return true;
    }

    if (viewModel.navigationLocked) {
      return true;
    }

    var compassElement = e.currentTarget;
    var compassRectangle = e.currentTarget.getBoundingClientRect();
    var maxDistance = compassRectangle.width / 2.0;
    var center = new Cartesian2$1((compassRectangle.right - compassRectangle.left) / 2.0, (compassRectangle.bottom - compassRectangle.top) / 2.0);
    var clickLocation = new Cartesian2$1(e.clientX - compassRectangle.left, e.clientY - compassRectangle.top);
    var vector = Cartesian2$1.subtract(clickLocation, center, vectorScratch);
    var distanceFromCenter = Cartesian2$1.magnitude(vector);
    var distanceFraction = distanceFromCenter / maxDistance;
    var nominalTotalRadius = 145;
    var norminalGyroRadius = 50;

    if (distanceFraction < norminalGyroRadius / nominalTotalRadius) {
      orbit(this, compassElement, vector); //            return false;
    } else if (distanceFraction < 1.0) {
      rotate(this, compassElement, vector); //            return false;
    } else {
      return true;
    }
  };

  var oldTransformScratch = new Matrix4();
  var newTransformScratch = new Matrix4();
  var centerScratch = new Cartesian3$2();

  NavigationViewModel.prototype.handleDoubleClick = function (viewModel, e) {
    var scene = viewModel.terria.scene;
    var camera = scene.camera;
    var sscc = scene.screenSpaceCameraController;

    if (scene.mode === SceneMode$2.MORPHING || !sscc.enableInputs) {
      return true;
    }

    if (viewModel.navigationLocked) {
      return true;
    }

    if (scene.mode === SceneMode$2.COLUMBUS_VIEW && !sscc.enableTranslate) {
      return;
    }

    if (scene.mode === SceneMode$2.SCENE3D || scene.mode === SceneMode$2.COLUMBUS_VIEW) {
      if (!sscc.enableLook) {
        return;
      }

      if (scene.mode === SceneMode$2.SCENE3D) {
        if (!sscc.enableRotate) {
          return;
        }
      }
    }

    var center = Utils.getCameraFocus(viewModel.terria, true, centerScratch);

    if (!defined$6(center)) {
      // Globe is barely visible, so reset to home view.
      this.controls[1].resetView();
      return;
    }

    var cameraPosition = scene.globe.ellipsoid.cartographicToCartesian(camera.positionCartographic, new Cartesian3$2());
    var surfaceNormal = scene.globe.ellipsoid.geodeticSurfaceNormal(center);
    var focusBoundingSphere = new BoundingSphere(center, 0);
    camera.flyToBoundingSphere(focusBoundingSphere, {
      offset: new HeadingPitchRange(0, // do not use camera.pitch since the pitch at the center/target is required
        CesiumMath.PI_OVER_TWO - Cartesian3$2.angleBetween(surfaceNormal, camera.directionWC), // distanceToBoundingSphere returns wrong values when in 2D or Columbus view so do not use
        // camera.distanceToBoundingSphere(focusBoundingSphere)
        // instead calculate distance manually
        Cartesian3$2.distance(cameraPosition, center)),
      duration: 1.5
    });
  };

  NavigationViewModel.create = function (options) {
    // options.enableZoomControls = this.enableZoomControls;
    // options.enableCompass = this.enableCompass;
    var result = new NavigationViewModel(options);
    result.show(options.container);
    return result;
  };

  function orbit(viewModel, compassElement, cursorVector) {
    var scene = viewModel.terria.scene;
    var sscc = scene.screenSpaceCameraController; // do not orbit if it is disabled

    if (scene.mode === SceneMode$2.MORPHING || !sscc.enableInputs) {
      return;
    }

    if (viewModel.navigationLocked) {
      return true;
    }

    switch (scene.mode) {
      case SceneMode$2.COLUMBUS_VIEW:
        if (sscc.enableLook) {
          break;
        }

        if (!sscc.enableTranslate || !sscc.enableTilt) {
          return;
        }

        break;

      case SceneMode$2.SCENE3D:
        if (sscc.enableLook) {
          break;
        }

        if (!sscc.enableTilt || !sscc.enableRotate) {
          return;
        }

        break;

      case SceneMode$2.SCENE2D:
        if (!sscc.enableTranslate) {
          return;
        }

        break;
    } // Remove existing event handlers, if any.


    document.removeEventListener('mousemove', viewModel.orbitMouseMoveFunction, false);
    document.removeEventListener('mouseup', viewModel.orbitMouseUpFunction, false);

    if (defined$6(viewModel.orbitTickFunction)) {
      viewModel.terria.clock.onTick.removeEventListener(viewModel.orbitTickFunction);
    }

    viewModel.orbitMouseMoveFunction = undefined;
    viewModel.orbitMouseUpFunction = undefined;
    viewModel.orbitTickFunction = undefined;
    viewModel.isOrbiting = true;
    viewModel.orbitLastTimestamp = getTimestamp$1();
    var camera = scene.camera;

    if (defined$6(viewModel.terria.trackedEntity)) {
      // when tracking an entity simply use that reference frame
      viewModel.orbitFrame = undefined;
      viewModel.orbitIsLook = false;
    } else {
      var center = Utils.getCameraFocus(viewModel.terria, true, centerScratch);

      if (!defined$6(center)) {
        viewModel.orbitFrame = Transforms.eastNorthUpToFixedFrame(camera.positionWC, scene.globe.ellipsoid, newTransformScratch);
        viewModel.orbitIsLook = true;
      } else {
        viewModel.orbitFrame = Transforms.eastNorthUpToFixedFrame(center, scene.globe.ellipsoid, newTransformScratch);
        viewModel.orbitIsLook = false;
      }
    }

    viewModel.orbitTickFunction = function (e) {
      var timestamp = getTimestamp$1();
      var deltaT = timestamp - viewModel.orbitLastTimestamp;
      var rate = (viewModel.orbitCursorOpacity - 0.5) * 2.5 / 1000;
      var distance = deltaT * rate;
      var angle = viewModel.orbitCursorAngle + CesiumMath.PI_OVER_TWO;
      var x = Math.cos(angle) * distance;
      var y = Math.sin(angle) * distance;
      var oldTransform;

      if (viewModel.navigationLocked) {
        return true;
      }

      if (defined$6(viewModel.orbitFrame)) {
        oldTransform = Matrix4.clone(camera.transform, oldTransformScratch);
        camera.lookAtTransform(viewModel.orbitFrame);
      } // do not look up/down or rotate in 2D mode


      if (scene.mode === SceneMode$2.SCENE2D) {
        camera.move(new Cartesian3$2(x, y, 0), Math.max(scene.canvas.clientWidth, scene.canvas.clientHeight) / 100 * camera.positionCartographic.height * distance);
      } else {
        if (viewModel.orbitIsLook) {
          camera.look(Cartesian3$2.UNIT_Z, -x);
          camera.look(camera.right, -y);
        } else {
          camera.rotateLeft(x);
          camera.rotateUp(y);
        }
      }

      if (defined$6(viewModel.orbitFrame)) {
        camera.lookAtTransform(oldTransform);
      } // viewModel.terria.cesium.notifyRepaintRequired();


      viewModel.orbitLastTimestamp = timestamp;
    };

    function updateAngleAndOpacity(vector, compassWidth) {
      var angle = Math.atan2(-vector.y, vector.x);
      viewModel.orbitCursorAngle = CesiumMath.zeroToTwoPi(angle - CesiumMath.PI_OVER_TWO);
      var distance = Cartesian2$1.magnitude(vector);
      var maxDistance = compassWidth / 2.0;
      var distanceFraction = Math.min(distance / maxDistance, 1.0);
      var easedOpacity = 0.5 * distanceFraction * distanceFraction + 0.5;
      viewModel.orbitCursorOpacity = easedOpacity; // viewModel.terria.cesium.notifyRepaintRequired();
    }

    viewModel.orbitMouseMoveFunction = function (e) {
      var compassRectangle = compassElement.getBoundingClientRect();
      var center = new Cartesian2$1((compassRectangle.right - compassRectangle.left) / 2.0, (compassRectangle.bottom - compassRectangle.top) / 2.0);
      var clickLocation = new Cartesian2$1(e.clientX - compassRectangle.left, e.clientY - compassRectangle.top);
      var vector = Cartesian2$1.subtract(clickLocation, center, vectorScratch);
      updateAngleAndOpacity(vector, compassRectangle.width);
    };

    viewModel.orbitMouseUpFunction = function (e) {
      // TODO: if mouse didn't move, reset view to looking down, north is up?
      viewModel.isOrbiting = false;
      document.removeEventListener('mousemove', viewModel.orbitMouseMoveFunction, false);
      document.removeEventListener('mouseup', viewModel.orbitMouseUpFunction, false);

      if (defined$6(viewModel.orbitTickFunction)) {
        viewModel.terria.clock.onTick.removeEventListener(viewModel.orbitTickFunction);
      }

      viewModel.orbitMouseMoveFunction = undefined;
      viewModel.orbitMouseUpFunction = undefined;
      viewModel.orbitTickFunction = undefined;
    };

    document.addEventListener('mousemove', viewModel.orbitMouseMoveFunction, false);
    document.addEventListener('mouseup', viewModel.orbitMouseUpFunction, false);
    viewModel.terria.clock.onTick.addEventListener(viewModel.orbitTickFunction);
    updateAngleAndOpacity(cursorVector, compassElement.getBoundingClientRect().width);
  }

  function rotate(viewModel, compassElement, cursorVector) {
    var scene = viewModel.terria.scene;
    var camera = scene.camera;
    var sscc = scene.screenSpaceCameraController; // do not rotate in 2D mode or if rotating is disabled

    if (scene.mode === SceneMode$2.MORPHING || scene.mode === SceneMode$2.SCENE2D || !sscc.enableInputs) {
      return;
    }

    if (viewModel.navigationLocked) {
      return true;
    }

    if (!sscc.enableLook && (scene.mode === SceneMode$2.COLUMBUS_VIEW || scene.mode === SceneMode$2.SCENE3D && !sscc.enableRotate)) {
      return;
    } // Remove existing event handlers, if any.


    document.removeEventListener('mousemove', viewModel.rotateMouseMoveFunction, false);
    document.removeEventListener('mouseup', viewModel.rotateMouseUpFunction, false);
    viewModel.rotateMouseMoveFunction = undefined;
    viewModel.rotateMouseUpFunction = undefined;
    viewModel.isRotating = true;
    viewModel.rotateInitialCursorAngle = Math.atan2(-cursorVector.y, cursorVector.x);

    if (defined$6(viewModel.terria.trackedEntity)) {
      // when tracking an entity simply use that reference frame
      viewModel.rotateFrame = undefined;
      viewModel.rotateIsLook = false;
    } else {
      var viewCenter = Utils.getCameraFocus(viewModel.terria, true, centerScratch);

      if (!defined$6(viewCenter) || scene.mode === SceneMode$2.COLUMBUS_VIEW && !sscc.enableLook && !sscc.enableTranslate) {
        viewModel.rotateFrame = Transforms.eastNorthUpToFixedFrame(camera.positionWC, scene.globe.ellipsoid, newTransformScratch);
        viewModel.rotateIsLook = true;
      } else {
        viewModel.rotateFrame = Transforms.eastNorthUpToFixedFrame(viewCenter, scene.globe.ellipsoid, newTransformScratch);
        viewModel.rotateIsLook = false;
      }
    }

    var oldTransform;

    if (defined$6(viewModel.rotateFrame)) {
      oldTransform = Matrix4.clone(camera.transform, oldTransformScratch);
      camera.lookAtTransform(viewModel.rotateFrame);
    }

    viewModel.rotateInitialCameraAngle = -camera.heading;

    if (defined$6(viewModel.rotateFrame)) {
      camera.lookAtTransform(oldTransform);
    }

    viewModel.rotateMouseMoveFunction = function (e) {
      var compassRectangle = compassElement.getBoundingClientRect();
      var center = new Cartesian2$1((compassRectangle.right - compassRectangle.left) / 2.0, (compassRectangle.bottom - compassRectangle.top) / 2.0);
      var clickLocation = new Cartesian2$1(e.clientX - compassRectangle.left, e.clientY - compassRectangle.top);
      var vector = Cartesian2$1.subtract(clickLocation, center, vectorScratch);
      var angle = Math.atan2(-vector.y, vector.x);
      var angleDifference = angle - viewModel.rotateInitialCursorAngle;
      var newCameraAngle = CesiumMath.zeroToTwoPi(viewModel.rotateInitialCameraAngle - angleDifference);
      var camera = viewModel.terria.scene.camera;
      var oldTransform;

      if (defined$6(viewModel.rotateFrame)) {
        oldTransform = Matrix4.clone(camera.transform, oldTransformScratch);
        camera.lookAtTransform(viewModel.rotateFrame);
      }

      var currentCameraAngle = -camera.heading;
      camera.rotateRight(newCameraAngle - currentCameraAngle);

      if (defined$6(viewModel.rotateFrame)) {
        camera.lookAtTransform(oldTransform);
      } // viewModel.terria.cesium.notifyRepaintRequired();

    };

    viewModel.rotateMouseUpFunction = function (e) {
      viewModel.isRotating = false;
      document.removeEventListener('mousemove', viewModel.rotateMouseMoveFunction, false);
      document.removeEventListener('mouseup', viewModel.rotateMouseUpFunction, false);
      viewModel.rotateMouseMoveFunction = undefined;
      viewModel.rotateMouseUpFunction = undefined;
    };

    document.addEventListener('mousemove', viewModel.rotateMouseMoveFunction, false);
    document.addEventListener('mouseup', viewModel.rotateMouseUpFunction, false);
  }

  /* eslint-disable no-unused-vars */
  var defined$7 = Cesium.defined;
  var definedProperties = Object.defineProperties;
  var CesiumEvent = Cesium.Event;
  var Knockout$4 = Cesium.knockout;
  var DeveloperError$2 = Cesium.DeveloperError;
  /**
   * @alias CesiumNavigation
   * @constructor
   *
   * @param {Viewer|CesiumWidget} viewerCesiumWidget The Viewer or CesiumWidget instance
   */

  var CesiumNavigation = function CesiumNavigation(viewerCesiumWidget) {
    initialize.apply(this, arguments);
    this._onDestroyListeners = [];
  };

  CesiumNavigation.prototype.distanceLegendViewModel = undefined;
  CesiumNavigation.prototype.navigationViewModel = undefined;
  CesiumNavigation.prototype.navigationDiv = undefined;
  CesiumNavigation.prototype.distanceLegendDiv = undefined;
  CesiumNavigation.prototype.terria = undefined;
  CesiumNavigation.prototype.container = undefined;
  CesiumNavigation.prototype._onDestroyListeners = undefined;
  CesiumNavigation.prototype._navigationLocked = false;

  CesiumNavigation.prototype.setNavigationLocked = function (locked) {
    this._navigationLocked = locked;
    this.navigationViewModel.setNavigationLocked(this._navigationLocked);
  };

  CesiumNavigation.prototype.getNavigationLocked = function () {
    return this._navigationLocked;
  };

  CesiumNavigation.prototype.destroy = function () {
    if (defined$7(this.navigationViewModel)) {
      this.navigationViewModel.destroy();
    }

    if (defined$7(this.distanceLegendViewModel)) {
      this.distanceLegendViewModel.destroy();
    }

    if (defined$7(this.navigationDiv)) {
      this.navigationDiv.parentNode.removeChild(this.navigationDiv);
    }

    delete this.navigationDiv;

    if (defined$7(this.distanceLegendDiv)) {
      this.distanceLegendDiv.parentNode.removeChild(this.distanceLegendDiv);
    }

    delete this.distanceLegendDiv;

    if (defined$7(this.container)) {
      this.container.parentNode.removeChild(this.container);
    }

    delete this.container;

    for (var i = 0; i < this._onDestroyListeners.length; i++) {
      this._onDestroyListeners[i]();
    }
  };

  CesiumNavigation.prototype.addOnDestroyListener = function (callback) {
    if (typeof callback === 'function') {
      this._onDestroyListeners.push(callback);
    }
  };
  /**
   * @param {Viewer|CesiumWidget} viewerCesiumWidget The Viewer or CesiumWidget instance
   * @param options
   */


  function initialize(viewerCesiumWidget, options) {
    if (!defined$7(viewerCesiumWidget)) {
      throw new DeveloperError$2('CesiumWidget or Viewer is required.');
    } //        options = defaultValue(options, defaultValue.EMPTY_OBJECT);


    var cesiumWidget = defined$7(viewerCesiumWidget.cesiumWidget) ? viewerCesiumWidget.cesiumWidget : viewerCesiumWidget;
    var container = document.createElement('div');
    container.className = 'cesium-widget-cesiumNavigationContainer';
    cesiumWidget.container.appendChild(container);
    this.terria = viewerCesiumWidget;
    this.terria.options = defined$7(options) ? options : {};
    this.terria.afterWidgetChanged = new CesiumEvent();
    this.terria.beforeWidgetChanged = new CesiumEvent();
    this.container = container; // this.navigationDiv.setAttribute("id", "navigationDiv");
    // Register custom Knockout.js bindings.  If you're not using the TerriaJS user interface, you can remove this.
    // registerKnockoutBindings()

    if (!defined$7(this.terria.options.enableDistanceLegend) || this.terria.options.enableDistanceLegend) {
      this.distanceLegendDiv = document.createElement('div');
      container.appendChild(this.distanceLegendDiv);
      this.distanceLegendDiv.setAttribute('id', 'distanceLegendDiv');
      this.distanceLegendViewModel = DistanceLegendViewModel.create({
        container: this.distanceLegendDiv,
        terria: this.terria,
        mapElement: container,
        enableDistanceLegend: true
      });
    }

    if ((!defined$7(this.terria.options.enableZoomControls) || this.terria.options.enableZoomControls) && (!defined$7(this.terria.options.enableCompass) || this.terria.options.enableCompass)) {
      this.navigationDiv = document.createElement('div');
      this.navigationDiv.setAttribute('id', 'navigationDiv');
      container.appendChild(this.navigationDiv); // Create the navigation controls.

      this.navigationViewModel = NavigationViewModel.create({
        container: this.navigationDiv,
        terria: this.terria,
        enableZoomControls: true,
        enableCompass: true
      });
    } else if (defined$7(this.terria.options.enableZoomControls) && !this.terria.options.enableZoomControls && (!defined$7(this.terria.options.enableCompass) || this.terria.options.enableCompass)) {
      this.navigationDiv = document.createElement('div');
      this.navigationDiv.setAttribute('id', 'navigationDiv');
      container.appendChild(this.navigationDiv); // Create the navigation controls.

      this.navigationViewModel = NavigationViewModel.create({
        container: this.navigationDiv,
        terria: this.terria,
        enableZoomControls: false,
        enableCompass: true
      });
    } else if ((!defined$7(this.terria.options.enableZoomControls) || this.terria.options.enableZoomControls) && defined$7(this.terria.options.enableCompass) && !this.terria.options.enableCompass) {
      this.navigationDiv = document.createElement('div');
      this.navigationDiv.setAttribute('id', 'navigationDiv');
      container.appendChild(this.navigationDiv); // Create the navigation controls.

      this.navigationViewModel = NavigationViewModel.create({
        container: this.navigationDiv,
        terria: this.terria,
        enableZoomControls: true,
        enableCompass: false
      });
    } else if (defined$7(this.terria.options.enableZoomControls) && !this.terria.options.enableZoomControls && defined$7(this.terria.options.enableCompass) && !this.terria.options.enableCompass);

    options.style = options.style || {};
    var compass = document.getElementsByClassName("compass")[0];
    var navigationControls = document.getElementsByClassName("navigation-controls")[0];
    if (options.style.top != undefined) {
      compass.style.top = Number(options.style.top) + "px";
      navigationControls.style.top = (Number(options.style.top) + 90) + "px";;
    }
    if (options.style.bottom != undefined) {
      compass.style.bottom = (Number(options.style.bottom) + 80) + "px";
      navigationControls.style.bottom = Number(options.style.bottom) + "px";
    }
    if (options.style.left != undefined) {
      compass.style.left = Number(options.style.left) + "px";
      navigationControls.style.left = (Number(options.style.left) + 30) + "px";
    }
    if (options.style.right != undefined) {
      compass.style.right = (Number(options.style.right) - 30) + "px";
      navigationControls.style.right = Number(options.style.right) + "px";
    }
  }

  return CesiumNavigation;

}

export default createCN;