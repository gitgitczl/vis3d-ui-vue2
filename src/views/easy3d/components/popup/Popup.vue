<template>
    <div>
        <div class="easy3d-popup-close"></div>
        <div class="easy3d-popup-title"></div>
        <div class="easy3d-popup-content">
            <slot></slot>
        </div>
    </div>
</template>
<script>
/* 气泡弹窗组件 */
export default {
    name: 'Easy3dPlatformPopup',

    data() {
        return {
            title: "",
            content : ""
        };
    },

    mounted() {
        
    },

    methods: {
        
    },
};
</script>