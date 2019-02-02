import { Vue, Component } from 'vue-property-decorator'
import ScoreViewer from '../lib/score-viewer'
import { globalInstance } from '../lib/global'
import { Route } from 'vue-router'
import { setFullScreen } from '../native/util'
import Btn from '../component/Btn.vue'

@Component({
  beforeRouteEnter (_to: Route, _from: Route, next: (cb: (vm: Score) => any) => void) {

    if (window.cordova) {
      window.screen.orientation.lock('landscape').then(() => {
        StatusBar.hide()
        return setFullScreen(true)
      }).then(() => next(async (vm) => {
        vm.scoreviewer = await ScoreViewer.main(vm.$el, vm.$route.params.id, vm.$route.params.fileName, vm.$route.params.difficulty, vm.$route.params.csv)
      })).catch(err => {
        console.log(err.message)
        console.log(err.stack)
      })
    } else {
      // next(async (vm) => {
      //   vm.scoreviewer = await ScoreViewer.main(vm.$el, vm.$route.params.id, vm.$route.params.difficulty)
      // })
    }
  },
  beforeRouteLeave (_to: Route, _from: Route, next: any) {
    globalInstance.audio.pause()
    this.scoreviewer.removeAllEventListener()
    next()
  },
  components: {
    Btn
  }
})
export default class Score extends Vue {

  public scoreviewer: ScoreViewer
  public playBtnText: string = '暂停'

  public playClicked (): void {
    this.scoreviewer.pauseOnClick(this)
  }

  public saveClicked (): void {
    this.scoreviewer.saveOnClick()
  }

}
