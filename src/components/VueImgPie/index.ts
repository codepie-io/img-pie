import ImgPie from './img-pie.vue'
import script from './utils'

const VueImgPie = {
  install(Vue: any, options: any) {
    Vue.component('img-pie', ImgPie)

    if (typeof window !== 'undefined') {
      Vue.use(script)
      Vue.script({
        domain: options.domain,
        origin: options.origin,
        params: options.params,
      })
    }

    Vue.prototype.$params = options.params
    Vue.prototype.$domain = options.domain
    Vue.prototype.$origin = options.origin
  },
}

export default VueImgPie
