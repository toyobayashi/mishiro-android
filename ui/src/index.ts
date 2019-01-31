import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import createRouter from './config/router'
import vuePlugin from './config/vue-plugin'
import Global, { globalInstance } from './lib/global'
import { setFullScreen } from './native/util'

function main () {
  Vue.use(VueRouter)
  Vue.use(vuePlugin)

  const router = createRouter()

  // tslint:disable-next-line:no-unused-expression
  const vm = new Vue({
    router,
    render: h => h(App)
  }).$mount('#root')

  if (window.cordova) {
    document.addEventListener('resume', () => {
      if (vm.$route.name === 'score') {
        setFullScreen(true).then(() => {
          Global.play(globalInstance.audio)
        })
      } else {
        setFullScreen(false)
      }
    }, false)

    document.addEventListener('pause', () => {
      if (vm.$route.name === 'score') {
        globalInstance.audio.pause()
      }
    }, false)
  }

  if (process.env.NODE_ENV !== 'production') {
    if ((module as any).hot) (module as any).hot.accept()
  }
}

if (window.cordova) {
  document.addEventListener('deviceready', main)
} else {
  main()
}
