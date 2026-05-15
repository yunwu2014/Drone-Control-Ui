import store from '/@/store'
import { getRoot } from '/@/root'
import { ELocalStorageKey, EDeviceTypeName } from '/@/types'
import { getDeviceBySn } from '/@/api/manage'
import { message } from 'ant-design-vue'
import dockIcon from '/@/assets/icons/dock.png'
import rcIcon from '/@/assets/icons/rc.png'
import droneIcon from '/@/assets/icons/drone.png'

export function deviceTsaUpdate () {
  const root = getRoot()
  const mars3d = (window as any).mars3d
  const map = (window as any).$map || root.$map

  const icons = new Map([
    [EDeviceTypeName.Aircraft, droneIcon],
    [EDeviceTypeName.Gateway, rcIcon],
    [EDeviceTypeName.Dock, dockIcon],
  ])
  const markers = store.state.markerInfo.coverMap
  const paths = store.state.markerInfo.pathMap

  let trackLine: any = null
  let trackPoints: [number, number, number][] = []

  function getTrackLineInstance () {
    if (!trackLine) {
      trackLine = new mars3d.graphic.PolylineEntity({
        positions: [],
        style: {
          color: '#939393',
          width: 2,
          clampToGround: true,
        },
      })
      map.addGraphic(trackLine)
    }
    return trackLine
  }

  function initMarker (type: number, name: string, sn: string, lng?: number, lat?: number) {
    if (markers[sn]) {
      return
    }
    const iconSrc = icons.get(type)
    if (!iconSrc) return

    markers[sn] = new mars3d.graphic.BillboardEntity({
      name,
      position: [lng || 113.943225499, lat || 22.577673716, 0],
      style: {
        image: iconSrc,
        scale: 1,
        horizontalOrigin: mars3d.Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: mars3d.Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: [0, -20],
      },
      attr: { sn, type },
    })
    map.addGraphic(markers[sn])

    if (!paths[sn]) {
      paths[sn] = []
    }
  }

  function removeMarker (sn: string) {
    if (!markers[sn]) {
      return
    }
    map.removeGraphic(markers[sn])
    delete markers[sn]
    delete paths[sn]

    if (Object.keys(markers).length === 0 && trackLine) {
      map.removeGraphic(trackLine)
      trackLine = null
      trackPoints = []
    }
  }

  function addMarker (sn: string, lng?: number, lat?: number) {
    getDeviceBySn(localStorage.getItem(ELocalStorageKey.WorkspaceId)!, sn)
      .then(data => {
        if (data.code !== 0) {
          message.error(data.message)
          return
        }
        initMarker(data.data.domain, data.data.nickname, sn, lng, lat)
      })
  }

  function moveTo (sn: string, lng: number, lat: number) {
    let marker = markers[sn]
    if (!marker) {
      addMarker(sn, lng, lat)
      marker = markers[sn]
      return
    }

    marker.position = mars3d.Cesium.Cartesian3.fromDegrees(lng, lat)

    if (!paths[sn]) {
      paths[sn] = []
    }
    paths[sn].push([lng, lat, 0])
    if (paths[sn].length > 200) {
      paths[sn].shift()
    }

    const line = getTrackLineInstance()
    line.positions = paths[sn]
  }

  return {
    marker: markers,
    initMarker,
    removeMarker,
    moveTo,
  }
}
