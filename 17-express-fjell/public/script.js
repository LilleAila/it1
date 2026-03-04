const grid = document.querySelector(".mountains");

await (async () => {
  const response = await fetch("/api/fjell_info");
  const data = await response.json();
  
  grid.innerHTML = "";
  for (const mountain of data) {
    const el = document.createElement("div");
    el.classList.add("mountain");
    el.innerHTML = `
      <h2>${mountain.fjellnavn}</h2>
      <h3>Høyde: ${mountain.hoyde}</h3>
      <p>${mountain.beskrivelse}</p>
      <img src="/assets/${mountain.foto}" alt="${mountain.fjellnavn}" />
    `;
    grid.appendChild(el);
  }
})();
