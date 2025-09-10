import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";

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
      alias: true,
      alpha: true,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
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
    //   OrbitControl                              */
    /*----------------------------------------------*/
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;

    /*----------------------------------------------*/
    //   Load EXR                                   */
    /*----------------------------------------------*/
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();

    const exrLoader = new EXRLoader();

    exrLoader.load(
      "/environmentMap/NightSkyHDRI004_8K-HDR.exr",
      (environmentMap) => {
        environmentMap.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.background = environmentMap;
        this.scene.environment = environmentMap;
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
}
