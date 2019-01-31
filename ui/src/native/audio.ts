import { ProgressData } from '../type/types'

export function wav2mp3 (wavPath: string, mp3Path: string, onProgress?: (data: ProgressData) => void) {
  return new Promise<void>((resolve, reject) => {
    let time = new Date().getTime()
    cordova.exec((data) => {
      if (!data.ended) {
        const now = new Date().getTime()
        if (now - time >= 100) {
          time = now
          if (onProgress) onProgress(data)
        }
      } else {
        resolve()
      }
    }, (err) => {
      reject(new Error(err))
    }, 'Client', 'wav2mp3', [wavPath.substr(7), mp3Path.substr(7)])
  })
}

export function hca2wav (hcaPath: string, wavPath: string) {
  return new Promise<void>((resolve, reject) => {
    cordova.exec(() => {
      resolve()
    }, (err) => {
      reject(new Error(err))
    }, 'Client', 'hca2wav', [hcaPath.substr(7), wavPath.substr(7)])
  })
}

export function acb2hca (acbPath: string) {
  return new Promise<string>((resolve, reject) => {
    cordova.exec((hcaDir) => {
      resolve(hcaDir)
    }, (err) => {
      reject(new Error(err))
    }, 'Client', 'acb2hca', [acbPath.substr(7)])
  })
}
