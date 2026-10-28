# Pitlane Portfolio

A Vite + React developer portfolio with a locally rendered, interactive Formula 1 car.

## Run locally

1. Install Node.js 20 or later.
2. From this folder, run `npm install`.
3. Run `npm run dev` and open the local address printed by Vite.

Run `npm run build` to create a production build in `dist/`.

## Personalize it

- Edit the name, intro, email, and navigation in `src/App.jsx`.
- Replace the sample project cards and tags in `src/projects.js`.
- Change colors, spacing, and type styles in `src/styles.css`.

## 3D car model

The hero loads `public/f1-car-wheels-v2.glb` locally and renders it with Three.js through React Three Fiber. It drives into view once, can be replayed, and can be explored by dragging. The original GLB is preserved as `models/f1-car-original.glb`; the site uses `public/f1-car-wheels-v2.glb`, an export with four separated wheels that spin briefly and slow down on load and replay. The Blender separation script is in `scripts/separate_wheels.py`.

The model was downloaded from [CGTrader](https://www.cgtrader.com/free-3d-models/car/racing-car/mclaren-formula-f1-race-car). Review the original listing's current license and attribution requirements before publishing the portfolio or redistributing the asset. Keep the exported file at `public/f1-car-wheels-v2.glb` or update `MODEL_FILE` in `src/CarViewer.jsx` if you rename it.
