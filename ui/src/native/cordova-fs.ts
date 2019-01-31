import * as path from 'path-browserify'

const errMap: any = {
  1: 'NOT_FOUND_ERR',
  2: 'SECURITY_ERR',
  3: 'ABORT_ERR',
  4: 'NOT_READABLE_ERR',
  5: 'ENCODING_ERR',
  6: 'NO_MODIFICATION_ALLOWED_ERR',
  7: 'INVALID_STATE_ERR',
  8: 'SYNTAX_ERR',
  9: 'INVALID_MODIFICATION_ERR',
  10: 'QUOTA_EXCEEDED_ERR',
  11: 'TYPE_MISMATCH_ERR',
  12: 'PATH_EXISTS_ERR'
}

function getError (err: FileError): string {
  return errMap[err.code]
}

export function mkdirs (dir: string) {
  console.log(dir)
  return new Promise<void>((resolve, reject) => {
    cordova.exec(() => resolve(), err => reject(new Error(err)), 'Client', 'mkdirs', [dir.slice(7)])
  })
}

export function writeFile (filePath: string, data: Blob | Uint8Array | ArrayBuffer | string, isAppend: boolean = false): Promise<void> {
  if (!window.cordova) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const dir: string = path.dirname(filePath)
    const filename: string = path.basename(filePath)

    mkdirs(dir).then(() => {
      window.resolveLocalFileSystemURL(dir, function (dirEntry) {
        console.log('file system open: ' + dirEntry.name);
        (dirEntry as DirectoryEntry).getFile(filename, { create: true, exclusive: false }, function (fileEntry) {

          fileEntry.createWriter(function (fileWriter) {
            fileWriter.onwriteend = function () {
              resolve()
            }
            fileWriter.onerror = function (progressEvent) {
              reject(progressEvent.toString())
            }

            if (isAppend) {
              try {
                fileWriter.seek(fileWriter.length)
              } catch (e) {
                reject(new Error('file doesn\'t exist!'))
              }
            }

            fileWriter.write(data instanceof Blob ? data : new Blob([data]))
          }, (err) => reject(new Error(getError(err))))
        }, (err) => reject(new Error(getError(err))))
      }, (err) => reject(new Error(getError(err))))
    }).catch(reject)
  })
}

export function exists (filePath: string): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    window.resolveLocalFileSystemURL(filePath, () => resolve(true), () => resolve(false))
  })
}

export function unlink (filePath: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    window.resolveLocalFileSystemURL(filePath, (entry) => {
      entry.remove(() => {
        resolve()
      }, (err) => reject(reject(new Error(getError(err)))))
    }, (err) => reject(reject(new Error(getError(err)))))
  })
}

export function rmrf (path: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    cordova.exec(() => resolve(), err => reject(new Error(err)), 'Client', 'rmrf', [path.slice(7)])
  })
}
