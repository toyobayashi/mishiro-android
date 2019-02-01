import { ProgressData } from '../type/types'
import { lz4dec } from './util'
import { exists, unlink } from './cordova-fs'

// export default function download (
//   url: string,
//   path: string,
//   onProgress?: (data: { loaded: number; total: number; percentage: number } | null) => void): { promise: Promise<FileEntry>; ft: FileTransfer } {
//   let ft = new FileTransfer()
//   const promise = new Promise<FileEntry>((resolve, reject) => {
//     if (onProgress) {
//       ft.onprogress = function (progressEvent) {
//         if (progressEvent.lengthComputable) {
//           onProgress({
//             loaded: progressEvent.loaded,
//             total: progressEvent.total,
//             percentage: 100 * progressEvent.loaded / progressEvent.total
//           })
//         } else {
//           onProgress(null)
//         }
//       }
//     }

//     const uri = encodeURI(url)

//     ft.download(
//       uri,
//       path,
//       function (entry) {
//         resolve(entry)
//       },
//       function (error) {
//         reject(error)
//       },
//       false,
//       {
//         headers: {
//           'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 7.0; Nexus 42 Build/XYZZ1Y)',
//           'X-Unity-Version': '5.4.5p1',
//           'Accept-Encoding': 'gzip',
//           'Connection': 'Keep-Alive'
//         }
//       }
//     )
//   })

//   return { ft, promise }
// }

class Downloader {

  private _url: string
  private _path: string

  constructor (u: string, p: string) {
    this._url = u
    this._path = p
  }

  public download (onProgress?: (data: ProgressData) => void) {
    return new Promise<string>((resolve, reject) => {
      let time = new Date().getTime()
      cordova.exec((data) => {
        if (!data.ended) {
          const now = new Date().getTime()
          if (now - time >= 100) {
            time = now
            if (onProgress) onProgress(data)
          }
        } else {
          if (onProgress) onProgress(data)
          resolve(this._path)
        }
      }, (err) => {
        reject(new Error(err))
      }, 'Client', 'download', [this._url, this._path.slice(7)])
    })
  }

  public abort () {
    return new Promise<void>((resolve, reject) => {
      cordova.exec(() => {
        resolve()
      }, (err) => {
        reject(new Error(err))
      }, 'Client', 'abortDownload', [this._path.slice(7)])
    })
  }

  public getSavePath () {
    return this._path
  }

  public getUrl () {
    return this._url
  }
}

export default Downloader

export async function downloadManifest (resver: string, onProgress?: (data: ProgressData) => void) {
  const file = `${window.cordova.file.externalDataDirectory}data/manifest_${resver}.db`
  const ex = await exists(file)
  if (!ex) {
    const dl = new Downloader(`http://storage.game.starlight-stage.jp/dl/${resver}/manifests/Android_AHigh_SHigh`, file + '.lz4')
    await dl.download(onProgress)
    await lz4dec(file + '.lz4')
    await unlink(file + '.lz4')
  }
  return file
}

export async function downloadMaster (resver: string, hash: string, onProgress?: (data: ProgressData) => void) {
  const file = `${window.cordova.file.externalDataDirectory}data/master_${resver}.db`
  const ex = await exists(file)
  if (!ex) {
    const dl = new Downloader(`http://storage.game.starlight-stage.jp/dl/resources/Generic/${hash}`, file + '.lz4')
    await dl.download(onProgress)
    await lz4dec(file + '.lz4')
    await unlink(file + '.lz4')
  }
  return file
}

export async function downloadScore (score: string, hash: string, onProgress?: (data: ProgressData) => void) {
  const file = `${window.cordova.file.externalDataDirectory}score/${score}`
  const ex = await exists(file)
  if (!ex) {
    const dl = new Downloader(`http://storage.game.starlight-stage.jp/dl/resources/Generic/${hash}`, file + '.lz4')
    await dl.download(onProgress)
    await lz4dec(file + '.lz4')
    await unlink(file + '.lz4')
  }
  return file
}
// export function download (url: string, path: string, onProgress?: (data: { loaded: number; total: number; percentage: number; computable: boolean; ended: boolean }) => void) {
//   return new Promise<void>((resolve, reject) => {
//     cordova.exec((data) => {
//       if (!data.ended) {
//         if (onProgress) onProgress(data)
//       } else {
//         resolve()
//       }
//     }, (err) => {
//       reject(new Error(err))
//     }, 'Client', 'download', [url, path])
//   })
// }
