<template>
  <div ref="imgPie" class="img-pie-i">
    <div :class="_wrapperClass" :style="_wrapperStyle">
      <img :alt="_alt" :loading="this.lazy ? 'lazy' : false" :style="_style" :src="_src" v-bind="{ ..._dataAttributes }" @load="onImageLoad" />
      <div ref="p" :style="_placeholderStyle" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { debounce, onIntersect } from './utils'
import { AnchorObject, Mode, Placeholder } from './types'

const rPx = /px$/

@Component({
  components: {},
})
export default class ImgPie extends Vue {
  @Prop({ type: String, default: '' }) readonly alt!: string
  @Prop({ type: String, default: '' }) readonly origin!: string
  @Prop({ type: Boolean, default: false }) readonly active!: boolean
  @Prop({ type: Boolean, default: false }) readonly disableDpr!: boolean
  @Prop({ type: Boolean, default: false }) readonly enablePlaceholder!: boolean
  @Prop({ type: Boolean, default: true }) readonly lazy!: boolean
  @Prop({
    type: String,
    default: 'top',
    validator(value: string): boolean {
      return ['bottom', 'bottom-left', 'bottom-right', 'left', 'top', 'top-left', 'top-right', 'right'].includes(value)
    },
  })
  readonly anchor!: string
  @Prop({ type: String, default: '' }) readonly bot!: string
  @Prop({ type: String, default: '' }) readonly focus!: string
  @Prop({ type: String, default: 'cover' }) readonly mode!: Mode
  @Prop({
    type: String,
    default: 'preview',
    validator(value: string): boolean {
      return ['preview', 'none'].includes(value)
    },
  })
  readonly placeholder!: Placeholder
  @Prop({ type: String, default: 'center' }) readonly position!: string
  @Prop({ type: String, default: '' }) readonly preTransform!: string
  @Prop({
    type: Number,
    default: 1,
  })
  readonly ratio!: number | undefined
  @Prop({
    type: Number,
    default: 100,
  })
  readonly step!: number | undefined
  @Prop({ type: String, required: true }) readonly src!: string
  @Prop({ type: [String, Boolean], default: 'fade' }) readonly transition!: any
  @Prop({ type: String, default: '0ms' }) readonly transitionDelay!: string
  @Prop({ type: String, default: '400ms' }) readonly transitionDuration!: string
  @Prop({ type: String, default: 'ease' }) readonly transitionTimingFunction!: string

  @Watch('active', { immediate: true })
  onActive(value: boolean): void {
    if (value && this.windowReady) {
      this.renderActualImage = value
    }
  }

  $domain: any
  $params: any
  $origin: any
  imgIntersectionObserver: any = null
  placeholderIntersectionObserver: any = null
  renderActualImage = false
  windowReady = false
  renderImageDone = false
  saveData: any = undefined
  resizeObserver: any
  handleResizeObserver = debounce(() => console.log("I'll only run 250ms after the body has finished resizing"), 250)

  get _anchor(): AnchorObject {
    const rAnchor = /\b(?:(left|right)|(bottom|top))\b/g
    let x
    let y
    if (this.anchor) {
      let tmp
      while ((tmp = rAnchor.exec(this.anchor))) {
        if (tmp[1]) {
          x = tmp[1]
        } else {
          y = tmp[2]
        }
      }
    }
    return {
      x,
      y,
    }
  }

  get _alt(): string {
    const rAlt = /\/?([^/?#.]+)(?:\.[^/?#]*)?(?:[?#].*)?$/
    if (!this.alt) {
      const tmp = rAlt.exec(this.src)
      return (tmp && tmp[1]) || `image`
    }
    return this.alt
  }

  get _src(): string | undefined {
    let src = undefined
    if (this.renderActualImage) {
      src = this.computeImageSrc()
    }
    return src
  }

  get _dataAttributes(): Record<string, string> {
    const attributes: Record<string, string> = {}
    attributes[`data-img-pie-bot`] = `${this.bot}/`
    if (this.src) {
      attributes[`data-img-pie-src`] = this.src
    }
    if (this.step !== undefined) {
      attributes[`data-img-pie-step`] = String(this.step)
    }
    if (this.renderImageDone) {
      attributes[`class`] = 'img-pie-done'
    }
    return attributes
  }

  get _style(): Record<string, string> {
    const computedStyle = this.preComputeStyle()
    const actualPosition = this.computePosition(this._anchor, this.mode, this.position)
    if (actualPosition) {
      computedStyle[`objectPosition`] = actualPosition
    }
    if (this.mode) {
      computedStyle[`objectFit`] = this.mode
    }
    return computedStyle
  }

  get _placeholderStyle(): Record<string, string> {
    const placeholderStyle = this.preComputeStyle()
    if (this.mode) {
      placeholderStyle[`backgroundSize`] = this.mode
    }
    const actualPosition = this.computePosition(this._anchor, this.mode, this.position)
    if (actualPosition) {
      placeholderStyle[`backgroundPosition`] = actualPosition
    }
    return placeholderStyle
  }

  get _wrapperClass(): string[] {
    const wrapperClass = [`img-pie-w`]
    if (this.windowReady) {
      if (!this.transition.hasOwnProperty(`none`)) {
        if (this.transition.hasOwnProperty(`fade`)) {
          wrapperClass.push(`img-pie-tf`)
        }
        if (this.transition.hasOwnProperty(`zoom`)) {
          wrapperClass.push(`img-pie-tz`)
        }
      }
    }
    return wrapperClass
  }

  get _wrapperStyle(): Record<string, string> {
    if (this.ratio === 0) {
      return {
        height: `100%`,
        paddingTop: `0`,
      }
    }
    return {
      paddingTop: this.ratio === undefined ? `` : `${this.ratio * 100}%`,
    }
  }

  transformQueryString(params: Record<string, string>): string {
    return Object.keys(params)
      .map((key) => key + '=' + params[key])
      .join('&')
  }

  cssWithoutPx(css: string): number {
    return Number(css.replace(rPx, ``))
  }

  onImageLoad(): void {
    this.renderImageDone = true
  }

  preComputeStyle(): Record<string, string> {
    const preComputedStyle: Record<string, string> = {}
    if (this.transitionDuration) {
      preComputedStyle[`transitionDuration`] = this.transitionDuration
    }
    if (this.transitionDelay) {
      preComputedStyle[`transitionDelay`] = this.transitionDelay
    }
    if (this.transitionTimingFunction) {
      preComputedStyle[`transitionTimingFunction`] = this.transitionTimingFunction
    }
    return preComputedStyle
  }

  computeEverything(): Record<string, string> {
    const config: Record<string, string> = {}
    let _ratio
    if (!this.lazy) {
      config['mode'] = this.mode || `cover`
      config['placeholder'] = this.placeholder
      config['src'] = this.src
      config['origin'] = this.origin ? this.origin : this.$origin
      return {
        ...config,
      }
    }
    const element: any = this.$refs.p
    const computedStyle = getComputedStyle(element)
    const actualMode = this.mode || ['contain', 'cover'].includes(computedStyle.backgroundSize) ? computedStyle.backgroundSize : `cover`
    if (this.ratio === 0) {
      _ratio = actualMode === `contain` ? 1 : this.cssWithoutPx(computedStyle.height) / Math.max(1, this.cssWithoutPx(computedStyle.width))
    } else {
      _ratio = this.ratio ?? this.cssWithoutPx(computedStyle.fontSize)
    }
    let width = Math.max(1, this.cssWithoutPx(computedStyle.width))
    let height = _ratio * width
    const maxDpr = this.disableDpr ? 1 : Math.min(this.$params.maxDPR ? this.$params.maxDPR : window.devicePixelRatio, window.devicePixelRatio)
    width = Math.max(1, Math.round(width)) * maxDpr
    height = Math.max(1, Math.round(height)) * maxDpr
    const actualPreTransform = this.computePreTransform(this._anchor)
    this.saveData = actualPreTransform
    config['width'] = width.toString()
    config['height'] = height.toString()
    config['mode'] = actualMode
    config['placeholder'] = this.placeholder
    config['src'] = this.src
    config['origin'] = this.origin ? this.origin : this.$origin
    return {
      ...config,
      ...actualPreTransform,
    }
  }

  computeImageSrc(): string {
    const computedPlaceholder = this.computeEverything()
    const params: any = {}
    for (let key in computedPlaceholder) {
      switch (key) {
        case 'mode':
          params['mode'] = computedPlaceholder['mode']
          break
        case 'width':
          params['width'] = computedPlaceholder['width']
          break
        case 'height':
          params['height'] = computedPlaceholder['height']
          break
        case 'origin':
          params['origin'] = computedPlaceholder['origin']
          break
      }
    }
    const queryString = this.transformQueryString(params)
    return queryString ? `${this.$domain}${this.getUrlWithLeadingSlash(this.src)}?${queryString}` : `${this.$domain}${this.getUrlWithLeadingSlash(this.src)}`
  }

  computePosition = ({ x, y }: AnchorObject, mode: Mode, position: string): any => mode === `contain` && (position || (y ? (x ? `${x} ${y}` : y) : x))

  computePlaceholderBackground(): Record<string, string> {
    if (!this.placeholder || !this.src || this.transition.hasOwnProperty(`zoom`)) {
      return {}
    }
    return this.computeEverything()
  }

  computePreTransform({ x, y }: AnchorObject): Record<string, string> {
    const actualFocus: any = this.mode !== `contain` && (this.focus || (y ? (x ? `${y}-${x}` : y) : x))
    return {
      focus: actualFocus,
    }
  }

  getUrlWithLeadingSlash(relativePath: string) {
    if (relativePath.charAt(0) === '/') {
      return relativePath
    }
    return `/${relativePath}`
  }

  setPlaceholderElement(placeholderElement: HTMLDivElement, domain: string): void {
    if (!placeholderElement || !domain) {
      return
    }
    const wrapperBackground = this.computePlaceholderBackground()
    const params: any = {}
    for (let key in wrapperBackground) {
      switch (key) {
        case 'mode':
          params['mode'] = wrapperBackground['mode']
          break
        case 'width':
          params['width'] = wrapperBackground['width']
          break
        case 'height':
          params['height'] = wrapperBackground['height']
          break
        case 'origin':
          params['origin'] = wrapperBackground['origin']
          break
        case 'placeholder':
          params['placeholder'] = wrapperBackground['placeholder']
          break
      }
    }
    let backgroundImage = ''
    const queryString = this.transformQueryString(params)
    backgroundImage = `url(${domain}${this.getUrlWithLeadingSlash(wrapperBackground.src)}?${queryString})`
    placeholderElement.style.backgroundImage = backgroundImage
  }

  onImgInteractionEnter(): void {
    this.renderActualImage = true
    this.imgIntersectionObserver.disconnect()
  }

  onPlaceholderInteractionEnter(placeholderRef: any): void {
    this.setPlaceholderElement(placeholderRef, this.$domain)
    this.placeholderIntersectionObserver.disconnect()
  }

  created(): void {
    if (!this.active) {
      this.renderActualImage = !this.lazy
    }
  }

  mounted(): void {
    this.windowReady = true
    if (this.lazy) {
      if (this.enablePlaceholder) {
        const placeholderRef: any = this.$refs.p
        //todo this.resizeObserver = new ResizeObserver(this.handleResizeObserver)
        if (placeholderRef) {
          // todo this.resizeObserver.observe(placeholderRef)
          this.placeholderIntersectionObserver = onIntersect(placeholderRef, this.onPlaceholderInteractionEnter, true, {
            threshold: 0,
          })
        }
      }
      const imgPieRef: any = this.$refs.imgPie
      if (imgPieRef) {
        this.imgIntersectionObserver = onIntersect(imgPieRef, this.onImgInteractionEnter, true, {
          threshold: 0.5,
        })
      }
    }
  }

  unmounted(): void {
    const placeholderRef: any = this.$refs.p
    if (this.resizeObserver && placeholderRef) {
      this.resizeObserver.unobserve(placeholderRef)
    }
    if (this.imgIntersectionObserver) {
      this.imgIntersectionObserver.disconnect()
    }
    if (this.placeholderIntersectionObserver) {
      this.placeholderIntersectionObserver.disconnect()
    }
  }
}
</script>
