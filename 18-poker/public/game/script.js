import { io } from "/socket.io-client/socket.io.esm.min.js";

const gameId = window.location.pathname.split("/").pop();
const socket = io();

document.querySelector("#game-id").textContent = `(${gameId})`;

document.querySelector("#join-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const data = Object.fromEntries(form);
  socket.emit("joinGame", { gameId, stack: Number(data.stack) });
});

document.querySelector("#leave-game").addEventListener("click", (e) => {
  socket.emit("leaveGame", { gameId });
});

document.querySelector("#back-button").addEventListener("click", (e) => {
  socket.emit("leaveGame", { gameId });
  window.location.href = "/";
});

socket.on("gameState", (gameState) => {
  const { message, players, state } = gameState;
  console.log(gameState);
  document.querySelector("#players").innerHTML = `
    ${players
      .map(
        (p) => `
      <li>${p.username}</li>
    `,
      )
      .join("")}
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
