<template>
    <div>
        <div class="analysis-btn analysis-top-btn basic-analysis-btn">
          <span>添加可视域</span>
          <span class="basic-analysis-btn-clear">清除</span>
        </div>
        <div class="visualfield-body">
            <ul class="visualfield-slider reset-slider basic-slider">
                <li>
                    <p>水平张角：</p>
                    <el-slider v-model="spAngle"></el-slider>
                </li>
                <li>
                    <p>垂直张角：</p>
                    <el-slider v-model="czAngle"></el-slider>
                </li>
                <li>
                    <p>投射距离：</p>
                    <el-slider v-model="tsDis"></el-slider>
                </li>
                <li>
                    <p>四周方向：</p>
                    <el-slider v-model="szDir"></el-slider>
                </li>
                <li>
                    <p>俯仰角度：</p>
                    <el-slider v-model="fyAngle"></el-slider>
                </li>
                <li class="basic-checkbox">
                    <p>视锥线框：</p>
                    <el-checkbox v-model="isView">是否显示</el-checkbox>
                </li>
                <li>
                    <p>视频透明度：</p>
                    <el-slider v-model="videoOpcity"></el-slider>
                </li>
            </ul>
            <span class="visualfield-btn basic-visualfield-btn">图上选点</span>
        </div>
    </div>
</template>

<script>
/* 可视域分析 */
export default {
    name:"VisualField",
    data(){
        return {
            spAngle: 0, // 水平张角
            czAngle: 0, // 垂直张角
            tsDis: 0, // 投射距离
            szDir: 0, // 四周方向
            fyAngle: 0, // 俯仰角度
            isView: true, // 显示线框
            videoOpcity: 0 // 视频透明度
        }
    },
    mounted(){

    },
    destroyed(){

    },
    methods:{
        
    }
}
</script>

<style lang="less">
.visualfield-body{
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.visualfield-slider{
    li{
        display: flex;
        align-items: center;
        p{
            width: 85px;
            display: flex;
            justify-content: flex-end;
            margin-right: 10px;
        }
        .el-slider{
            width: 110px;
        }
    }
}
.visualfield-btn{
    height: 32px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 15px;
    border-radius: 2px;
    cursor: pointer;
}
</style>