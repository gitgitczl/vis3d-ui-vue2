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
  FrustumGeometry_default
} from "./chunk-CDGHUKQ4.js";
import "./chunk-ZQRZBHYI.js";
import "./chunk-LGL4P5KL.js";
import "./chunk-PIXK6KHB.js";
import "./chunk-R3HUGXBH.js";
import "./chunk-HOT2SNXP.js";
import "./chunk-4KP73B43.js";
import "./chunk-3PW6ZBN4.js";
import "./chunk-ARPTYYKS.js";
import "./chunk-LGJUI2CE.js";
import "./chunk-BP467WX3.js";
import "./chunk-SV7DDPAC.js";
import "./chunk-RIDPF7PO.js";
import "./chunk-CWJQGBWT.js";
import "./chunk-5HLGKKG3.js";
import {
  defined_default
} from "./chunk-YBKFS53K.js";

// packages/engine/Source/Workers/createFrustumGeometry.js
function createFrustumGeometry(frustumGeometry, offset) {
  if (defined_default(offset)) {
    frustumGeometry = FrustumGeometry_default.unpack(frustumGeometry, offset);
  }
  return FrustumGeometry_default.createGeometry(frustumGeometry);
}
var createFrustumGeometry_default = createFrustumGeometry;
export {
  createFrustumGeometry_default as default
};
