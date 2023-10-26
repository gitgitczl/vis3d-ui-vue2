const { defineConfig } = require('@vue/cli-service')
const path = require("path");
module.exports = defineConfig({
  lintOnSave: false,
  transpileDependencies: true,
  devServer: {
    client: {
      progress: true,
      overlay: false,
    },
  },
  configureWebpack: {
    output: {
      sourcePrefix: " ",
    },
    amd: {
      toUrlUndefined: true,
    },
    resolve: {
      alias: {
        vue$: "vue/dist/vue.esm.js",
        "@": path.resolve("src")
      },
    },

  }
})
