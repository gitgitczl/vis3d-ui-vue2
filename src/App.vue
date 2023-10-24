<template>
  <div id="app" ref="app">
    <Map />
  </div>
</template>

<script>
import Map from '@/views/map3d/Index.vue'
export default {
  name: 'App',
  components: {
    Map
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
