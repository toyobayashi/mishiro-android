import { Vue, Component, Prop, Emit } from 'vue-property-decorator'

@Component
export default class extends Vue {
  @Prop({ default: '' }) public id!: string
  @Prop({ default: '' }) public content!: string
  @Prop({ default: 0 }) public loaded!: number
  @Prop({ default: 'none' }) public button!: 'download' | 'stop' | 'none'

  @Emit('download')
  public downloadBtnClicked () {
    return this.id
  }

  @Emit('stop')
  public stopBtnClicked () {
    return this.id
  }

  @Emit()
  public press () {
    return this.id
  }
}
