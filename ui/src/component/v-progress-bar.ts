import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class extends Vue {
  @Prop({ default: 0 }) public loaded!: number
  @Prop({ default: 'load' }) public theme!: 'stamina' | 'event' | 'live' | 'load'
}
