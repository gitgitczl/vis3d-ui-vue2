// easy3d 版权及有效期说明
function setOverTime(time) {
    return ;
    time = time || "1993/11/19 00:00:01"
    var nowDate = new Date();
    var endDate = new Date(time);
    if (nowDate.getTime() >= endDate.getTime()) {
        alert("\u8be5\u7248\u672c\u5df2\u8fc7\u671f\uff0c\u8bf7\u8054\u7cfb\u5f00\u53d1\u8005\uff01\uff08qq\uff1a951973194\uff09");
        setOverTime(time);
    }
}

function setConsole(time) {
    return ;
    console.group('版本信息（🗺 三维地图开发框架）：');
    console.log(`%c 公司官网 ：http://mapgl.com`, `color: red; font-weight: bold`);
    console.log(`%c 有 效 期 ：${time}`, `color: red; font-weight: bold`);
    console.log(`%c 编译日期 ：2023-01-11 17:30:00`, `color: #03A9F4; font-weight: bold`);
    console.log(`%c 其    它 ：
        1、如当前版本出现问题，请联系：18755191132（微信同号）
        2、未授权版本超过上述有效期后，此系统将不能使用！`, `color: #03A9F4; font-weight: bold`);
    console.groupEnd();
}

setConsole("2023-06-30 10:00:00");
setOverTime("2023-06-30 10:00:01");

export default {setConsole,setOverTime};