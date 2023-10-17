<template>
  <Card @close="close" :title="title" :size="size" :position="position" :iconfont="iconfont">
    <p class="roam-toolip">提示：支持.json格式的路线文件导入</p>
    <div class="roam-operate">
      <span class="basic-btn" @click="startDraw">新增线路</span>
      <span class="basic-btn" @click="importFile">导入</span>
      <span class="basic-btn" @click="saveFile">导出</span>
    </div>

    <div class="split-line"></div>

    <!-- 漫游列表 -->
    <div class="reset-table roam-tabel">
      <el-table v-show="isShowList" :data="roamTabList" max-height="400px" style="width: 100%">
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="名称" prop="name"></el-table-column>
        <el-table-column label="类型" prop="typeName"></el-table-column>
        <el-table-column label="备注" prop="mark"></el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <span title="开始漫游" class="el-icon-s-promotion operate-btn-icon" @click="startRoam(scope.row)"></span>
            <span title="编辑" class="el-icon-edit operate-btn-icon" @click="roamEdit(scope.row)"></span>
            <span title="删除" class="el-icon-delete operate-btn-icon" @click="roamDelete(scope.row)"></span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 漫游属性设置 -->
    <div class="roam-attr" v-show="!isShowList">
      <el-row class="roatm-attr-item basic-text-input">
        <el-col :span="6">名称：</el-col>
        <el-col :span="18">
          <el-input placeholder="请输入名称" v-model="nowRoamAttr.name"></el-input>
        </el-col>
      </el-row>

      <!-- 漫游时 可设置模型 -->
      <el-row class="roatm-attr-item reset-radio">
        <el-col :span="6">显示模型：</el-col>
        <el-col :span="18">
          <el-radio-group v-model="selectModel">
            <el-radio label="isSelectModel">是</el-radio>
            <el-radio label="noSelectModel">否</el-radio>
          </el-radio-group>
        </el-col>
      </el-row>

      <el-row class="roatm-attr-item reset-select basic-select" v-if="selectModel == 'isSelectModel'">
        <el-col :span="6">模型选择：</el-col>
        <el-col :span="18">
          <el-select v-model="roamModel" placeholder="请选择">
            <el-option v-for="(item, index) in modelList" :key="index" :label="item.name" :value="item.uri">
            </el-option>
          </el-select>
        </el-col>
      </el-row>

      <!-- 固定时长 or 固定速度漫游 -->
      <el-row class="roatm-attr-item reset-radio">
        <el-col :span="6">漫游设置：</el-col>
        <el-col :span="18">
          <el-radio-group v-model="nowRoamAttr.fixType">
            <el-radio label="0">固定时长</el-radio>
            <el-radio label="1">固定速度</el-radio>
          </el-radio-group>
        </el-col>
      </el-row>
      <el-row class="roatm-attr-item basic-text-input" v-if="nowRoamAttr.fixType == '0'">
        <el-col :span="6">漫游时长：</el-col>
        <el-col :span="18">
          <el-input placeholder="请输入时长" v-model="nowRoamAttr.alltimes"></el-input>
        </el-col>
      </el-row>
      <el-row class="roatm-attr-item basic-text-input" v-if="nowRoamAttr.fixType == '1'">
        <el-col :span="6">漫游速度(m/s)：</el-col>
        <el-col :span="18">
          <el-input placeholder="请输入速度" v-model="nowRoamAttr.speed"></el-input>
        </el-col>
      </el-row>
      <!-- 其它配置 -->
      <el-row class="roatm-attr-item reset-select basic-select">
        <el-col :span="6">漫游类型：</el-col>
        <el-col :span="18">
          <el-select v-model="nowRoamAttr.roamType" placeholder="请选择">
            <el-option label="普通" value="0"> </el-option>
            <el-option label="飞行漫游" value="1"> </el-option>
            <el-option label="贴地漫游" value="2"> </el-option>
            <!--  <el-option label="贴模型漫游" value="3"> </el-option> -->
          </el-select>
        </el-col>
      </el-row>

      <el-row v-if="nowRoamAttr.roamType === '1'" class="roatm-attr-item basic-text-input">
        <el-col :span="6">飞行高度：</el-col>
        <el-col :span="18">
          <el-input placeholder="请输入高度" v-model="nowRoamAttr.height"></el-input>
        </el-col>
      </el-row>
      <el-row class="roatm-attr-item reset-select basic-select">
        <el-col :span="6">视角选择：</el-col>
        <el-col :span="18">
          <el-select v-model="nowRoamAttr.viewType" placeholder="请选择">
            <el-option label="无" value="no"></el-option>
            <el-option label="第一视角" value="dy"> </el-option>
            <el-option label="上帝视角" value="sd"></el-option>
            <el-option label="跟随视角" value="gs"></el-option>
          </el-select>
        </el-col>
      </el-row>
      <el-row class="roatm-attr-item basic-text-input">
        <el-col :span="6">备注：</el-col>
        <el-col :span="18">
          <el-input placeholder="请输入名称" v-model="nowRoamAttr.mark"></el-input>
        </el-col>
      </el-row>

      <div class="roam-add-btn">
        <span class="basic-btn" @click="confirmEdit">确定</span>
        <span class="basic-clear-btn" @click="resetEdit">取消</span>
      </div>
    </div>

    <!-- 打开文件 -->
    <input type="file" accept=".json" style="display: none" id="roam-loadFile" @change="loadFileChange" />
  </Card>
</template>

<script>
// 飞行漫游

let roamDrawTool = null;
let roamTool = null;
let nowEditEntityObj = null;
let lastRouteObj = null; // 上次漫游的线路
window.nowRoam = undefined;
export default {
  name: "roam",

  props: {
    title: "",
    position: {},
    size: {},
    iconfont: {
      type: String,
      default: "icon-youlan",
    },
  },

  components: {

  },

  data() {
    return {
      isShowList: true,
      roamTabList: [],
      nowRoamAttr: {
        name: "",
        roamType: "0",
        viewType: "no",
        fixType: "0",
        alltimes: 60,
        mark: "",
        height: 1000,
        entityAttr: {},
      },
      // 漫游模型选择
      selectModel: "isSelectModel",
      roamModel: "./gltf/dajiang.gltf",
      modelList: [
        {
          name: "无人机",
          uri: "./gltf/dajiang.gltf",
          scale: 50,
        },
      ],
    };
  },
  mounted() {
    let that = this;
    if (!roamTool) {
      roamTool = new this.vis3d.roam.Tool(window.viewer);
      roamTool.on("startRoam", function () {
        // 开始漫游时 显示漫游面板
        window.workControl.openToolByName("roamStyle",roamTool.getNowroamAttr());
      });
      roamTool.on("endRoam", function () {
        // 结束漫游时 显示漫游列表
        window.workControl.closeToolByName("roamStyle");
      });
      roamTool.on("roaming", function () {
        // 每秒回调一次
        that.$emit("fire", {
          toolName: "roamStyle",
          method: 'setNowRoamAttr',
          arg: roamTool.getNowroamAttr()
        })
      });
      roamTool.on("stopRoam", function () {
        that.$emit("fire", {})
      });
      roamTool.on("goonRoam", function () {
        that.$emit("fire", {
          toolName: "roamStyle",
          method: 'setNowRoamAttr',
          arg: roamTool.getNowroamAttr()
        })
      });
    }

    if (!roamDrawTool) {
      roamDrawTool = new this.vis3d.plot.Tool(window.viewer, {
        canEdit: true,
      });
      roamDrawTool.on("startEdit", function (entObj, ent) {
        // 结束其他漫游
        roamTool.endRoam();
        window.nowRoam = null;
        nowEditEntityObj = entObj;
        // 不显示漫游列表
        that.isShowList = false;
        let roams = roamTool.getRoamByField("plotId", entObj.attr.id);
        if (!roams[0]) return;
        // 获取当前漫游对象属性 表单赋值
        let roamAttr = roams[0].roam.getAttr();

        that.nowRoamAttr.name = roamAttr.name;
        that.nowRoamAttr.roamType = roamAttr.roamType;
        that.nowRoamAttr.viewType = roamAttr.viewType;
        that.nowRoamAttr.mark = roamAttr.mark;
        that.nowRoamAttr.fixType = roamAttr.fixType;
        that.nowRoamAttr.alltimes = roamAttr.alltimes;
        that.nowRoamAttr.speed = roamAttr.speed;
        that.nowRoamAttr.height = roamAttr.height;
        // 获取当前漫游实体对象
        let entityAttr = roamAttr.entityAttr;
        that.roamModel = (entityAttr && entityAttr.uri) || "";
        that.selectModel = entityAttr.uri ? "isSelectModel" : "noSelectModel";
      });

      roamDrawTool.on("endEdit", function (entObj, ent) {
        that.isShowList = true;
        if (!roamTool) return;
        // ======== 当前表单信息 ==========
        let roamTypeNmae = "普通";
        if (that.nowRoamAttr.roamType == 0) {
          roamTypeNmae = "普通";
        } else if (that.nowRoamAttr.roamType == 1) {
          roamTypeNmae = "飞行漫游";
        } else if (that.nowRoamAttr.roamType == 2) {
          roamTypeNmae = "贴地漫游";
        } else {
          roamTypeNmae = "贴模型漫游";
        }

        that.nowRoamAttr.name =
          that.nowRoamAttr.name || "未命名" + new Date().getSeconds();
        let roamform = {
          name: that.nowRoamAttr.name,
          mark: that.nowRoamAttr.mark || "无",
          typeName: roamTypeNmae,
          plotId: entObj.attr.id,
        };
        let roams = roamTool.getRoamByField("plotId", entObj.attr.id);

        if (roams[0]) {
          // ====== 编辑 更新列表中数据 ======
          // 同步漫游列表中数据
          let plotId = roams[0].roam.attr.plotId;
          for (let i = 0; i < that.roamTabList.length; i++) {
            if (that.roamTabList[i].plotId == plotId) {
              that.roamTabList.splice(i, 1, roamform);
              break;
            }
          }
          // 编辑时 先删除原来的漫游对象 下面重新创建
          roamTool.removeRoam(roams[0].roam);
        } else {
          // ====== 新增 列表中插入新数据 ======
          that.roamTabList.push(roamform);
        }

        // 创建新的漫游对象
        let attr = {};
        let positions = entObj.getPositions(false);
        attr.positions = positions;
        attr.plotId = entObj.attr.id; // 和标绘关联
        let roamAttr = Object.assign(attr, that.nowRoamAttr);
        // 设置漫游模型
        let entityAttr = that.modelList.filter((model) => {
          return model.uri == that.roamModel;
        });

        if (that.selectModel == "isSelectModel") {
          roamAttr.entityType = "model";
        }
        roamAttr.entityAttr = entityAttr[0] || {}; // 设置漫游模型
        roamTool.create(roamAttr);

        // 编辑完后重置表单
        that.nowRoamAttr = {
          name: "",
          roamType: "0",
          viewType: "no",
          fixType: "0",
          mark: "",
          height: 1000,
          entityAttr: {},
        };

        that.selectModel = "isSelectModel";
        that.roamModel = "./gltf/dajiang.gltf";

      });
    }
  },

  destroyed() {
    if (roamDrawTool) {
      roamDrawTool.destroy();
      roamDrawTool = null;
    }
    if (roamTool) {
      roamTool.destroy();
      roamTool = null;
    }
    window.nowRoam = undefined;
    window.workControl.closeToolByName("roamStyle");
  },

  methods: {
    close() {
      window.workControl.closeToolByName('roam');
      window.workControl.closeToolByName("roamStyle");
    },
    startDraw() {
      if (!roamDrawTool) return;
      roamDrawTool.start({
        type: "polyline",
        style: {
          color: Cesium.Color.RED.withAlpha(0.6),
          width: 3,
          clampToGround: true,
        },
      });
    },
    startRoam(attr) {
      // 显示之前隐藏的线路
      if (lastRouteObj && lastRouteObj.entObj) {
        lastRouteObj.entObj.setVisible(true);
        lastRouteObj = null;
      }
      let roams = roamTool.getRoamByField("plotId", attr.plotId);
      if (roams[0]) {
        roamTool.startRoam(roams[0].roam);
        window.nowRoam = roams[0].roam;
      }
      // 隐藏对应线
      let eo = roamDrawTool.getEntityObjById(attr.plotId);
      if (eo.entityObj) eo.entityObj.setVisible(false);
      lastRouteObj = eo;
    },
    roamEdit(attr) {
      // 开始编辑 当前所有漫游
      roamTool.endRoam();
      // 隐藏对应线
      let eo = roamDrawTool.getEntityObjById(attr.plotId);
      if (eo.entityObj) {
        roamDrawTool.startEditOne(eo.entityObj);
      }
    },
    roamDelete(attr) {
      let roams = roamTool.getRoamByField("plotId", attr.plotId);
      if (roams[0]) {
        roamTool.removeRoam(roams[0].roam);
      }
      roamDrawTool.removeById(attr.plotId);

      for (let i = 0; i < this.roamTabList.length; i++) {
        if (this.roamTabList[i].plotId == attr.plotId) {
          this.roamTabList.splice(i, 1);
          break;
        }
      }
    },
    // 提交当前编辑
    confirmEdit() {
      if (!roamDrawTool) return;
      roamDrawTool.endEdit();
    },
    // 取消当前编辑
    resetEdit() {
      // 移除当前编辑对象
      if (!roamDrawTool) return;
      roamDrawTool.endEdit();
      if (nowEditEntityObj)
        this.roamDelete({
          plotId: nowEditEntityObj.entity.objId,
        });
    },
    importFile() {
      let dom = document.getElementById("roam-loadFile");
      if (dom) dom.click();
    },
    saveFile() {
      let jsondata = roamTool.toJson();
      this.vis3d.tool.downloadFile(
        "场景漫游.json",
        JSON.stringify(jsondata)
      );
    },
    // 打开当前漫游文件
    loadFileChange(e) {
      let that = this;
      let file = e.target.files[0];
      let fileName = file.name;
      let fileType = fileName
        .substring(fileName.lastIndexOf(".") + 1, fileName.length)
        .toLowerCase();
      if (fileType != "json") {
        console.warn("文件类型不合法,请选择json格式标注文件！");
        return;
      }
      if (window.FileReader) {
        let reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onloadend = function (e) {
          let strjson = this.result;
          let jsonArr = JSON.parse(strjson);
          // 构建漫游线路
          for (let i = 0; i < jsonArr.length; i++) {
            let attr = jsonArr[i];
            roamDrawTool.createByPositions({
              type: "polyline",
              style: {
                color: Cesium.Color.RED.withAlpha(0.6),
                width: 3,
              },
              positions: attr.positions,
              fireEdit: true, // 绘制完成 触发编辑
            });
            // 当前属性赋值
            that.nowRoamAttr = {
              name: attr.name || "未命名",
              roamType: attr.roamType,
              viewType: attr.viewType,
              mark: attr.mark,
              fixType: attr.fixType,
              alltimes: attr.alltimes,
              speed: attr.speed,
              height: Number(attr.height || 0)
            };

            that.selectModel = attr.entityAttr.uri
              ? "isSelectModel"
              : "noSelectModel";
            that.roamModel = attr.entityAttr.uri;

            roamDrawTool.endEdit();
          }
        };
      }
    },
    
  },
};
</script>

<style lang="less">
.roam-tabel {
  margin: 10px 0;
}

.roam-operate {
  display: flex;
  align-items: center;
  margin: 10px auto;

  span {
    height: 40px;
    padding: 0 20px;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:nth-child(2) {
      margin: 0 20px;
    }
  }
}

.roam-oper-btn {
  font-size: 16px;
}

.split-line {
  width: 100%;
  height: 1px;
  border-bottom: 1px dashed gray;
}

.roam-attr {
  margin: 10px 0;
}

.roatm-attr-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }
}

.roam-add-btn {
  display: flex;
  align-items: center;
  justify-content: flex-end;

  span {
    height: 40px;
    border-radius: 2px;
    cursor: pointer;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;

    &:last-child {
      margin-right: 0;
    }
  }
}
</style>
