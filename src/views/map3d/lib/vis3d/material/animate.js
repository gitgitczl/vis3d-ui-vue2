import FlowLineMaterial from "./flowline";
import WallMaterial from "./wall";
import WaveMaterial from "./wave";
import ScanMaterial from "./scan";
import CylinderMaterial from "./cylinder"
import EllipsoidTrailMaterial from "./ellipsoid"
export default {
    // FlowLine: FlowLineMaterial,
    // Wall: WallMaterial,
    // Wave: WaveMaterial,
    // Scan: ScanMaterial,
    // Cylinder: CylinderMaterial,
    // Elipsoid: EllipsoidTrailMaterial,
    LineFlow: FlowLineMaterial, // 动态线
    Wall: WallMaterial, 
    EllipseWave: WaveMaterial, // 扩散圆
    EllipseScan: ScanMaterial, // 扫描圆
    CylinderScan: CylinderMaterial, // 锥体扫描
    Elipsoid: EllipsoidTrailMaterial // 动态球体
}
