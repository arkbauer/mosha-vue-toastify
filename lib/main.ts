import { App } from '@vue/runtime-core'
import { createToast } from './createToast'
import './index.scss'

export { createToast } from './createToast'
export * from './types'

export default {
  // eslint-disable-next-line
  install: (app: App) => {
    app.config.globalProperties.$moshaToast = createToast
    app.provide('moshaToast', createToast)
  }
}
