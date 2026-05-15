import { createApp, ComponentCustomProperties, App as VueApp } from 'vue'
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $map: any // Mars3D/Cesium 地图对象
    $mars3d: any // Mars3D 命名空间
    $measure: any // Mars3D 测量工具
  }
}
let root: ComponentCustomProperties
let app = null as any

export function createInstance (App: any): VueApp {
  app = createApp(App)
  root = app.config.globalProperties as ComponentCustomProperties
  return app
}

export function getRoot (): ComponentCustomProperties {
  return root
}

export function getApp (): VueApp {
  return app
}
