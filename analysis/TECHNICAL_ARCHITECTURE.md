# Lagos Life — Technical Architecture & Engine Reverse Engineering

## 1. High-Level Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Client Application                            │
│  Next.js 15 (App Router + Turbopack)  ·  React 19 Server Components   │
├────────────────────────────────────────────────────────────────────────┤
│                       3D Rendering Pipeline                            │
│  Three.js  ·  @react-three/fiber  ·  @react-three/drei (Custom Build)  │
├────────────────────────────────────────────────────────────────────────┤
│                         Styling & Interface                            │
│  Tailwind CSS  ·  Vanilla CSS Design Tokens  ·  Lucide Icons           │
├────────────────────────────────────────────────────────────────────────┤
│                       Audio Streaming Pipeline                         │
│  HTML5 Audio  ·  HLS / Shoutcast Streams  ·  Local MP3 Audio Engine     │
├────────────────────────────────────────────────────────────────────────┤
│                       Backend & Edge Delivery                          │
│  Cloudflare Edge CDN / Workers  ·  REST APIs  ·  Server-Sent Events    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 3D World Rendering Engine

### A. Isometric Projection & Camera Matrix
Lagos Life uses an orthographic/isometric perspective configured via React Three Fiber:
- **Camera Configuration**:
  - `orthographic: true`
  - Fixed isometric tilt angle ($45^\circ$ azimuth, $\approx 35.264^\circ$ elevation).
  - Smooth pan and zoom constraints bounded by the Lagos geographical grid (Mainland to the North/West, Lagos Lagoon in the center, Victoria Island and Lekki to the South/East).

### B. Modular 3D Asset Kit (KayKit Pipeline)
The 3D assets are sourced and adapted from the popular modular low-poly kit (**KayKit**):
- **Asset Format**: Binary glTF (`.glb`) compressed for web delivery.
- **Color Atlasing**: Instead of using individual multi-megabyte image textures per building, the models share **4 global color-map textures** (`colormap.png`):
  - `commercial/Textures/colormap.png` (11.0 KB)
  - `suburban/Textures/colormap.png` (11.7 KB)
  - `car/Textures/colormap.png` (12.3 KB)
  - `pirate/Textures/colormap.png` (10.0 KB)
- **Result**: The entire 3D city (dozens of skyscrapers, vehicles, and suburban homes) downloads in **less than 8 MB**, making the game boot in under 3 seconds even on 3G/4G connections in Lagos.

### C. Billboard Texture Swapping Engine
The billboards scattered throughout the 3D map are dynamic Three.js plane meshes:
- The base billboard structure is a 3D model with an empty billboard frame.
- The ad face is a `MeshBasicMaterial` textured dynamically with images loaded from `/api/ads/<id>/image` and `/api/sea/<id>/image`.
- Interactive click listeners (`onClick`) trigger browser redirects or internal modal previews with sponsor attribution.

---

## 3. Client State & React Architecture

### A. Modular Chunks Breakdown
The Next.js Turbopack compiler split the client code into specialized functional bundles:
- `0p91zfawmvoj4.js` / `2kstq4kblh5h-.js`: Core React 19 and Three.js runtime.
- `2ipskyn6xlm81.js`: City map manager, highway billboards, vehicle traffic simulator.
- `2h5d-2cshddbh.js`: Venue interiors, prop placements, NPC crowds, and character animation poses.
- `3gg_tw9jrbd5h.js`: Character avatar customization engine (skin tones, hairstyles, outfit layers).
- `3iluy0onkjs7j.js`: Home interior editor and 3D furniture placement engine.
- `0vks1-_0allxo.js`: UNILAG university academics, lectures, and hostel life.
- `2afas8qnowmhu.js`: Real estate, player houses, and company creation.
- `0mzw0ugrs0p8h.js`: Economy, Lapo loans, origins, and persistent game storage.
- `3jv557p5iq4mk.js`: Intercity transportation (flights to Abuja & Port Harcourt, GIG night buses).

### B. State Persistence & Network Sync
- Game state is synchronized locally using `localStorage` and `sessionStorage` with keys prefixed with `ll-`.
- Background syncing communicates with `/api/save`, while live player movement in public venues uses lightweight polling/WebSocket channels at `/api/live` and `/api/room`.
