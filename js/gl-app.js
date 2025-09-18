import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import gsap from "gsap";

import overlayVertexShader from "/shaders/overlay/vertex.glsl";
import overlayFragmentShader from "/shaders/overlay/fragment.glsl";

//import { createCursorTrail } from "./cursor-trail";

import Models from "./Models";

export default class GLApp {
  constructor() {
    window.app = this;

    // -------------------------
    // Renderer
    // -------------------------
    this.canvas = document.querySelector("canvas#sketch");
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.toneMapping = THREE.CineonToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // -------------------------
    // Scene & Camera
    // -------------------------
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.z = 6;

    // -------------------------
    // Overlay
    // -------------------------
    this.overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1);
    this.overlayMaterial = new THREE.ShaderMaterial({
      transparent: true,
      vertexShader: overlayVertexShader,
      fragmentShader: overlayFragmentShader,
      uniforms: {
        uAlpha: new THREE.Uniform(1),
      },
    });
    this.overlay = new THREE.Mesh(this.overlayGeometry, this.overlayMaterial);
    this.scene.add(this.overlay);

    // -------------------------
    // Loading Bar + Manager
    // -------------------------
    this.loadingBar = document.querySelector(".loading-bar");
    this.sceneReady = false;
    this.loadingManager = new THREE.LoadingManager(
      () => {
        // onLoad
        window.setTimeout(() => {
          gsap.to(this.overlayMaterial.uniforms.uAlpha, {
            duration: 2,
            value: 0,
            delay: 0.5,
            ease: "power2.out",
            onComplete: () => {
              this.scene.remove(this.overlay);
              this.controls.enabled = true;
              document
                .querySelectorAll(".prev, .next")
                .forEach((btn) => (btn.style.display = "block"));
            },
          });
          this.loadingBar.classList.add("loaded");
        }, 500);

        window.setTimeout(() => {
          this.sceneReady = true;
        }, 2000);
      },
      (itemUrl, itemsLoaded, itemsTotal) => {
        // onProgress
        const progressRatio = itemsLoaded / itemsTotal;
        this.loadingBar.style.transform = `scaleX(${progressRatio})`;
      }
    );

    // -------------------------
    // OrbitControls
    // -------------------------
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.enabled = false;
    document
      .querySelectorAll(".prev, .next")
      .forEach((btn) => (btn.style.display = "none"));

    // -------------------------
    // HDR Environment
    // -------------------------
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();

    const hdrPath = "/environmentMap/NightSkyHDRI004_8K-HDR.hdr";
    const hdrLoader = new RGBELoader(this.loadingManager);
    hdrLoader.load(hdrPath, (environmentMap) => {
      environmentMap.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.background = environmentMap;
      this.scene.environment = environmentMap;
      this.checkIfReady();
    });

    // -------------------------
    // Resize
    // -------------------------
    let that = this;
    window.addEventListener("resize", () => {
      that.camera.aspect = window.innerWidth / window.innerHeight;
      that.camera.updateProjectionMatrix();
      that.renderer.setSize(window.innerWidth, window.innerHeight);
      that.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // -------------------------
    // Models
    // -------------------------
    this.models = new Models(this);

    // -------------------------
    // Loop
    // -------------------------
    this.clock = new THREE.Clock();
    const animate = () => {
      const elapsed = this.clock.getElapsedTime();
      const delta = this.clock.getDelta();

      // Animación de modelos
      if (this.models.is_ready) {
        this.models.meshes.forEach((mesh, i) => {
          mesh.position.y += Math.sin(elapsed + i) * 0.001;
          mesh.rotation.x = Math.sin(elapsed + i) * 0.1;
          mesh.rotation.y = Math.cos(elapsed + i) * 0.1;
        });
        this.models.update();
      }

      this.renderer.render(this.scene, this.camera);
      this.controls.update();
      requestAnimationFrame(animate);
    };
    animate();
  }

  checkIfReady() {
    if (this.models?.is_ready && this.scene.environment) {
      gsap.to(this.overlayMaterial.uniforms.uAlpha, {
        value: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          this.scene.remove(this.overlay);
        },
      });
    }
  }
}
