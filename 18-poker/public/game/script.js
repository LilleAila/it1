import { io } from "/socket.io-client/socket.io.esm.min.js";

const gameContainer = document.querySelector(".game-container");
const actionsContainer = document.querySelector("#actions-container");
const handInfo = document.querySelector("#hand-info");

const cardElements = Array.from({ length: 7 }, (_, i) =>
  document.querySelector(`#card${i}`),
);

let fourColor = false;

document.querySelector("#four-color-toggle").addEventListener("click", (e) => {
  fourColor = !fourColor;
  e.target.textContent = fourColor ? "Use Two Colors" : "Use Four Colors";
  const color = fourColor ? "#000,#f00,#04f,#080" : "#000,#f00,#f00,#000";
  cardElements.map((c) => {
    c.suitcolor = color;
    c.rankcolor = color;
  });
});

const gameId = window.location.pathname.split("/").pop();
const socket = io();
let joinedGame = false;
let joinRequests = {};
let playerSelf = {};
let userSelf = {};
let currentBet = 0;
let currentPot = 0;
let bets = [];

const ranks = [
  "",
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];
const suits = ["Clubs", "Diamonds", "Hearts", "Spades"];
const handTypes = [
  "High Card",
  "One Pair",
  "Two Pair",
  "Three of a Kind",
  "Straight",
  "Flush",
  "Full House",
  "Four of a Kind",
  "Straight Flush",
  "Royal Flush",
];

document.querySelector("#game-id").textContent = `(${gameId})`;

document.querySelector("#join-form").addEventListener("submit", (e) => {
  const form = new FormData(e.target);
  const data = Object.fromEntries(form);
  socket.emit("joinRequest", { gameId, stack: Number(data.stack) });
  e.preventDefault();
});

document.querySelector("#leave-game").addEventListener("click", (_e) => {
  socket.emit("leaveGame", { gameId });
});

document.querySelector("#back-button").addEventListener("click", (_e) => {
  socket.emit("leaveGame", { gameId });
  window.location.href = "/";
});

socket.on("playerJoined", ({ message, player }) => {
  console.log(message);
  const tr = document.createElement("tr");
  tr.id = `player-${player.id}`;
  if (userSelf.id == player.id) {
    tr.classList.add("self");
  }
  tr.innerHTML = `
    <td>${player.username}${player.isAdmin ? " (Admin)" : ""}</td>
    <td class="player-stack">${player.stack}</td>
    <td class="player-state"></td>
  `;
  document.querySelector("#players tbody").appendChild(tr);
});

socket.on("playerLeft", ({ message, playerId }) => {
  console.log(message);
  console.log(playerId);
  const playerElement = document.querySelector(`#player-${playerId}`);
  playerElement.remove();
});

socket.on("playerState", (playerState) => {
  const { message, joined, admin, player } = playerState;
  console.log(message);
  joinedGame = joined;
  playerSelf = player;

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

function initializeGame(state) {
  document.querySelector("#username").textContent = userSelf.username;
  for (const player of state.players) {
    const tr = document.createElement("tr");
    tr.id = `player-${player.id}`;
    if (userSelf.id == player.id) {
      tr.classList.add("self");
    }
    tr.innerHTML = `
      <td>${player.username}${player.isAdmin ? " (Admin)" : ""}</td>
      <td class="player-stack">${player.stack}</td>
      <td class="player-state"></td>
    `;
    document.querySelector("#players tbody").appendChild(tr);
  }

  for (let i = 0; i < 5; i++) {
    const cardElement = cardElements[i + 2];
    const card = state.communityCards[i];
    if (!card) {
      cardElement.classList.remove("active");
      continue;
    }
    cardElement.classList.add("active");
    cardElement.rank = ranks[card.rank];
    cardElement.suit = suits[card.suit];
  }

  gameContainer.classList.add("loaded");
}

socket.on("connect", async () => {
  const socketId = socket.id;

  const response = await fetch(`/api/games/${gameId}/join`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ socketId: socketId }),
  });

  const data = await response.json();
  const { gameState, user } = data;

  console.log("Loaded game state");
  userSelf = user;
  initializeGame(gameState);
});

socket.on("joinRequest", ({ message, player }) => {
  console.log(message);
  joinRequests[player.id] = player;

  const requestedSeatsWrapper = document.querySelector(".requested-seats");
  const requestedSeats = document.querySelector("#requested-seats tbody");
  requestedSeatsWrapper.classList.add("active-requests");
  const tr = document.createElement("tr");

  const username = document.createElement("td");
  username.textContent = player.username;
  tr.appendChild(username);

  const stack = document.createElement("td");
  stack.textContent = player.stack;
  tr.appendChild(stack);

  const approveContainer = document.createElement("td");
  const approve = document.createElement("button");
  approve.textContent = "Approve";
  approve.addEventListener("click", () => {
    console.log(`Approving ${player.username}`);

    socket.emit("joinResponse", {
      gameId,
      playerId: player.id,
      approved: true,
    });

    tr.remove();

    delete joinRequests[player.id];
    if (Object.keys(joinRequests).length < 1) {
      requestedSeatsWrapper.classList.remove("active-requests");
    }
  });
  approveContainer.appendChild(approve);
  tr.appendChild(approveContainer);

  const declineContainer = document.createElement("td");
  const decline = document.createElement("button");
  decline.textContent = "Decline";
  decline.addEventListener("click", () => {
    console.log(`Declining ${player.username}`);

    socket.emit("joinResponse", {
      gameId,
      playerId: player.id,
      approved: false,
    });

    tr.remove();

    delete joinRequests[player.id];
    if (Object.keys(joinRequests).length < 1) {
      requestedSeatsWrapper.classList.remove("active-requests");
    }
  });
  declineContainer.appendChild(decline);
  tr.appendChild(declineContainer);

  requestedSeats.appendChild(tr);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected. Reason: ", reason);
  gameContainer.classList.remove("joined");
});

document.querySelector("#advance").addEventListener("click", () => {
  socket.emit("advanceGame", { gameId });
});

socket.on("newHand", ({ message, hand }) => {
  console.log(message);
  handInfo.classList.add("hide");

  for (let i = 0; i < 7; i++) {
    const cardElement = cardElements[i];
    cardElement.classList.remove("best");
    cardElement.classList.remove("active");
  }

  for (let i = 0; i < 2; i++) {
    const cardElement = cardElements[i];
    const card = hand[i];
    cardElement.classList.add("best");
    cardElement.classList.add("active");
    cardElement.rank = ranks[card.rank];
    cardElement.suit = suits[card.suit];
  }
});

socket.on("communityCards", ({ message, cards }) => {
  console.log(message);

  for (let i = 0; i < 5; i++) {
    const cardElement = cardElements[i + 2];
    const card = cards[i];
    if (!card) {
      cardElement.classList.remove("active");
      continue;
    }
    cardElement.classList.add("active");
    cardElement.rank = ranks[card.rank];
    cardElement.suit = suits[card.suit];
  }
});

socket.on("evaluatedHand", ({ message, result }) => {
  console.log(message);

  handInfo.classList.remove("hide");

  for (let i = 0; i < 7; i++) {
    const cardElement = cardElements[i];
    if (result.indices.includes(i)) {
      cardElement.classList.add("best");
    } else {
      cardElement.classList.remove("best");
    }
  }

  const infoText =
    result.bestHand.info.length > 0
      ? ` (${result.bestHand.info.map((x) => ranks[x]).join(", ")})`
      : "";
  handInfo.textContent = handTypes[result.bestHand.type] + infoText;
});

socket.on("bet", (b) => {
  if (b.bet) {
    actionsContainer.querySelectorAll("button, input").forEach((b) => {
      b.disabled = false;
    });
    actionsContainer.classList.add("my-turn");
  } else {
    actionsContainer.classList.remove("my-turn");
    actionsContainer.querySelectorAll("button, input").forEach((b) => {
      b.disabled = true;
    });
  }
});

socket.on("betsUpdated", ({ pot, bet, bets, players, bettingPlayer }) => {
  currentBet = bet;
  actionsContainer.querySelector("#current-bet").textContent = currentBet;
  document.querySelector("#pot-value").textContent = pot;

  for (const bet of bets) {
    const playerTr = document.querySelector(`#player-${bet.player}`);
    const stateTd = playerTr.querySelector(".player-state");
    if (bet.type == "fold") {
      stateTd.textContent = "Folded";
    } else if (bet.allIn) {
      stateTd.textContent = "All In";
    } else {
      stateTd.textContent = "";
    }
  }

  for (const player of players) {
    const playerTr = document.querySelector(`#player-${player.id}`);
    playerTr.querySelector(".player-stack").textContent = player.stack;
  }

  document.querySelectorAll("#players tr").forEach((p) => {
    p.classList.remove("current-bet");
  });
  document
    .querySelector(`#player-${bettingPlayer}`)
    .classList.add("current-bet");
});

document.querySelector("#check-btn").addEventListener("click", () => {
  socket.emit("betResponse", {
    action: "check",
  });
});

document.querySelector("#call-btn").addEventListener("click", () => {
  socket.emit("betResponse", {
    action: "call",
  });
});

document.querySelector("#raise-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const form = new FormData(e.target);
  const data = Object.fromEntries(form);

  socket.emit("betResponse", {
    action: "raise",
    bet: data.bet,
  });

  e.preventDefault();
});

document.querySelector("#fold-btn").addEventListener("click", () => {
  socket.emit("betResponse", {
    action: "fold",
  });
});
