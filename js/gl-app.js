import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";
import overlayVertexShader from "/shaders/overlay/vertex.glsl";
import overlayFragmentShader from "/shaders/overlay/fragment.glsl";
import gsap from "gsap";

import Models from "./Models";

export default class GLApp {
  constructor() {
    window.app = this;

    /*----------------------------------------------*/
    //   Renderer                                   */
    /*----------------------------------------------*/
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
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    /*----------------------------------------------*/
    //   Scene & Camera                             */
    /*----------------------------------------------*/
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.z = 6;

    /*----------------------------------------------*/
    //       Overlay (pantalla de carga)             */
    /*----------------------------------------------*/
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

    /*----------------------------------------------*/
    //   Loading Bar + Manager                      */
    /*----------------------------------------------*/
    this.loadingBar = document.querySelector(".loading-bar");
    this.sceneReady = false;

    this.loadingManager = new THREE.LoadingManager(
      // onLoad
      () => {
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
      // onProgress
      (itemUrl, itemsLoaded, itemsTotal) => {
        console.log(itemUrl, itemsLoaded, itemsTotal);
        const progressRatio = itemsLoaded / itemsTotal;
        this.loadingBar.style.transform = `scaleX(${progressRatio})`;
      }
    );
    /*----------------------------------------------*/
    //   OrbitControl                              */
    /*----------------------------------------------*/
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.enabled = false; //

    document
      .querySelectorAll(".prev, .next")
      .forEach((btn) => (btn.style.display = "none"));
    /*----------------------------------------------*/
    //   Load EXR                                   */
    /*----------------------------------------------*/
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();

    const exrLoader = new EXRLoader(this.loadingManager);

    exrLoader.load(
      "/environmentMap/NightSkyHDRI004_8K-HDR.exr",
      (environmentMap) => {
        environmentMap.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.background = environmentMap;
        this.scene.environment = environmentMap;

        this.checkIfReady();
      }
    );

    /*----------------------------------------------*/
    //   Resize                                     */
    /*----------------------------------------------*/
    function onResize() {
      that.camera.aspect = window.innerWidth / window.innerHeight;
      that.camera.updateProjectionMatrix();

      that.pixelRatio = Math.min(window.devicePixelRatio, 2);
      that.renderer.setSize(window.innerWidth, window.innerHeight);
      that.renderer.setPixelRatio(that.pixelRatio);
    }
    window.addEventListener("resize", onResize, false);

    /*----------------------------------------------*/
    //   Models                                     */
    /*----------------------------------------------*/
    this.models = new Models(this);

    /*----------------------------------------------*/
    //   Loop                                       */
    /*----------------------------------------------*/
    let that = this;
    const clock = new THREE.Clock();
    function animate() {
      const elapsed = clock.getElapsedTime();

      if (that.models.is_ready) {
        that.models.meshes.forEach((mesh, i) => {
          // flotación vertical
          mesh.position.y += Math.sin(elapsed + i) * 0.001; // +i para variar el movimiento
          // rotación ligera
          mesh.rotation.x = Math.sin(elapsed * 1 + i) * 0.1;
          mesh.rotation.y = Math.cos(elapsed * 1 + i) * 0.1;
        });

        that.models.update();
      }

      requestAnimationFrame(animate);
      // if (that.models.is_ready) {
      // that.models.update();
      // }
      that.renderer.render(that.scene, that.camera);
      that.controls.update();
    }
    animate();
  }
  checkIfReady() {
    if (this.models?.is_ready && this.scene.environment) {
      gsap.to(this.overlayMaterial.uniforms.uAlpha, {
        value: 0,
        duration: 1.5,
        ease: "power2.out",
        onComplete: () => {
          this.scene.remove(this.overlay);
        },
      });
    }
  }
}
