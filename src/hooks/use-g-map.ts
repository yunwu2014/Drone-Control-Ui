import { App } from 'vue'
import { message } from 'ant-design-vue'

export function useGMapManage () {
  let map: any = null

  function initMap (container: string, app: App) {
    const mars3d = (window as any).mars3d
    if (!mars3d) {
      console.error('mars3d is not loaded')
      return
    }

    mars3d.Util.fetchJson({ url: '/config/config.json' }).then((data: any) => {
      const mapOptions = data.map3d || {}
      map = new mars3d.Map(container, {
        ...mapOptions,
        control: {
          ...(mapOptions.control || {}),
          // compass: {
          //   className: 'mars3d-compass-custom',
          //   rotation: false,
          // },
        },
        contextOptions: {
          requestWebglPreMultipliedAlpha: false,
        },
      })

      map.setOptions({
        scene: {
          backgroundImage: 'url(/img/tietu/backGroundImg.jpg)',
        },
      })

      // 将指北针 DOM 移到 body 下，使用 fixed 定位，防止随地图移动
      // setTimeout(() => {
      //   const compassEl = document.querySelector('.mars3d-compass-custom')
      //   if (compassEl && compassEl.parentNode !== document.body) {
      //     document.body.appendChild(compassEl)
      //     ;(compassEl as HTMLElement).style.position = 'fixed'
      //     ;(compassEl as HTMLElement).style.top = '5px'
      //     ;(compassEl as HTMLElement).style.right = '5px'
      //     ;(compassEl as HTMLElement).style.bottom = 'auto'
      //     ;(compassEl as HTMLElement).style.zIndex = '9999'
      //   }
      // }, 300)

      window.haoutil = window.haoutil || {}
      window.haoutil.msg = (msg: string) => message.success(msg)
      window.haoutil.alert = (msg: string) => message.success(msg)

      const measure = new mars3d.thing.Measure({
        label: {
          color: '#ffffff',
          font_family: '楷体',
          font_size: 20,
          background: false,
        },
      })
      map.addThing(measure)

      ;(window as any).$map = map
      app.config.globalProperties.$map = map
      app.config.globalProperties.$mars3d = mars3d

      map.flyHome({ duration: 0 })
    })
  }

  function globalPropertiesConfig (app: App) {
    initMap('mars3d-container', app)
  }

  return {
    globalPropertiesConfig,
  }
}
