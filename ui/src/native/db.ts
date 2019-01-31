class DB {
  private _id: string
  public static openDatabase (dbPath: string) {
    return new Promise<DB>((resolve, reject) => {
      cordova.exec((id) => resolve(new DB(id)), err => reject(new Error(err)), 'Client', 'openDatabase', [dbPath.slice(7)])
    })
  }
  private constructor (id: string) {
    this._id = id
  }

  public close () {
    return new Promise<void>((resolve, reject) => {
      cordova.exec(() => resolve(), err => reject(new Error(err)), 'Client', 'closeDatabase', [this._id])
    })
  }

  public query (sql: string, selectionArgs: string[] = []) {
    return new Promise<any[]>((resolve, reject) => {
      cordova.exec((records) => resolve(records), err => reject(new Error(err)), 'Client', 'queryDatabase', [this._id, sql, selectionArgs])
    })
  }
}

export default DB
