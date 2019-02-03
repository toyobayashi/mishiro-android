import { Vue, Component } from 'vue-property-decorator'
import { Route } from 'vue-router'
import Downloader, { downloadManifest, downloadMaster, downloadScore } from '../native/downloader'
import DB from '../native/db'
import { setFullScreen, getPath, check, getVersion } from '../native/util'
import Item from '../component/Item.vue'
import Btn from '../component/Btn.vue'
import BtnProgress from '../component/BtnProgress.vue'
import ModalDifficulty from '../component/ModalDifficulty.vue'
import Spinner from '../component/Spinner.vue'
import { exists, mkdirs, unlink, rmrf } from '../native/cordova-fs'
import { acb2hca, hca2wav, wav2mp3 } from '../native/audio'
import * as path from 'path-browserify'

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

  bpm?: number;
  score?: string;
  scoreHash?: string;
}

@Component({
  components: {
    Item,
    Btn,
    BtnProgress,
    Spinner,
    ModalDifficulty
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
      }).then(() => next((vm) => {
        (vm.$refs as any).audioList.scrollTop = vm.scrollValue
        if (vm.currentPlaying) {
          vm.audio.play()
          vm.isPlaying = true
        }
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

  isBrowser: boolean = typeof cordova === 'undefined'

  scrollValue: number = 0

  resver: string = ''
  appVersion: string = ''

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
  currentPlaying: BGMItem | LiveItem | null = null
  isPlaying: boolean = false

  recheck: number = 0

  infoBtnClicked () {
    this.alert(`
      <p>应用名称：mishiro</p>
      <p>版本：${this.appVersion}</p>
      <p>资源版本：${this.resver}</p>
      <p>Git仓库：<a class="a" href="https://github.com/toyobayashi/mishiro-android">toyobayashi/mishiro-android</a></p>
      <p>PC版：<a class="a" href="https://github.com/toyobayashi/mishiro">toyobayashi/mishiro</a></p>
      <br/>
      <h3 style="font-size: 16px">使用第三方库</h3>
      <p>ACBExtractor - <a class="a" href="https://github.com/toyobayashi/ACBExtractor">toyobayashi/ACBExtractor</a></p>
      <p>HCADecoder - <a class="a" href="https://github.com/Nyagamon/HCADecoder">Nyagamon/HCADecoder</a></p>
      <p>libmp3lame - <a class="a" href="www.mp3dev.org">www.mp3dev.org</a></p>
      <br/>
      <h3 style="font-size: 16px">欢迎支持mishiro</h3>
      <img style="width: 100%" src="${process.env.NODE_ENV === 'production' ? 'file:///android_asset/www/img/alipay.jpg' : '/img/alipay.jpg'}" />
    `, '关于')
  }

  async scoreClicked () {
    if (!this.currentPlaying) {
      this.alert('无正在播放的曲子')
      return
    }
    if (!this.currentPlaying.score || !this.currentPlaying.scoreHash) {
      this.alert('当前播放的曲子没有谱面')
      return
    }

    let scoreFile = getPath(`score/${this.currentPlaying.score}`)
    const ex = await exists(scoreFile)
    if (!ex) {
      this.showLoading('正在下载谱面')
      scoreFile = await downloadScore(this.currentPlaying.score, this.currentPlaying.scoreHash, (data) => {
        this.setLoading(data.percentage)
      })
      this.hideLoading()
    }

    // this.alert(scorePath)
    let bdb = await DB.openDatabase(scoreFile)
    let rows = await bdb.query(`SELECT data FROM blobs WHERE name LIKE "%/__.csv" ESCAPE '/'`)
    // await bdb.close()
    const difficulty = await this.showScoreDifficulty(this.currentPlaying, rows.length === 5 ? true : false)
    if (!difficulty) {
      await bdb.close()
      return
    }

    const csv = await bdb.query(`SELECT data FROM blobs WHERE name LIKE "%/_${difficulty}.csv" ESCAPE '/'`)
    await bdb.close()
    let realCsv = ''
    if (typeof csv[0].data !== 'string') {
      let dataString = ''
      for (let i = 0; i < csv[0].data.length; i++) {
        dataString += String.fromCharCode(csv[0].data[i])
      }
      realCsv = dataString
    } else {
      realCsv = csv[0].data
    }

    this.audio.pause()
    this.isPlaying = false

    this.$router.push({
      name: 'score',
      params: {
        id: this.currentPlaying.name.split('/')[1].split('.')[0].split('_')[1],
        fileName: this.currentPlaying.fileName,
        difficulty,
        csv: realCsv
      }
    })
  }

  showScoreDifficulty (live: any, hasMasterPlus: boolean) {
    return new Promise<string>((resolve) => {
      this.bus.$emit('difficulty', live, hasMasterPlus, (res: string) => {
        resolve(res)
      })
    })
  }

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
      if (this.$route.name === 'index') {
        this.audio.src = getPath(`live/${item.fileName}`)
        this.audio.currentTime = 0
        this.audio.play()
        this.currentPlaying = item
        this.isPlaying = true
      }
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
      if (this.$route.name === 'index') {
        this.audio.src = getPath(`bgm/${item.fileName}`)
        this.audio.currentTime = 0
        this.audio.play()
        this.currentPlaying = item
        this.isPlaying = true
      }
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
  async pressed (item: LiveItem | BGMItem) {
    if (item.status === 'finished') {
      const res = await this.confirm('是否要删除' + item.fileName.split('.')[0] + '？')
      if (res) {
        await unlink(item.name.split('/')[0] === 'l' ? getPath(`live/${item.fileName}`) : getPath(`bgm/${item.fileName}`))
        item.status = 'stoped'
        item.loaded = 0
        this.audio.pause()
        this.currentPlaying = null
        this.isPlaying = false
      }
    }
  }

  swipeRight () {
    if (this.currentTab !== this.tabList[0]) {
      this.currentTab = this.tabList[this.tabList.indexOf(this.currentTab) - 1]
      this.$nextTick(() => {
        (this.$refs as any).audioList.scrollTop = 0
      })
    }
  }

  swipeLeft () {
    if (this.currentTab !== this.tabList[this.tabList.length - 1]) {
      this.currentTab = this.tabList[this.tabList.indexOf(this.currentTab) + 1]
      this.$nextTick(() => {
        (this.$refs as any).audioList.scrollTop = 0
      })
    }
  }

  tabClicked (tab: string) {
    this.currentTab = tab
    this.$nextTick(() => {
      (this.$refs as any).audioList.scrollTop = 0
    })
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

      if (typeof cordova !== 'undefined') {

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

        try {
          this.appVersion = await getVersion()
          await this.getLatestResource()
          // this.toast(resver)
          this.liveListDisplay = this.liveList = await this.getLiveList()
          // console.log(this.liveList)
          this.bgmListDisplay = this.bgmList = await this.getBGMList()
          // console.log(this.bgmList)
          if (this.manifestDatabase) {
            await this.manifestDatabase.close()
            this.manifestDatabase = null
          }
          if (this.masterDatabase) {
            await this.masterDatabase.close()
            this.masterDatabase = null
          }
        } catch (err) {
          console.log(err)
          this.hideLoading()
          this.alert(err.message)
        }
      }

    })
  }

  async getLatestResource (): Promise<string> {
    this.showLoading('正在获取数据库版本')
    let resver: string = ''
    try {
      resver = await check() /* '10050900' */
    } catch (err) {
      if (err.message.indexOf('209') !== -1) {
        if (this.recheck >= 3) {
          this.recheck = 0
          throw err
        } else {
          this.recheck++
          return this.getLatestResource()
        }
      } else {
        throw err
      }
    }
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

  public scrolled (e: any) {
    this.scrollValue = e.target.scrollTop
  }
}
