import ImgPie from './components/VueImgPie/img-pie.vue'

const script = {
  install: function (Vue) {
    Vue.script = function ({ domain }) {
      const link = document.createElement('link')
      link.setAttribute('rel', 'preconnect')
      link.setAttribute('href', domain)
      document.head.appendChild(link)
    }
  },
}

function install(Vue, options) {
  if (install.installed) return
  install.installed = true
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
}
const plugin = {
  install,
}

let GlobalVue = null
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue
} else if (typeof global !== 'undefined') {
  GlobalVue = global.vue
}
if (GlobalVue) {
  GlobalVue.use(plugin)
}

ImgPie.install = install

export default ImgPie
