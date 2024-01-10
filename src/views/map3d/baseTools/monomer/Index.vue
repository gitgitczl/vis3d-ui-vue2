<template>
  <Card
    :title="title"
    :position="position"
    :size="size"
    height="auto"
    :iconfont="iconfont"
    @close="close"
  >
    <div style="margin: 0px 0px 10px 0px">
      <el-row>
        <el-col :span="4"> 模式： </el-col>
        <el-col :span="20" class="reset-radio">
          <el-radio-group v-model="mode" @change="changeMode">
            <el-radio label="view">预览模式</el-radio>
            <el-radio label="edit">编辑模式</el-radio>
          </el-radio-group>
        </el-col>
      </el-row>
    </div>

    <!-- 属性设置 -->
    <div v-show="isShowAttrTool">
      <el-button type="primary" @click="startDraw" style="margin-bottom: 10px"
        >绘制范围</el-button
      >
      <div>
        <el-row class="monomer-item basic-text-input">
          <el-col :span="4">名称：</el-col>
          <el-col :span="20">
            <el-input placeholder="请输入内容" v-model="dthName"></el-input>
          </el-col>
        </el-row>
        <el-row class="monomer-item basic-text-input">
          <el-col :span="4">备注：</el-col>
          <el-col :span="20">
            <el-input placeholder="请输入内容" v-model="dthMark"></el-input>
          </el-col>
        </el-row>
        <div style="margin-top: 10px">
          <el-button type="primary" @click="endEdit">确定</el-button>
          <el-button type="warning" @click="reset">取消</el-button>
        </div>
      </div>
    </div>
  </Card>
</template>
<script>


/* 单体化 */
let handler = null;
let lastHightlightEnt = null;
let propmt = null;
let drawTool = null;
export default {
  name: "monomer",
  components: {
    
  },
  props: {
    size: {},
    position: {},
    title: "",
    iconfont: {
      type: String,
      default: "icon-getihuabianji",
    },
  },
  data() {
    return {
      dthName: "",
      dthMark: "",
      isShowAttrTool: false,
      isshowInput: false,
      mode: "view",
    };
  },

  mounted() {
    let that = this;
    if (!drawTool) {
      drawTool = new window.vis3d.plot.Tool(window.viewer);
      drawTool.on("endCreate", function (entityObj, entity) {
        that.dthName = "";
        that.dthMark = "";
        that.isshowInput = false;
        entity.type = "dth";
      });
      drawTool.on("startEdit", function (entityObj, entity) {
        that.isshowInput = true;
        if (!entity || !entity.attr) return;
        that.dthName = entity.attr.name;
        that.dthMark = entity.attr.mark;
      });
      drawTool.on("endEdit", function (entityObj, entity) {
        that.isshowInput = false;
        entity.attr = {
          name: that.dthName || "未命名",
          mark: that.dthMark || "无",
        };
      });
    }
  },

  destroyed() {
    if (handler) {
      handler.destroy();
      handler = null;
    }
    if (drawTool) {
      drawTool.destroy();
      drawTool = null;
    }
    if (propmt) {
      propmt.destroy();
      propmt = null;
    }
  },

  methods: {
    startDraw() {
      drawTool.start({
        type: "polygon",
        style: {
          color: "#FFFF00",
          colorAlpha: 0.5,
          heightReference: 1,
          outline: false,
        },
      });
    },
    // 添加鼠标移入效果
    bindHightlight() {
      let that = this;
      if (!handler)
        handler = new Cesium.ScreenSpaceEventHandler(
          window.viewer.scene.canvas
        );
      handler.setInputAction(function (evt) {
        let pick = window.viewer.scene.pick(evt.endPosition);
        if (pick && pick.id && pick.id.type == "dth") {
          pick.id.polygon.material = Cesium.Color.YELLOW.withAlpha(0.5);
          that.showPopup(evt.endPosition, pick.id.attr);
          lastHightlightEnt = pick.id;
        } else {
          if (lastHightlightEnt) {
            lastHightlightEnt.polygon.material =
              Cesium.Color.WHITE.withAlpha(0.00001);
            if (propmt) {
              propmt.destroy();
              propmt = null;
            }
            lastHightlightEnt = null;
          }
        }
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    },
    removeHightlight() {
      if (handler) {
        handler.destroy();
        handler = null;
      }
    },
    showPopup(px, attr) {
      if (!propmt) {
        propmt = new window.vis3d.common.Prompt(window.viewer, {
          type: 2,
          offset: {
            x: -30,
            y: -70,
          },
          closeBtn: false,
        });
      }
      attr = attr || {};
      propmt.update(
        px,
        `
          <div style="color:white;">
            <div>
              名称：${attr.name}
            </div>
            <div>
              备注：${attr.mark}
            </div>
          </div>
        `
      );
    },
    changeMode(data) {
      this.mode = data;
      if (data == "view") {
        // 预览模式下 低亮所有面 隐藏属性面板
        if (drawTool) {
          drawTool.end();
          drawTool.entityObjArr.forEach(function (entObj) {
            entObj.entity.polygon.material =
              Cesium.Color.WHITE.withAlpha(0.00001);
          });
        }
        this.isShowAttrTool = false;
        this.bindHightlight();
      } else {
        this.removeHightlight();
        if (propmt) {
          propmt.destroy();
          propmt = null;
        }
        if (drawTool) {
          drawTool.entityObjArr.forEach(function (entObj) {
            entObj.entity.polygon.material = Cesium.Color.YELLOW.withAlpha(0.5);
          });
        }
        this.isShowAttrTool = true;
      }
    },

    endEdit() {
      if (!drawTool) return;
      drawTool.endEdit();
    },
    reset() {
      this.dthName = "";
      this.dthMark = "";
    },

    close() {
      window.workControl.closeToolByName("monomer")
    },
  },
};
</script>

<style lang="less">
.monomer-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
</style>
