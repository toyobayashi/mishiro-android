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
  callback: Function | null = null

  afterLeave () {
    this.show = false
    this.title = ''
    this.body = ''
    this.modalWidth = '90%'
  }

  created () {
    this.$nextTick(() => {
      this.bus.$on('confirm', (title: string, body: string, callback: Function, width?: number) => {
        if (width) this.modalWidth = width + 'px'
        this.callback = callback
        this.title = title
        this.body = body
        this.show = true
        this.visible = true
      })
    })
  }

  yes () {
    if (this.callback) this.callback(true)
    this.callback = null
    this.close()
  }

  no () {
    if (this.callback) this.callback(false)
    this.callback = null
    this.close()
  }
}
