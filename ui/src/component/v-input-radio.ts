import { Vue, Component, Prop, Model, Emit } from 'vue-property-decorator'

@Component
export default class extends Vue {
  @Model('check') selected: any
  @Prop({ required: true }) lableId: string
  @Prop({ required: true }) value: string | number
  @Prop({ required: true }) text: string
  @Emit()
  check (_v: any) {
    // this.$emit('check', v)
  }
}
