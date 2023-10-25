<template>
  <div>
    <div class="basic-tooltip">
      提示：模型压平只支持部分无着色器的3dtiles数据。
    </div>
    <div class="analysis-btn analysis-top-btn basic-analysis-btn">
      <span>添加矩形</span>
      <span>添加多边形</span>
      <span class="basic-analysis-btn-clear">清除</span>
    </div>
    <div class="modelFlat-height basic-number">
      <label>压平高度：</label>
      <div class="modelFlat-height-body">
        <el-input-number
          :controls="false"
          v-model="height"
          :min="0"
          placeholder="请输入内容"
        ></el-input-number>
        <span>(米)</span>
      </div>
    </div>

    <div class="flat-table reset-table" v-show="modelFlatList.length">
      <el-table
        ref="singleTable"
        :data="modelFlatList"
        :border="true"
        style="width: 100%"
        max-height="300"
        @selection-change="onChangeFlat"
      >
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column
          property="flatName"
          header-align="center"
          align="center"
          label="压平区"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column header-align="center" align="center" label="操作">
          <template slot-scope="scope">
            <span
              class="el-icon-s-promotion operate-btn-icon"
              @click="onStartFlat(scope.row)"
            ></span>
            <span
              class="el-icon-delete operate-btn-icon"
              @click="onDeleteFlat(scope.row)"
            ></span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
/* 模型压平 */
export default {
  name: "ModelFlat",

  data() {
    return {
      height: 0, // 压平高度
      modelFlatList: [
        {
          id: 1,
          flatName: "测试压平",
        },
        {
          id: 2,
          flatName: "测试压平1",
        },
      ],
    };
  },

  mounted() {},

  destroyed() {},

  methods: {
    /**
     * 选择压平区
     * @param {Array} list 选中压平数据
     */
    onChangeFlat(list) {
    },

    /**
     * 开始压平
     * @param {Object} data
     */
    onStartFlat(data) {},

    /**
     * 删除
     * @param {Object} data
     */
    onDeleteFlat(data) {
      this.$confirm(`此操作将永久删除${data.flatName}, 是否继续?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.$message({
            type: "success",
            message: "删除成功!",
          });

          let tempList = this.modelFlatList.filter(item => item.id !== data.id)
          this.$set(this, 'modelFlatList', tempList)
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
.modelFlat-height {
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
  .modelFlat-height-body {
    display: flex;
    align-items: flex-end;
    span {
      margin-left: 10px;
    }
  }
}
.flat-table {
  margin-top: 10px;
}
</style>