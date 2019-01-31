import { PluginFunction } from 'vue'
import { toast } from '../native/util'
import { AdditionalBtn } from '../component/v-modal-alert'
import * as Hammer from 'hammerjs'

const install: PluginFunction<undefined> = function (Vue) {
  const bus = new Vue({})
  Vue.prototype.bus = bus
  Vue.prototype.setLoading = function (data: string | number | boolean | Function | { show?: boolean; text?: string; loaded?: number; btnCall?: null | (() => void); }) {
    if (typeof data === 'string') {
      bus.$emit('setLoading', null, data, null)
    } else if (typeof data === 'number') {
      bus.$emit('setLoading', null, null, data)
    } else if (typeof data === 'boolean') {
      bus.$emit('setLoading', data, null, null)
    } else if (typeof data === 'function') {
      bus.$emit('setLoading', null, null, null, data)
    } else if (typeof data === 'object' && data !== null) {
      bus.$emit('setLoading', data.show, data.text, data.loaded, data.btnCall)
    }
  }

  Vue.prototype.showLoading = function (text?: string, btnCall: null | (() => void) = null) {
    this.setLoading({ show: true, text: text || '', loaded: 0, btnCall })
  }

  Vue.prototype.hideLoading = function () {
    this.setLoading({ show: false, text: '', loaded: 0, btnCall: null })
  }

  Vue.prototype.alert = function (body: string, title: string = '提示', additionalBtn?: AdditionalBtn) {
    bus.$emit('alert', title, body, null, additionalBtn)
  }

  Vue.prototype.confirm = function (body: string, title: string = '提示') {
    return new Promise<boolean>((resolve) => {
      bus.$emit('confirm', title, body, resolve)
    })
  }

  Vue.prototype.toast = toast

  Vue.directive('tap', {
    bind: function (el, binding) {
      const hammertime = new Hammer(el)
      hammertime.on('tap', binding.value)
    }
  })
  Vue.directive('swipeLeft', {
    bind: function (el, binding) {
      const hammertime = new Hammer(el)
      hammertime.on('swipeleft', binding.value)
    }
  })
  Vue.directive('swipeRight', {
    bind: function (el, binding) {
      const hammertime = new Hammer(el)
      hammertime.on('swiperight', binding.value)
    }
  })
  Vue.directive('press', {
    bind: function (el, binding) {
      const hammertime = new Hammer(el)
      hammertime.on('press', binding.value)
    }
  })
}

export default {
  install
}
