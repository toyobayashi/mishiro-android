import { Vue, Component } from 'vue-property-decorator'
import ModalLoading from './component/ModalLoading.vue'
import ModalAlert from './component/ModalAlert.vue'
import ModalConfirm from './component/ModalConfirm.vue'

@Component({
  components: {
    ModalLoading,
    ModalAlert,
    ModalConfirm
  }
})
export default class extends Vue {}
