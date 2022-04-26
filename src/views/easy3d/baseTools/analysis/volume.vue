<template>
    <div>
        <p class="slope-toolip">提示：请首先单击“绘制区域按钮”，再在图上绘制分析区域</p>
        <div class="analysis-btn analysis-top-btn basic-analysis-btn">
            <span>绘制区域</span>
            <span class="basic-analysis-btn-clear">清除</span>
        </div>
        <ul class="volume-body basic-number">
            <li>
                <label>基准面高：</label>
                <el-input-number :controls="false" v-model="height1" placeholder="请输入内容"></el-input-number>
                <span class="volume-btn">点选高度</span>
            </li>
            <li>
                <label>围墙底高：</label>
                <el-input-number :controls="false" v-model="height2" placeholder="请输入内容"></el-input-number>
                <span class="volume-btn">点选高度</span>
            </li>
            <li>
                <label>围墙顶高：</label>
                <el-input-number :controls="false" v-model="height3" placeholder="请输入内容"></el-input-number>
                <span class="volume-btn">点选高度</span>
            </li>
        </ul>
    </div>
</template>

<script>
/* 方量分析 */
export default {
    name:"Volume",
    data(){
        return {
            height1: 0,
            height2: 0,
            height3: 0
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
.volume-body{
    margin-top: 15px;
    li{
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        label{
            display: flex;
            align-items: center;
        }
        .el-input-number{
            width: 100px;
        }
        .volume-btn{
            height: 40px;
            padding: 0 10px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            border-radius: 2px;
            margin-left: 15px;
            cursor: pointer;
        }
    }
}
</style>