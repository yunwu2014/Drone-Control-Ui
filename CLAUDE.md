# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is DJI's Cloud API Demo — a Vue 3 web application for drone fleet management. It communicates with DJI devices (drones, docks, remote controllers) through a backend Cloud API service using HTTP REST, WebSocket (for real-time telemetry), and MQTT (for drone remote control / DRC).

**Important**: This is a demo/reference implementation, not production-grade. Per DJI's README, the project was discontinued April 2025.

## Commands

```bash
# Dev server (port 8081, with vConsole enabled)
yarn serve

# Production build
yarn build

# Staging build
yarn build:test

# Preview production build
yarn preview

# Lint with auto-fix
yarn lint
```

## Tech Stack

- **Framework**: Vue 3 (Composition API with `<script setup>` and `defineComponent`)
- **Language**: TypeScript (strict mode)
- **Build**: Vite 2
- **State**: Vuex 4
- **Routing**: Vue Router 4 (history mode)
- **UI**: Ant Design Vue 2
- **Styling**: SCSS (variables in `src/styles/variables.scss`, auto-injected via `vite.config.ts`)
- **Map**: AMap (Gaode) via `@amap/amap-jsapi-loader`, plus Mars3D/Cesium for 3D globe
- **Real-time**: MQTT (`mqtt`), WebSocket (`reconnecting-websocket`), Agora RTM SDK for live streaming
- **Event bus**: `mitt` for cross-component events

## Path Alias

`/@/` maps to `src/`. Imports use `/@/` prefix throughout the codebase.

## Architecture

### Configuration (`src/api/http/config.ts`)

All deployment-specific settings (backend URL, WebSocket URL, API keys for AMap, RTMP, GB28181, Agora) live here. The app ID, key, and license must be obtained from DJI's developer site.

### HTTP Layer (`src/api/http/`)

- `request.ts` — single Axios instance with interceptors that attach auth token from localStorage and handle 401 redirects
- `type.ts` — generic response types (`IWorkspaceResponse`, `IListWorkspaceResponse`, `CommonListResponse`)
- `http.ts` — factory for creating Axios instances with optional common interceptors (not used directly; `request.ts` is the active instance)

### WebSocket (`src/websocket/`)

`ConnectWebSocket` class wraps `reconnecting-websocket`. It connects using the token from localStorage. The `useConnectWebSocket` hook (in `src/hooks/`) wires it to component lifecycle. Incoming messages are dispatched by `biz_code` to Vuex mutations or the event bus.

### MQTT (`src/mqtt/`)

`UranusMqtt` class wraps the `mqtt` library with auto-reconnect. Used for DRC (Drone Remote Control) low-latency communication. Managed via the `useConnectMqtt` and `use-drone-control` hooks.

### Event Bus (`src/event-bus/`)

Typed `mitt` emitter for cross-cutting events that don't belong in Vuex:
- `deviceUpgrade` — firmware upgrade progress
- `deviceLogUploadProgress` — log upload progress
- `flightTaskWs` — flight task progress, media upload
- `droneControlWs` — flight control messages (control source changes, fly-to-point progress, joystick, DRC status)
- `droneControlMqttInfo` — DRC link notifications
- `flightAreasDroneLocationWs`, `flightAreasSyncProgressWs`, `flightAreasUpdateWs` — custom flight area events

### Vuex Store (`src/store/`)

Single store with no modules. Key state:
- **Layers** — map element layers (default, share), their elements, and check/select state
- **deviceState** — OSD data keyed by serial number for gateways (RC), drones, and docks. Also tracks `currentSn` and `currentType`
- **osdVisible** — which device's OSD panel is shown
- **deviceStatusEvent** — online/offline events
- **wsEvent** — map element create/update/delete from WebSocket
- **hmsInfo** — device health management system messages per SN
- **devicesCmdExecuteInfo** — command execution status per SN
- **mqttState / clientId** — MQTT instance reference

### Routing (`src/router/`)

Two user flows gated by `EUserType` (stored in localStorage as `flag`):

| Route | Purpose |
|---|---|
| `/project` | Login page (Web user) |
| `/home` | Members, Devices, Firmwares (admin panels) |
| `/workspace` | TSA (map), Livestream, Layers, Media, Wayline, Task, Flight Area |
| `/pilot-login` | Pilot login |
| `/pilot-home`, etc. | Pilot-specific pages |

### Page Layout

`workspace.vue` is the main operational view: left sidebar (335px, dark) with functional panels, right side (flex-grow) with the map. Media and Task panels overlay the map when active.

### Map Component (`src/components/GMap.vue`)

The central component. It orchestrates:
- AMap/Mars3D map rendering
- Drawing tools (pin, polyline, polygon) for map elements
- Device OSD panels (drone telemetry, dock status)
- Drone/dock control panels
- Live stream windows (Agora, others)
- Flight area drawing and management
- Coordinate transformation between WGS84 and GCJ02

### API Modules (`src/api/`)

Each module corresponds to a feature domain: `manage.ts` (auth, devices, users, firmware, HMS, livestream), `layer.ts` (map elements), `wayline.ts` (flight routes), `media.ts`, `drc.ts`, `drone-control/drone.ts` and `payload.ts`, `device-cmd/`, `device-log/`, `device-setting/`, `device-upgrade/`, `flight-area/`, `pilot-bridge.ts`.

### Composables (`src/hooks/`, component-local `use-*.ts`)

Vue 3 composition hooks encapsulating reusable logic: WebSocket connection, AMap management, map covers/markers, mouse drawing tools, device control (MQTT + WS events), device upgrade, flight area management, etc.

### Custom Directives (`src/directives/`)

- `drag-window` — makes OSD panels and live-stream windows draggable

### Two Coordinate Systems

The codebase converts between WGS84 (device GPS) and GCJ02 (AMap's mandated coordinate system for China). Conversion functions are in `src/vendors/coordtransform.js`. Map elements stored on the backend use WGS84; the map display uses GCJ02.
