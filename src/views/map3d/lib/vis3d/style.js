// 用于设置各个entity的样式
const defaulteStyle = {
  point: {
    color: "#00FFFF",
    colorAlpha: 1,
    outlineWidth: 1,
    outlineColor: "#00FFFF",
    outlineColorAlpha: 1,
    pixelSize: 20,
    heightReference: 1,
    disableDepthTestDistance: Number.MAX_VALUE,
  },
  polyline: {
    color: "#FFFF00",
    colorAlpha: 1,
    width: 3,
    clampToGround: 1,
  },
  polygon: {
    heightReference: 1,
    fill: true,
    color: "#00FFFF",
    colorAlpha: 1,
    outline: true,
    outlineWidth: 1,
    outlineColor: "#FFFF00",
    outlineColorAlpha: 1,
  },
  label: {
    fillColor: "#ffffff",
    fillColorAlpah: 1,
    disableDepthTestDistance: Number.MAX_VALUE,
    heightReference: 1,
    showBackground: false,
    backgroundColor: "#000000",
    backgroundColorAlpha: 0.5,
    outlineColor: "#C6A300",
    outlineColorAlpha: 1.0,
    outlineWidth: 1.0,
    pixelOffset: [0, -20],
    font: "14px",
    verticalOrigin: 1, // {CENTER: 0, BOTTOM: 1, BASELINE: 2, TOP: -1}
    HorizontalOrigin: 0, // {CENTER: 0, LEFT: 1, RIGHT: -1}
  },
};

/**
 * 颜色转换
 * @param {Cesium.Color | String} color
 * @param {Number} alpha
 * @returns {Cesium.Color}
 */
const transColor = (color, alpha) => {
  let tcolor = undefined;
  alpha = alpha || 1.0;
  if (color instanceof Cesium.Color) {
    tcolor = color.clone();
  } else {
    tcolor = Cesium.Color.fromCssColorString(color).withAlpha(alpha);
  }
  return tcolor;
};

/**
 * 数组转cartsian2
 * @param {Array} arr
 * @returns {Cesium.Cartesian2}
 */
const transC2 = (arr) => {
  arr = arr || [0, 0];
  return new Cesium.Cartesian2(arr[0], arr[1]);
};

const setPointStyle = (ent, style) => {
  if (!ent) return;
  let point = ent.point;
  style = Object.assign(defaulteStyle.point, style);
  style.color = transColor(style.color, style.colorAlpha);
  style.outlineColor = transColor(style.outlineColor, style.outlineColorAlpha);

  for (let i in style) {
    point[i] = style[i];
  }
};

const setLabelStyle = (ent, style) => {
  if (!ent) return;
  let label = ent.label;
  style = Object.assign(defaulteStyle.label, style);
  style.fillColor = style.color || style.fillColor;
  style.fillColor = transColor(style.fillColor, style.fillColorAlpah);
  style.outlineColor = transColor(style.outlineColor, style.outlineColorAlpha);

  if (style.showBackground) {
    style.backgroundColor = transColor(
      style.backgroundColor,
      style.backgroundColorAlpha
    );
  }
  style.pixelOffset = transC2(style.pixelOffset);
  for (let i in style) {
    label[i] = style[i];
  }
};

const setPolylineStyle = (ent, style) => {
  if (!ent) return;
  let polyline = ent.polyline;
  style = Object.assign(defaulteStyle.polyline, style);
  style.color = transColor(style.color, style.colorAlpha);
  style.material = style.color.clone();
  for (let i in style) {
    polyline[i] = style[i];
  }
}

const setPolygonStyle = (ent, style) => {
  if (!ent) return;
  let polygon = ent.polygon;
  style = Object.assign(defaulteStyle.polyline, style);
  style.color = transColor(style.color, style.colorAlpha);
  style.material = style.color.clone();
  if (style.heightReference == 1) style.height = undefined;
  for (let i in style) {
    polygon[i] = style[i];
  }
}

export { setPointStyle, setLabelStyle, setPolylineStyle, setPolygonStyle };
