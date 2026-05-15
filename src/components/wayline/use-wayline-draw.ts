/**
 * Wayline drawing hook — manages waypoint state and Mars3D graphic rendering
 * for in-map route planning.
 */
import { reactive, ref } from 'vue'
import { WaylinePoint, WaylinePlanConfig, generateWaylineKmz } from '/@/utils/wayline-kmz-generator'
import { importKmzFile } from '/@/api/wayline'
import { ELocalStorageKey } from '/@/types/enums'
import { message } from 'ant-design-vue'
import { uuidv4 } from '/@/utils/uuid'

export interface WaylineDrawState {
  isPlanning: boolean
  waypoints: WaylinePoint[]
  selectedIndex: number
  config: WaylinePlanConfig
}

export function useWaylineDraw () {
  const mars3d = (window as any).mars3d
  const map = () => (window as any).$map

  const state = reactive<WaylineDrawState>({
    isPlanning: false,
    waypoints: [],
    selectedIndex: -1,
    config: {
      name: '',
      autoFlightSpeed: 5,
      maxFlightSpeed: 15,
      finishAction: 'goHome',
      heightMode: 'relativeToStartPoint',
      headingMode: 'followWayline',
    },
  })

  const saving = ref(false)

  // Graphics references for cleanup
  let waypointGraphics: any[] = []
  let polylineGraphic: any = null
  let clickHandler: any = null

  /**
   * Start planning mode — listen for map clicks to add waypoints
   */
  function startPlanning () {
    state.isPlanning = true
    state.waypoints = []
    state.selectedIndex = -1
    state.config.name = `Wayline-${new Date().toLocaleString()}`

    clearGraphics()

    // Register click handler on Mars3D map
    const mapInstance = map()
    if (!mapInstance) {
      message.error('地图未初始化')
      return
    }

    clickHandler = (event: any) => {
      if (!state.isPlanning) return
      const cartesian = event.cartesian
      if (!cartesian) return

      const cartographic = mars3d.Cesium.Cartographic.fromCartesian(cartesian)
      const lng = mars3d.Cesium.Math.toDegrees(cartographic.longitude)
      const lat = mars3d.Cesium.Math.toDegrees(cartographic.latitude)

      const point: WaylinePoint = {
        lng: parseFloat(lng.toFixed(7)),
        lat: parseFloat(lat.toFixed(7)),
        height: 50, // default altitude 50m
      }

      state.waypoints.push(point)
      state.selectedIndex = state.waypoints.length - 1

      renderWaypoints()
    }

    mapInstance.on(mars3d.EventType.click, clickHandler)
  }

  /**
   * Stop planning mode — remove click handler but keep graphics
   */
  function stopPlanning () {
    state.isPlanning = false
    const mapInstance = map()
    if (mapInstance && clickHandler) {
      mapInstance.off(mars3d.EventType.click, clickHandler)
      clickHandler = null
    }
  }

  /**
   * Cancel planning — clear everything
   */
  function cancelPlanning () {
    stopPlanning()
    state.waypoints = []
    state.selectedIndex = -1
    clearGraphics()
  }

  /**
   * Remove last waypoint (undo)
   */
  function removeLastWaypoint () {
    if (state.waypoints.length > 0) {
      state.waypoints.pop()
      state.selectedIndex = Math.max(0, state.waypoints.length - 1)
      renderWaypoints()
    }
  }

  /**
   * Remove waypoint by index
   */
  function removeWaypoint (index: number) {
    state.waypoints.splice(index, 1)
    if (state.selectedIndex >= state.waypoints.length) {
      state.selectedIndex = state.waypoints.length - 1
    }
    renderWaypoints()
  }

  /**
   * Update waypoint properties
   */
  function updateWaypoint (index: number, updates: Partial<WaylinePoint>) {
    if (index >= 0 && index < state.waypoints.length) {
      Object.assign(state.waypoints[index], updates)
      renderWaypoints()
    }
  }

  /**
   * Save the planned wayline — generate KMZ and upload to backend
   */
  async function saveWayline (): Promise<boolean> {
    if (state.waypoints.length < 2) {
      message.warning('至少需要2个航点才能保存航线')
      return false
    }

    if (!state.config.name.trim()) {
      message.warning('请输入航线名称')
      return false
    }

    saving.value = true
    try {
      const blob = await generateWaylineKmz(state.waypoints, state.config)
      const fileName = `${state.config.name}.kmz`
      const file = new File([blob], fileName, { type: 'application/zip' })

      const formData = new FormData()
      formData.append('file', file, fileName)

      const workspaceId = localStorage.getItem(ELocalStorageKey.WorkspaceId) || ''
      const res = await importKmzFile(workspaceId, formData)

      if (res.code === 0) {
        message.success('航线保存成功')
        cancelPlanning()
        return true
      } else {
        message.error('航线保存失败: ' + (res.message || '未知错误'))
        return false
      }
    } catch (err: any) {
      message.error('航线生成失败: ' + (err.message || err))
      return false
    } finally {
      saving.value = false
    }
  }

  // ─── Rendering ──────────────────────────────────────────────────────────

  function clearGraphics () {
    const mapInstance = map()
    if (!mapInstance) return

    waypointGraphics.forEach(g => {
      try { mapInstance.removeGraphic(g) } catch {}
    })
    waypointGraphics = []

    if (polylineGraphic) {
      try { mapInstance.removeGraphic(polylineGraphic) } catch {}
      polylineGraphic = null
    }
  }

  function renderWaypoints () {
    clearGraphics()
    const mapInstance = map()
    if (!mapInstance || !mars3d) return

    // Draw polyline connecting waypoints
    if (state.waypoints.length >= 2) {
      const positions = state.waypoints.map(p => [p.lng, p.lat, p.height || 50])
      polylineGraphic = new mars3d.graphic.PolylineEntity({
        positions,
        style: {
          color: '#00FF88',
          width: 3,
          opacity: 0.9,
          clampToGround: false,
        },
      })
      mapInstance.addGraphic(polylineGraphic)
    }

    // Draw waypoint markers
    state.waypoints.forEach((p, i) => {
      const isSelected = i === state.selectedIndex
      const graphic = new mars3d.graphic.DivGraphic({
        position: [p.lng, p.lat, p.height || 50],
        style: {
          html: `<div style="
            width: 24px; height: 24px; border-radius: 50%;
            background: ${isSelected ? '#FF6600' : '#00AAFF'};
            border: 2px solid #fff;
            color: #fff; font-size: 11px; font-weight: bold;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          ">${i + 1}</div>`,
          anchor: [12, 12],
        },
      })
      mapInstance.addGraphic(graphic)
      waypointGraphics.push(graphic)
    })
  }

  return {
    state,
    saving,
    startPlanning,
    stopPlanning,
    cancelPlanning,
    removeLastWaypoint,
    removeWaypoint,
    updateWaypoint,
    saveWayline,
    renderWaypoints,
  }
}
