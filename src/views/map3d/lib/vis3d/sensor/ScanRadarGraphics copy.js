/* 参考 https://github.com/kaktus40/cesium-sensors/tree/master */

var shader1 = `
	#ifdef GL_OES_standard_derivatives\n    
	#extension GL_OES_standard_derivatives : enable\n
	#endif\n\n
	uniform bool u_showIntersection;\n
	uniform bool u_showThroughEllipsoid;\n\n
	uniform float u_radius;\n
	uniform float u_xHalfAngle;\n
	uniform float u_yHalfAngle;\n
	uniform float u_normalDirection;\n
	uniform float u_type;\n\n
	in vec3 v_position;\n
	in vec3 v_positionWC;\n
	in vec3 v_positionEC;\n
	in vec3 v_normalEC;\n\n
	vec4 getColor(float sensorRadius, vec3 pointEC)\n
	{\n    czm_materialInput materialInput;\n\n    vec3 pointMC = (czm_inverseModelView * vec4(pointEC, 1.0)).xyz;\n    materialInput.st = sensor2dTextureCoordinates(sensorRadius, pointMC);\n    materialInput.str = pointMC / sensorRadius;\n\n    vec3 positionToEyeEC = -v_positionEC;\n    materialInput.positionToEyeEC = positionToEyeEC;\n\n    vec3 normalEC = normalize(v_normalEC);\n    materialInput.normalEC = u_normalDirection * normalEC;\n\n    czm_material material = czm_getMaterial(materialInput);\n    // czm_lightDirectionEC在cesium1.66开始加入的\n    return mix(czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC), vec4(material.diffuse, material.alpha), 0.4);\n\n}\n\nbool isOnBoundary(float value, float epsilon)\n{\n    float width = getIntersectionWidth();\n    float tolerance = width * epsilon;\n\n#ifdef GL_OES_standard_derivatives\n    float delta = max(abs(dFdx(value)), abs(dFdy(value)));\n    float pixels = width * delta;\n    float temp = abs(value);\n    // There are a couple things going on here.\n    // First we test the value at the current fragment to see if it is within the tolerance.\n    // We also want to check if the value of an adjacent pixel is within the tolerance,\n    // but we don't want to admit points that are obviously not on the surface.\n    // For example, if we are looking for \"value\" to be close to 0, but value is 1 and the adjacent value is 2,\n    // then the delta would be 1 and \"temp - delta\" would be \"1 - 1\" which is zero even though neither of\n    // the points is close to zero.\n    return temp < tolerance && temp < pixels || (delta < 10.0 * tolerance && temp - delta < tolerance && temp < pixels);\n#else\n    return abs(value) < tolerance;\n#endif\n}\n\nvec4 shade(bool isOnBoundary)\n{\n    if (u_showIntersection && isOnBoundary)\n    {\n        return getIntersectionColor();\n    }\n    if(u_type == 1.0){\n        return getLineColor();\n    }\n    return getColor(u_radius, v_positionEC);\n}\n\nfloat ellipsoidSurfaceFunction(vec3 point)\n{\n    vec3 scaled = czm_ellipsoidInverseRadii * point;\n    return dot(scaled, scaled) - 1.0;\n}\n\nvoid main()\n{\n    vec3 sensorVertexWC = czm_model[3].xyz;      // (0.0, 0.0, 0.0) in model coordinates\n    vec3 sensorVertexEC = czm_modelView[3].xyz;  // (0.0, 0.0, 0.0) in model coordinates\n\n    //vec3 pixDir = normalize(v_position);\n    float positionX = v_position.x;\n    float positionY = v_position.y;\n    float positionZ = v_position.z;\n\n    vec3 zDir = vec3(0.0, 0.0, 1.0);\n    vec3 lineX = vec3(positionX, 0 ,positionZ);\n    vec3 lineY = vec3(0, positionY, positionZ);\n    float resX = dot(normalize(lineX), zDir);\n    if(resX < cos(u_xHalfAngle)-0.00001){\n        discard;\n    }\n    float resY = dot(normalize(lineY), zDir);\n    if(resY < cos(u_yHalfAngle)-0.00001){\n        discard;\n    }\n\n\n    float ellipsoidValue = ellipsoidSurfaceFunction(v_positionWC);\n\n    // Occluded by the ellipsoid?\n\tif (!u_showThroughEllipsoid)\n\t{\n\t    // Discard if in the ellipsoid\n\t    // PERFORMANCE_IDEA: A coarse check for ellipsoid intersection could be done on the CPU first.\n\t    if (ellipsoidValue < 0.0)\n\t    {\n            discard;\n\t    }\n\n\t    // Discard if in the sensor's shadow\n\t    if (inSensorShadow(sensorVertexWC, v_positionWC))\n\t    {\n\t        discard;\n\t    }\n    }\n\n    // Notes: Each surface functions should have an associated tolerance based on the floating point error.\n    bool isOnEllipsoid = isOnBoundary(ellipsoidValue, czm_epsilon3);\n    //isOnEllipsoid = false;\n    //if((resX >= 0.8 && resX <= 0.81)||(resY >= 0.8 && resY <= 0.81)){\n    /*if(false){\n        out_FragColor = vec4(1.0,0.0,0.0,1.0);\n    }else{\n        out_FragColor = shade(isOnEllipsoid);\n    }\n*/\n    out_FragColor = shade(isOnEllipsoid);\n\n}
`
var shader2 =
	`
	in vec4 position;\n
	in vec3 normal;\n\n
	out vec3 v_position;\n
	out vec3 v_positionWC;\n
	out vec3 v_positionEC;\n
	out vec3 v_normalEC;\n\n
	void main()\n{\n    gl_Position = czm_modelViewProjection * position;\n    v_position = vec3(position);\n    v_positionWC = (czm_model * position).xyz;\n    v_positionEC = (czm_modelView * position).xyz;\n    v_normalEC = czm_normal * normal;\n}
	`;
var shader3 = `
uniform vec4 u_intersectionColor;\n
uniform float u_intersectionWidth;\n
uniform vec4 u_lineColor;\n\n
bool inSensorShadow(vec3 coneVertexWC, vec3 pointWC)\n{\n    // Diagonal matrix from the unscaled ellipsoid space to the scaled space.    \n    vec3 D = czm_ellipsoidInverseRadii;\n\n    // Sensor vertex in the scaled ellipsoid space\n    vec3 q = D * coneVertexWC;\n    float qMagnitudeSquared = dot(q, q);\n    float test = qMagnitudeSquared - 1.0;\n    \n    // Sensor vertex to fragment vector in the ellipsoid's scaled space\n    vec3 temp = D * pointWC - q;\n    float d = dot(temp, q);\n    \n    // Behind silhouette plane and inside silhouette cone\n    return (d < -test) && (d / length(temp) < -sqrt(test));\n}\n\n///////////////////////////////////////////////////////////////////////////////\n\nvec4 getLineColor()\n{\n    return u_lineColor;\n}\n\nvec4 getIntersectionColor()\n{\n    return u_intersectionColor;\n}\n\nfloat getIntersectionWidth()\n{\n    return u_intersectionWidth;\n}\n\nvec2 sensor2dTextureCoordinates(float sensorRadius, vec3 pointMC)\n{\n    // (s, t) both in the range [0, 1]\n    float t = pointMC.z / sensorRadius;\n    float s = 1.0 + (atan(pointMC.y, pointMC.x) / czm_twoPi);\n    s = s - floor(s);\n    \n    return vec2(s, t);\n}\n
`;
var shader4 = `
	#ifdef GL_OES_standard_derivatives\n
    #extension GL_OES_standard_derivatives : enable\n#endif\n\n
	uniform bool u_showIntersection;\n
	uniform bool u_showThroughEllipsoid;\n\n
	uniform float u_radius;\n
	uniform float u_xHalfAngle;\n
	uniform float u_yHalfAngle;\n
	uniform float u_normalDirection;\n
	uniform vec4 u_color;\n\n
	in vec3 v_position;\n
	in vec3 v_positionWC;\n
	in vec3 v_positionEC;\n
	in vec3 v_normalEC;\n\n
	vec4 getColor(float sensorRadius, vec3 pointEC)\n{\n    czm_materialInput materialInput;\n\n    vec3 pointMC = (czm_inverseModelView * vec4(pointEC, 1.0)).xyz;\n    materialInput.st = sensor2dTextureCoordinates(sensorRadius, pointMC);\n    materialInput.str = pointMC / sensorRadius;\n\n    vec3 positionToEyeEC = -v_positionEC;\n    materialInput.positionToEyeEC = positionToEyeEC;\n\n    vec3 normalEC = normalize(v_normalEC);\n    materialInput.normalEC = u_normalDirection * normalEC;\n\n    czm_material material = czm_getMaterial(materialInput);\n\n    material.diffuse = u_color.rgb;\n    material.alpha = u_color.a;\n    // czm_lightDirectionEC在cesium1.66开始加入的\n    return mix(czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC), vec4(material.diffuse, material.alpha), 0.4);\n\n}\n\nbool isOnBoundary(float value, float epsilon)\n{\n    float width = getIntersectionWidth();\n    float tolerance = width * epsilon;\n\n#ifdef GL_OES_standard_derivatives\n    float delta = max(abs(dFdx(value)), abs(dFdy(value)));\n    float pixels = width * delta;\n    float temp = abs(value);\n    // There are a couple things going on here.\n    // First we test the value at the current fragment to see if it is within the tolerance.\n    // We also want to check if the value of an adjacent pixel is within the tolerance,\n    // but we don't want to admit points that are obviously not on the surface.\n    // For example, if we are looking for \"value\" to be close to 0, but value is 1 and the adjacent value is 2,\n    // then the delta would be 1 and \"temp - delta\" would be \"1 - 1\" which is zero even though neither of\n    // the points is close to zero.\n    return temp < tolerance && temp < pixels || (delta < 10.0 * tolerance && temp - delta < tolerance && temp < pixels);\n#else\n    return abs(value) < tolerance;\n#endif\n}\n\nvec4 shade(bool isOnBoundary)\n{\n    if (u_showIntersection && isOnBoundary)\n    {\n        return getIntersectionColor();\n    }\n    return getColor(u_radius, v_positionEC);\n}\n\nfloat ellipsoidSurfaceFunction(vec3 point)\n{\n    vec3 scaled = czm_ellipsoidInverseRadii * point;\n    return dot(scaled, scaled) - 1.0;\n}\n\nvoid main()\n{\n    vec3 sensorVertexWC = czm_model[3].xyz;      // (0.0, 0.0, 0.0) in model coordinates\n    vec3 sensorVertexEC = czm_modelView[3].xyz;  // (0.0, 0.0, 0.0) in model coordinates\n\n    //vec3 pixDir = normalize(v_position);\n    float positionX = v_position.x;\n    float positionY = v_position.y;\n    float positionZ = v_position.z;\n\n    vec3 zDir = vec3(0.0, 0.0, 1.0);\n    vec3 lineX = vec3(positionX, 0 ,positionZ);\n    vec3 lineY = vec3(0, positionY, positionZ);\n    float resX = dot(normalize(lineX), zDir);\n    if(resX < cos(u_xHalfAngle) - 0.0001){\n        discard;\n    }\n    float resY = dot(normalize(lineY), zDir);\n    if(resY < cos(u_yHalfAngle)- 0.0001){\n        discard;\n    }\n\n\n    float ellipsoidValue = ellipsoidSurfaceFunction(v_positionWC);\n\n    // Occluded by the ellipsoid?\n\tif (!u_showThroughEllipsoid)\n\t{\n\t    // Discard if in the ellipsoid\n\t    // PERFORMANCE_IDEA: A coarse check for ellipsoid intersection could be done on the CPU first.\n\t    if (ellipsoidValue < 0.0)\n\t    {\n            discard;\n\t    }\n\n\t    // Discard if in the sensor's shadow\n\t    if (inSensorShadow(sensorVertexWC, v_positionWC))\n\t    {\n\t        discard;\n\t    }\n    }\n\n    // Notes: Each surface functions should have an associated tolerance based on the floating point error.\n    bool isOnEllipsoid = isOnBoundary(ellipsoidValue, czm_epsilon3);\n    out_FragColor = shade(isOnEllipsoid);\n\n}
`;

let Cesium = window.Cesium;

function removePrimitive(entity, hash, primitives) {
	var data = hash[entity.id];
	if (Cesium.defined(data)) {
		var primitive = data.primitive;
		primitives.remove(primitive);
		if (!primitive.isDestroyed()) {
			primitive.destroy();
		}
		delete hash[entity.id];
	}
};

function ScanRadarGraphics(options) {
	this._show = undefined;
	this._radius = undefined;
	this._xHalfAngle = undefined;
	this._yHalfAngle = undefined;
	this._lineColor = undefined;
	this._showSectorLines = undefined;
	this._showSectorSegmentLines = undefined;
	this._showLateralSurfaces = undefined;
	this._material = undefined;
	this._showDomeSurfaces = undefined;
	this._showDomeLines = undefined;
	this._showIntersection = undefined;
	this._intersectionColor = undefined;
	this._intersectionWidth = undefined;
	this._showThroughEllipsoid = undefined;
	this._gaze = undefined;
	this._showScanPlane = undefined;
	this._scanPlaneColor = undefined;
	this._scanPlaneMode = undefined;
	this._scanPlaneRate = undefined;
	this._definitionChanged = new Cesium.Event();
	this.merge(Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT));
}
Object.defineProperties(ScanRadarGraphics.prototype, {
	definitionChanged: {
		get: function get() {
			return this._definitionChanged;
		}
	},
	show: Cesium.createPropertyDescriptor('show'),
	radius: Cesium.createPropertyDescriptor('radius'),
	xHalfAngle: Cesium.createPropertyDescriptor('xHalfAngle'),
	yHalfAngle: Cesium.createPropertyDescriptor('yHalfAngle'),
	lineColor: Cesium.createPropertyDescriptor('lineColor'),
	showSectorLines: Cesium.createPropertyDescriptor('showSectorLines'),
	showSectorSegmentLines: Cesium.createPropertyDescriptor('showSectorSegmentLines'),
	showLateralSurfaces: Cesium.createPropertyDescriptor('showLateralSurfaces'),
	material: Cesium.createMaterialPropertyDescriptor('material'),
	showDomeSurfaces: Cesium.createPropertyDescriptor('showDomeSurfaces'),
	showDomeLines: Cesium.createPropertyDescriptor('showDomeLines '),
	showIntersection: Cesium.createPropertyDescriptor('showIntersection'),
	intersectionColor: Cesium.createPropertyDescriptor('intersectionColor'),
	intersectionWidth: Cesium.createPropertyDescriptor('intersectionWidth'),
	showThroughEllipsoid: Cesium.createPropertyDescriptor('showThroughEllipsoid'),
	gaze: Cesium.createPropertyDescriptor('gaze'),
	showScanPlane: Cesium.createPropertyDescriptor('showScanPlane'),
	scanPlaneColor: Cesium.createPropertyDescriptor('scanPlaneColor'),
	scanPlaneMode: Cesium.createPropertyDescriptor('scanPlaneMode'),
	scanPlaneRate: Cesium.createPropertyDescriptor('scanPlaneRate')
});

ScanRadarGraphics.prototype.clone = function (result) {
	if (!Cesium.defined(result)) {
		result = new ScanRadarGraphics();
	}

	result.show = this.show;
	result.radius = this.radius;
	result.xHalfAngle = this.xHalfAngle;
	result.yHalfAngle = this.yHalfAngle;
	result.lineColor = this.lineColor;
	result.showSectorLines = this.showSectorLines;
	result.showSectorSegmentLines = this.showSectorSegmentLines;
	result.showLateralSurfaces = this.showLateralSurfaces;
	result.material = this.material;
	result.showDomeSurfaces = this.showDomeSurfaces;
	result.showDomeLines = this.showDomeLines;
	result.showIntersection = this.showIntersection;
	result.intersectionColor = this.intersectionColor;
	result.intersectionWidth = this.intersectionWidth;
	result.showThroughEllipsoid = this.showThroughEllipsoid;
	result.gaze = this.gaze;
	result.showScanPlane = this.showScanPlane;
	result.scanPlaneColor = this.scanPlaneColor;
	result.scanPlaneMode = this.scanPlaneMode;
	result.scanPlaneRate = this.scanPlaneRate;
	return result;
};

ScanRadarGraphics.prototype.merge = function (source) {
	if (!Cesium.defined(source)) {
		throw new Cesium.DeveloperError('source is required.');
	}
	this.slice = Cesium.defaultValue(this.slice, source.slice);
	this.show = Cesium.defaultValue(this.show, source.show);
	this.radius = Cesium.defaultValue(this.radius, source.radius);
	this.xHalfAngle = Cesium.defaultValue(this.xHalfAngle, source.xHalfAngle);
	this.yHalfAngle = Cesium.defaultValue(this.yHalfAngle, source.yHalfAngle);
	this.lineColor = Cesium.defaultValue(this.lineColor, source.lineColor);
	this.showSectorLines = Cesium.defaultValue(this.showSectorLines, source.showSectorLines);
	this.showSectorSegmentLines = Cesium.defaultValue(this.showSectorSegmentLines, source.showSectorSegmentLines);
	this.showLateralSurfaces = Cesium.defaultValue(this.showLateralSurfaces, source.showLateralSurfaces);
	this.material = Cesium.defaultValue(this.material, source.material);
	this.showDomeSurfaces = Cesium.defaultValue(this.showDomeSurfaces, source.showDomeSurfaces);
	this.showDomeLines = Cesium.defaultValue(this.showDomeLines, source.showDomeLines);
	this.showIntersection = Cesium.defaultValue(this.showIntersection, source.showIntersection);
	this.intersectionColor = Cesium.defaultValue(this.intersectionColor, source.intersectionColor);
	this.intersectionWidth = Cesium.defaultValue(this.intersectionWidth, source.intersectionWidth);
	this.showThroughEllipsoid = Cesium.defaultValue(this.showThroughEllipsoid, source.showThroughEllipsoid);
	this.gaze = Cesium.defaultValue(this.gaze, source.gaze);
	this.showScanPlane = Cesium.defaultValue(this.showScanPlane, source.showScanPlane);
	this.scanPlaneColor = Cesium.defaultValue(this.scanPlaneColor, source.scanPlaneColor);
	this.scanPlaneMode = Cesium.defaultValue(this.scanPlaneMode, source.scanPlaneMode);
	this.scanPlaneRate = Cesium.defaultValue(this.scanPlaneRate, source.scanPlaneRate);
};




//====================================================================================================================
var AssociativeArray = Cesium.AssociativeArray;
var Cartesian3 = Cesium.Cartesian3;
var Color = Cesium.Color;
var defined = Cesium.defined;
var destroyObject = Cesium.destroyObject;
var DeveloperError = Cesium.DeveloperError;
var Matrix3 = Cesium.Matrix3;
var Matrix4 = Cesium.Matrix4;
var Quaternion = Cesium.Quaternion;
var MaterialProperty = Cesium.MaterialProperty;
var Property = Cesium.Property;

var matrix3Scratch = new Matrix3();
// var matrix4Scratch = new Matrix4();
var cachedPosition = new Cartesian3();
var cachedGazePosition = new Cartesian3();
var cachedOrientation = new Quaternion();
var diffVectorScratch = new Cartesian3();
var orientationScratch = new Quaternion();
var ScanRadarVisualizer = function ScanRadarVisualizer(scene, entityCollection) {
	// >>includeStart('debug', pragmas.debug);
	if (!defined(scene)) {
		throw new DeveloperError('scene is required.');
	}
	if (!defined(entityCollection)) {
		throw new DeveloperError('entityCollection is required.');
	}
	// >>includeEnd('debug');

	entityCollection.collectionChanged.addEventListener(ScanRadarVisualizer.prototype._onCollectionChanged,
		this);

	this._scene = scene;
	this._primitives = scene.primitives;
	this._entityCollection = entityCollection;
	this._hash = {};
	this._entitiesToVisualize = new AssociativeArray();

	this._onCollectionChanged(entityCollection, entityCollection.values, [], []);
};

/**
 * Updates the primitives created by this visualizer to match their
 * Entity counterpart at the given time.
 *
 * @param {JulianDate} time The time to update to.
 * @returns {Boolean} This function always returns true.
 */
ScanRadarVisualizer.prototype.update = function (time) {
	// >>includeStart('debug', pragmas.debug);
	if (!defined(time)) {
		throw new DeveloperError('time is required.');
	}
	// >>includeEnd('debug');

	var entities = this._entitiesToVisualize.values;
	var hash = this._hash;
	var primitives = this._primitives;

	for (var i = 0, len = entities.length; i < len; i++) {
		var entity = entities[i];
		var rectangularSensorGraphics = entity._rectangularSensor;

		var position;
		var orientation;
		var radius;
		var xHalfAngle;
		var yHalfAngle;
		var data = hash[entity.id];
		var show = entity.isShowing && entity.isAvailable(time) && Property.getValueOrDefault(
			rectangularSensorGraphics._show, time, true);

		if (show) {
			position = Property.getValueOrUndefined(entity._position, time, cachedPosition);
			orientation = Property.getValueOrUndefined(entity._orientation, time, cachedOrientation);
			radius = Property.getValueOrUndefined(rectangularSensorGraphics._radius, time);
			xHalfAngle = Property.getValueOrUndefined(rectangularSensorGraphics._xHalfAngle, time);
			yHalfAngle = Property.getValueOrUndefined(rectangularSensorGraphics._yHalfAngle, time);
			show = defined(position) && defined(xHalfAngle) && defined(yHalfAngle);
		}

		if (!show) {
			// don't bother creating or updating anything else
			if (defined(data)) {
				data.primitive.show = false;
			}
			continue;
		}

		var primitive = defined(data) ? data.primitive : undefined;
		if (!defined(primitive)) {
			primitive = new ScanRadarPrimitive();
			primitive.id = entity;
			primitives.add(primitive);

			data = {
				primitive: primitive,
				position: undefined,
				orientation: undefined
			};
			hash[entity.id] = data;
		}

		var gaze = Property.getValueOrUndefined(rectangularSensorGraphics._gaze, time);
		if (defined(gaze)) {

			var targetPosition = Property.getValueOrUndefined(gaze._position, time, cachedGazePosition);

			if (!defined(position) || !defined(targetPosition)) {
				continue;
			}

			var diffVector = Cartesian3.subtract(position, targetPosition, diffVectorScratch);
			var rotate = Cartesian3.angleBetween(Cesium.Cartesian3.UNIT_Z, diffVector);
			var cross = Cartesian3.cross(Cesium.Cartesian3.UNIT_Z, diffVector, diffVectorScratch);
			var orientation = Quaternion.fromAxisAngle(cross, rotate - Math.PI, orientationScratch);

			//replace original radius
			radius = Cartesian3.distance(position, targetPosition);
			primitive.modelMatrix = Matrix4.fromRotationTranslation(Matrix3.fromQuaternion(orientation, matrix3Scratch),
				position, primitive.modelMatrix);
		} else {
			if (!Cartesian3.equals(position, data.position) || !Quaternion.equals(orientation, data.orientation)) {
				if (defined(orientation)) {
					primitive.modelMatrix = Matrix4.fromRotationTranslation(Matrix3.fromQuaternion(orientation, matrix3Scratch),
						position, primitive.modelMatrix);
					data.position = Cartesian3.clone(position, data.position);
					data.orientation = Quaternion.clone(orientation, data.orientation);
				} else {
					primitive.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
					data.position = Cartesian3.clone(position, data.position);
				}
			}
		}

		primitive.show = true;
		primitive.gaze = gaze;
		primitive.radius = radius;
		primitive.xHalfAngle = xHalfAngle;
		primitive.yHalfAngle = yHalfAngle;
		primitive.lineColor = Property.getValueOrDefault(rectangularSensorGraphics._lineColor, time, Color.WHITE);
		primitive.showSectorLines = Property.getValueOrDefault(rectangularSensorGraphics._showSectorLines, time, true);
		primitive.showSectorSegmentLines = Property.getValueOrDefault(rectangularSensorGraphics._showSectorSegmentLines,
			time, true);
		primitive.showLateralSurfaces = Property.getValueOrDefault(rectangularSensorGraphics._showLateralSurfaces,
			time, true);
		primitive.material = MaterialProperty.getValue(time, rectangularSensorGraphics._material, primitive.material);
		primitive.showDomeSurfaces = Property.getValueOrDefault(rectangularSensorGraphics._showDomeSurfaces, time,
			true);
		primitive.showDomeLines = Property.getValueOrDefault(rectangularSensorGraphics._showDomeLines, time, true);
		primitive.showIntersection = Property.getValueOrDefault(rectangularSensorGraphics._showIntersection, time,
			true);
		primitive.intersectionColor = Property.getValueOrDefault(rectangularSensorGraphics._intersectionColor, time,
			Color.WHITE);
		primitive.intersectionWidth = Property.getValueOrDefault(rectangularSensorGraphics._intersectionWidth, time, 1);
		primitive.showThroughEllipsoid = Property.getValueOrDefault(rectangularSensorGraphics._showThroughEllipsoid,
			time, true);
		primitive.scanPlaneMode = Property.getValueOrDefault(rectangularSensorGraphics._scanPlaneMode, time);
		primitive.scanPlaneColor = Property.getValueOrDefault(rectangularSensorGraphics._scanPlaneColor, time, Color.WHITE);
		primitive.showScanPlane = Property.getValueOrDefault(rectangularSensorGraphics._showScanPlane, time, true);
		primitive.scanPlaneRate = Property.getValueOrDefault(rectangularSensorGraphics._scanPlaneRate, time, 1);
	}
	return true;
};

/**
 * Returns true if this object was destroyed; otherwise, false.
 *
 * @returns {Boolean} True if this object was destroyed; otherwise, false.
 */
ScanRadarVisualizer.prototype.isDestroyed = function () {
	return false;
};

/**
 * Removes and destroys all primitives created by this instance.
 */
ScanRadarVisualizer.prototype.destroy = function () {
	var entities = this._entitiesToVisualize.values;
	var hash = this._hash;
	var primitives = this._primitives;
	for (var i = entities.length - 1; i > -1; i--) {
		removePrimitive(entities[i], hash, primitives);
	}
	return destroyObject(this);
};

/**
 * @private
 */
ScanRadarVisualizer.prototype._onCollectionChanged = function (entityCollection, added, removed, changed) {
	var i;
	var entity;
	var entities = this._entitiesToVisualize;
	var hash = this._hash;
	var primitives = this._primitives;

	for (i = added.length - 1; i > -1; i--) {
		entity = added[i];
		if (defined(entity._rectangularSensor) && defined(entity._position)) {
			entities.set(entity.id, entity);
		}
	}
	for (i = changed.length - 1; i > -1; i--) {
		entity = changed[i];
		if (defined(entity._rectangularSensor) && defined(entity._position)) {
			entities.set(entity.id, entity);
		} else {
			removePrimitive(entity, hash, primitives);
			entities.remove(entity.id);
		}
	}

	for (i = removed.length - 1; i > -1; i--) {
		entity = removed[i];
		removePrimitive(entity, hash, primitives);
		entities.remove(entity.id);
	}
};


//===============================================================================================
var BoundingSphere = Cesium.BoundingSphere;
var Cartesian3 = Cesium.Cartesian3;
var Color = Cesium.Color;
var combine = Cesium.combine;
var ComponentDatatype = Cesium.ComponentDatatype;
var defaultValue = Cesium.defaultValue;
var defined = Cesium.defined;
// var defineProperties = Cesium.defineProperties;
// var destroyObject = Cesium.destroyObject;
var DeveloperError = Cesium.DeveloperError;
var Matrix4 = Cesium.Matrix4;
var PrimitiveType = Cesium.PrimitiveType;
var Buffer = Cesium.Buffer;
var BufferUsage = Cesium.BufferUsage;
var DrawCommand = Cesium.DrawCommand;
var Pass = Cesium.Pass;
var RenderState = Cesium.RenderState;
var ShaderProgram = Cesium.ShaderProgram;
var ShaderSource = Cesium.ShaderSource;
var VertexArray = Cesium.VertexArray;
var BlendingState = Cesium.BlendingState;
var CullFace = Cesium.CullFace;
var Material = Cesium.Material;
var SceneMode = Cesium.SceneMode;
var VertexFormat = Cesium.VertexFormat;
var CesiumMath = Cesium.Math;
var Matrix3 = Cesium.Matrix3;
var Matrix4 = Cesium.Matrix4;
var JulianDate = Cesium.JulianDate;

// var BoxGeometry = Cesium.BoxGeometry;
// var EllipsoidGeometry = Cesium.EllipsoidGeometry;

var sin = Math.sin;
var cos = Math.cos;
var tan = Math.tan;
var atan = Math.atan;
var asin = Math.asin;

var attributeLocations = {
	position: 0,
	normal: 1
};

function ScanRadarPrimitive(options) {
	var self = this;

	options = defaultValue(options, defaultValue.EMPTY_OBJECT);

	/**
	 * 是否显示
	 */
	this.show = defaultValue(options.show, true);

	/**
	 * 切分程度
	 */
	this.slice = defaultValue(options.slice, 32);

	/**
	 * 传感器的模型矩阵
	 */
	this.modelMatrix = Matrix4.clone(options.modelMatrix, new Matrix4());
	this._modelMatrix = new Matrix4();
	this._computedModelMatrix = new Matrix4();
	this._computedScanPlaneModelMatrix = new Matrix4();

	/**
	 * 传感器的半径
	 */
	this.radius = defaultValue(options.radius, Number.POSITIVE_INFINITY);
	this._radius = undefined;

	/**
	 * 传感器水平半角
	 */
	this.xHalfAngle = defaultValue(options.xHalfAngle, 0);
	this._xHalfAngle = undefined;

	/**
	 * 传感器垂直半角
	 */
	this.yHalfAngle = defaultValue(options.yHalfAngle, 0);
	this._yHalfAngle = undefined;

	/**
	 * 线的颜色
	 */
	this.lineColor = defaultValue(options.lineColor, Color.WHITE);

	/**
	 * 是否显示扇面的线
	 */
	this.showSectorLines = defaultValue(options.showSectorLines, true);

	/**
	 * 是否显示扇面和圆顶面连接的线
	 */
	this.showSectorSegmentLines = defaultValue(options.showSectorSegmentLines, true);

	/**
	 * 是否显示侧面
	 */
	this.showLateralSurfaces = defaultValue(options.showLateralSurfaces, true);

	/**
	 * 目前用的统一材质
	 * @type {Material}
	 */
	this.material = defined(options.material) ? options.material : Material.fromType(Material.ColorType);
	this._material = undefined;
	this._translucent = undefined;

	/**
	 * 侧面材质
	 * @type {Material}
	 */
	this.lateralSurfaceMaterial = defined(options.lateralSurfaceMaterial) ? options.lateralSurfaceMaterial :
		Material.fromType(Material.ColorType);
	this._lateralSurfaceMaterial = undefined;
	this._lateralSurfaceTranslucent = undefined;

	/**
	 * 是否显示圆顶表面
	 */
	this.showDomeSurfaces = defaultValue(options.showDomeSurfaces, true);

	/**
	 * 圆顶表面材质
	 * @type {Material}
	 */
	this.domeSurfaceMaterial = defined(options.domeSurfaceMaterial) ? options.domeSurfaceMaterial : Material.fromType(
		Material.ColorType);
	this._domeSurfaceMaterial = undefined;

	/**
	 * 是否显示圆顶面线
	 */
	this.showDomeLines = defaultValue(options.showDomeLines, true);

	/**
	 * 是否显示与地球相交的线
	 */
	this.showIntersection = defaultValue(options.showIntersection, true);

	/**
	 * 与地球相交的线的颜色
	 */
	this.intersectionColor = defaultValue(options.intersectionColor, Color.WHITE);

	/**
	 * 与地球相交的线的宽度（像素）
	 */
	this.intersectionWidth = defaultValue(options.intersectionWidth, 5.0);

	/**
	 * 是否穿过地球
	 */
	this.showThroughEllipsoid = defaultValue(options.showThroughEllipsoid, false);
	this._showThroughEllipsoid = undefined;

	/**
	 * 是否显示扫描面
	 */
	this.showScanPlane = defaultValue(options.showScanPlane, true);

	/**
	 * 扫描面颜色
	 */
	this.scanPlaneColor = defaultValue(options.scanPlaneColor, Color.WHITE);

	/**
	 * 扫描面模式 垂直vertical/水平horizontal
	 */
	this.scanPlaneMode = defaultValue(options.scanPlaneMode, 'horizontal');

	/**
	 * 扫描速率
	 */
	this.scanPlaneRate = defaultValue(options.scanPlaneRate, 10);

	this._scanePlaneXHalfAngle = 0;
	this._scanePlaneYHalfAngle = 0;

	//时间计算的起点
	this._time = JulianDate.now();

	this._boundingSphere = new BoundingSphere();
	this._boundingSphereWC = new BoundingSphere();

	//扇面 sector
	this._sectorFrontCommand = new DrawCommand({
		owner: this,
		primitiveType: PrimitiveType.TRIANGLES,
		boundingVolume: this._boundingSphereWC
	});
	this._sectorBackCommand = new DrawCommand({
		owner: this,
		primitiveType: PrimitiveType.TRIANGLES,
		boundingVolume: this._boundingSphereWC
	});
	this._sectorVA = undefined;

	//扇面边线 sectorLine
	this._sectorLineCommand = new DrawCommand({
		owner: this,
		primitiveType: PrimitiveType.LINES,
		boundingVolume: this._boundingSphereWC
	});
	this._sectorLineVA = undefined;

	//扇面分割线 sectorSegmentLine
	this._sectorSegmentLineCommand = new DrawCommand({
		owner: this,
		primitiveType: PrimitiveType.LINES,
		boundingVolume: this._boundingSphereWC
	});
	this._sectorSegmentLineVA = undefined;

	//弧面 dome
	this._domeFrontCommand = new DrawCommand({
		owner: this,
		primitiveType: PrimitiveType.TRIANGLES,
		boundingVolume: this._boundingSphereWC
	});
	this._domeBackCommand = new DrawCommand({
		owner: this,
		primitiveType: PrimitiveType.TRIANGLES,
		boundingVolume: this._boundingSphereWC
	});
	this._domeVA = undefined;

	//弧面线 domeLine
	this._domeLineCommand = new DrawCommand({
		owner: this,
		primitiveType: PrimitiveType.LINES,
		boundingVolume: this._boundingSphereWC
	});
	this._domeLineVA = undefined;

	//扫描面 scanPlane/scanRadial
	this._scanPlaneFrontCommand = new DrawCommand({
		owner: this,
		primitiveType: PrimitiveType.TRIANGLES,
		boundingVolume: this._boundingSphereWC
	});
	this._scanPlaneBackCommand = new DrawCommand({
		owner: this,
		primitiveType: PrimitiveType.TRIANGLES,
		boundingVolume: this._boundingSphereWC
	});

	this._scanRadialCommand = undefined;

	this._colorCommands = [];

	this._frontFaceRS = undefined;
	this._backFaceRS = undefined;
	this._sp = undefined;

	this._uniforms = {
		u_type: function u_type() {
			return 0; //面
		},
		u_xHalfAngle: function u_xHalfAngle() {
			return self.xHalfAngle;
		},
		u_yHalfAngle: function u_yHalfAngle() {
			return self.yHalfAngle;
		},
		u_radius: function u_radius() {
			return self.radius;
		},
		u_showThroughEllipsoid: function u_showThroughEllipsoid() {
			return self.showThroughEllipsoid;
		},
		u_showIntersection: function u_showIntersection() {
			return self.showIntersection;
		},
		u_intersectionColor: function u_intersectionColor() {
			return self.intersectionColor;
		},
		u_intersectionWidth: function u_intersectionWidth() {
			return self.intersectionWidth;
		},
		u_normalDirection: function u_normalDirection() {
			return 1.0;
		},
		u_lineColor: function u_lineColor() {
			return self.lineColor;
		}
	};

	this._scanUniforms = {
		u_xHalfAngle: function u_xHalfAngle() {
			return self._scanePlaneXHalfAngle;
		},
		u_yHalfAngle: function u_yHalfAngle() {
			return self._scanePlaneYHalfAngle;
		},
		u_radius: function u_radius() {
			return self.radius;
		},
		u_color: function u_color() {
			return self.scanPlaneColor;
		},
		u_showThroughEllipsoid: function u_showThroughEllipsoid() {
			return self.showThroughEllipsoid;
		},
		u_showIntersection: function u_showIntersection() {
			return self.showIntersection;
		},
		u_intersectionColor: function u_intersectionColor() {
			return self.intersectionColor;
		},
		u_intersectionWidth: function u_intersectionWidth() {
			return self.intersectionWidth;
		},
		u_normalDirection: function u_normalDirection() {
			return 1.0;
		},
		u_lineColor: function u_lineColor() {
			return self.lineColor;
		}
	};
}

ScanRadarPrimitive.prototype.update = function (frameState) {
	var mode = frameState.mode;
	if (!this.show || mode !== SceneMode.SCENE3D) {
		return;
	}
	var createVS = false;
	var createRS = false;
	var createSP = false;

	var xHalfAngle = this.xHalfAngle;
	var yHalfAngle = this.yHalfAngle;

	if (xHalfAngle < 0.0 || yHalfAngle < 0.0) {
		throw new DeveloperError('halfAngle must be greater than or equal to zero.');
	}
	if (xHalfAngle == 0.0 || yHalfAngle == 0.0) {
		return;
	}
	if (this._xHalfAngle !== xHalfAngle || this._yHalfAngle !== yHalfAngle) {
		this._xHalfAngle = xHalfAngle;
		this._yHalfAngle = yHalfAngle;
		createVS = true;
	}

	var radius = this.radius;
	if (radius < 0.0) {
		throw new DeveloperError('this.radius must be greater than or equal to zero.');
	}
	var radiusChanged = false;
	if (this._radius !== radius) {
		radiusChanged = true;
		this._radius = radius;
		this._boundingSphere = new BoundingSphere(Cartesian3.ZERO, this.radius);
	}

	var modelMatrixChanged = !Matrix4.equals(this.modelMatrix, this._modelMatrix);
	if (modelMatrixChanged || radiusChanged) {
		Matrix4.clone(this.modelMatrix, this._modelMatrix);
		Matrix4.multiplyByUniformScale(this.modelMatrix, this.radius, this._computedModelMatrix);
		BoundingSphere.transform(this._boundingSphere, this.modelMatrix, this._boundingSphereWC);
	}

	var showThroughEllipsoid = this.showThroughEllipsoid;
	if (this._showThroughEllipsoid !== this.showThroughEllipsoid) {
		this._showThroughEllipsoid = showThroughEllipsoid;
		createRS = true;
	}

	var material = this.material;
	if (this._material !== material) {
		this._material = material;
		createRS = true;
		createSP = true;
	}
	var translucent = material.isTranslucent();
	if (this._translucent !== translucent) {
		this._translucent = translucent;
		createRS = true;
	}

	if (this.showScanPlane) {
		var time = frameState.time;
		var timeDiff = JulianDate.secondsDifference(time, this._time);
		if (timeDiff < 0) {
			this._time = JulianDate.clone(time, this._time);
		}
		var percentage = Math.max(timeDiff % this.scanPlaneRate / this.scanPlaneRate, 0);
		console.log(percentage);
		var angle;

		if (this.scanPlaneMode == 'horizontal') {
			angle = 2 * yHalfAngle * percentage - yHalfAngle;
			var cosYHalfAngle = cos(angle);
			var tanXHalfAngle = tan(xHalfAngle);

			var maxX = atan(cosYHalfAngle * tanXHalfAngle);
			this._scanePlaneXHalfAngle = maxX;
			this._scanePlaneYHalfAngle = angle;
			Cesium.Matrix3.fromRotationX(this._scanePlaneYHalfAngle, matrix3Scratch);
		} else {
			angle = 2 * xHalfAngle * percentage - xHalfAngle;
			var tanYHalfAngle = tan(yHalfAngle);
			var cosXHalfAngle = cos(angle);

			var maxY = atan(cosXHalfAngle * tanYHalfAngle);
			this._scanePlaneXHalfAngle = angle;
			this._scanePlaneYHalfAngle = maxY;
			Cesium.Matrix3.fromRotationY(this._scanePlaneXHalfAngle, matrix3Scratch);
		}

		Cesium.Matrix4.multiplyByMatrix3(this.modelMatrix, matrix3Scratch, this._computedScanPlaneModelMatrix);
		Matrix4.multiplyByUniformScale(this._computedScanPlaneModelMatrix, this.radius, this._computedScanPlaneModelMatrix);
	}

	if (createVS) {
		createVertexArray(this, frameState);
	}
	if (createRS) {
		createRenderState(this, showThroughEllipsoid, translucent);
	}
	if (createSP) {
		createShaderProgram(this, frameState, material);
	}
	if (createRS || createSP) {
		createCommands(this, translucent);
	}

	var commandList = frameState.commandList;
	var passes = frameState.passes;
	var colorCommands = this._colorCommands;
	if (passes.render) {
		for (var i = 0, len = colorCommands.length; i < len; i++) {
			var colorCommand = colorCommands[i];
			commandList.push(colorCommand);
		}
	}
};

var matrix3Scratch = new Matrix3();
var nScratch = new Cartesian3();

//region -- VertexArray --

/**
 * 计算zoy面和zoy面单位扇形位置
 * @param primitive
 * @returns {{zoy: Array, zox: Array}}
 */
function computeUnitPosiiton(primitive, xHalfAngle, yHalfAngle) {
	var slice = primitive.slice;

	//以中心为角度
	var cosYHalfAngle = cos(yHalfAngle);
	var tanYHalfAngle = tan(yHalfAngle);
	var cosXHalfAngle = cos(xHalfAngle);
	var tanXHalfAngle = tan(xHalfAngle);

	var maxY = atan(cosXHalfAngle * tanYHalfAngle);
	var maxX = atan(cosYHalfAngle * tanXHalfAngle);

	//ZOY面单位圆
	var zoy = [];
	for (var i = 0; i < slice; i++) {
		var phi = 2 * maxY * i / (slice - 1) - maxY;
		zoy.push(new Cartesian3(0, sin(phi), cos(phi)));
	}
	//zox面单位圆
	var zox = [];
	for (var i = 0; i < slice; i++) {
		var phi = 2 * maxX * i / (slice - 1) - maxX;
		zox.push(new Cartesian3(sin(phi), 0, cos(phi)));
	}

	return {
		zoy: zoy,
		zox: zox
	};
}

/**
 * 计算扇面的位置
 * @param unitPosition
 * @returns {Array}
 */
function computeSectorPositions(primitive, unitPosition) {
	var xHalfAngle = primitive.xHalfAngle,
		yHalfAngle = primitive.yHalfAngle,
		zoy = unitPosition.zoy,
		zox = unitPosition.zox;
	var positions = [];

	//zoy面沿y轴逆时针转xHalfAngle
	var matrix3 = Matrix3.fromRotationY(xHalfAngle, matrix3Scratch);
	positions.push(zoy.map(function (p) {
		return Matrix3.multiplyByVector(matrix3, p, new Cesium.Cartesian3());
	}));
	//zox面沿x轴顺时针转yHalfAngle
	var matrix3 = Matrix3.fromRotationX(-yHalfAngle, matrix3Scratch);
	positions.push(zox.map(function (p) {
		return Matrix3.multiplyByVector(matrix3, p, new Cesium.Cartesian3());
	}).reverse());
	//zoy面沿y轴顺时针转xHalfAngle
	var matrix3 = Matrix3.fromRotationY(-xHalfAngle, matrix3Scratch);
	positions.push(zoy.map(function (p) {
		return Matrix3.multiplyByVector(matrix3, p, new Cesium.Cartesian3());
	}).reverse());
	//zox面沿x轴逆时针转yHalfAngle
	var matrix3 = Matrix3.fromRotationX(yHalfAngle, matrix3Scratch);
	positions.push(zox.map(function (p) {
		return Matrix3.multiplyByVector(matrix3, p, new Cesium.Cartesian3());
	}));
	return positions;
}

/**
 * 创建扇面顶点
 * @param context
 * @param positions
 * @returns {*}
 */
function createSectorVertexArray(context, positions) {
	var planeLength = Array.prototype.concat.apply([], positions).length - positions.length;
	var vertices = new Float32Array(2 * 3 * 3 * planeLength);

	var k = 0;
	for (var i = 0, len = positions.length; i < len; i++) {
		var planePositions = positions[i];
		var n = Cartesian3.normalize(Cartesian3.cross(planePositions[0], planePositions[planePositions.length - 1],
			nScratch), nScratch);
		for (var j = 0, planeLength = planePositions.length - 1; j < planeLength; j++) {
			vertices[k++] = 0.0;
			vertices[k++] = 0.0;
			vertices[k++] = 0.0;
			vertices[k++] = -n.x;
			vertices[k++] = -n.y;
			vertices[k++] = -n.z;

			vertices[k++] = planePositions[j].x;
			vertices[k++] = planePositions[j].y;
			vertices[k++] = planePositions[j].z;
			vertices[k++] = -n.x;
			vertices[k++] = -n.y;
			vertices[k++] = -n.z;

			vertices[k++] = planePositions[j + 1].x;
			vertices[k++] = planePositions[j + 1].y;
			vertices[k++] = planePositions[j + 1].z;
			vertices[k++] = -n.x;
			vertices[k++] = -n.y;
			vertices[k++] = -n.z;
		}
	}

	var vertexBuffer = Buffer.createVertexBuffer({
		context: context,
		typedArray: vertices,
		usage: BufferUsage.STATIC_DRAW
	});

	var stride = 2 * 3 * Float32Array.BYTES_PER_ELEMENT;

	var attributes = [{
		index: attributeLocations.position,
		vertexBuffer: vertexBuffer,
		componentsPerAttribute: 3,
		componentDatatype: ComponentDatatype.FLOAT,
		offsetInBytes: 0,
		strideInBytes: stride
	}, {
		index: attributeLocations.normal,
		vertexBuffer: vertexBuffer,
		componentsPerAttribute: 3,
		componentDatatype: ComponentDatatype.FLOAT,
		offsetInBytes: 3 * Float32Array.BYTES_PER_ELEMENT,
		strideInBytes: stride
	}];

	return new VertexArray({
		context: context,
		attributes: attributes
	});
}

/**
 * 创建扇面边线顶点
 * @param context
 * @param positions
 * @returns {*}
 */
function createSectorLineVertexArray(context, positions) {
	var planeLength = positions.length;
	var vertices = new Float32Array(3 * 3 * planeLength);

	var k = 0;
	for (var i = 0, len = positions.length; i < len; i++) {
		var planePositions = positions[i];
		vertices[k++] = 0.0;
		vertices[k++] = 0.0;
		vertices[k++] = 0.0;

		vertices[k++] = planePositions[0].x;
		vertices[k++] = planePositions[0].y;
		vertices[k++] = planePositions[0].z;
	}

	var vertexBuffer = Buffer.createVertexBuffer({
		context: context,
		typedArray: vertices,
		usage: BufferUsage.STATIC_DRAW
	});

	var stride = 3 * Float32Array.BYTES_PER_ELEMENT;

	var attributes = [{
		index: attributeLocations.position,
		vertexBuffer: vertexBuffer,
		componentsPerAttribute: 3,
		componentDatatype: ComponentDatatype.FLOAT,
		offsetInBytes: 0,
		strideInBytes: stride
	}];

	return new VertexArray({
		context: context,
		attributes: attributes
	});
}

/**
 * 创建扇面圆顶面连接线顶点
 * @param context
 * @param positions
 * @returns {*}
 */
function createSectorSegmentLineVertexArray(context, positions) {
	var planeLength = Array.prototype.concat.apply([], positions).length - positions.length;
	var vertices = new Float32Array(3 * 3 * planeLength);

	var k = 0;
	for (var i = 0, len = positions.length; i < len; i++) {
		var planePositions = positions[i];

		for (var j = 0, planeLength = planePositions.length - 1; j < planeLength; j++) {
			vertices[k++] = planePositions[j].x;
			vertices[k++] = planePositions[j].y;
			vertices[k++] = planePositions[j].z;

			vertices[k++] = planePositions[j + 1].x;
			vertices[k++] = planePositions[j + 1].y;
			vertices[k++] = planePositions[j + 1].z;
		}
	}

	var vertexBuffer = Buffer.createVertexBuffer({
		context: context,
		typedArray: vertices,
		usage: BufferUsage.STATIC_DRAW
	});

	var stride = 3 * Float32Array.BYTES_PER_ELEMENT;

	var attributes = [{
		index: attributeLocations.position,
		vertexBuffer: vertexBuffer,
		componentsPerAttribute: 3,
		componentDatatype: ComponentDatatype.FLOAT,
		offsetInBytes: 0,
		strideInBytes: stride
	}];

	return new VertexArray({
		context: context,
		attributes: attributes
	});
}

/**
 * 创建圆顶面顶点
 * @param context
 */
function createDomeVertexArray(context) {
	var geometry = Cesium.EllipsoidGeometry.createGeometry(new Cesium.EllipsoidGeometry({
		vertexFormat: VertexFormat.POSITION_ONLY,
		stackPartitions: 32,
		slicePartitions: 32
	}));

	var vertexArray = VertexArray.fromGeometry({
		context: context,
		geometry: geometry,
		attributeLocations: attributeLocations,
		bufferUsage: BufferUsage.STATIC_DRAW,
		interleave: false
	});
	return vertexArray;
}

/**
 * 创建圆顶面连线顶点
 * @param context
 */
function createDomeLineVertexArray(context) {
	var geometry = Cesium.EllipsoidOutlineGeometry.createGeometry(new Cesium.EllipsoidOutlineGeometry({
		vertexFormat: VertexFormat.POSITION_ONLY,
		stackPartitions: 32,
		slicePartitions: 32
	}));

	var vertexArray = VertexArray.fromGeometry({
		context: context,
		geometry: geometry,
		attributeLocations: attributeLocations,
		bufferUsage: BufferUsage.STATIC_DRAW,
		interleave: false
	});
	return vertexArray;
}

/**
 * 创建扫描面顶点
 * @param context
 * @param positions
 * @returns {*}
 */
function createScanPlaneVertexArray(context, positions) {
	var planeLength = positions.length - 1;
	var vertices = new Float32Array(3 * 3 * planeLength);

	var k = 0;
	for (var i = 0; i < planeLength; i++) {
		vertices[k++] = 0.0;
		vertices[k++] = 0.0;
		vertices[k++] = 0.0;

		vertices[k++] = positions[i].x;
		vertices[k++] = positions[i].y;
		vertices[k++] = positions[i].z;

		vertices[k++] = positions[i + 1].x;
		vertices[k++] = positions[i + 1].y;
		vertices[k++] = positions[i + 1].z;
	}

	var vertexBuffer = Buffer.createVertexBuffer({
		context: context,
		typedArray: vertices,
		usage: BufferUsage.STATIC_DRAW
	});

	var stride = 3 * Float32Array.BYTES_PER_ELEMENT;

	var attributes = [{
		index: attributeLocations.position,
		vertexBuffer: vertexBuffer,
		componentsPerAttribute: 3,
		componentDatatype: ComponentDatatype.FLOAT,
		offsetInBytes: 0,
		strideInBytes: stride
	}];

	return new VertexArray({
		context: context,
		attributes: attributes
	});
}

function createVertexArray(primitive, frameState) {
	var context = frameState.context;

	var unitSectorPositions = computeUnitPosiiton(primitive, primitive.xHalfAngle, primitive.yHalfAngle);
	var positions = computeSectorPositions(primitive, unitSectorPositions);

	//显示扇面
	if (primitive.showLateralSurfaces) {
		primitive._sectorVA = createSectorVertexArray(context, positions);
	}

	//显示扇面线
	if (primitive.showSectorLines) {
		primitive._sectorLineVA = createSectorLineVertexArray(context, positions);
	}

	//显示扇面圆顶面的交线
	if (primitive.showSectorSegmentLines) {
		primitive._sectorSegmentLineVA = createSectorSegmentLineVertexArray(context, positions);
	}

	//显示弧面
	if (primitive.showDomeSurfaces) {
		primitive._domeVA = createDomeVertexArray(context);
	}

	//显示弧面线
	if (primitive.showDomeLines) {
		primitive._domeLineVA = createDomeLineVertexArray(context);
	}

	//显示扫描面
	if (primitive.showScanPlane) {

		if (primitive.scanPlaneMode == 'horizontal') {
			var unitScanPlanePositions = computeUnitPosiiton(primitive, CesiumMath.PI_OVER_TWO, 0);
			primitive._scanPlaneVA = createScanPlaneVertexArray(context, unitScanPlanePositions.zox);
		} else {
			var unitScanPlanePositions = computeUnitPosiiton(primitive, 0, CesiumMath.PI_OVER_TWO);
			primitive._scanPlaneVA = createScanPlaneVertexArray(context, unitScanPlanePositions.zoy);
		}
	}
}

//endregion

//region -- ShaderProgram --

function createCommonShaderProgram(primitive, frameState, material) {
	var context = frameState.context;

	var vs = shader2;
	var fs = new ShaderSource({
		sources: [shader3, material.shaderSource, shader1]
	});

	primitive._sp = ShaderProgram.replaceCache({
		context: context,
		shaderProgram: primitive._sp,
		vertexShaderSource: vs,
		fragmentShaderSource: fs,
		attributeLocations: attributeLocations
	});

	var pickFS = new ShaderSource({
		sources: [shader3, material.shaderSource, shader1],
		pickColorQualifier: 'uniform'
	});

	primitive._pickSP = ShaderProgram.replaceCache({
		context: context,
		shaderProgram: primitive._pickSP,
		vertexShaderSource: vs,
		fragmentShaderSource: pickFS,
		attributeLocations: attributeLocations
	});
}

function createScanPlaneShaderProgram(primitive, frameState, material) {
	var context = frameState.context;

	var vs = shader2;
	var fs = new ShaderSource({
		sources: [shader3, material.shaderSource, shader4]
	});

	primitive._scanePlaneSP = ShaderProgram.replaceCache({
		context: context,
		shaderProgram: primitive._scanePlaneSP,
		vertexShaderSource: vs,
		fragmentShaderSource: fs,
		attributeLocations: attributeLocations
	});
}

function createShaderProgram(primitive, frameState, material) {
	createCommonShaderProgram(primitive, frameState, material);

	if (primitive.showScanPlane) {
		createScanPlaneShaderProgram(primitive, frameState, material);
	}
}

//endregion

//region -- RenderState --

function createRenderState(primitive, showThroughEllipsoid, translucent) {
	if (translucent) {
		primitive._frontFaceRS = RenderState.fromCache({
			depthTest: {
				enabled: !showThroughEllipsoid
			},
			depthMask: false,
			blending: BlendingState.ALPHA_BLEND,
			cull: {
				enabled: true,
				face: CullFace.BACK
			}
		});

		primitive._backFaceRS = RenderState.fromCache({
			depthTest: {
				enabled: !showThroughEllipsoid
			},
			depthMask: false,
			blending: BlendingState.ALPHA_BLEND,
			cull: {
				enabled: true,
				face: CullFace.FRONT
			}
		});

		primitive._pickRS = RenderState.fromCache({
			depthTest: {
				enabled: !showThroughEllipsoid
			},
			depthMask: false,
			blending: BlendingState.ALPHA_BLEND
		});
	} else {
		primitive._frontFaceRS = RenderState.fromCache({
			depthTest: {
				enabled: !showThroughEllipsoid
			},
			depthMask: true
		});

		primitive._pickRS = RenderState.fromCache({
			depthTest: {
				enabled: true
			},
			depthMask: true
		});
	}
}

//endregion

//region -- Command --

function createCommand(primitive, frontCommand, backCommand, frontFaceRS, backFaceRS, sp, va, uniforms,
	modelMatrix, translucent, pass, isLine) {
	if (translucent && backCommand) {
		backCommand.vertexArray = va;
		backCommand.renderState = backFaceRS;
		backCommand.shaderProgram = sp;
		backCommand.uniformMap = combine(uniforms, primitive._material._uniforms);
		backCommand.uniformMap.u_normalDirection = function () {
			return -1.0;
		};
		backCommand.pass = pass;
		backCommand.modelMatrix = modelMatrix;
		primitive._colorCommands.push(backCommand);
	}

	frontCommand.vertexArray = va;
	frontCommand.renderState = frontFaceRS;
	frontCommand.shaderProgram = sp;
	frontCommand.uniformMap = combine(uniforms, primitive._material._uniforms);
	if (isLine) {
		frontCommand.uniformMap.u_type = function () {
			return 1;
		};
	}
	frontCommand.pass = pass;
	frontCommand.modelMatrix = modelMatrix;
	primitive._colorCommands.push(frontCommand);
}

function createCommands(primitive, translucent) {
	primitive._colorCommands.length = 0;

	var pass = translucent ? Pass.TRANSLUCENT : Pass.OPAQUE;

	//显示扇面
	if (primitive.showLateralSurfaces) {
		createCommand(primitive, primitive._sectorFrontCommand, primitive._sectorBackCommand, primitive._frontFaceRS,
			primitive._backFaceRS, primitive._sp, primitive._sectorVA, primitive._uniforms, primitive._computedModelMatrix,
			translucent, pass);
	}
	//显示扇面线
	if (primitive.showSectorLines) {
		createCommand(primitive, primitive._sectorLineCommand, undefined, primitive._frontFaceRS, primitive._backFaceRS,
			primitive._sp, primitive._sectorLineVA, primitive._uniforms, primitive._computedModelMatrix, translucent,
			pass, true);
	}
	//显示扇面交接线
	if (primitive.showSectorSegmentLines) {
		createCommand(primitive, primitive._sectorSegmentLineCommand, undefined, primitive._frontFaceRS, primitive._backFaceRS,
			primitive._sp, primitive._sectorSegmentLineVA, primitive._uniforms, primitive._computedModelMatrix,
			translucent, pass, true);
	}
	//显示弧面
	if (primitive.showDomeSurfaces) {
		createCommand(primitive, primitive._domeFrontCommand, primitive._domeBackCommand, primitive._frontFaceRS,
			primitive._backFaceRS, primitive._sp, primitive._domeVA, primitive._uniforms, primitive._computedModelMatrix,
			translucent, pass);
	}
	//显示弧面线
	if (primitive.showDomeLines) {
		createCommand(primitive, primitive._domeLineCommand, undefined, primitive._frontFaceRS, primitive._backFaceRS,
			primitive._sp, primitive._domeLineVA, primitive._uniforms, primitive._computedModelMatrix, translucent, pass,
			true);
	}
	//显示扫描面
	if (primitive.showScanPlane) {
		createCommand(primitive, primitive._scanPlaneFrontCommand, primitive._scanPlaneBackCommand, primitive._frontFaceRS,
			primitive._backFaceRS, primitive._scanePlaneSP, primitive._scanPlaneVA, primitive._scanUniforms, primitive._computedScanPlaneModelMatrix,
			translucent, pass);
	}
}


var originalDefaultVisualizersCallback = Cesium.DataSourceDisplay.defaultVisualizersCallback;
Cesium.DataSourceDisplay.defaultVisualizersCallback = function (scene, entityCluster, dataSource) {
	var entities = dataSource.entities;
	var array = originalDefaultVisualizersCallback(scene, entityCluster, dataSource);
	return array.concat([new ScanRadarVisualizer(scene, entities)]);
};

export default ScanRadarGraphics;