import { Vue, Component } from 'vue-property-decorator'
import { Route } from 'vue-router'
// import axios from '../config/axios'
// import { exists, unlink } from '../native/cordova-fs'
import Downloader, { downloadManifest, downloadMaster } from '../native/downloader'
import DB from '../native/db'
import { setFullScreen, getPath/*, lz4dec , toast check*/ } from '../native/util'
import Item from '../component/Item.vue'
import Btn from '../component/Btn.vue'
import BtnProgress from '../component/BtnProgress.vue'
import Spinner from '../component/Spinner.vue'
import { exists, mkdirs, unlink, rmrf } from '../native/cordova-fs'
import { acb2hca, hca2wav, wav2mp3 } from '../native/audio'
import * as path from 'path-browserify'
// import { wav2mp3, acb2hca } from '../native/audio'

// declare const LAST_UPDATE_TIME: string

type LiveItem = {
  name: string;
  hash: string;
  fileName: string;
  loaded: number;
  bpm: number;
  score: string;
  scoreHash: string;
  status: string;
  dl: Downloader | null;
}

type BGMItem = {
  name: string;
  hash: string;
  fileName: string;
  loaded: number;
  status: string;
  dl: Downloader | null;
}

@Component({
  components: {
    Item,
    Btn,
    BtnProgress,
    Spinner
  },
  directives: {
    audioInit: {
      inserted (el, _binding, vnode) {
        Vue.nextTick(() => {
          (vnode.context as Index).audio = el as HTMLAudioElement
        })
      }
    }
  },
  beforeRouteEnter (_to: Route, _from: Route, next: (callback: (vm: Index) => any) => void) {
    if (window.cordova) {
      window.screen.orientation.lock('portrait').then(() => {
        StatusBar.show()
        return setFullScreen(false)
      }).then(() => next(() => {
        // console.log(vm)
      })).catch(err => {
        console.log(err.message)
        console.log(err.stack)
      })
    } else {
      next(() => {
        // console.log(vm)
      })
    }
  }
})
export default class Index extends Vue {

  // data: any = {
  //   version: 'loading...'
  // }
  // time = LAST_UPDATE_TIME

  resver: string = ''

  tabList: string[] = ['LIVE', 'BGM']
  currentTab: string = 'LIVE'

  currentLive: any = null
  currentDiff: any = ''

  inputShow: boolean = false
  searchText: string = ''

  manifestDatabase: DB | null = null
  masterDatabase: DB | null = null

  liveList: LiveItem[] = []
  liveListDisplay: LiveItem[] = []

  bgmList: BGMItem[] = []
  bgmListDisplay: BGMItem[] = []

  audio: HTMLAudioElement
  audioProgress: number = 0
  currentPlaying: any = null
  isPlaying: boolean = false

  pauseBtnClicked () {
    if (this.isPlaying) {
      this.audio.pause()
      this.isPlaying = false
    } else {
      this.audio.play()
      this.isPlaying = true
    }
  }

  timeUpdated () {
    const progress = this.audio.currentTime / this.audio.duration * 100
    this.audioProgress = isNaN(progress) ? 0 : progress
  }

  itemClicked (item: LiveItem | BGMItem) {
    if (item.status === 'finished') {
      if (item.name.split('/')[0] === 'l') {
        this.audio.src = getPath(`live/${item.fileName}`)
        this.audio.currentTime = 0
        this.audio.play()
        this.currentPlaying = item
        this.isPlaying = true
      } else if (item.name.split('/')[0] === 'b') {
        this.audio.src = getPath(`bgm/${item.fileName}`)
        this.audio.currentTime = 0
        this.audio.play()
        this.currentPlaying = item
        this.isPlaying = true
      }
    }
  }

  // get selectLive () {
  //   if (!this.data || !this.data.list) return {}
  //   const ids = Object.keys(this.data.list)
  //   const res: any = []
  //   for (let i = 0; i < this.data.music.length; i++) {
  //     if (ids.indexOf(this.data.music[i].id.toString()) !== -1) {
  //       res.push(this.data.music[i])
  //     }
  //   }
  //   return res
  // }

  // get selectDifficulty () {
  //   return this.data && this.data.list ? (this.data.list[this.currentLive] || []) : []
  // }
  async downloadClicked (item: LiveItem | BGMItem) {
    if (item.dl) {
      this.alert('正在下载中')
      return
    }

    item.status = 'downloading'
    if (item.name.split('/')[0] === 'l') {
      item.dl = new Downloader(`http://storage.game.starlight-stage.jp/dl/resources/High/Sound/Common/l/${item.hash}`, getPath(`live/${item.name.split('/')[1]}`))
      const acbPath = await item.dl.download((data) => {
        if (data) item.loaded = data.percentage / 2
      })
      item.dl = null
      item.status = 'extracting'
      const hcaDir = await acb2hca(acbPath)
      item.status = 'decoding'
      const wavPath = 'file://' + path.join(hcaDir, item.name.split('/')[1].split('.')[0] + '.wav')
      await hca2wav('file://' + path.join(hcaDir, item.name.split('/')[1].split('.')[0] + '.hca'), wavPath)
      await wav2mp3(wavPath, getPath(`live/${item.fileName}`), data => {
        if (data) item.loaded = 50 + data.percentage / 2
      })
      await Promise.all([rmrf('file://' + hcaDir), unlink(acbPath)])
      item.status = 'finished'
      this.audio.src = getPath(`live/${item.fileName}`)
      this.audio.currentTime = 0
      this.audio.play()
      this.currentPlaying = item
      this.isPlaying = true
    } else if (item.name.split('/')[0] === 'b') {
      item.dl = new Downloader(`http://storage.game.starlight-stage.jp/dl/resources/High/Sound/Common/b/${item.hash}`, getPath(`bgm/${item.name.split('/')[1]}`))
      const acbPath = await item.dl.download((data) => {
        if (data) item.loaded = data.percentage / 2
      })
      item.dl = null
      item.status = 'extracting'
      const hcaDir = await acb2hca(acbPath)
      item.status = 'decoding'
      const wavPath = 'file://' + path.join(hcaDir, item.name.split('/')[1].split('.')[0] + '.wav')
      await hca2wav('file://' + path.join(hcaDir, item.name.split('/')[1].split('.')[0] + '.hca'), wavPath)
      await wav2mp3(wavPath, getPath(`bgm/${item.fileName}`), data => {
        if (data) item.loaded = 50 + data.percentage / 2
      })
      await Promise.all([rmrf('file://' + hcaDir), unlink(acbPath)])
      item.status = 'finished'
      this.audio.src = getPath(`bgm/${item.fileName}`)
      this.audio.currentTime = 0
      this.audio.play()
      this.currentPlaying = item
      this.isPlaying = true
    }
  }
  async stopClicked (item: LiveItem | BGMItem) {
    if (!item.dl) {
      this.alert('下载已完成')
      return
    }
    try {
      await item.dl.abort()
      item.dl = null
      item.status = 'stoped'
    } catch (err) {
      this.alert(err)
    }
  }
  pressed (item: LiveItem | BGMItem) {
    console.log('pressed')
    console.log(item)
  }

  swipeRight () {
    if (this.currentTab !== this.tabList[0]) {
      this.currentTab = this.tabList[this.tabList.indexOf(this.currentTab) - 1]
    }
  }

  swipeLeft () {
    if (this.currentTab !== this.tabList[this.tabList.length - 1]) {
      this.currentTab = this.tabList[this.tabList.indexOf(this.currentTab) + 1]
    }
  }

  tabClicked (tab: string) {
    this.currentTab = tab
  }

  clearText () {
    if (this.searchText !== '') {
      this.searchText = ''
      const input = this.$refs.searchInput as HTMLInputElement
      input.focus()
      return
    }

    this.inputShow = false
  }

  searchBtnClicked () {
    if (!this.inputShow) {
      this.inputShow = true
      const input = this.$refs.searchInput as HTMLInputElement
      input.focus()
      return
    }

    // this.toast(this.searchText)
    if (!this.searchText) {
      if (this.currentTab === 'LIVE') this.liveListDisplay = this.liveList
      else if (this.currentTab === 'BGM') this.bgmListDisplay = this.bgmList
      return
    }

    if (this.currentTab === 'LIVE') this.liveListDisplay = this.liveList.filter(item => item.fileName.includes(this.searchText))
    else if (this.currentTab === 'BGM') this.bgmListDisplay = this.bgmList.filter(item => item.fileName.includes(this.searchText))
  }

  mounted () {
    this.$nextTick(async () => {
      window.addEventListener('keyup', (ev) => {
        if (ev.keyCode === 13 || ev.keyCode === 108) {
          if (this.inputShow) {
            this.searchBtnClicked()
          }
        }
      }, false)

      if (cordova) {

        await Promise.all([
          mkdirs(getPath('data')),
          mkdirs(getPath('live')),
          mkdirs(getPath('bgm')),
          mkdirs(getPath('score'))
        ])

        document.addEventListener('backbutton', async () => {
          if (this.$route.name === 'index') {
            const res = await this.confirm('真的要退出？')
            if (res) {
              if (this.manifestDatabase) {
                await this.manifestDatabase.close()
                this.manifestDatabase = null
              }
              if (this.masterDatabase) {
                await this.masterDatabase.close()
                this.masterDatabase = null
              }
              (window.navigator as any).app.exitApp()
              // cordova.exec(data => console.log(data), err => console.log(err), 'Client', 'exit', [])
            }
          } else {
            history.go(-1)
          }
        } , false)
      }

      try {
        const resver = await this.getLatestResource()
        this.toast(resver)
        this.liveListDisplay = this.liveList = await this.getLiveList()
        console.log(this.liveList)
        this.bgmListDisplay = this.bgmList = await this.getBGMList()
        console.log(this.bgmList)
      } catch (err) {
        console.log(err)
        this.hideLoading()
        this.alert(err.message)
      }
      // this.showLoading('测试', () => {
      //   console.log(1)
      // })
    })
  }

  // @Watch('$route')
  async getData () {
    // this.data = {
    //   version: 'loading...'
    // }
    // try {
    //   this.data = (await axios.get('./data.json')).data
    //   this.currentLive = this.data.default.id
    //   this.currentDiff = this.data.default.score
    // } catch (err) {
    //   console.log(err)
    // }
  }

  go () {
    this.$router.push({ name: 'score', params: { id: this.currentLive, difficulty: this.currentDiff } })
  }

  async getLatestResource () {
    this.showLoading('正在获取数据库版本')
    const resver: string = /* await check() */ '10050800'
    this.resver = resver
    window.localStorage.setItem('mishiroResVer', resver)
    this.setLoading('正在下载资源清单数据库')
    const manifestDBPath = await downloadManifest(resver, (data) => { data && this.setLoading(data.percentage) })
    this.setLoading(0)
    this.setLoading('正在读取资源清单')
    if (this.manifestDatabase) {
      await this.manifestDatabase.close()
      this.manifestDatabase = null
    }
    this.manifestDatabase = await DB.openDatabase(manifestDBPath)
    const result = await this.manifestDatabase.query('SELECT name, hash FROM manifests WHERE name LIKE ?', ['master.mdb'])
    // await db.close()
    const masterHash = result[0].hash
    this.setLoading('正在下载主数据库')
    const masterDBPath = await downloadMaster(resver, masterHash, (data) => { data && this.setLoading(data.percentage) })
    if (this.masterDatabase) {
      await this.masterDatabase.close()
      this.masterDatabase = null
    }
    this.masterDatabase = await DB.openDatabase(masterDBPath)
    this.hideLoading()
    return resver
  }

  async getBGMList () {
    if (!this.manifestDatabase || !this.masterDatabase) {
      this.alert('读取数据库失败')
      return []
    }

    const [bgmManifest] = await Promise.all([
      this.manifestDatabase.query('SELECT name, hash FROM manifests WHERE name LIKE "b/%.acb"')
    ])

    for (let i = 0; i < bgmManifest.length; i++) {
      let bgm = bgmManifest[i]
      bgm.fileName = bgm.name.split('/')[1].split('.')[0] + '.mp3'

      bgm.status = 'stoped'
      bgm.loaded = 0
      bgm.dl = null

      if (await exists(getPath('bgm', bgm.fileName))) {
        bgm.loaded = 100
        bgm.status = 'finished'
      }

    }

    return bgmManifest
  }

  async getLiveList () {
    if (!this.manifestDatabase || !this.masterDatabase) {
      this.alert('读取数据库失败')
      return []
    }
    const [liveManifest, scoreManifest, musicData, liveData, charaData] = await Promise.all([
      this.manifestDatabase.query('SELECT name, hash FROM manifests WHERE name LIKE "l/%.acb"'),
      this.manifestDatabase.query('SELECT name, hash FROM manifests WHERE name LIKE "musicscores_m___.bdb"'),
      this.masterDatabase.query('SELECT id, name, bpm FROM music_data'),
      this.masterDatabase.query('SELECT id, music_data_id FROM live_data'),
      this.masterDatabase.query('SELECT chara_id, name FROM chara_data')
    ])
    for (let i = 0; i < liveManifest.length; i++) {
      let song = liveManifest[i]
      let name: string = song.name.split('/')[1].split('.')[0]
      let arr: string[] = name.split('_')

      song.fileName = ''
      song.bpm = 0
      song.score = ''
      song.scoreHash = ''
      song.status = 'stoped'
      song.loaded = 0
      song.dl = null

      if (Number(arr[1]) < 1000) {
        song.fileName = name + '.mp3'
      } else {
        if (arr.length > 2) {
          if (arr[2] === 'another') {
            song.fileName = arr[1] + '_' + arr[2] + '-' + musicData.filter(row => Number(row.id) === Number(arr[1]))[0].name.replace(/\\n|\\|\/|<|>|\*|\?|:|"|\|/g, '') + '.mp3'
          } else {
            song.fileName = arr[1] + '_' + arr[2] + '-' + musicData.filter(row => Number(row.id) === Number(arr[1]))[0].name.replace(/\\n|\\|\/|<|>|\*|\?|:|"|\|/g, '') + '（' + charaData.filter(row => Number(row.chara_id) === Number(arr[2]))[0].name + '）.mp3'
          }
        } else {
          song.fileName = arr[1] + '-' + musicData.filter(row => Number(row.id) === Number(arr[1]))[0].name.replace(/\\n|\\|\/|<|>|\*|\?|:|"|\|/g, '') + '.mp3'
        }
        const liveDataArr = liveData.filter(row => Number(row.music_data_id) === Number(arr[1]))
        let id: any = null
        if (liveDataArr.length === 1) {
          id = liveDataArr[0].id
        } else {
          for (let j = 0; j < liveDataArr.length; j++) {
            if (Number(liveDataArr[j].event_type) !== 0 && Number(liveDataArr[j].difficulty_5) !== 0) {
              id = liveDataArr[j].id
            }
          }
          if (id === null) {
            id = liveDataArr[0].id
          }
        }

        let scoreId = id.toString().length >= 3 ? id : (id.toString().length === 2 ? '0' + id : '00' + id)
        let scoreExists = scoreManifest.filter(row => row.name === `musicscores_m${scoreId}.bdb`)
        if (scoreExists.length) {
          song.score = scoreExists[0].name
          song.scoreHash = scoreExists[0].hash
          song.bpm = musicData.filter(row => Number(row.id) === Number(arr[1]))[0].bpm
        }
      }

      if (await exists(getPath('live', song.fileName))) {
        song.loaded = 100
        song.status = 'finished'
      }
    }

    return liveManifest
  }
}
