<script>
export default {
  name: 'PieStyle',
  render(createElement) {
    return createElement('style', this.$slots.default)
  },
}
</script>
