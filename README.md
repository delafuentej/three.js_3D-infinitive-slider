# 🎢 3D Infinite Slider with Overlay-Shaders

A WebGL project built with **Three.js**, **GSAP**, and custom **GLSL shaders**, featuring:

- An **infinite 3D image slider**
- A **shader-based overlay transition**
- A **loading bar with progress tracking**
- **OrbitControls** for smooth camera interaction
- HDRI **environment lighting**
- Custom **image textures** dynamically arranged in 3D space

 - This project is inspired by Victor Costa’s course on creative WebGL/Three.js experiences.
- I adapted and extended the concepts to build a custom 3D Infinite Slider with Overlay-Shaders & Dinamic Image Generation.

---

images = fuente pixalbay.com y canva.com

## 🚀 Features

- **Infinite Slider**:  
  Smooth forward/backward navigation using GSAP animations.

- **Custom Overlay with Shaders**:  
  Transition effect on startup with GLSL vertex & fragment shaders.

- **Loading Manager & Progress Bar**:  
  Displays asset loading progress and removes overlay once complete.

- **Responsive Renderer**:  
  Automatically adjusts to window resize and device pixel ratio.

- **HDR Environment**:  
  Realistic reflections and background using HDRI maps.

---

## 🛠️ Tech Stack

- [Three.js](https://threejs.org/) — 3D rendering
- [GSAP](https://greensock.com/gsap/) — animations
- [Vite](https://vitejs.dev/) — lightning-fast dev server & bundler
- [vite-plugin-glsl](https://www.npmjs.com/package/vite-plugin-glsl) — GLSL shader imports
- [OrbitControls](https://threejs.org/docs/#examples/en/controls/OrbitControls) — camera interaction
- [RGBELoader](https://threejs.org/docs/#examples/en/loaders/RGBELoader) — HDRI environments
- GLSL Shaders — custom vertex & fragment for overlay effects

---
## 🚀 Getting Started

Follow these steps to set up the project locally:

1️⃣ Clone the repository

```
git clone https://github.com/delafuentej/r3f_wizard-game.git

cd r3f_wizard-game
```

2️⃣ Install dependencies

```
npm install
yarn install
```

3️⃣ Start the development server

```
npm run server
yarn dev
```
