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
  CylinderGeometry_default
} from "./chunk-CSIZ3BGT.js";
import "./chunk-434ZTTFX.js";
import "./chunk-MN34FIF5.js";
import "./chunk-ZQRZBHYI.js";
import "./chunk-LX6XV4DK.js";
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

// packages/engine/Source/Workers/createCylinderGeometry.js
function createCylinderGeometry(cylinderGeometry, offset) {
  if (defined_default(offset)) {
    cylinderGeometry = CylinderGeometry_default.unpack(cylinderGeometry, offset);
  }
  return CylinderGeometry_default.createGeometry(cylinderGeometry);
}
var createCylinderGeometry_default = createCylinderGeometry;
export {
  createCylinderGeometry_default as default
};
