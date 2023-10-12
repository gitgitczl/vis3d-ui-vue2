<template>
    <div>
        <div class="map3d-popup-close"></div>
        <div class="map3d-popup-title"></div>
        <div class="map3d-popup-content">
            <slot></slot>
        </div>
    </div>
</template>
<script>
/* 气泡弹窗组件 */
export default {
    name: 'map3dPlatformPopup',

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