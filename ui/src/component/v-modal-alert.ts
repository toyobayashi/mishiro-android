import Component, { mixins } from 'vue-class-component'
import modalMixin from './modal-mixin'
import Btn from './Btn.vue'

export interface AdditionalBtn {
  text: string
  cb: ((title: string, body: string) => void) | null
}

@Component({
  components: {
    Btn
  }
})
export default class extends mixins(modalMixin) {
  title: string = ''
  body: string = ''
  additionalBtn: AdditionalBtn = {
    text: '',
    cb: null
  }

  afterLeave () {
    this.show = false
    this.title = ''
    this.body = ''
    this.additionalBtn.text = ''
    this.additionalBtn.cb = null
    this.modalWidth = '90%'
  }

  created () {
    this.$nextTick(() => {
      this.bus.$on('alert', (title: string, body: string, width?: number, additionalBtn?: AdditionalBtn) => {
        if (width) this.modalWidth = width + 'px'
        if (additionalBtn) {
          this.additionalBtn.text = additionalBtn.text
          this.additionalBtn.cb = additionalBtn.cb
        }
        this.title = title
        this.body = body
        this.show = true
        this.visible = true
      })
    })
  }
}
