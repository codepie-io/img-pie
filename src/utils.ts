export const wait = (ms = 0): Promise<void> => new Promise<void>((resolve) => (ms > 0 ? setTimeout(resolve, ms) : resolve()))

export const debounce = (fn: () => void, ms = 0): (() => void) => {
  let promise: Promise<void> | undefined
  return () => {
    if (!promise) {
      promise = wait(ms).then(() => {
        promise = undefined
        fn()
      })
    }
  }
}

export const isBrowser = typeof document !== `undefined`

export const onIntersect = (elementToWatch: HTMLElement, callback: any, once = true, options = { threshold: 1.0 }) => {
  // Initiate the observer
  const observer = new IntersectionObserver(([entry]) => {
    // If the element to watch is intersecting within the threshold
    if (entry && entry.isIntersecting) {
      // Run the callback
      callback(entry.target)
      // If the callback should only run once, unobserve the element
      if (once) {
        observer.unobserve(entry.target)
      }
    }
  }, options)
  // Observe the element
  observer.observe(elementToWatch)
  // Returns the observer, so it can be further used in the component
  return observer
}

const Script = {
  install: function (Vue: any) {
    Vue.script = function ({ domain }: any) {
      const link = document.createElement('link')
      link.setAttribute('rel', 'preconnect')
      link.setAttribute('href', domain)
      document.head.appendChild(link)
    }
  },
}
export default Script
