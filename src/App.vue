<template>
  <div id="app" ref="app">
    <Map />
  </div>
</template>

<script>
import Map from '@/views/easy3d/index.vue'
import Clip from "@/views/easy3d/clip.vue"
export default {
  name: 'App',
  components: {
    Map,
    Clip
  },

  data() {
    return {
    }
  },

  computed: {
   
  },

  mounted() {
    
  },

  methods: {

  }
}
</script>

<style>
#app {
  width: 100vw;
  height: 100vh;
  padding: 0;
}
</style>
