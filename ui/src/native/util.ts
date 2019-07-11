import * as path from 'path'

export function lz4dec (file: string) {
  return new Promise<void>((resolve, reject) => {
    cordova.exec(() => {
      resolve()
    }, (err) => {
      reject(new Error(err))
    }, 'Client', 'lz4dec', [file.substr(7)])
  })
}

export function toast (message: string, duration: 'short' | 'long' = 'short') {
  if (typeof cordova === 'undefined') return Promise.resolve(console.log(message))
  return new Promise<void>((resolve, reject) => {
    cordova.exec(() => {
      resolve()
    }, (err) => {
      reject(new Error(err))
    }, 'MyToast', 'toast', [message, duration])
  })
}

export function setFullScreen (isFullScreen: boolean) {
  return new Promise<void>((resolve, reject) => {
    cordova.exec(() => {
      resolve()
    }, (err) => {
      reject(new Error(err))
    }, 'Client', 'setFullScreen', [isFullScreen])
  })
}

export function check () {
  return new Promise<string>((resolve, reject) => {
    cordova.exec((resver) => resolve(resver), (err) => reject(new Error(err)), 'Client', 'check', [])
  })
}

export function getPath (...relative: string[]) {
  return 'file://' + path.join(cordova.file.externalDataDirectory, ...relative).slice(5)
}

export function getPathNative (...relative: string[]) {
  return path.join(cordova.file.externalDataDirectory, ...relative).slice(5)
}

export function getVersion () {
  return new Promise<string>((resolve, reject) => {
    cordova.exec((version) => {
      resolve(version)
    }, (err) => {
      reject(new Error(err))
    }, 'Client', 'getVersion', [])
  })
}
