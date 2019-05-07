// Maybe have better way to handle the {server}

const { ProgressPlugin: Plugin } = require('webpack')

module.exports = class ProgressPlugin extends Plugin {
  constructor(opts = {}) {
    super()
    this.opts = Object.assign(
      {
        baseURL: '/',
        logo: 'https://webpack.js.org/assets/icon-square-big.svg',
        port: process.env.port || 4000,
        callback: () => {
          console.log(`[loading screen]:  http://localhost:${this.opts.port}`)
        }
      },
      opts
    )

    this.env = opts.env || process.env.NODE_ENV

    this.connections = new Set()

    this.handler = (per, message, ...details) => {
      if (this.opts.handler) {
        this.opts.handler(per, message, ...details)
      }

      this.updateProgress(per, message, ...details)
    }

    this.init()
  }

  apply(compiler) {
    super.apply(compiler)

    compiler.hooks.done.tap('LoadingScreen:done', () => {
      this.closeServer()
    })
  }

  async init() {
    if (this.env !== 'development') {
      return
    }

    const LoadingUI = require('./loading')
    this.loading = new LoadingUI(this.opts)

    const { app, wss } = await this.loading.init()

    this.server = app.listen(this.opts.port, this.opts.host, this.opts.callback)
    this.server
      .on('upgrade', (req, socket, head) => {
        if (req.url === `${this.opts.baseURL}_loading/ws`) {
          this.loading.handleUpgrade(req, socket, head)
        }
      })
      .on('connection', connection => {
        this.connections.add(connection)
      })

    wss.on('connection', ws => {
      ws.on('close', () => {
        this.closeServer('connection')
      })
    })
  }

  updateProgress(per, message, ...details) {
    this.loading.setStates([
      {
        name: 'client',
        progress: Math.floor(per * 100),
        message,
        details
      }
    ])
  }

  closeServer(type) {
    this.server.close()
    if (type === 'connection') {
      this.connections.forEach(connection => {
        connection.destroy()
      })
    }
  }
}
