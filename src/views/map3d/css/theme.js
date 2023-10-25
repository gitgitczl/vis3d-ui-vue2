// 设置主题样式
const theme = {
    dark: {
        fontColor: "#bdc2d0",
        cardHeadColor: "#2a303c",
        cardBackground: "rgba(37, 38, 49, .96)",
        btnStyleColor: "#1c9ed5",
        toolsMouseoverColor: "#1c9ed5",
        elCustomColor: "rgba(0, 0, 0, 0.8)"
    },
    blue: {
        fontColor: "#bdc2d0",
        cardHeadColor: "#002a4b",
        cardBackground: "#001734",
        btnStyleColor: "#004dae",
        toolsMouseoverColor: "#00adff",
        elCustomColor: "#004668",
    },
    green: {
        fontColor: "#bdc2d0",
        cardHeadColor: "#0d4a00",
        cardBackground: "#003e08",
        btnStyleColor: "#1c9ed5",
        toolsMouseoverColor: "#009000",
        elCustomColor: "#004e04",
    }
}
const setThemeStyle = (type) => {
    const attr = theme[type] || theme.dark;
    for (let key in attr) {
        const keyName = '--' + key;
        document.documentElement.style.setProperty(keyName, attr[key])
    }
}

export default setThemeStyle;