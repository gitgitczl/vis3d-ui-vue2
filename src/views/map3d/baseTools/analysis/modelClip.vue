<template>
  <div class="">
    <div class="modelClip-head">
      <p>提示：请先在图上点选模型后，设置剖切方向及距离</p>
      <span class="basic-clear-btn">清除</span>
    </div>
    <div class="modelClip-tab basic-tab">
      <span v-for="(item, index) in modelClipTab" :key="index"
        :class="[modelClipIndex === index ? 'modelClip-active' : '']" @click="onModelClipChangeTab(index)">{{ item
        }}</span>
    </div>
    <ul class="modelClip-line-area" v-if="!modelClipIndex">
      <li>
        <p>按线剖切：</p>
        <span class="modelClip-btn basic-btn">绘制线</span>
      </li>
      <li class="reset-radio">
        <p>按面裁剪：</p>
        <span class="modelClip-btn basic-btn">绘制面</span>
        <el-radio-group v-model="modelClipArea">
          <el-radio :label="0">内裁</el-radio>
          <el-radio :label="1">外裁</el-radio>
        </el-radio-group>
      </li>
      <li class="modelClip-select basic-select">
        <p>选择模型：</p>
        <el-select v-model="modelType" placeholder="请选择" style="margin-right: 10px">
          <el-option v-for="item in modelList" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
        <span class="modelClip-btn basic-btn">图上选点</span>
      </li>
      <li>
        <p>剖切方向：</p>
        <ul class="clip-dir basic-modelClip-dir">
          <li v-for="(item, index) in dirList" :key="index" :class="[dirIndex === index ? 'modelClip-dir-active' : '']"
            @click="onChangeModelClipDir(index)">
            {{ item }}
          </li>
        </ul>
      </li>
      <li class="modelClip-slider reset-slider basic-slider">
        <p>剖切距离：</p>
        <el-slider v-model="clipDis" :show-input-controls="false" show-input>
        </el-slider>
      </li>
    </ul>
    <div v-else>
      <div>属性</div>
      <ul class="clip-body">
        <li class="basic-checkbox">
          <el-checkbox v-model="clipIn">裁切内部</el-checkbox>
        </li>
        <li class="reset-slider basic-slider clicp-body-silder">
          <p>x轴旋转：</p>
          <el-slider v-model="clipDis" show-input>
          </el-slider>
        </li>
        <li class="reset-slider basic-slider clicp-body-silder">
          <p>y轴旋转：</p>
          <el-slider v-model="clipDis" show-input>
          </el-slider>
        </li>
        <li class="reset-slider basic-slider clicp-body-silder">
          <p>z轴旋转：</p>
          <el-slider v-model="clipDis" show-input>
          </el-slider>
        </li>
      </ul>
      <div>重置姿态</div>
      <ul class="clip-reset-style">
        <li class="basic-slider">
          <label>移动：</label>
          <el-switch v-model="isMove"></el-switch>
        </li>
        <li class="basic-slider">
          <label>图元可见：</label>
          <el-switch v-model="isLook"></el-switch>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
/* 模型剖切 */
export default {
  name: "ModelClip",

  data() {
    return {
      modelClipTab: ["裁剪线、面", "裁剪体"],
      modelClipIndex: 0,
      modelClipArea: 0,
      modelList: [], // 模型
      modelType: "", // 选择模型
      dirList: ["顶", "底", "东", "西", "南", "北"],
      dirIndex: 0,
      clipDis: 0, // 剖切距离
      clipIn: false,
      isMove: false, // 移动
      isLook: false // 图元可见
    };
  },

  mounted() { },

  destroyed() { },

  methods: {
    onModelClipChangeTab(index) {
      this.$set(this, 'modelClipIndex', index)
    },

    /**
     * 选择剖切方向
     * @param {Number} index
     */
    onChangeModelClipDir(index) {
      this.$set(this, "dirIndex", index);
    },
  },
};
</script>

<style lang="less">
.modelClip-head {
  display: flex;
  align-items: center;
  justify-content: space-between;

  p {
    width: 78%;
    font-size: 12px;
    color: #6d748a;
  }

  span {
    height: 32px;
    padding: 0 15px;
    box-sizing: border-box;
    border-radius: 2px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }
}

.modelClip-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;

  span {
    height: 32px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 15px;
    cursor: pointer;

    &:first-child {
      border-radius: 2px 0 0 2px;
    }

    &:last-child {
      border-radius: 0 2px 2px 0;
    }
  }
}

.modelClip-line-area {
  li {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    p {
      width: 80px;
    }

    &:last-child {
      margin-bottom: 0;
    }

    .modelClip-btn {
      height: 32px;
      display: flex;
      align-items: center;
      padding: 0 10px;
      border-radius: 2px;
      margin-right: 15px;
      cursor: pointer;
    }

    .clip-dir {
      display: flex;
      align-items: center;

      li {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        margin-bottom: 0;
        cursor: pointer;

        &:first-child {
          border-radius: 2px 0 0 2px;
        }

        &:last-child {
          border-radius: 0 2px 2px 0;
        }
      }
    }
  }

  .modelClip-select {
    .el-select {
      width: 100px;
    }

    .el-input__inner {
      height: 32px;
      line-height: 32px;
    }

    .el-input__icon {
      line-height: 32px;
    }
  }
}

.modelClip-slider {
  .el-slider__runway.show-input {
    width: 150px;
    margin-right: 70px;
  }

  .el-slider__input {
    width: 50px;
  }
}

.clip-body {
  margin-top: 10px;

  li {
    display: flex;
    align-items: center;
  }

  .clicp-body-silder {
    .el-slider__runway.show-input {
      width: 120px;
      margin-right: 110px;
    }

    .el-slider__input {
      width: 100px;
    }
  }
}

.clip-reset-style {
  margin-top: 10px;
  display: flex;
  align-items: center;

  li {
    display: flex;
    align-items: center;
    margin-right: 15px;

    &:last-child {
      margin-right: 0;
    }

    label {
      margin-right: 10px;
    }
  }
}

.basic-modelClip-dir li {
  border: 1px solid #6a7485;
  background: rgba(106, 116, 133, 0.2);
  border-right: none;
}

.basic-modelClip-dir li:last-child {
  border-right: 1px solid #6a7485;
}

.basic-modelClip-dir .modelClip-dir-active {
  background: #1c9ed5;
  border-color: #1c9ed5;
  color: #ffffff;
}

.basic-modelClip-dir .modelClip-dir-active:last-child {
  border-right: 1px solid #1c9ed5;
}</style>