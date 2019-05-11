const LoadingScreenPlugin = require('.')
const colors = require('@poi/dev-utils/colors')

exports.name = 'loading-screen'

exports.apply = api => {
  if (!api.args.has('s') && !api.args.has('serve')) return
  /**
   * Prepare arguments for open browser
   */
  const { args, config } = api
  const { host, port } = config.devServer
  const isUnspecifiedHost = host === '0.0.0.0' || host === '::'
  const prettyHost = isUnspecifiedHost ? 'localhost' : host

  /**
   * Make poi lose ability to open browser
   */
  delete config.devServer.open

  api.hook('createWebpackChain', config => {
    config.plugin('print-loading-screen-serve').use({
      apply(compiler) {
        compiler.hooks.afterPlugins.tap('print-loading-screen-serve', () => {
          console.log()
          console.log('You can now view your app in the browser:')
          console.log(
            `Local:             http://${prettyHost}:${colors.bold(port)}`
          )
          console.log()
        })
      }
    })
    /**
     * Override poi progress plugin
     */
    config.plugin('progress').init(
      (_, [handler]) =>
        new LoadingScreenPlugin({
          logo:
            'https://camo.githubusercontent.com/5ae09d1630be8e50dd69a50d9d45b326a0cb41ab/68747470733a2f2f692e6c6f6c692e6e65742f323031382f30392f31322f356239386537373335326339642e706e67',
          handler,
          port,
          // Real • open browser
          callback() {
            if (args.has('o') || args.has('open')) {
              require('@poi/dev-utils/openBrowser')(
                `http://${prettyHost}:${port}`
              )
            }
          }
        })
    )
  })
}
