import { PluginObject } from 'vue';

// Import vue component
import component from '@/img-pie.vue';
import script from "@/utils";

// Define typescript interfaces for installable component
type InstallableComponent = typeof component & PluginObject<any>;

// Default export is installable instance of component.
// IIFE injects install function into component, allowing component
// to be registered via Vue.use() as well as Vue.component(),
export default /*#__PURE__*/((): InstallableComponent => {
  // Assign InstallableComponent type
  const installable = component as unknown as InstallableComponent;

  // Attach install function executed by Vue.use()
  installable.install = (Vue: any, options: any) => {
    Vue.component('ImgPie', installable);
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
  };
  return installable;
})();

// It's possible to expose named exports when writing components that can
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = directive;
