<template>
  <div>
    <ul v-for="(item, index) in list" :key="index">
      <li @click="clickTool(item)">
        <span>{{ item.name }}</span>
      </li>
    </ul>
  </div>
</template>
<script>
/* 鼠标右键菜单 */
export default {
  name: "Easy3dPlatformIndex",

  data() {
    return {
      list: [
        {
          name: "深度检测（开）",
          type: "depthTest",
          showPop: false, // 是否以弹窗展示
        },
        {
          name: "相机视角",
          type: "cameraView",
          showPop: true,
        },
        {
          name: "坐标拾取",
          type: "coordinate",
          showPop: true,
        },
      ],
    };
  },

  mounted() {
    const oldDepth = this.viewer.scene.globe.depthTestAgainstTerrain;
    let depthVal = !oldDepth ? "深度检测（开）" : "深度检测（关）";
    list[0].name = depthVal;
  },

  methods: {
    // 面板点击
    clickTool(attr) {},
    setPopup(title, content) {
        const html = `
            
        `;
    },
  },
};
</script>