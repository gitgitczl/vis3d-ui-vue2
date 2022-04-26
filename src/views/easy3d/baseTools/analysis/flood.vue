<template>
    <div>
        <ul class="flood-body basic-flood basic-number">
            <li>
                <label>分析区域：</label>
                <p>绘制区域</p>
            </li>
            <li>
                <label>最低海拔(米)：</label>
                <el-input-number :controls="false" v-model="minHeight" placeholder="请输入内容"></el-input-number>
            </li>
            <li>
                <label>最高海拔(米)：</label>
                <el-input-number :controls="false" v-model="maxHeight" placeholder="请输入内容"></el-input-number>
            </li>
            <li>
                <label>淹没速度(米/秒)：</label>
                <el-input-number :controls="false" v-model="speed" placeholder="请输入内容"></el-input-number>
            </li>
        </ul>
        <div class="analysis-btn basic-analysis-btn">
            <span>清除</span>
            <span>开始分析</span>
        </div>
    </div>
</template>

<script>
/* 淹没分析 */
export default {
    name:"Flood",
    data(){
        return {
            minHeight: 0, // 最低高度
            maxHeight: 0, // 最大高度
            speed: 0 // 淹没速度
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
.flood-body{
    li{
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        label{
            width: 120px;
            display: flex;
            justify-content: flex-end;
        }
        p{
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