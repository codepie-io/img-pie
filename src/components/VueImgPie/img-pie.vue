<template>
  <div ref="imgPie" class="img-pie" :class="{ 'img-pie--done': renderImageDone }">
    <pie-style v-if="_mediaQuery && !localLazy">{{ _mediaQuery }}</pie-style>
    <div ref="imgPie" :id="guid" class="img-pie__wrapper" :style="_wrapperStyle">
      <picture v-if="!localLazy" class="img-pie__picture">
        <template>
          <source v-for="(item, index) in _srcSets" :key="index" :srcset="getSsrImageSrc(item)" :media="getMedia(item)" />
        </template>
        <img class="img-pie__img" :alt="_alt" :crossorigin="_crossorigin" :loading="loading" :style="_style" :src="ssrMainSrc" v-bind="{ ..._dataAttributes }" @load="onImageLoad" />
      </picture>
      <img v-else class="img-pie__img" :alt="_alt" :crossorigin="_crossorigin" :loading="loading" :style="_style" :src="lazyMainSrc" v-bind="{ ..._dataAttributes }" @load="onImageLoad" />
      <div class="img-pie__placeholder" ref="p" :style="placeholderStyle" />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import throttle from 'lodash.throttle'
import ResizeObserver from 'resize-observer-polyfill'
import { onIntersect } from './utils'
import { AnchorObject, Mode, Placeholder } from './types'
import PieStyle from './pie-style.vue'

const rPx = /px$/

@Component({
  components: {
    PieStyle,
  },
  head() {
    return this.headLink
  },
})
export default class ImgPie extends Vue {
  @Prop({ type: String, default: '' }) readonly alt!: string
  @Prop({ type: String, default: '' }) readonly origin!: string
  @Prop({ type: String, default: undefined }) readonly loading!: undefined | string
  @Prop({ type: [String, Boolean], default: undefined }) readonly crossorigin!: undefined | string | boolean
  @Prop({ type: Boolean, default: false }) readonly preload!: any
  @Prop({ type: Boolean, default: false }) readonly active!: boolean
  @Prop({ type: Boolean, default: false }) readonly disableDpr!: boolean
  @Prop({ type: Boolean, default: false }) readonly lazyPlaceholder!: boolean
  @Prop({ type: Boolean, default: true }) readonly lazy!: boolean
  @Prop({
    type: String,
    default: 'top',
    validator(value: string): boolean {
      return ['bottom', 'bottom-left', 'bottom-right', 'left', 'top', 'top-left', 'top-right', 'right'].includes(value)
    },
  })
  readonly anchor!: string
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
  @Prop({ type: [String, Array], required: true }) readonly src!: string | Record<string, any>
  @Prop({ type: [String, Boolean], default: 'fade' }) readonly transition!: any
  @Prop({ type: String, default: '0ms' }) readonly transitionDelay!: string
  @Prop({ type: String, default: '400ms' }) readonly transitionDuration!: string
  @Prop({ type: String, default: 'ease' }) readonly transitionTimingFunction!: string

  @Watch('active', { immediate: true })
  onActive(value: boolean): void {
    if (value && this.windowReady) {
      this.updateImage()
    }
  }

  $domain: any
  $step: any
  $params: any
  $origin: any
  lazyMainSrc: any = ''
  processPlaceholderConfig: Record<string, any> = {}
  processImageConfig: Record<string, any> = {}
  localLazy: any = this.lazy
  placeholderWindowSize: any = null
  imageWindowSize: any = null
  localRatio: any = this.ratio
  placeholderStyle: Record<string, string> = {}
  imgIntersectionObserver: any = null
  placeholderIntersectionObserver: any = null
  wrapperResizeObserver: any = null
  windowReady = false
  renderImageDone = false
  saveData: any = undefined
  resizeObserver: any
  guid: string = this.getUID()

  get _step() {
    return this.step ? this.step : this.$step
  }

  get _srcSets() {
    const sets: any[] = []
    if (typeof this.src === 'string') {
      sets.push({ src: this.src, main: true, ratio: this.ratio, origin: this.origin ? this.origin : this.$origin })
    } else {
      for (let i = 0; i < this.src.length; i++) {
        if (typeof this.src[i] === 'string') {
          sets.push({ src: this.src[i], main: true, ratio: this.ratio, origin: this.origin ? this.origin : this.$origin })
        } else {
          sets.push({ src: this.src[i].src, maxWidth: this.src[i].maxWidth, ratio: this.src[i].ratio ? this.src[i].ratio : this.ratio, origin: this.origin ? this.origin : this.$origin })
        }
      }
    }
    return sets
  }

  get _mediaQuery(): string {
    let mediaQuery = ''
    this._srcSets.forEach((setItem: any) => {
      if (setItem.maxWidth) {
        mediaQuery += `@media(max-width:${setItem.maxWidth}px){#${this.guid}{padding-top: ${setItem.ratio * 100}%!important}}`
      }
    })
    return mediaQuery
  }

  get mainSrc(): string {
    const getMainSrc = this._srcSets.find((item: any) => {
      return item.main
    })
    return getMainSrc.src
  }

  get ssrMainSrc(): string | undefined {
    let src = undefined
    const getMainSrc = this._srcSets.find((item: any) => {
      return item.main
    })
    if (!this.lazy) {
      src = this.getSsrImageSrc(getMainSrc)
    }
    return src
  }

  get _crossorigin() {
    return this.crossorigin === true ? 'anonymous' : this.crossorigin || undefined
  }

  get headLink(): any {
    if (this.preload && !this.lazy) {
      return {
        link: [
          {
            rel: 'preload',
            as: 'image',
            href: this.ssrMainSrc,
            hid: this.guid,
          },
        ],
      }
    }
    return {}
  }

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
      const tmp = rAlt.exec(this.mainSrc)
      return (tmp && tmp[1]) || `image`
    }
    return this.alt
  }

  get _dataAttributes(): Record<string, string> {
    const attributes: Record<string, string> = {}
    if (this.src) {
      attributes[`data-img-pie-src`] = this.mainSrc
    }
    if (this.step !== undefined) {
      attributes[`data-img-pie-step`] = String(this.step)
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

  get _wrapperStyle(): Record<string, string> {
    if (this.localRatio === 0) {
      return {
        height: `100%`,
        paddingTop: `0`,
      }
    }
    return {
      paddingTop: this.localRatio === undefined ? `` : `${this.localRatio * 100}%`,
    }
  }

  getSrcConfigByWidth(width: any): Record<string, any> {
    if (this._srcSets.length === 1) {
      return this._srcSets[0]
    }
    let mediaMap = []
    for (let i = 0; i < this._srcSets.length; i++) {
      if (this._srcSets[i].maxWidth) {
        mediaMap.push({ index: i, maxWidth: this._srcSets[i].maxWidth })
      } else {
        mediaMap.push({ index: i, maxWidth: Infinity })
      }
    }
    mediaMap = mediaMap.sort((a, b) => {
      return a.maxWidth - b.maxWidth
    })
    let findIndex = -1
    for (let i = mediaMap.length - 1; i > -1; i--) {
      if (width <= mediaMap[i].maxWidth) {
        findIndex = mediaMap[i].index
      }
    }
    return findIndex !== -1 ? this._srcSets[findIndex] : this._srcSets[0]
  }

  computePlaceholderStyle(mode: Mode, anchor: AnchorObject, position: string): Record<string, string> {
    const placeholderStyleConfig = this.preComputeStyle()
    if (mode) {
      placeholderStyleConfig['backgroundSize'] = mode
    }
    const actualPosition = this.computePosition(anchor, mode, position)
    if (actualPosition) {
      placeholderStyleConfig['backgroundPosition'] = actualPosition
    }
    return placeholderStyleConfig
  }

  getUID(): string {
    const characters = 'abcdefghijklmnopqrstuvwxyz'
    let result = ''
    let charactersLength = characters.length
    for (let i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
  }

  getMedia(srcSet: any) {
    if (srcSet && srcSet.maxWidth) {
      return `(max-width: ${this.cssWithoutPx(srcSet.maxWidth.toString())}px)`
    }
    return undefined
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
    this.$emit('load')
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

  computeSsrImageConfig(src: string, origin: string): Record<string, string> {
    const config: Record<string, string> = {}
    config['mode'] = this.mode || 'cover'
    config['src'] = src
    config['origin'] = origin
    return {
      ...config,
    }
  }

  computeLazyImageConfig(): Record<string, string> {
    const imageConfig = this.getSrcConfigByWidth(window.innerWidth)
    imageConfig['mode'] = this.mode
    imageConfig['anchor'] = this._anchor
    imageConfig['placeholder'] = this.placeholder
    const config: Record<string, string> = {}
    let _ratio
    const element: any = this.$refs.p
    const computedStyle = getComputedStyle(element)
    const actualMode = imageConfig.mode || ['contain', 'cover'].includes(computedStyle.backgroundSize) ? computedStyle.backgroundSize : `cover`
    if (imageConfig.ratio === 0) {
      _ratio = actualMode === `contain` ? 1 : this.cssWithoutPx(computedStyle.height) / Math.max(1, this.cssWithoutPx(computedStyle.width))
    } else {
      _ratio = imageConfig.ratio ?? this.cssWithoutPx(computedStyle.fontSize)
    }
    let width = Math.max(1, this.cssWithoutPx(computedStyle.width))
    const maxDpr = this.disableDpr ? 1 : Math.min(this.$params.maxDPR ? this.$params.maxDPR : window.devicePixelRatio, window.devicePixelRatio)
    if (width > this._step) {
      width = maxDpr > 1 ? Math.floor(width / this._step) * this._step : Math.ceil(width / this._step) * this._step
    }
    let height = _ratio * width
    width = Math.max(1, Math.round(width)) * maxDpr
    height = Math.max(1, Math.round(height)) * maxDpr
    const actualPreTransform = this.computePreTransform(imageConfig.anchor)
    this.saveData = actualPreTransform
    config['width'] = width.toString()
    config['height'] = height.toString()
    config['mode'] = actualMode
    config['placeholder'] = imageConfig.placeholder
    config['src'] = imageConfig.src
    config['origin'] = imageConfig.origin
    return {
      ...config,
      ...actualPreTransform,
    }
  }

  getSsrImageSrc(config: Record<string, any>): string {
    const imageConfig = this.computeSsrImageConfig(config.src, config.origin)
    return this.getImageSrc(this.$domain, imageConfig)
  }

  computePosition = ({ x, y }: AnchorObject, mode: Mode, position: string): any => mode === `contain` && (position || (y ? (x ? `${x} ${y}` : y) : x))

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

  getPlaceholder(placeholderElement: HTMLDivElement, domain: string, imageConfig: Record<string, any>): string {
    const params: any = {}
    for (let key in imageConfig) {
      switch (key) {
        case 'mode':
          params['mode'] = imageConfig['mode']
          break
        case 'width':
          params['width'] = imageConfig['width']
          break
        case 'height':
          params['height'] = imageConfig['height']
          break
        case 'origin':
          params['origin'] = imageConfig['origin']
          break
        case 'placeholder':
          params['placeholder'] = imageConfig['placeholder']
          break
      }
    }
    const queryString = this.transformQueryString(params)
    return `url(${domain}${this.getUrlWithLeadingSlash(imageConfig.src)}?${queryString})`
  }

  getImageSrc(domain: string, imageConfig: Record<string, any>) {
    const params: any = {}
    for (let key in imageConfig) {
      switch (key) {
        case 'mode':
          params['mode'] = imageConfig['mode']
          break
        case 'width':
          params['width'] = imageConfig['width']
          break
        case 'height':
          params['height'] = imageConfig['height']
          break
        case 'origin':
          params['origin'] = imageConfig['origin']
          break
      }
    }
    const queryString = this.transformQueryString(params)
    return queryString ? `${domain}${this.getUrlWithLeadingSlash(imageConfig.src)}?${queryString}` : `${domain}${this.getUrlWithLeadingSlash(imageConfig.src)}`
  }

  onImgInteractionEnter(): void {
    this.updateImage()
    this.imgIntersectionObserver.disconnect()
  }

  onPlaceholderInteractionEnter(): void {
    this.updatePlaceholder()
    this.placeholderIntersectionObserver.disconnect()
  }

  shouldUpdatePlaceholderSize(): boolean {
    if (!this.placeholderWindowSize) {
      return true
    }
    if (window.innerWidth > this.placeholderWindowSize) {
      return true
    }
    if (window.innerWidth < this.placeholderWindowSize) {
      if (this._srcSets.length > 1) {
        const imageConfig = this.computeLazyImageConfig()
        return imageConfig.src !== this.processPlaceholderConfig.src
      }
      return false
    }
    return false
  }

  shouldUpdateImageSize(): boolean {
    if (!this.imageWindowSize) {
      return true
    }
    if (window.innerWidth > this.imageWindowSize) {
      return true
    }
    if (window.innerWidth < this.imageWindowSize) {
      if (this._srcSets.length > 1) {
        const imageConfig = this.computeLazyImageConfig()
        return imageConfig.src !== this.processImageConfig.src
      }
      return false
    }
    return false
  }

  updatePlaceholder() {
    // Update placeholder style
    if (this.shouldUpdatePlaceholderSize()) {
      this.updateWrapperStyle()
      this.placeholderStyle = this.computePlaceholderStyle(this.mode, this._anchor, this.position)
      const placeholderRef: any = this.$refs.p
      if (this.placeholder !== 'none') {
        const imageConfig = this.localLazy ? this.computeLazyImageConfig() : this.computeSsrImageConfig(this.mainSrc, this.origin ? this.origin : this.$origin)
        this.placeholderStyle['backgroundImage'] = this.getPlaceholder(placeholderRef, this.$domain, imageConfig)
        this.processPlaceholderConfig = imageConfig
      }
      this.placeholderWindowSize = window.innerWidth
    }
  }

  handleResizeObserver() {
    if (this.lazyMainSrc) {
      this.updateImage()
    } else {
      this.updatePlaceholder()
    }
  }

  updateImage() {
    // Update img src
    if (this.shouldUpdateImageSize()) {
      this.updateWrapperStyle()
      const imageConfig = this.localLazy ? this.computeLazyImageConfig() : this.computeSsrImageConfig(this.mainSrc, this.origin ? this.origin : this.$origin)
      this.lazyMainSrc = this.getImageSrc(this.$domain, imageConfig)
      this.imageWindowSize = window.innerWidth
      this.processImageConfig = imageConfig
    }
  }

  updateWrapperStyle() {
    const imageConfig = this.getSrcConfigByWidth(window.innerWidth)
    this.localRatio = imageConfig.ratio
  }

  created(): void {}

  mounted(): void {
    this.windowReady = true
    if (this.localLazy) {
      const imgPieRef: any = this.$refs.imgPie
      if (this.placeholder !== 'none') {
        const placeholderRef: any = this.$refs.p
        if (placeholderRef) {
          if (this.lazyPlaceholder) {
            this.placeholderIntersectionObserver = onIntersect(placeholderRef, this.onPlaceholderInteractionEnter, true, {
              threshold: 0.1,
            })
          } else {
            this.updatePlaceholder()
          }
        }
      }
      // todo when active force update image
      this.imgIntersectionObserver = onIntersect(imgPieRef, this.onImgInteractionEnter, true, {
        threshold: 0.1,
      })
      const handleResizeObserver = throttle(this.handleResizeObserver, 500)
      this.wrapperResizeObserver = new ResizeObserver(handleResizeObserver)
      this.wrapperResizeObserver.observe(document.body)
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
    if (this.wrapperResizeObserver) {
      this.wrapperResizeObserver.disconnect()
    }
  }
}
</script>
