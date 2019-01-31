import * as webpack from 'webpack'
import webpackConfig from './webpack.config'
import { config, getPath } from './constant'
import * as DevServer from 'webpack-dev-server'
// import { spawn } from 'child_process'
// import * as fs from 'fs-extra'

const statsOptions = {
  colors: true,
  children: false,
  modules: false,
  entrypoints: false
}

if (require.main === module) {
  main()
}

function main () {
  if (process.env.NODE_ENV === 'production') {
    prod()
    return
  }
  // if (webpackConfig.output && typeof webpackConfig.output.path === 'string') {
  //   if (fs.existsSync(webpackConfig.output.path)) fs.removeSync(webpackConfig.output.path)
  // }
  const devServerOptions: DevServer.Configuration = {
    stats: statsOptions,
    hot: true,
    host: config.devServerHost,
    inline: true,
    contentBase: getPath(config.contentBase)
  }
  if (config.publicPath) devServerOptions.publicPath = config.publicPath
  DevServer.addDevServerEntrypoints(webpackConfig, devServerOptions)
  const server = new DevServer(webpack(webpackConfig), devServerOptions)

  server.listen(config.devServerPort, config.devServerHost, () => {
    if (config.open) require('opn')(`http://${config.devServerHost}:${config.devServerPort}${config.publicPath || '/'}`)
  })
}

function prod () {
  // if (webpackConfig.output && typeof webpackConfig.output.path === 'string') {
  //   if (fs.existsSync(webpackConfig.output.path)) fs.removeSync(webpackConfig.output.path)
  // }
  if (process.argv.slice(2)[0] === 'watch') {
    webpack(webpackConfig).watch({
      aggregateTimeout: 300
    }, (err, stats) => {
      if (err) {
        console.error(err)
        return
      }
      console.log(stats.toString(statsOptions) + '\n')
    })
    return Promise.resolve()
  } else {
    return new Promise((resolve, reject) => {
      webpack(webpackConfig, (err, stats) => {
        if (err) {
          console.error(err)
          reject(err)
          return
        }
        console.log(stats.toString(statsOptions) + '\n')
        // spawn('cordova.cmd', ['prepare'], { cwd: getPath('..'), stdio: 'inherit', env: process.env })
        resolve(stats)
      })
    })
  }
}

module.exports = prod
