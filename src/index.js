import ImgPie from './ImgPie.vue'
import script from './utils'

const VueImgPie = {
  install(Vue, options) {
    Vue.component('img-pie', ImgPie)

    if (typeof window !== 'undefined') {
      Vue.use(script)
      Vue.script({
        domain: options.domain,
        params: options.params,
      })
    }

    Vue.prototype.$params = options.params
    Vue.prototype.$domain = options.domain
  },
}

export default VueImgPie
