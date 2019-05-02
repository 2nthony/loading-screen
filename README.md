<img src="https://user-images.githubusercontent.com/19513289/57039264-c0f5c980-6c8e-11e9-8894-3737f5671900.png" alt="logo">

---

[![NPM version](https://badgen.net/npm/v/loading-screen)](https://npmjs.com/package/loading-screen)
[![NPM download](https://badgen.net/npm/dm/loading-screen)](https://npmjs.com/package/loading-screen)
[![License](https://badgen.net/npm/license/loading-screen)](./LICENSE)
[![$donate](https://badgen.net/badge/$/donate/f2a)](https://patreon.com/evillt)

![](https://user-images.githubusercontent.com/19513289/57092852-f2c66900-6d3e-11e9-9919-449361403b0a.gif)

## Introduction

To show loading screen for webpack.

**_This plugin is recommended for webpack-based app bundler._**

## Install

```console
yarn add loading-screen -D
```

## Usage

In your `webpack.config.js`:

```js
const LoadingScreenPlugin = require('loading-screen')

module.exports = {
  plugins: [new LoadingScreenPlugin()]
}
```

## API

### **listen**

- Type: `[server.listen]`
- Default: `[4000, serverCallback]`

The server listen instance.

Reference: https://nodejs.org/dist/latest-v10.x/docs/api/net.html#net_server_listen

### serverCallback

- Type: `(req, res) => void`
- DefaultBehavior: Print loading screen server message.

Only modified server listen callback.

### baseURL

- Type: `string`
- Default: `'/'`

Similiar with `webpack.output.publicPath`.

### logo

- Type: `url | HTML.innerHTML`
- Default: `'https://webpack.js.org/assets/icon-square-big.svg'` which mean is webpack logo

Set url to display your prefer logo for loading screen.

Or with regular HTML:

```js
new LoadingScreenPlugin({
  logo: '<svg xmlns>...</svg>'
})
```

### env

- Type: `'development' | 'production'`
- Default: `process.env.NODE_ENV`

Enable loading screen when is `'development'`, disable otherwise.

### handler

- Type: `(per, message, ...details) => void`

Progress hooks report details.

Reference: https://webpack.js.org/plugins/progress-plugin/

## Credits

- [**nuxt/loading-screen**](https://github.com/nuxt/loading-screen)

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

**loading-screen** © [EVILLT](https://github.com/evillt), Released under the [MIT](./LICENSE) License.

Authored and maintained by **EVILLT** with help from contributors ([list](https://github.com/evillt/loading-screen/contributors)).

> [evila.me](https://evila.me) · GitHub [@evillt](https://github.com/evillt) · Twitter [@evillt](https://twitter.com/evillt)
