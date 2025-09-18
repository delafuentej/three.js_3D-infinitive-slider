import * as THREE from "three";
import gsap from "gsap";

export default class Models {
  constructor(gl_app) {
    this.gl_app = gl_app;
    this.scene = gl_app.scene;
    this.is_ready = false;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // new
    this.imgs = document.querySelectorAll(".list-imgs img");
    this.imgs_src = [];
    this.textures = [];
    this.duration = 0.4;

    this.imgs.forEach((img) => {
      this.loadTexture(img.src);
    });
  }

  createMeshes() {
    const scale = 0.00275;
    const radius = this.textures[0].image.width * 0.0015; // escala ajustada
    const segments = 64; // suavidad del círculo
    this.circle = new THREE.Mesh(
      new THREE.CircleGeometry(radius, segments, 1),
      new THREE.MeshBasicMaterial({
        map: this.textures[0],
        transparent: true,
        side: THREE.DoubleSide,
      })
    );
    // this.group.add(this.mesh);
    this.gap = 25;
    this.meshes = [];
    this.positions = []; // to store all meshes positions

    const count = 23;
    const spacing = this.gap / count;
    const centerIndex = (count - 1) / 2;

    for (let i = 0; i < count; i++) {
      const textureIndex = (i + 1) % this.textures.length;
      // console.log(textureIndex);

      const mesh = this.circle.clone();
      mesh.material = this.circle.material.clone();
      mesh.material.map = this.textures[textureIndex];

      mesh.position.x = -i * 0.1;
      mesh.position.z = -i * 0.1;
      const yPosition = -this.gap / 2 + spacing * i + spacing / 2;
      const distanceFromCenter = Math.abs(i - centerIndex);
      const zPosition = -distanceFromCenter * 1;

      mesh.position.set(0, yPosition, zPosition + zPosition * 1);
      this.positions.push({ y: yPosition, z: zPosition });
      this.group.add(mesh);
      this.meshes.push(mesh);
      // 🔹 Espaciado vertical

      // Espiral Form
      // const yPosition = -this.gap / 2 + spacing * i + spacing / 2;

      // 🔹 Ángulo y radio para el espiral
      // const angle = i * 0.5; // controla la "densidad" de la espiral (más pequeño → más vueltas)
      // const radius = 2 + i * 0.1; // radio base de la espiral
      // const x = Math.cos(angle) * radius;
      // const z = Math.sin(angle) * radius;

      //🔹 Posición final en espiral
      // mesh.position.set(x, yPosition, z);

      // this.positions.push({ x, y: yPosition, z });
      // this.group.add(mesh);
      // this.meshes.push(mesh);
    }

    this.is_animating = false;
    this.bindEvents();
    this.is_ready = true;
    this.gl_app.checkIfReady();
  }

  moveBackward() {
    if (this.is_animating) return;
    this.is_animating = true;
    const firstMesh = this.meshes[0];
    const firstPosition = { ...firstMesh.position };
    for (let i = 0; i < this.meshes.length - 1; i++) {
      gsap.to(this.meshes[i].position, {
        y: this.meshes[i + 1].position.y,
        z: this.meshes[i + 1].position.z,
        duration: this.duration,
        ease: "power3.out",
      });
    }
    gsap.to(this.meshes[this.meshes.length - 1].position, {
      y: firstPosition.y,
      z: firstPosition.z,
      duration: this.duration,
      ease: "power3.out",
      onComplete: () => {
        this.meshes.push(this.meshes.shift()); // move the first mesh to the back
        this.is_animating = false;
      },
    });
  }
  moveForward() {
    if (this.is_animating) return;
    this.is_animating = true;
    const lastMesh = this.meshes[this.meshes.length - 1];
    const lastPosition = { ...lastMesh.position };
    for (let i = this.meshes.length - 1; i > 0; i--) {
      gsap.to(this.meshes[i].position, {
        y: this.meshes[i - 1].position.y,
        z: this.meshes[i - 1].position.z,
        duration: this.duration,
        ease: "power3.out",
      });
    }
    //
    gsap.to(this.meshes[0].position, {
      y: lastPosition.y,
      z: lastPosition.z,
      duration: this.duration,
      ease: "power3.out",
      onComplete: () => {
        this.meshes.unshift(this.meshes.pop()); //move the last mesh to the first position
        this.is_animating = false;
      },
    });
  }

  bindEvents() {
    const prevBtn = document.querySelector(".prev");
    prevBtn.addEventListener("click", () => this.moveBackward());
    const nextBtn = document.querySelector(".next");
    nextBtn.addEventListener("click", () => this.moveForward());
  }

  //? - =========================  LOAD TEXTURE  ========================= -//
  //? - =========================  LOAD TEXTURE  ========================= -//

  loadTexture(src) {
    // console.log(src);
    return new Promise((resolve, reject) => {
      const loader = new THREE.TextureLoader(this.gl_app.loadingManager);
      loader.load(src, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        this.textures.push(texture);
        console.log("texture", texture);

        if (this.textures.length === this.imgs.length) {
          this.is_ready = true;
          this.createMeshes();
          this.gl_app.checkIfReady();
        }
        resolve(texture);
      });
    });
  }

  //? - =========================  UPDATES  ========================= -//
  //? - =========================  UPDATES  ========================= -//
  update() {
    if (this.is_ready) {
      this.group.children.forEach((model, index) => {
        model.rotation.y += 0.01;
      });
    }
  }
}
