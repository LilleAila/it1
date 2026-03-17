import { io } from "/socket.io/socket.io.js";

const id = window.location.pathname.split("/").pop();
const socket = io("http://localhost:3000");

document.querySelector("#game-id").textContent = `(${id})`;

document.querySelector("#join-game").addEventListener("click", (e) => {
  socket.emit("joinGame", { gameId });
});

socket.on("gameState", (state) => {

});
