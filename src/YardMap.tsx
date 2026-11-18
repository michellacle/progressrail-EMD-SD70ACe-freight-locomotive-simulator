import { Minus, Navigation, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  DEMO_SPEED_CAP_MPH,
  MAP_HEIGHT,
  MAP_WIDTH,
  STOP_MARKER_PROGRESS,
  getRoutePathPoints,
  getRoutePose,
  routePoints,
  type RouteState,
} from './routeSimulation'
import { getPinchZoomIndex } from './mapInteraction'

type YardMapProps = {
  route: RouteState
}

const mapSize = 360
const zoomLevels = [0.32, 0.42, 0.52, 0.64]
const routeString = routePoints.map(({ x, y }) => `${x},${y}`).join(' ')
const treePositions = [
  [128, 222], [160, 260], [135, 308], [170, 353], [130, 420], [170, 470],
  [240, 520], [270, 580], [320, 635], [555, 190], [600, 205], [840, 220],
  [900, 260], [925, 300], [930, 545], [885, 585], [800, 620], [690, 625],
  [580, 640], [245, 650], [205, 610], [160, 545], [120, 500], [113, 370],
]

function pointsToString(points: { x: number; y: number }[]) {
  return points.map(({ x, y }) => `${x},${y}`).join(' ')
}

function YardMap({ route }: YardMapProps) {
  const [zoomIndex, setZoomIndex] = useState(0)
  const mapFrameRef = useRef<HTMLDivElement>(null)
  const pinchStart = useRef<{ distance: number; zoomIndex: number } | null>(null)
  const zoom = zoomLevels[zoomIndex]
  const pose = getRoutePose(route.progress)
  const traveledPath = getRoutePathPoints(route.progress)
  const stop = getRoutePose(STOP_MARKER_PROGRESS)

  useEffect(() => {
    const mapFrame = mapFrameRef.current
    if (!mapFrame) return

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 2) return
      const first = event.touches[0]
      const second = event.touches[1]
      pinchStart.current = {
        distance: Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY),
        zoomIndex,
      }
    }

    const handleTouchMove = (event: TouchEvent) => {
      const start = pinchStart.current
      if (!start || event.touches.length !== 2) return
      event.preventDefault()
      const first = event.touches[0]
      const second = event.touches[1]
      const distance = Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY)
      setZoomIndex(getPinchZoomIndex(start.zoomIndex, start.distance, distance, zoomLevels.length))
    }

    const handleTouchEnd = (event: TouchEvent) => {
      if (event.touches.length < 2) pinchStart.current = null
    }

    mapFrame.addEventListener('touchstart', handleTouchStart, { passive: true })
    mapFrame.addEventListener('touchmove', handleTouchMove, { passive: false })
    mapFrame.addEventListener('touchend', handleTouchEnd)
    mapFrame.addEventListener('touchcancel', handleTouchEnd)

    return () => {
      mapFrame.removeEventListener('touchstart', handleTouchStart)
      mapFrame.removeEventListener('touchmove', handleTouchMove)
      mapFrame.removeEventListener('touchend', handleTouchEnd)
      mapFrame.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [zoomIndex])

  return (
    <section className="yard-map-panel" aria-label="Muncie factory and test track map">
      <div className="yard-map-header">
        <div>
          <p className="eyebrow">YARD OVERVIEW</p>
          <h3>Muncie, Indiana</h3>
        </div>
        <div className="map-camera-state"><span className="map-lock-dot" /> FOLLOW</div>
      </div>

      <div className="yard-map-frame" ref={mapFrameRef}>
        <svg className="yard-map-svg" viewBox={`0 0 ${mapSize} ${mapSize}`} role="img" aria-label={`North-up schematic map. Train at ${(route.progress * 100).toFixed(0)} percent of route, heading ${pose.headingDegrees.toFixed(0)} degrees, speed ${route.speedMph.toFixed(1)} simulated miles per hour.`}>
          <defs>
            <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0H0V40" fill="none" stroke="#56564d" strokeWidth="1" opacity=".32" />
            </pattern>
            <pattern id="yard-gravel" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="3" r=".8" fill="#77756c" opacity=".55" />
              <circle cx="9" cy="8" r=".7" fill="#77756c" opacity=".4" />
            </pattern>
          </defs>

          <rect width={mapSize} height={mapSize} fill="#34352f" />
          <rect width={mapSize} height={mapSize} fill="url(#map-grid)" />

          <g transform={`translate(${mapSize / 2} ${mapSize / 2}) scale(${zoom}) translate(${-pose.x} ${-pose.y})`}>
            <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="#383a32" />
            <path d="M40 150c125-86 225-35 325-88 118-63 203-31 317 26s199 47 282-7v630c-123 33-225-23-339 17-120 41-210 14-333-27S91 674 40 710z" fill="#46483a" opacity=".72" />
            <path d="M72 183c110-72 197-31 294-77 108-51 191-22 293 27 99 47 165 44 260 0M64 242c114-65 198-26 301-66 105-41 180-15 283 29 94 41 181 34 264-3M85 613c104-49 199-7 290 25 105 36 198 47 292 15 105-36 154-13 228 15" fill="none" stroke="#696955" strokeWidth="3" opacity=".36" />

            <path d="M90 385 206 365 328 348 432 350 540 370 650 365 770 350 905 340" fill="none" stroke="#9b988d" strokeWidth="18" opacity=".55" />
            <path d="M90 385 206 365 328 348 432 350 540 370 650 365 770 350 905 340" fill="none" stroke="#d0ccc0" strokeWidth="8" />
            <path d="M112 222 208 272 286 300M580 200 620 248 655 285M220 650 305 605 355 570" fill="none" stroke="#85847c" strokeWidth="7" />
            <path d="M112 222 208 272 286 300M580 200 620 248 655 285M220 650 305 605 355 570" fill="none" stroke="#c2bfb5" strokeWidth="2" />

            <path d="M185 178h420v292H185z" fill="#252624" stroke="#c4c0b5" strokeWidth="8" />
            <path d="M200 193h390v262H200z" fill="#77766e" stroke="#464640" strokeWidth="3" />
            <path d="M205 198h380v252H205z" fill="url(#yard-gravel)" opacity=".7" />
            <path d="M205 408h380" stroke="#4f5049" strokeWidth="8" />
            <path d="M380 438v32m98-32v32" stroke="#d5a900" strokeWidth="5" />
            <path d="M380 438v32m98-32v32" stroke="#ffcd11" strokeWidth="2" />
            <path d="M230 240h110v78H230zM460 240h100v78H460z" fill="#696961" stroke="#aaa69a" strokeWidth="3" />
            <path d="M244 253h82m-82 14h82m-82 14h82m-82 14h82M472 253h74m-74 14h74m-74 14h74m-74 14h74" stroke="#85847a" strokeWidth="2" />
            <text x="282" y="350" fill="#eeeae0" fontFamily="monospace" fontSize="16" letterSpacing="2">LOCOMOTIVE</text>
            <text x="348" y="377" fill="#c9c4b8" fontFamily="monospace" fontSize="12" letterSpacing="2">ASSEMBLY</text>

            <path d="M365 438v84l58 46h88v-32h-78l-36-30v-68z" fill="none" stroke="#a8a59a" strokeWidth="12" />
            <path d="M365 438v84l58 46h88v-32h-78l-36-30v-68z" fill="none" stroke="#46453f" strokeWidth="4" />
            <path d="M372 462h230m-218 22h218m-211 22h218" stroke="#64625a" strokeWidth="4" />
            <rect x="426" y="505" width="125" height="32" rx="2" fill="#5b5a52" stroke="#a5a196" strokeWidth="2" />
            <text x="447" y="526" fill="#f0c51c" fontFamily="monospace" fontSize="12" letterSpacing="1">YARD</text>

            <path d="M760 300a130 120 0 1 1 0 240 130 120 0 1 1 0-240z" fill="url(#yard-gravel)" stroke="#706e64" strokeWidth="22" />
            <path d="M760 300a130 120 0 1 1 0 240 130 120 0 1 1 0-240z" fill="none" stroke="#252523" strokeWidth="15" />
            <path d="M760 300a130 120 0 1 1 0 240 130 120 0 1 1 0-240z" fill="none" stroke="#dad6ca" strokeWidth="5" />
            <path d="M760 323a105 97 0 1 1 0 194 105 97 0 1 1 0-194z" fill="none" stroke="#8a887d" strokeWidth="4" strokeDasharray="8 7" />
            <text x="728" y="416" fill="#f1ede2" fontFamily="monospace" fontSize="15" letterSpacing="2">TEST LOOP</text>
            <text x="743" y="438" fill="#bdb9ac" fontFamily="monospace" fontSize="10" letterSpacing="1">1 CIRCUIT</text>

            <path d={`M${routeString}`} fill="none" stroke="#161715" strokeWidth="17" strokeLinejoin="round" strokeLinecap="round" />
            <path d={`M${routeString}`} fill="none" stroke="#d7d3c8" strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" />
            <polyline points={pointsToString(traveledPath)} fill="none" stroke="#ffcd11" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" />

            <g transform={`translate(${stop.x} ${stop.y})`}>
              <circle r="15" fill="#1f1f1d" stroke="#ffcd11" strokeWidth="4" />
              <path d="M-5-7 7 0-5 7z" fill="#ffcd11" />
            </g>
            <text x={stop.x + 19} y={stop.y + 4} fill="#ffdc51" fontFamily="monospace" fontSize="12" letterSpacing="1">STOP</text>

            {treePositions.map(([x, y], index) => (
              <path key={`${x}-${y}`} d={`M${x} ${y - 10}l-9 17h18z`} fill={index % 2 ? '#6d7754' : '#59684b'} stroke="#343b2f" strokeWidth="2" />
            ))}

            <text x="125" y="285" fill="#d5d1c5" fontFamily="monospace" fontSize="11">MUNCIE, IN</text>
            <text x="104" y="303" fill="#aaa69a" fontFamily="monospace" fontSize="8">SCHEMATIC SITE</text>
          </g>

          <g className="map-train-marker" transform={`translate(${mapSize / 2} ${mapSize / 2}) rotate(${pose.headingDegrees + 90})`}>
            <path d="M0-15 7 2 0-1-7 2z" fill="#1c1c1a" stroke="#ffcd11" strokeWidth="2" />
            <rect x="-5" y="-2" width="10" height="18" rx="2" fill="#ffcd11" stroke="#1c1c1a" strokeWidth="2" />
            <path d="M-3 3h6m-6 5h6" stroke="#262623" strokeWidth="2" />
          </g>

          <g className="map-north-indicator" transform="translate(326 24)">
            <path d="M0 13 7 0l7 13-7-4z" fill="#ffcd11" />
            <text x="7" y="25" textAnchor="middle" fill="#f2eee3" fontFamily="monospace" fontSize="8">N</text>
          </g>
        </svg>

        <div className="map-zoom-controls" aria-label="Map zoom controls">
          <button type="button" onClick={() => setZoomIndex((index) => Math.min(zoomLevels.length - 1, index + 1))} disabled={zoomIndex === zoomLevels.length - 1} aria-label="Zoom in" title="Zoom in"><Plus size={15} /></button>
          <span>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoomIndex((index) => Math.max(0, index - 1))} disabled={zoomIndex === 0} aria-label="Zoom out" title="Zoom out"><Minus size={15} /></button>
        </div>
        <div className="map-follow-indicator"><Navigation size={12} /> TRAIN CENTERED</div>
      </div>

      <div className="map-hud">
        <div className="map-speed-readout"><span>SIM SPEED</span><strong>{route.speedMph.toFixed(1)} <small>MPH</small></strong></div>
        <div className="map-cap-readout"><span>DEMO CAP</span><strong>{DEMO_SPEED_CAP_MPH} MPH</strong></div>
        <div className="map-route-readout"><span>ROUTE</span><strong>{Math.min(100, Math.round(route.progress * 100))}% <small>· LAP {route.completedLaps + 1}</small></strong></div>
      </div>

      <div className="map-legend" aria-label="Map legend">
        <span><i className="legend-line traveled" />Traveled</span>
        <span><i className="legend-line upcoming" />Track</span>
        <span><i className="legend-stop" />Stop point</span>
      </div>
      <p className="map-footnote">Schematic Muncie site layout; not surveyed or to scale.</p>
      {route.missedStops > 0 && <p className="map-missed-stop" role="status">Stop marker passed {route.missedStops}×. Continue safely around the loop.</p>}
    </section>
  )
}

export default YardMap