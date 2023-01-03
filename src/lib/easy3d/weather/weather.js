// 引入天气
import fog from "./fog";
import rain from "./rain";
import snow from "./snow";

/**
 * 自定义天气
 * @exports weather
 * @property {Object} fog 雾{@link fog}
 * @property {Object} rain 雨{@link rain}
 * @property {Object} snow 雪{@link snow}
 */
let weather = {
    /**
     * 雾效果
     */
    fog: fog,
    /**
     * 雨效果
     */
    rain: rain,
    /**
    * 雪效果
    */
    snow: snow,
};

export default weather;