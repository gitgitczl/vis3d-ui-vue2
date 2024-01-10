<template>
  <div>
    <div class="basic-tooltip">
      提示：模型裁剪和模型裁剪同时作用在同一个模型上时，会冲突。
    </div>

    <!-- 点选模型 -->
    <div class="modelCut-height basic-number" style="display: flex;align-items: center;">
      <label>模型：</label>
      <el-input :controls="false" v-model="tilesetName" size="small" style="width: 120px;" :disabled="true"></el-input>
      <div class="analysis-btn analysis-top-btn basic-analysis-btn" style="margin-left: 10px;"><span
          @click="selectModel">点选模型</span></div>
    </div>

    <div class="analysis-btn analysis-top-btn basic-analysis-btn" style="margin: 10px auto;align-items: center;">
      <label>绘制：</label>
      <span @click="drawRectangle">矩形</span>
      <span @click="drawPolygon">多边形</span>
      <!-- <span class="basic-analysis-btn-clear">清除</span> -->
    </div>
    <div class="cut-table reset-table" v-show="modelCutList.length">
      <el-table ref="singleTable" :data="modelCutList" :border="true" style="width: 100%" max-height="300">
        <el-table-column type="index" width="55" label="序号"></el-table-column>
        <el-table-column property="cutName" header-align="center" align="center" label="裁剪区"
          show-overflow-tooltip></el-table-column>
        <el-table-column header-align="center" align="center" label="操作">
          <template slot-scope="scope">
            <!-- <span class="el-icon-s-promotion operate-btn-icon" @click="onStartCut(scope.row)"></span> -->
            <span class="el-icon-delete operate-btn-icon" @click="onDeleteCut(scope.row)"></span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
/* 模型裁剪 */
let cut = undefined;
let tileset = undefined;
let cutDrawTool = undefined;
export default {
  name: "ModelCut",

  data() {
    return {
      tilesetName: "", // 点选模型名称
      modelCutList: [],
    };
  },

  mounted() {
    if (!cutDrawTool) {
      cutDrawTool = new window.vis3d.plot.Tool(viewer, {
        canEdit: false
      })
      cutDrawTool.on("endCreate", (entObj, ent) => {
        // 绘制结束后 更新列表
        const date = new Date()
        const randomid = date.getMinutes() + '_' + date.getSeconds();
        this.modelCutList.push({
          cutName: this.tilesetName + '裁剪' + randomid,
          id: randomid
        })

        let positions = [];
        if (entObj.type == "rectangle") {
          const lnglats = entObj.getPositions(true);
          const p1 = lnglats[0];
          const p2 = lnglats[1];
          positions = [
            Cesium.Cartesian3.fromDegrees(p1[0], p1[1]),
            Cesium.Cartesian3.fromDegrees(p1[0], p2[1]),
            Cesium.Cartesian3.fromDegrees(p2[0], p2[1]),
            Cesium.Cartesian3.fromDegrees(p2[0], p1[1])
          ]
        } else {
          positions = entObj.getPositions();
        }
        if (!cut) {
          cut = new window.vis3d.tileset.Cut(tileset);
        }
        cut.addRegion({
          positions: positions,
          id: randomid
        })
        cutDrawTool.remove(entObj);
      })
    }
  },

  destroyed() {
    if (cut) {
      cut.destroy();
    }
    if (cutDrawTool) {
      cutDrawTool.destroy();
      cutDrawTool = undefined;
    }
  },

  methods: {
    /**
     *  点击拾取模型 
     */
    selectModel() {
      window.vis3d.common.selectModel.disable();
      window.vis3d.common.selectModel.activate(viewer, (res) => {
        tileset = res.content._tileset;
        const name = res.content._tileset.layerConfig.name;
        this.tilesetName = name;
      })
    },
    /**
     * 绘制矩形裁剪区
     */
    drawRectangle() {
      if (!tileset) {
        this.$message({
          message: '请先选择模型',
          type: 'warning'
        });
        return;
      }
      cutDrawTool.start({
        type: "rectangle",
        style: {
          "outline": true,
          "fill": false,
          "color": "#0000ff",
          "outlineColor": "#ff0000",
          "heightReference": 1
        }
      })
    },
    /**
    *  绘制多边形裁剪区
    */
    drawPolygon() {
      if (!tileset) {
        this.$message({
          message: '请先选择模型',
          type: 'warning'
        });
        return;
      }

      cutDrawTool.start({
        type: "polygon",
        style: {
          "color": "#0000ff",
          "fill": false,
          "outline": true,
          "outlineColor": "#ff0000",
          "heightReference": 1
        }
      })
    },
    /**
     * 删除
     * @param {Object} data
     */
    onDeleteCut(data) {
      this.$confirm(`此操作将永久删除${data.cutName}, 是否继续?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$message({
            type: "success",
            message: "删除成功!",
          });

          let tempList = this.modelCutList.filter(item => item.id !== data.id)
          this.$set(this, 'modelCutList', tempList)

          if (cut) {
            cut.removeRegionById(data.id);
          }

        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });

    },
  },
};
</script>

<style lang="less">
.modelCut-height {
  margin-top: 10px;
  display: flex;
  align-content: center;

  label {
    display: flex;
    align-items: center;
  }

  .el-input-number {
    width: 100px;
  }

  .modelCut-height-body {
    display: flex;
    align-items: flex-end;

    span {
      margin-left: 10px;
    }
  }
}

.cut-table {
  margin-top: 10px;
}
</style>