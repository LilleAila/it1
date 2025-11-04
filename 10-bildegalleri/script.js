const images = [
  "assets/01.png",
  "assets/02.png",
  "assets/03.png",
  "assets/04.png",
  "assets/05.png",
  "assets/06.png",
  "assets/07.png",
];

let activeImage = 0;

function changeImage(x) {
  activeImage = Math.max(Math.min(activeImage + x, images.length - 1), 0);
  console.log(activeImage);

  document.querySelector(".image").src = images[activeImage];
}

document
  .querySelector("#previmg")
  .addEventListener("click", () => changeImage(-1));

document
  .querySelector("#nextimg")
  .addEventListener("click", () => changeImage(1));
