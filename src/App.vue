<template>
  <div id="app">
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Condimentum id venenatis a condimentum vitae sapien pellentesque. Sagittis nisl rhoncus mattis rhoncus. Curabitur vitae nunc sed velit dignissim sodales ut eu. Arcu cursus euismod quis viverra nibh. Id faucibus nisl tincidunt eget nullam non nisi est. Mauris pellentesque pulvinar pellentesque habitant morbi tristique. Tempus quam pellentesque nec nam aliquam sem. Eget mi proin sed libero enim. Dui vivamus arcu felis bibendum ut. Orci porta non pulvinar neque laoreet suspendisse interdum consectetur. Vulputate mi sit amet mauris commodo quis imperdiet massa tincidunt. Bibendum est ultricies integer quis auctor elit sed vulputate mi. Lobortis scelerisque fermentum dui faucibus in ornare quam viverra. Dictum non consectetur a erat nam at lectus. Duis at tellus at urna condimentum mattis pellentesque id nibh. Turpis nunc eget lorem dolor sed viverra ipsum
      nunc. Scelerisque purus semper eget duis at. Pulvinar mattis nunc sed blandit libero volutpat sed cras ornare. Fames ac turpis egestas maecenas pharetra convallis posuere. Eget est lorem ipsum dolor sit amet consectetur adipiscing elit. Est placerat in egestas erat imperdiet sed euismod nisi porta. Pellentesque habitant morbi tristique senectus et. Quam nulla porttitor massa id neque aliquam. Semper eget duis at tellus at urna. Lorem ipsum dolor sit amet consectetur adipiscing elit pellentesque habitant. Blandit volutpat maecenas volutpat blandit. Vestibulum sed arcu non odio euismod lacinia. Vitae proin sagittis nisl rhoncus mattis rhoncus. Sem fringilla ut morbi tincidunt. Viverra accumsan in nisl nisi. Amet mattis vulputate enim nulla aliquet porttitor lacus luctus accumsan. Nam aliquam sem et tortor consequat. Adipiscing at in tellus integer feugiat scelerisque varius. Pellentesque elit eget gravida cum sociis natoque. Risus sed vulputate odio ut enim blandit volutpat
      maecenas. Tellus cras adipiscing enim eu turpis egestas. Aliquam id diam maecenas ultricies mi eget mauris. Lorem ipsum dolor sit amet consectetur adipiscing elit ut. Dignissim diam quis enim lobortis scelerisque fermentum dui faucibus in. Etiam tempor orci eu lobortis elementum nibh. Tellus at urna condimentum mattis pellentesque id nibh tortor id. Enim diam vulputate ut pharetra sit amet aliquam. Morbi tincidunt ornare massa eget egestas purus viverra accumsan in. Elementum tempus egestas sed sed risus pretium quam vulputate. Amet massa vitae tortor condimentum. Arcu bibendum at varius vel pharetra vel turpis nunc eget. Adipiscing elit ut aliquam purus sit amet luctus venenatis. Feugiat nibh sed pulvinar proin gravida. Vel pretium lectus quam id. Condimentum vitae sapien pellentesque habitant morbi tristique senectus. Viverra suspendisse potenti nullam ac. Orci a scelerisque purus semper eget duis at tellus. Sit amet justo donec enim diam vulputate ut pharetra. Ullamcorper
      eget nulla facilisi etiam dignissim diam quis enim. Fermentum odio eu feugiat pretium nibh. Urna cursus eget nunc scelerisque viverra mauris in aliquam. Id cursus metus aliquam eleifend mi in nulla. Blandit massa enim nec dui nunc mattis enim ut. Netus et malesuada fames ac turpis egestas sed tempus. Tincidunt tortor aliquam nulla facilisi cras fermentum. Risus in hendrerit gravida rutrum. Tempus iaculis urna id volutpat lacus laoreet non curabitur gravida. Id venenatis a condimentum vitae sapien pellentesque habitant morbi tristique. Pellentesque eu tincidunt tortor aliquam nulla facilisi cras. Nunc sed blandit libero volutpat sed cras ornare. Amet aliquam id diam maecenas ultricies mi eget mauris. Aliquam purus sit amet luctus venenatis lectus magna fringilla urna. Justo eget magna fermentum iaculis eu. Donec enim diam vulputate ut pharetra sit amet aliquam. Velit euismod in pellentesque massa. Cursus vitae congue mauris rhoncus. Bibendum enim facilisis gravida neque
      convallis a cras semper auctor. Pharetra diam sit amet nisl suscipit adipiscing bibendum est ultricies. Nibh sed pulvinar proin gravida hendrerit lectus a. Nisi scelerisque eu ultrices vitae auctor eu. Euismod nisi porta lorem mollis aliquam.
    </p>
    <img-pie src="/wp-content/uploads/2022/09/06030930/Add-Cash_Desktop-LP-Banner-SR.jpg" origin="cdn.rummyculture.com" :lazy="true" alt="Avocado" :ratio="816 / 539" focus="auto" style="width: 600px" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import VueImgPie from './components/VueImgPie/index.ts'
import './style.scss'

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
body {
  background: black;
  color: white;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  margin-top: 60px;
}
</style>
