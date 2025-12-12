const speed = 1;
const fps = 60;
const dt = 1 / fps;

let snows = [];
const snowContainer = document.querySelector("#snowContainer");

function random(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function createSnow() {
  const elem = document.createElement("div");

  elem.classList.add("snow");
  elem.style.width = `${random(5, 15)}px`;
  elem.style.opacity = `${random(40, 80)}%`;

  snowContainer.appendChild(elem);

  const rect = elem.getBoundingClientRect();
  const left = random(0, window.innerWidth - rect.width);
  const top = -rect.height - random(50, 500);
  elem.style.left = `${left}px`;
  elem.style.top = `${top}px`;

  snows.push({
    elem: elem,
    angle: random(70, 100),
    left: left,
    top: top,
    speed: random(20, 100),
  });
}

function moveSnow(snow) {
  const rad = snow.angle * (Math.PI / 180);
  const dx = Math.cos(rad) * snow.speed * speed * dt;
  const dy = Math.sin(rad) * snow.speed * speed * dt;

  snow.left += dx;
  snow.top += dy;
  snow.elem.style.left = `${snow.left}px`;
  snow.elem.style.top = `${snow.top}px`;
}

function handleOutside(snow, i) {
  const rect = snow.elem.getBoundingClientRect();

  if (
    snow.left + rect.width < 0 ||
    snow.left > window.innerWidth ||
    snow.top > window.innerHeight
  ) {
    snow.elem.remove();
    snows.splice(i, 1);
    createSnow();
  }
}

(() => {
  for (let i = 0; i < 200; i++) {
    createSnow();
  }

  setInterval(() => {
    for (let i = 0; i < snows.length; i++) {
      const snow = snows[i];
      moveSnow(snow);
      handleOutside(snow, i);
    }
  }, dt * 1000);
})();
