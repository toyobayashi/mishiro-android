import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class extends Vue {
  @Prop({ default: 0 }) loaded!: number
  @Prop({ default: 'rgb(141, 206, 214)' }) color!: string
  @Prop({ default: 'play' }) type!: string

  get leftDeg () {
    if (this.loaded < 50) return -225
    if (this.loaded <= 100) return Math.floor((this.loaded - 50) / 50 * 180) + (-225)
    return -45
  }

  get rightDeg () {
    if (this.loaded >= 50) return 45
    if (this.loaded >= 0) return Math.floor(this.loaded / 50 * 180) + (-135)
    return -135
  }
}
