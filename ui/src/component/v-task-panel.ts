import ProgressBar from './ProgressBar.vue'
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component({
  components: {
    ProgressBar
  }
})
export default class extends Vue {
  @Prop({ default: 0 }) public loaded!: number
  @Prop({ default: '' }) public text!: string
  @Prop({ default: 'load' }) public theme!: 'stamina' | 'event' | 'live' | 'load'
}
