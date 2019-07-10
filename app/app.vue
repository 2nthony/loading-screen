<!-- Modified from @nuxt/loading-screen -->

<template>
  <div class="loading-screen" :class="{ hide: allDone }">
    <div class="row">
      <transition appear>
        <Logo class="logo" />
      </transition>
    </div>
    <div v-if="!bundles.length && !hasErrors" class="row placeholder">
      <transition appear>
        <h3>Loading...</h3>
      </transition>
    </div>
    <div v-else-if="hasErrors">
      <h3 class="hasErrors">
        An error occured, please look at your terminal.
      </h3>
    </div>
    <transition-group v-else>
      <div v-for="bundle of bundles" :key="bundle" class="row">
        <h3>{{ bundle | capitalize }} bundle</h3>
        <div class="progress_bar_container">
          <div class="progress_bar" :style="{ width: `${states[bundle].progress}%`, backgroundColor: theme[bundle] }" />
        </div>
        <div class="progress_status_container">
          <h4>{{ states[bundle].status }}</h4>
          <h4 v-if="theme.showPercent">{{ states[bundle].progress  }}%</h4>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<style src="./css/reset.css"></style>
<style src="./css/loading.css"></style>
<style src="./css/fonts.css"></style>

<script>
import fetch from 'unfetch'
import capitalizeMixin from './mixins/capitalize'
import logMixin from './mixins/log'
import wsMixin from './mixins/ws'

const waitFor = ms => new Promise(resolve => setTimeout(resolve, ms))

export default {
  el: '#webpack_loading_screen',

  mixins: [
    capitalizeMixin,
    logMixin,
    wsMixin
  ],

  // Hack Logo
  components: {
    Logo: {
      render(h) {
        return h('div', {
          domProps: {
            innerHTML: window.$LOGO.startsWith('http')
              ? `<img src="${window.$LOGO}">`
              : window.$LOGO
          }
        })
      }
    }
  },

  data() {
    return {
      allDone: false,
      hasErrors: false,
      isFinished: false,
      baseURL: window.$BASE_URL,
      bundles: [],
      states: {},
      theme: window.$THEME
    }
  },

  mounted() {
    this.onData(window.$STATE)
    this.wsConnect(`${this.baseURL}_loading/ws`)
    this.setTimeout()
  },

  methods: {
    onWSData(data) {
      if (this._reloading) {
        return
      }

      // We have data from ws. Delay timeout!
      this.setTimeout()

      this.onData(data)
    },

    async fetchData() {
      if (this._reloading) {
        return
      }

      // Prevent any fetch happening during fetch
      this.clearTimeout()

      try {
        const data = await fetch(`${this.baseURL}_loading/json`).then(res => res.json())
        this.onData(data)
      } catch (e) {
        this.logError(e)
      }

      // Start next timeout
      this.setTimeout()
    },

    clearTimeout() {
      if (this._fetchTimeout) {
        clearTimeout(this._fetchTimeout)
      }
    },

    setTimeout() {
      if (this._reloading) {
        return
      }

      this.clearTimeout()
      this._fetchTimeout = setTimeout(() => this.fetchData(), 1000)
    },

    onData(data) {
      if (!data || !data.states || this._reloading) {
        return
      }

      // Update active bundles
      this.bundles = data.states.map(state => state.name.toLowerCase())

      // Ignore if no bundle is active
      if (!this.bundles.length) {
        return
      }

      // Update bundle states
      for (const state of data.states) {
        const bundle = state.name.toLowerCase()
        if (!this.states[bundle]) {
          this.states[bundle] = {}
        }
        this.states[bundle].progress = state.progress
        this.states[bundle].status = state.details.length ? state.details.slice(0, 2).join(' ') : 'Done'
      }

      // Try to show your app if allDone and no errors
      if (!data.hasErrors && data.allDone && !this.allDone) {
        this.reload()
      }

      // Update state
      this.allDone = data.allDone
      this.hasErrors = data.hasErrors
    },

    async reload() {
      if (this._reloading) {
        return
      }

      this._reloading = true

      // Stop timers
      this.clearTimeout()

      // Close websockets connection
      this.wsClose()

      // Clear console
      this.clearConsole()

      // Wait form transition (and hopefully renderer to be ready)
      await waitFor(500)

      // Reload the page
      window.location.reload(true)
    }
  }
}
</script>
