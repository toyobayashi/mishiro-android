import { Vue, Component } from 'vue-property-decorator'
import TaskPanel from './TaskPanel.vue'
import Spinner from './Spinner.vue'
import Btn from './Btn.vue'

@Component({
  components: {
    TaskPanel,
    Spinner,
    Btn
  }
})
export default class extends Vue {
  public show: boolean = false
  public text: string = ''
  public loaded: number = 0
  public btnCall: null | (() => void) = null

  public close () {
    if (this.btnCall) this.btnCall()
    this.hideLoading()
    // this.show = false
    // this.text = ''
    // this.loaded = 0
    // this.btnCall = null
  }

  created () {
    this.$nextTick(() => {
      this.bus.$on('setLoading', (show?: boolean, text?: string, loaded?: number, btnCall?: null | (() => void)) => {
        if (typeof show === 'boolean') this.show = show
        if (typeof text === 'string') this.text = text
        if (typeof loaded === 'number') this.loaded = loaded
        if ((typeof btnCall === 'function') || (btnCall === null)) this.btnCall = btnCall
      })
    })
  }
}
