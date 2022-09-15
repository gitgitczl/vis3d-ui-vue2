<template>
  <div>
    <el-row style="display: flex; align-items: center">
      <slot></slot>
      <el-col :span="18" class="reset-radio" v-if="detailAttr.type === 'radio-number'">
        <el-radio-group v-model="detailAttr.value" @change="toChange">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-col>

      <el-col :span="18" class="reset-radio" v-if="detailAttr.type === 'radio-boolean'">
        <el-radio-group v-model="detailAttr.value" @change="toChange">
          <el-radio :label="true">是</el-radio>
          <el-radio :label="false">否</el-radio>
        </el-radio-group>
      </el-col>

      <el-col
        class="basic-number"
        :span="18"
        v-if="detailAttr.type === 'input-number'"
      >
        <el-input-number
          size="small"
          v-model="detailAttr.value"
          @change="toChange"
        ></el-input-number>
      </el-col>

      <el-col
        class="basic-number"
        :span="18"
        v-if="detailAttr.type === 'input-text'"
      >
        <el-input
          size="small"
          v-model="detailAttr.value"
          @change="toChange"
        ></el-input>
      </el-col>

      <el-col
        :span="14"
        class="reset-color-picker color-picker-box basic-text-input"
        v-if="detailAttr.type === 'color-picker'"
      >
        <el-color-picker
          v-model="detailAttr.value"
          @active-change="toChange"
        ></el-color-picker>
        <el-input
          v-model="detailAttr.value"
          placeholder="请输入内容"
          @change="toChange"
        ></el-input>
      </el-col>
      <el-col
        :span="10"
        v-if="detailAttr.type === 'slider'"
        class="reset-slider basic-slider"
      >
        <el-slider
          v-model="detailAttr.value"
          :min="detailAttr.min === undefined ? 0 : detailAttr.min"
          :max="detailAttr.max === undefined ? 1 : detailAttr.max"
          :step="detailAttr.step === undefined ? 1 : detailAttr.step"
          @change="toChange"
        ></el-slider>
      </el-col>
    </el-row>
  </div>
</template>
<script>
/* 动态标签组件 */
export default {
  name: "Detail",
  props: {
    detailAttr: {},
  },
  data() {
    return {};
  },

  methods: {
    toChange() {
      this.$emit("toChange", true);
    },
  },
};
</script>

<style lang="less">
.color-picker-box {
  display: flex;
  align-items: center;
}
</style>
