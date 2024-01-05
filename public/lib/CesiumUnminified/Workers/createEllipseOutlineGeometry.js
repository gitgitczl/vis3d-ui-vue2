/**
 * @license
 * Cesium - https://github.com/CesiumGS/cesium
 * Version 1.113
 *
 * Copyright 2011-2022 Cesium Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Columbus View (Pat. Pend.)
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/main/LICENSE.md for full licensing details.
 */

import {
  EllipseOutlineGeometry_default
} from "./chunk-DR5XZ6K5.js";
import "./chunk-QRBRVGZC.js";
import "./chunk-MN34FIF5.js";
import "./chunk-LX6XV4DK.js";
import "./chunk-PIXK6KHB.js";
import "./chunk-R3HUGXBH.js";
import "./chunk-HOT2SNXP.js";
import "./chunk-4KP73B43.js";
import "./chunk-3PW6ZBN4.js";
import "./chunk-ARPTYYKS.js";
import {
  Cartesian3_default,
  Ellipsoid_default
} from "./chunk-LGJUI2CE.js";
import "./chunk-BP467WX3.js";
import "./chunk-SV7DDPAC.js";
import "./chunk-RIDPF7PO.js";
import "./chunk-CWJQGBWT.js";
import "./chunk-5HLGKKG3.js";
import {
  defined_default
} from "./chunk-YBKFS53K.js";

// packages/engine/Source/Workers/createEllipseOutlineGeometry.js
function createEllipseOutlineGeometry(ellipseGeometry, offset) {
  if (defined_default(offset)) {
    ellipseGeometry = EllipseOutlineGeometry_default.unpack(ellipseGeometry, offset);
  }
  ellipseGeometry._center = Cartesian3_default.clone(ellipseGeometry._center);
  ellipseGeometry._ellipsoid = Ellipsoid_default.clone(ellipseGeometry._ellipsoid);
  return EllipseOutlineGeometry_default.createGeometry(ellipseGeometry);
}
var createEllipseOutlineGeometry_default = createEllipseOutlineGeometry;
export {
  createEllipseOutlineGeometry_default as default
};
