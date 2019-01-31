import { Vue, Component/* , Watch */ } from 'vue-property-decorator'
import ScoreViewer from '../lib/score-viewer'
import { globalInstance } from '../lib/global'
import { Route } from 'vue-router'
import { setFullScreen } from '../native/util'

@Component({
  beforeRouteEnter (_to: Route, _from: Route, next: (cb: (vm: Score) => any) => void) {
    if (window.cordova) {
      window.screen.orientation.lock('landscape').then(() => {
        StatusBar.hide()
        return setFullScreen(true)
      }).then(() => next(async (vm) => {
        vm.scoreviewer = await ScoreViewer.main(vm.$el, vm.$route.params.id, vm.$route.params.difficulty)
      })).catch(err => {
        console.log(err.message)
        console.log(err.stack)
      })
    } else {
      next(async (vm) => {
        vm.scoreviewer = await ScoreViewer.main(vm.$el, vm.$route.params.id, vm.$route.params.difficulty)
      })
    }
  },
  beforeRouteLeave (_to: Route, _from: Route, next: any) {
    globalInstance.audio.pause()
    this.scoreviewer.removeAllEventListener()
    next()
  }
})
export default class Score extends Vue {

  public scoreviewer: ScoreViewer
}
