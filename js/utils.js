// utils.js o al inicio de App.js
export function supportsWebP() {
  const elem = document.createElement("canvas");
  if (!!(elem.getContext && elem.getContext("2d"))) {
    return elem.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  }
  return false;
}
