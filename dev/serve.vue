<script lang="ts">
import Vue from 'vue';
import ImgPie from '@/img-pie.vue';

Vue.use(ImgPie, {
  domain: 'https://imgpie.codepie.com',
  params: {
    anticipation: 0.5,
    maxDpr: 2,
    step: 100,
  },
})

export default Vue.extend({
  name: 'ServeDev',
  components: {
    ImgPie
  }
});
</script>

<template>
  <div id="app">
    <img-pie src="wp-content/uploads/2022/08/23072139/Blog-900x450-21.jpg" :lazy="true" alt="Avocado" :ratio="3 / 4" focus="auto" placeholder="preview" style="width: 300px" />
  </div>
</template>
