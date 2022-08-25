<template>
  <div>
    <ul class="flood-body basic-flood basic-number">
      <li>
        <label>分析区域：</label>
        <p @click="draw">绘制区域</p>
      </li>
      <li>
        <label>最低海拔(米)：</label>
        <el-input-number
          :controls="false"
          v-model="minHeight"
          placeholder="请输入内容"
        ></el-input-number>
      </li>
      <li>
        <label>最高海拔(米)：</label>
        <el-input-number
          :controls="false"
          v-model="maxHeight"
          placeholder="请输入内容"
        ></el-input-number>
      </li>
      <li>
        <label>淹没速度(米/秒)：</label>
        <el-input-number
          :controls="false"
          v-model="speed"
          placeholder="请输入内容"
        ></el-input-number>
      </li>
      <li>
        <label>当前海拔：</label>
        <el-input-number
          :controls="false"
          v-model="nowHeight"
          disable
        ></el-input-number>
      </li>
    </ul>
    <div class="analysis-btn basic-analysis-btn">
      <span @click="clear">清除</span>
      <span @click="start">开始分析</span>
    </div>
  </div>
</template>

<script>
/* 淹没分析 */
window.floodDrawTool = null;
let polygonPositions = null;
let floodPolygon = null;
let interVal = null;
export default {
  name: "Flood",
  data() {
    return {
      minHeight: 0, // 最低高度
      maxHeight: 0, // 最大高度
      speed: 0, // 淹没速度
      nowHeight : 0
    };
  },
  mounted() {
    let that = this;
    if (!window.floodDrawTool)
        window.floodDrawTool = new this.easy3d.DrawTool(window.viewer, {
            canEdit: false,
        });

  },
  destroyed() {
      this.clear()
      window.floodDrawTool.destroy();
      window.floodDrawTool = null;
  },
  methods: {
    clear(){
        if(interVal){
            window.clearInterVal(interVal);
            interVal = null;
        }
        if(window.floodDrawTool){
            window.floodDrawTool.removeAll();
            entObj = null;
        }
        if(floodPolygon){
            window.entities.remove(floodPolygon);
            floodPolygon = null;
        }
        this.minHeight = 0;
        this.maxHeight = 0;
        this.speed = 0;
        this.nowHeight = 0;
    },
    start(){
        if(!polygonPositions) return ;
        let uniformData = cUtil.computeUniforms(polygonPositions);
        that.minHeight = uniformData.minHeight;
        that.maxHeight = uniformData.maxHeight;
        window.floodDrawTool.removeOne(entObj);
        floodPolygon = that.createFloodPolygon();
        if(!floodPolygon) return ;

        this.nowHeight = this.minHeight;
        let that = this;
        interVal = window.setInterval(()=>{
            if(that.nowHeight >=that.maxHeight){
                that.nowHeight = that.maxHeight
                return;
            }
            that.nowHeight += 0.1 * that.speed;
        },100);
    },
    draw() {
      if (!window.floodDrawTool) return;
      window.floodDrawTool.start({
        type: "polygon",
        styleType: "polygon",
        style: {
          color: "#00FFFF",
          colorAlpha: 0.5,
          outline: true,
          outlineColor: "#ff0000",
          heightReference: 1,
        },
        success:function(entObj){
            polygonPositions = entObj.getPositions();
            window.floodDrawTool.removeOne(entObj);
        }
      });
    },
    // 构建淹没面
    createFloodPolygon(){
        return window.viewer.entities.add({
            polygon : {
                positions : polygonPositions,
                extrudedHeight : new Cesium.CallbackProperty(function(){
                    return this.nowHeight
                },false);
            }
        });
    }

  },
};
</script>

<style lang="less">
.flood-body {
  li {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    label {
      width: 120px;
      display: flex;
      justify-content: flex-end;
    }
    p {
      height: 40px;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      padding: 0 20px;
      border-radius: 2px;
      cursor: pointer;
    }
  }
}
</style>
