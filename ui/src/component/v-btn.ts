import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class extends Vue {
  @Prop({ default: 'cancel' }) public theme!: 'cancel' | 'ok'
}
