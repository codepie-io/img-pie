<template>
  <div id="app">
    <img-pie src="wp-content/uploads/2022/08/23072139/Blog-900x450-21.jpg" origin="cdn.rummyculture.com" :lazy="true" alt="Avocado" :ratio="3 / 4" focus="auto" placeholder="preview" style="width: 300px" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import VueImgPie from './components/VueImgPie/index'

Vue.use(VueImgPie, {
  domain: 'https://imagenary.pocket52.com',
  origin: 'cdn.rummyculture.com',
  params: {
    anticipation: 0.5,
    maxDpr: 2,
    step: 100,
  },
})

@Component({
  components: {},
})
export default class App extends Vue {}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
