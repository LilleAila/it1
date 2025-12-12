const speed = 0.01;

let lastTime = 0;
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

function moveSnow(snow, dt) {
  const rad = snow.angle * (Math.PI / 180);
  const dx = Math.cos(rad) * snow.speed * speed;
  const dy = Math.sin(rad) * snow.speed * speed;

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

function frame(time) {
  if (!lastTime) lastTime = time;
  const dt = (time - lastTime) / 1000;
  lastTime = time;

  for (let i = 0; i < snows.length; i++) {
    const snow = snows[i];
    moveSnow(snow, dt);
    handleOutside(snow, i);
  }

  requestAnimationFrame(frame);
}

(() => {
  for (let i = 0; i < 200; i++) {
    createSnow();
  }

  requestAnimationFrame(frame);
})();
