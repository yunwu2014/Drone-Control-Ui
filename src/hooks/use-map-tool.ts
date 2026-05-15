import { GeojsonCoordinate } from '../utils/genjson'
import { getRoot } from '/@/root'

export function useMapTool () {
  const root = getRoot()
  const mars3d = (window as any).mars3d
  const map = (window as any).$map || root.$map

  function panTo (coordinate: GeojsonCoordinate) {
    map.flyToPoint({
      lat: coordinate[1],
      lng: coordinate[0],
      height: coordinate[2] || 800,
    }, {
      duration: 1.5,
    })
  }

  return {
    panTo,
  }
}
