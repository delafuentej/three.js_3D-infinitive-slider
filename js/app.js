import GLApp from "./gl-app.js";
import { images } from "./constants";
//console.log("images", images);
class App {
  constructor() {
    this.createImageList();
    this.gl_app = new GLApp();
  }

  createImageList() {
    const list = document.createElement("ul");
    list.classList.add("list-imgs");

    images.forEach((src, index) => {
      const li = document.createElement("li");
      li.classList.add("each-img", `each-img${index + 1}`);

      const img = document.createElement("img");
      img.src = src;
      img.alt = `img${index + 1}`;

      li.appendChild(img);
      list.appendChild(li);
    });

    const canvas = document.getElementById("sketch");
    document.body.insertBefore(list, canvas);
  }
}

new App();
