import { io } from "/socket.io-client/socket.io.esm.min.js";

const gameId = window.location.pathname.split("/").pop();
const socket = io("http://localhost:3000");

document.querySelector("#game-id").textContent = `(${gameId})`;

document.querySelector("#join-game").addEventListener("click", (e) => {
  socket.emit("joinGame", { gameId });
});

document.querySelector("#leave-game").addEventListener("click", (e) => {
  socket.emit("leaveGame", { gameId });
});

document.querySelector("#back-button").addEventListener("click", (e) => {
  socket.emit("leaveGame", { gameId });
  window.location.href = "/";
})

socket.on("gameState", (gameState) => {
  const { message, players, state } = gameState;
  console.log(message);
  document.querySelector("#players").innerHTML = `
    ${players.map((p) => `
      <li>${p}</li>
    `).join("")}
  `;
});

socket.on("playerState", (playerState) => {
  const { message, joined } = playerState;
  setJoined(joined);
});

function setJoined(joined) {
  const gameButtons = document.querySelector(".game-container");
  if (joined) {
    gameButtons.classList.add("joined");
  } else {
    gameButtons.classList.remove("joined");
  }
}
