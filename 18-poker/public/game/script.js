import { io } from "/socket.io-client/socket.io.esm.min.js";

const gameId = window.location.pathname.split("/").pop();
const socket = io();
let joinedGame = false;
let joinRequests = [];

document.querySelector("#game-id").textContent = `(${gameId})`;

document.querySelector("#join-form").addEventListener("submit", (e) => {
  const form = new FormData(e.target);
  const data = Object.fromEntries(form);
  socket.emit("joinGame", { gameId, stack: Number(data.stack) });
  e.preventDefault();
});

document.querySelector("#leave-game").addEventListener("click", (_e) => {
  socket.emit("leaveGame", { gameId });
});

document.querySelector("#back-button").addEventListener("click", (_e) => {
  socket.emit("leaveGame", { gameId });
  window.location.href = "/";
});

socket.on("gameState", (gameState) => {
  const { message, state } = gameState;
  console.log(message);
  document.querySelector("#players").innerHTML = `
    ${state.players
      .map(
        (p) => `
      <li>${p.username}${p.isAdmin ? " (Admin)" : ""}</li>
    `,
      )
      .join("")}
  `;
});

socket.on("playerState", (playerState) => {
  const { message, joined, admin } = playerState;
  console.log(message);
  joinedGame = joined;

  const gameContainer = document.querySelector(".game-container");
  if (joinedGame) {
    gameContainer.classList.add("joined");
  } else {
    gameContainer.classList.remove("joined");
  }

  if (admin) {
    gameContainer.classList.add("admin");
  } else {
    gameContainer.classList.remove("admin");
  }
});

socket.on("gameOptions", ({ message, options }) => {
  console.log(message);

  Object.entries(options).forEach(([key, value]) => {
    document.querySelector(`#game-options input[name="${key}"]`).value = value;
  });
});

document.querySelector("#game-options").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const options = Object.fromEntries(form);
  socket.emit("updateOptions", { gameId, options });
});

socket.on("joinRequest", (joinRequest) => {
  const { message, players } = joinRequest;
  console.log(message);

  joinRequests = players;
  const requestedSeats = document.querySelector("#requested-seats");
  requestedSeats.innerHTML = "";
  for (const p of players) {
    const username = document.createElement("div");
    username.textContent = p.username;
    const approve = document.createElement("button");
    approve.textContent = "Approve";
    approve.addEventListener("click", () => {
      console.log(`Approving ${p.username}`);
    });
    const decline = document.createElement("button");
    decline.textContent = "Decline";
    decline.addEventListener("click", () => {
      console.log(`Declining ${p.username}`);
    });
    requestedSeats.appendChild(username);
    requestedSeats.appendChild(approve);
    requestedSeats.appendChild(decline);
  }
});
