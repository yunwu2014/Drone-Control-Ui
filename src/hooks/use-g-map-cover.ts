import { EFlightAreaType } from '../types/flight-area'
import pin19be6b from '/@/assets/icons/pin-19be6b.svg'
import pin212121 from '/@/assets/icons/pin-212121.svg'
import pin2d8cf0 from '/@/assets/icons/pin-2d8cf0.svg'
import pinb620e0 from '/@/assets/icons/pin-b620e0.svg'
import pine23c39 from '/@/assets/icons/pin-e23c39.svg'
import pineffbb00 from '/@/assets/icons/pin-ffbb00.svg'
import { getRoot } from '/@/root'
import rootStore from '/@/store'
import { GeojsonCoordinate } from '/@/types/map'

export function useGMapCover () {
  const root = getRoot()
  const mars3d = (window as any).mars3d
  const map = (window as any).$map || root.$map

  const normalColor = '#2D8CF0'
  const store = rootStore
  const coverMap = store.state.coverMap
  const flightAreaColorMap = {
    [EFlightAreaType.DFENCE]: '#19be6b',
    [EFlightAreaType.NFZ]: '#ff0000',
  }
  const disableColor = '#b3b3b3'

  function getPinIconSrc (color?: string): string {
    const colorObj: { [key: string]: any } = {
      '2d8cf0': pin2d8cf0,
      '19be6b': pin19be6b,
      212121: pin212121,
      b620e0: pinb620e0,
      e23c39: pine23c39,
      ffbb00: pineffbb00,
    }
    const iconName = (color?.replaceAll('#', '') || '').toLocaleLowerCase()
    return colorObj[iconName] || pin2d8cf0
  }

  function addToCoverMap (id: string, graphic: any) {
    if (!coverMap[id]) {
      coverMap[id] = []
    }
    coverMap[id].push(graphic)
    map.addGraphic(graphic)
  }

  function init2DPin (name: string, coordinates: GeojsonCoordinate, color?: string, data?: {}) {
    const src = getPinIconSrc(color)
    const graphic = new mars3d.graphic.BillboardEntity({
      name,
      position: [coordinates[0], coordinates[1], 0],
      style: {
        image: src,
        scale: 1,
        horizontalOrigin: mars3d.Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: mars3d.Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: [0, -20],
      },
      attr: data || {},
    })
    addToCoverMap((data as any)?.id, graphic)
  }

  function initPolyline (name: string, coordinates: GeojsonCoordinate[], color?: string, data?: {}) {
    const graphic = new mars3d.graphic.PolylineEntity({
      name,
      positions: coordinates.map(c => [c[0], c[1], c[2] || 0]),
      style: {
        color: color || normalColor,
        opacity: 1,
        width: 2,
        clampToGround: true,
      },
      attr: data || {},
    })
    addToCoverMap((data as any)?.id, graphic)
  }

  function initPolygon (name: string, coordinates: GeojsonCoordinate[][], color?: string, data?: {}) {
    const graphic = new mars3d.graphic.PolygonEntity({
      name,
      positions: coordinates[0].map(c => [c[0], c[1], c[2] || 0]),
      style: {
        color: color || normalColor,
        opacity: 0.4,
        outline: true,
        outlineColor: color || normalColor,
        outlineWidth: 2,
        clampToGround: true,
      },
      attr: data || {},
    })
    addToCoverMap((data as any)?.id, graphic)
  }

  function removeCoverFromMap (id: string) {
    if (!coverMap[id]) return
    coverMap[id].forEach((graphic: any) => {
      map.removeGraphic(graphic)
    })
    coverMap[id] = []
  }

  function getElementFromMap (id: string): any[] {
    return coverMap[id] || []
  }

  function updatePinElement (id: string, name: string, coordinates: GeojsonCoordinate, color?: string) {
    const elements = getElementFromMap(id)
    if (elements && elements.length > 0) {
      const graphic = elements[0]
      graphic.position = mars3d.Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1])
      graphic.name = name
      if (color) {
        graphic.style.image = getPinIconSrc(color)
      }
    } else {
      init2DPin(name, coordinates, color, { id, name })
    }
  }

  function updatePolylineElement (id: string, name: string, coordinates: GeojsonCoordinate[], color?: string) {
    const elements = getElementFromMap(id)
    if (elements && elements.length > 0) {
      const graphic = elements[0]
      graphic.positions = coordinates.map(c => [c[0], c[1], c[2] || 0])
      graphic.name = name
      if (color) {
        graphic.style.color = color
      }
    } else {
      initPolyline(name, coordinates, color, { id, name })
    }
  }

  function updatePolygonElement (id: string, name: string, coordinates: GeojsonCoordinate[][], color?: string) {
    const elements = getElementFromMap(id)
    if (elements && elements.length > 0) {
      const graphic = elements[0]
      graphic.positions = coordinates[0].map(c => [c[0], c[1], c[2] || 0])
      graphic.name = name
      if (color) {
        graphic.style.color = color
        graphic.style.outlineColor = color
      }
    } else {
      initPolygon(name, coordinates, color, { id, name })
    }
  }

  function initTextInfo (content: string, coordinates: GeojsonCoordinate, id: string) {
    const graphic = new mars3d.graphic.DivGraphic({
      position: [coordinates[0], coordinates[1], 0],
      style: {
        html: `<div style="background: transparent; font-size: 16px; color: #333; white-space: nowrap;">${content}</div>`,
        anchor: [0, -20],
      },
      attr: { id, type: 'text' },
    })
    addToCoverMap(id, graphic)
  }

  function initFlightAreaCircle (name: string, radius: number, position: GeojsonCoordinate, data: { id: string, type: EFlightAreaType, enable: boolean }) {
    const color = data.enable ? flightAreaColorMap[data.type] : disableColor
    const graphic = new mars3d.graphic.CircleEntity({
      name,
      position: [position[0], position[1], 0],
      radius,
      style: {
        color: EFlightAreaType.NFZ === data.type && data.enable ? color : 'rgba(0,0,0,0)',
        opacity: EFlightAreaType.NFZ === data.type && data.enable ? 0.3 : 0,
        outline: true,
        outlineColor: color,
        outlineWidth: 4,
        clampToGround: true,
      },
      attr: data,
    })
    addToCoverMap(data.id, graphic)
    initTextInfo(name, position, data.id)
  }

  function updateFlightAreaCircle (id: string, name: string, radius: number, position: GeojsonCoordinate, enable: boolean, type: EFlightAreaType) {
    const elements = getElementFromMap(id)
    if (elements && elements.length > 0) {
      const color = enable ? flightAreaColorMap[type] : disableColor
      let textGraphic: any = null
      const nonTextElements: any[] = []

      elements.forEach((ele: any) => {
        if (ele.attr?.type === 'text') {
          textGraphic = ele
        } else {
          nonTextElements.push(ele)
        }
      })

      if (textGraphic) {
        textGraphic.position = mars3d.Cesium.Cartesian3.fromDegrees(position[0], position[1])
        textGraphic.style.html = `<div style="background: transparent; font-size: 16px; color: #333; white-space: nowrap;">${name}</div>`
      } else {
        initTextInfo(name, position, id)
      }

      nonTextElements.forEach((graphic: any) => {
        graphic.radius = radius
        graphic.position = mars3d.Cesium.Cartesian3.fromDegrees(position[0], position[1])
        graphic.style.color = EFlightAreaType.NFZ === type && enable ? color : 'rgba(0,0,0,0)'
        graphic.style.opacity = EFlightAreaType.NFZ === type && enable ? 0.3 : 0
        graphic.style.outlineColor = color
      })
    } else {
      initFlightAreaCircle(name, radius, position, { id, type, enable })
    }
  }

  function calcPolygonPosition (coordinate: GeojsonCoordinate[]): GeojsonCoordinate {
    const index = coordinate.length - 1
    return [(coordinate[0][0] + coordinate[index][0]) / 2.0, (coordinate[0][1] + coordinate[index][1]) / 2]
  }

  function initFlightAreaPolygon (name: string, coordinates: GeojsonCoordinate[], data: { id: string, type: EFlightAreaType, enable: boolean }) {
    const color = data.enable ? flightAreaColorMap[data.type] : disableColor
    const graphic = new mars3d.graphic.PolygonEntity({
      name,
      positions: coordinates.map(c => [c[0], c[1], c[2] || 0]),
      style: {
        color: EFlightAreaType.NFZ === data.type && data.enable ? color : 'rgba(0,0,0,0)',
        opacity: EFlightAreaType.NFZ === data.type && data.enable ? 0.3 : 0,
        outline: true,
        outlineColor: color,
        outlineWidth: 4,
        clampToGround: true,
      },
      attr: data,
    })
    addToCoverMap(data.id, graphic)
    initTextInfo(name, calcPolygonPosition(coordinates), data.id)
  }

  function updateFlightAreaPolygon (id: string, name: string, coordinates: GeojsonCoordinate[], enable: boolean, type: EFlightAreaType) {
    const elements = getElementFromMap(id)
    if (elements && elements.length > 0) {
      const color = enable ? flightAreaColorMap[type] : disableColor
      let textGraphic: any = null
      const nonTextElements: any[] = []

      elements.forEach((ele: any) => {
        if (ele.attr?.type === 'text') {
          textGraphic = ele
        } else {
          nonTextElements.push(ele)
        }
      })

      if (textGraphic) {
        textGraphic.position = mars3d.Cesium.Cartesian3.fromDegrees(
          calcPolygonPosition(coordinates)[0],
          calcPolygonPosition(coordinates)[1]
        )
        textGraphic.style.html = `<div style="background: transparent; font-size: 16px; color: #333; white-space: nowrap;">${name}</div>`
      } else {
        initTextInfo(name, calcPolygonPosition(coordinates), id)
      }

      nonTextElements.forEach((graphic: any) => {
        graphic.positions = coordinates.map(c => [c[0], c[1], c[2] || 0])
        graphic.style.color = EFlightAreaType.NFZ === type && enable ? color : 'rgba(0,0,0,0)'
        graphic.style.opacity = EFlightAreaType.NFZ === type && enable ? 0.3 : 0
        graphic.style.outlineColor = color
      })
    } else {
      initFlightAreaPolygon(name, coordinates, { id, type, enable })
    }
  }

  return {
    init2DPin,
    initPolyline,
    initPolygon,
    removeCoverFromMap,
    getElementFromMap,
    updatePinElement,
    updatePolylineElement,
    updatePolygonElement,
    initFlightAreaCircle,
    initFlightAreaPolygon,
    updateFlightAreaPolygon,
    updateFlightAreaCircle,
    calcPolygonPosition,
  }
}
