import { reactive } from 'vue'
import pin2d8cf0 from '/@/assets/icons/pin-2d8cf0.svg'
import { MapDoodleType } from '/@/constants/map'
import { getRoot } from '/@/root'
import { MapDoodleEnum } from '/@/types/map-enum'
import { EFlightAreaType } from '../types/flight-area'
import { message } from 'ant-design-vue'

export function useMouseTool () {
  const root = getRoot()
  const mars3d = (window as any).mars3d
  const map = (window as any).$map || root.$map

  const state = reactive({
    pinNum: 0,
    polylineNum: 0,
    PolygonNum: 0,
    currentType: '',
  })

  const flightAreaColorMap = {
    [EFlightAreaType.DFENCE]: '#19be6b',
    [EFlightAreaType.NFZ]: '#ff0000',
  }

  let drawThing: any = null
  let currentDrawCallback: Function | null = null
  let currentFlightAreaType: EFlightAreaType | undefined

  function getDrawInstance () {
    if (!drawThing) {
      drawThing = new mars3d.thing.Draw({
        label: {
          color: '#ffffff',
          font_family: '楷体',
          font_size: 20,
          background: false,
        },
      })
      map.addThing(drawThing)

      drawThing.on(mars3d.thing.Draw.EventType.drawEnd, (e: any) => {
        if (currentDrawCallback) {
          const graphic = e.graphic
          if (currentFlightAreaType) {
            currentDrawCallback({
              obj: {
                getExtData: () => graphic.attr || {},
                getCenter: () => {
                  const p = graphic.position
                  const cartographic = mars3d.Cesium.Cartographic.fromCartesian(p)
                  return {
                    lng: mars3d.Cesium.Math.toDegrees(cartographic.longitude),
                    lat: mars3d.Cesium.Math.toDegrees(cartographic.latitude),
                  }
                },
                getRadius: () => graphic.radius,
                getPath: () => {
                  const positions = graphic.positions
                  if (!positions) return []
                  return positions.map((p: any) => {
                    const cartographic = mars3d.Cesium.Cartographic.fromCartesian(p)
                    return {
                      lng: mars3d.Cesium.Math.toDegrees(cartographic.longitude),
                      lat: mars3d.Cesium.Math.toDegrees(cartographic.latitude),
                    }
                  })
                },
                getPosition: () => {
                  const p = graphic.position
                  const cartographic = mars3d.Cesium.Cartographic.fromCartesian(p)
                  return {
                    lng: mars3d.Cesium.Math.toDegrees(cartographic.longitude),
                    lat: mars3d.Cesium.Math.toDegrees(cartographic.latitude),
                  }
                },
                setExtData: (ext: any) => {
                  graphic.attr = Object.assign(graphic.attr || {}, ext)
                },
                _originOpts: { title: graphic.name || '' },
                _opts: { title: graphic.name || '' },
              },
            })
          } else {
            currentDrawCallback({
              obj: {
                getExtData: () => graphic.attr || {},
                getPath: () => {
                  const positions = graphic.positions
                  if (!positions) return []
                  return positions.map((p: any) => {
                    const cartographic = mars3d.Cesium.Cartographic.fromCartesian(p)
                    return {
                      lng: mars3d.Cesium.Math.toDegrees(cartographic.longitude),
                      lat: mars3d.Cesium.Math.toDegrees(cartographic.latitude),
                    }
                  })
                },
                getPosition: () => {
                  const p = graphic.position
                  const cartographic = mars3d.Cesium.Cartographic.fromCartesian(p)
                  return {
                    lng: mars3d.Cesium.Math.toDegrees(cartographic.longitude),
                    lat: mars3d.Cesium.Math.toDegrees(cartographic.latitude),
                  }
                },
                setExtData: (ext: any) => {
                  graphic.attr = Object.assign(graphic.attr || {}, ext)
                },
                _originOpts: { title: graphic.name || '' },
                _opts: { title: graphic.name || '' },
              },
            })
          }
        }
      })
    }
    return drawThing
  }

  function drawPin (getDrawCallback: Function) {
    const operation = getDrawInstance()
    operation.startDraw({
      type: 'point',
      style: {
        image: pin2d8cf0,
        scale: 1,
        horizontalOrigin: mars3d.Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: mars3d.Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: [0, -20],
      },
    })
    state.pinNum++
    currentDrawCallback = getDrawCallback
    currentFlightAreaType = undefined
  }

  function drawPolyline (getDrawCallback: Function) {
    const operation = getDrawInstance()
    operation.startDraw({
      type: 'polyline',
      style: {
        color: '#2d8cf0',
        width: 2,
        opacity: 1,
        clampToGround: true,
      },
    })
    currentDrawCallback = getDrawCallback
    currentFlightAreaType = undefined
  }

  function drawPolygon (getDrawCallback: Function) {
    const operation = getDrawInstance()
    operation.startDraw({
      type: 'polygon',
      style: {
        color: '#1791fc',
        opacity: 0.4,
        outline: true,
        outlineColor: '#2d8cf0',
        outlineWidth: 2,
        clampToGround: true,
      },
    })
    currentDrawCallback = getDrawCallback
    currentFlightAreaType = undefined
  }

  function drawOff () {
    const operation = getDrawInstance()
    operation.removeDrawGraphic()
    operation.enabled = false
    currentDrawCallback = null
    currentFlightAreaType = undefined
  }

  function drawFlightAreaPolygon (type: EFlightAreaType, getDrawFlightAreaCallback: Function) {
    const color = flightAreaColorMap[type]
    const operation = getDrawInstance()
    operation.startDraw({
      type: 'polygon',
      style: {
        color: EFlightAreaType.NFZ === type ? color : 'rgba(0,0,0,0)',
        opacity: EFlightAreaType.NFZ === type ? 0.3 : 0,
        outline: true,
        outlineColor: color,
        outlineWidth: 4,
        clampToGround: true,
      },
    })
    currentDrawCallback = getDrawFlightAreaCallback
    currentFlightAreaType = type
  }

  function drawFlightAreaCircle (type: EFlightAreaType, getDrawFlightAreaCallback: Function) {
    const color = flightAreaColorMap[type]
    const operation = getDrawInstance()
    operation.startDraw({
      type: 'circle',
      style: {
        color: EFlightAreaType.NFZ === type ? color : 'rgba(0,0,0,0)',
        opacity: EFlightAreaType.NFZ === type ? 0.3 : 0,
        outline: true,
        outlineColor: color,
        outlineWidth: 4,
        clampToGround: true,
      },
    })
    currentDrawCallback = getDrawFlightAreaCallback
    currentFlightAreaType = type
  }

  function mouseTool (type: MapDoodleType, getDrawCallback: Function, flightAreaType?: EFlightAreaType) {
    state.currentType = type
    if (flightAreaType) {
      switch (type) {
        case MapDoodleEnum.POLYGON:
          drawFlightAreaPolygon(flightAreaType, getDrawCallback)
          return
        case MapDoodleEnum.CIRCLE:
          drawFlightAreaCircle(flightAreaType, getDrawCallback)
          return
        default:
          message.error(`Invalid type: ${flightAreaType}`)
          return
      }
    }
    switch (type) {
      case MapDoodleEnum.PIN:
        drawPin(getDrawCallback)
        break
      case MapDoodleEnum.POLYLINE:
        drawPolyline(getDrawCallback)
        break
      case MapDoodleEnum.POLYGON:
        drawPolygon(getDrawCallback)
        break
      case MapDoodleEnum.Close:
        drawOff()
        break
    }
  }

  return {
    mouseTool,
  }
}
