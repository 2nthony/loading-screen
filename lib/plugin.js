const { ProgressPlugin: Plugin } = require('webpack')

module.exports = class ProgressPlugin extends Plugin {
  constructor(opts = {}) {
    super()
    this.opts = Object.assign(
      {
        baseURL: '/',
        logo: 'https://webpack.js.org/assets/icon-square-big.svg'
      },
      opts
    )

    this.env = opts.env || process.env.NODE_ENV
    this.port = process.env.port || 4000
    this.serverCallback =
      opts.serverCallback ||
      (() => {
        console.log(
          `[loading screen]:             http://localhost:${this.port}`
        )
      })
    this.listen = opts.listen || [this.port, this.serverCallback]

    this.connections = new Set()

    this.handler = (per, message, ...details) => {
      this.updateProgress(per, message, ...details)
    }

    this.init()
  }

  async init() {
    if (this.env !== 'development') {
      return
    }

    const LoadingUI = require('./loading')
    this.loading = new LoadingUI(this.opts)

    const { app, wss } = await this.loading.init()

    this.server = app.listen(...this.listen)
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
    if (this.opts.handler) {
      this.opts.handler(per, message, ...details)
    }

    this.loading.setStates([
      {
        name: 'client',
        progress: Math.floor(per * 100),
        message,
        details
      }
    ])

    if (per === 1) {
      this.closeServer()
    }
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
