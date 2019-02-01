import InputRadio from './InputRadio.vue'
// import getPath from '../../ts/renderer/get-path'
import modalMixin from './modal-mixin'
import Component, { mixins } from 'vue-class-component'
import Btn from './Btn.vue'
// const { scoreDir, liveDir } = getPath
@Component({
  components: {
    InputRadio,
    Btn
  }
})
export default class extends mixins(modalMixin) {
  difficulty: string = '4'
  live: any = {}
  callback: Function | null = null
  hasMasterPlus: boolean = false

  yes () {
    // this.$router.push({
    //   name: 'score',
    //   params: {
    //     id: this.live.name.split('/')[1].split('.')[0].split('_')[1],
    //     difficulty: this.difficulty,
    //     csv: this.csv
    //   }
    // })
    // this.playSe(this.enterSe)
    // ipcRenderer.send(
    //   'game',
    //   scoreDir(this.live.score), // scoreFile
    //   this.difficulty, // difficulty
    //   this.live.bpm, // bpm
    //   liveDir(this.live.fileName) // audioFile
    // )
    this.close()
    if (this.callback) this.callback(this.difficulty)
    this.hasMasterPlus = false
  }

  cancel () {
    this.close()
    if (this.callback) this.callback('')
    this.hasMasterPlus = false
  }

  mounted () {
    this.$nextTick(() => {
      // ipcRenderer.on('game', (_event: Event, obj: { src: string; bpm: number; score: any[][]; fullCombo: number;}) => {
      //   const focusedWindow = BrowserWindow.getFocusedWindow()
      //   if (!focusedWindow) return
      //   this.event.$emit('gameStart')
      //   this.event.$emit('pauseBgm')
      //   const windowID = focusedWindow.id
      //   let win = new BrowserWindow({
      //     width: 1296,
      //     height: 759,
      //     minWidth: 1296,
      //     minHeight: 759,
      //     maxWidth: 1296,
      //     maxHeight: 759,
      //     backgroundColor: '#000000',
      //     parent: focusedWindow
      //   })
      //   if (process.env.NODE_ENV === 'production') {
      //     win.loadURL(url.format({
      //       pathname: getPath('./public/game.html'),
      //       protocol: 'file:',
      //       slashes: true
      //     }))
      //   } else {
      //     const { devServerHost, devServerPort, publicPath } = require('../../../script/config.json')
      //     win.loadURL(`http://${devServerHost}:${devServerPort}${publicPath}game.html`)
      //   }
      //   win.webContents.on('did-finish-load', function () {
      //     win.webContents.send('start', obj, windowID)
      //   })
      //   this.visible = false
      // })
      this.bus.$on('difficulty', (live: any, hasMasterPlus: boolean, callback: Function) => {
        this.difficulty = '4'
        this.live = live
        this.show = true
        this.visible = true
        this.hasMasterPlus = hasMasterPlus
        this.callback = callback
      })
      // this.event.$on('enterKey', (block: string) => {
      //   if (block === 'live' && this.visible) {
      //     this.start()
      //   }
      // })
    })
  }
}
