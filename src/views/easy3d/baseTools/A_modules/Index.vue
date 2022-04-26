<template>
  <Card
    :title="title"
    :position="position"
    :size="size"
    height="auto"
    titleIcon="icon-tushangcehui"
    @close="close"
  >
  </Card>
</template>
<script>
import Card from "@/views/easy3d/components/card/Card.vue";
export default {
  name: "Map3dPlatformIndex",
  components: {
    Card,
  },
  props: {
    size: {},
    position: {},
    title: "",
  },
  data() {
    return {};
  },

  mounted() {},

  methods: {},
};
</script>