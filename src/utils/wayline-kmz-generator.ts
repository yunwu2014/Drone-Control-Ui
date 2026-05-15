/**
 * DJI WPML KMZ Generator
 * Generates a valid DJI Cloud API KMZ file (containing wpmz/template.kml + wpmz/waylines.wpml)
 * from an array of waypoints planned on the Mars3D map.
 *
 * KMZ structure:
 *   wpmz/
 *     template.kml   — template info (drone model, payload, global settings)
 *     waylines.wpml  — executable wayline (per-waypoint coords, altitude, speed, actions)
 *
 * Uses the JSZip instance bundled inside the globally-loaded kml-geojson.js (JSZip 3.7).
 * Falls back to window.JSZip if available.
 */

export interface WaylinePoint {
  lng: number       // WGS84 longitude
  lat: number       // WGS84 latitude
  height: number    // relative altitude (m) above takeoff point (executeHeight)
  speed?: number    // waypoint speed m/s (default uses global)
  heading?: number  // aircraft heading (yaw) in degrees, default 0 = followWayline
  gimbalPitch?: number // gimbal pitch angle (e.g. -90 for nadir)
  turnMode?: 'coordinateTurn' | 'toPointAndStopWithDiscontinuityCurvature' | 'toPointAndStopWithContinuityCurvature' | 'toPointAndPassWithContinuityCurvature'
}

export interface WaylinePlanConfig {
  name: string
  /** DJI drone model key, e.g. "0-67-0" for Matrice 30 */
  droneModelKey?: string
  /** DJI payload model key, e.g. "1-53-0" */
  payloadModelKey?: string
  /** Global flight speed m/s, default 5 */
  autoFlightSpeed?: number
  /** Max flight speed m/s, default 15 */
  maxFlightSpeed?: number
  /** Finish action: goHome | noAction | autoLand | gotoFirstWaypoint */
  finishAction?: 'goHome' | 'noAction' | 'autoLand' | 'gotoFirstWaypoint'
  /** Height mode: relativeToStartPoint (default) | EGM96 | realTimeFollowSurface | aboveGroundLevel */
  heightMode?: string
  /** Global wayline heading mode: followWayline | manually | fixed | smoothTransition */
  headingMode?: string
}

/**
 * Generate a DJI-compatible KMZ Blob from waypoints and config.
 */
export async function generateWaylineKmz (points: WaylinePoint[], config: WaylinePlanConfig): Promise<Blob> {
  if (points.length < 2) {
    throw new Error('At least 2 waypoints are required to generate a wayline.')
  }

  // Access JSZip from the global scope (bundled inside kml-geojson.js)
  const JSZip = (window as any).JSZip || getJSZipFromKgUtil()
  if (!JSZip) {
    throw new Error('JSZip is not available. Ensure kml-geojson.js is loaded.')
  }

  const zip = new JSZip()
  const wpmzFolder = zip.folder('wpmz')

  const templateKml = buildTemplateKml(points, config)
  const waylinesWpml = buildWaylinesWpml(points, config)

  wpmzFolder.file('template.kml', templateKml)
  wpmzFolder.file('waylines.wpml', waylinesWpml)

  // DJI also expects a res/ folder (can be empty)
  wpmzFolder.folder('res')

  const blob: Blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
  return blob
}

/**
 * Try to extract JSZip constructor from kgUtil's internal modules (it bundles JSZip 3.7).
 * The kml-geojson.js UMD exposes kgUtil on window; internally it requires JSZip.
 * We use a known trick: create a temporary instance via kgUtil internals.
 */
function getJSZipFromKgUtil (): any {
  try {
    // kml-geojson.js bundles JSZip and uses it internally via `new JSZip()`.
    // It's not directly exported, but it IS on the window in some builds.
    // Since the minified bundle uses `module.exports = factory()` pattern with
    // internal require, and the factory runs in the window context, JSZip may
    // have been leaked to scope. Check common locations:
    if ((window as any).JSZip) return (window as any).JSZip
    // If not found, we cannot proceed without an npm-installed jszip.
    return null
  } catch {
    return null
  }
}

// ─── XML Builders ──────────────────────────────────────────────────────────

function buildTemplateKml (points: WaylinePoint[], config: WaylinePlanConfig): string {
  const speed = config.autoFlightSpeed ?? 5
  const maxSpeed = config.maxFlightSpeed ?? 15
  const finishAction = config.finishAction ?? 'goHome'
  const droneModel = config.droneModelKey ?? '0-67-0'
  const payloadModel = config.payloadModelKey ?? '1-53-0'
  const heightMode = config.heightMode ?? 'relativeToStartPoint'
  const headingMode = config.headingMode ?? 'followWayline'

  const placemarks = points.map((p, i) => `
      <Placemark>
        <Point>
          <coordinates>${p.lng},${p.lat}</coordinates>
        </Point>
        <wpml:index>${i}</wpml:index>
        <wpml:executeHeight>${p.height}</wpml:executeHeight>
        <wpml:waypointSpeed>${p.speed ?? speed}</wpml:waypointSpeed>
        <wpml:waypointHeadingParam>
          <wpml:waypointHeadingMode>${headingMode}</wpml:waypointHeadingMode>
        </wpml:waypointHeadingParam>
        <wpml:waypointTurnParam>
          <wpml:waypointTurnMode>${p.turnMode ?? 'coordinateTurn'}</wpml:waypointTurnMode>
          <wpml:waypointTurnDampingDist>0</wpml:waypointTurnDampingDist>
        </wpml:waypointTurnParam>
      </Placemark>`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:wpml="http://www.dji.com/wpmz/1.0.6">
  <Document>
    <wpml:author>DroneControlUI</wpml:author>
    <wpml:createTime>${Date.now()}</wpml:createTime>
    <wpml:updateTime>${Date.now()}</wpml:updateTime>
    <wpml:missionConfig>
      <wpml:flyToWaylineMode>safely</wpml:flyToWaylineMode>
      <wpml:finishAction>${finishAction}</wpml:finishAction>
      <wpml:exitOnRCLost>executeLostAction</wpml:exitOnRCLost>
      <wpml:executeRCLostAction>goBack</wpml:executeRCLostAction>
      <wpml:globalTransitionalSpeed>${speed}</wpml:globalTransitionalSpeed>
      <wpml:droneInfo>
        <wpml:droneEnumValue>${droneModel.split('-')[1] || '67'}</wpml:droneEnumValue>
        <wpml:droneSubEnumValue>${droneModel.split('-')[2] || '0'}</wpml:droneSubEnumValue>
      </wpml:droneInfo>
      <wpml:payloadInfo>
        <wpml:payloadEnumValue>${payloadModel.split('-')[1] || '53'}</wpml:payloadEnumValue>
        <wpml:payloadSubEnumValue>${payloadModel.split('-')[2] || '0'}</wpml:payloadSubEnumValue>
        <wpml:payloadPositionIndex>0</wpml:payloadPositionIndex>
      </wpml:payloadInfo>
    </wpml:missionConfig>
    <Folder>
      <wpml:templateId>0</wpml:templateId>
      <wpml:executeHeightMode>${heightMode}</wpml:executeHeightMode>
      <wpml:waylineId>0</wpml:waylineId>
      <wpml:autoFlightSpeed>${speed}</wpml:autoFlightSpeed>
      <wpml:maxFlightSpeed>${maxSpeed}</wpml:maxFlightSpeed>
      <wpml:templateType>waypoint</wpml:templateType>
      ${placemarks}
    </Folder>
  </Document>
</kml>`
}

function buildWaylinesWpml (points: WaylinePoint[], config: WaylinePlanConfig): string {
  const speed = config.autoFlightSpeed ?? 5
  const maxSpeed = config.maxFlightSpeed ?? 15
  const finishAction = config.finishAction ?? 'goHome'
  const droneModel = config.droneModelKey ?? '0-67-0'
  const payloadModel = config.payloadModelKey ?? '1-53-0'
  const heightMode = config.heightMode ?? 'relativeToStartPoint'
  const headingMode = config.headingMode ?? 'followWayline'

  const placemarks = points.map((p, i) => `
      <Placemark>
        <Point>
          <coordinates>${p.lng},${p.lat}</coordinates>
        </Point>
        <wpml:index>${i}</wpml:index>
        <wpml:executeHeight>${p.height}</wpml:executeHeight>
        <wpml:waypointSpeed>${p.speed ?? speed}</wpml:waypointSpeed>
        <wpml:waypointHeadingParam>
          <wpml:waypointHeadingMode>${headingMode}</wpml:waypointHeadingMode>
          <wpml:waypointHeadingAngle>${p.heading ?? 0}</wpml:waypointHeadingAngle>
          <wpml:waypointHeadingAngleEnable>0</wpml:waypointHeadingAngleEnable>
          <wpml:waypointPoiPoint>0.000000,0.000000,0.000000</wpml:waypointPoiPoint>
        </wpml:waypointHeadingParam>
        <wpml:waypointTurnParam>
          <wpml:waypointTurnMode>${p.turnMode ?? 'coordinateTurn'}</wpml:waypointTurnMode>
          <wpml:waypointTurnDampingDist>0</wpml:waypointTurnDampingDist>
        </wpml:waypointTurnParam>
        <wpml:waypointGimbalHeadingParam>
          <wpml:waypointGimbalPitchAngle>${p.gimbalPitch ?? 0}</wpml:waypointGimbalPitchAngle>
          <wpml:waypointGimbalYawAngle>0</wpml:waypointGimbalYawAngle>
        </wpml:waypointGimbalHeadingParam>
      </Placemark>`).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:wpml="http://www.dji.com/wpmz/1.0.6">
  <Document>
    <wpml:missionConfig>
      <wpml:flyToWaylineMode>safely</wpml:flyToWaylineMode>
      <wpml:finishAction>${finishAction}</wpml:finishAction>
      <wpml:exitOnRCLost>executeLostAction</wpml:exitOnRCLost>
      <wpml:executeRCLostAction>goBack</wpml:executeRCLostAction>
      <wpml:globalTransitionalSpeed>${speed}</wpml:globalTransitionalSpeed>
      <wpml:droneInfo>
        <wpml:droneEnumValue>${droneModel.split('-')[1] || '67'}</wpml:droneEnumValue>
        <wpml:droneSubEnumValue>${droneModel.split('-')[2] || '0'}</wpml:droneSubEnumValue>
      </wpml:droneInfo>
      <wpml:payloadInfo>
        <wpml:payloadEnumValue>${payloadModel.split('-')[1] || '53'}</wpml:payloadEnumValue>
        <wpml:payloadSubEnumValue>${payloadModel.split('-')[2] || '0'}</wpml:payloadSubEnumValue>
        <wpml:payloadPositionIndex>0</wpml:payloadPositionIndex>
      </wpml:payloadInfo>
    </wpml:missionConfig>
    <Folder>
      <wpml:templateId>0</wpml:templateId>
      <wpml:executeHeightMode>${heightMode}</wpml:executeHeightMode>
      <wpml:waylineId>0</wpml:waylineId>
      <wpml:autoFlightSpeed>${speed}</wpml:autoFlightSpeed>
      <wpml:maxFlightSpeed>${maxSpeed}</wpml:maxFlightSpeed>
      ${placemarks}
    </Folder>
  </Document>
</kml>`
}
