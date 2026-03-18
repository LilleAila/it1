import crypto from "crypto";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const PORT = 3000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(
  "/socket.io-client",
  express.static("node_modules/socket.io-client/dist"),
);

class Game {
  id: string;
  players: string[];
  state: "waiting" | "active";

  constructor(id: string) {
    this.id = id;
    this.players = [];
    this.state = "waiting";
  }

  hasPlayer(id: string): boolean {
    return this.players.includes(id);
  }

  addPlayer(id: string) {
    if (!this.hasPlayer(id)) {
      this.players.push(id);
    }
  }

  removePlayer(id: string) {
    this.players = this.players.filter((p) => p !== id);
  }
}

let games: Record<string, Game> = {};

app.post("/new-game", (req, res) => {
  const gameId = crypto.randomUUID().slice(0, 6);
  games[gameId] = new Game(gameId);
  res.redirect(`/game/${gameId}`);
});

app.post("/join-game", (req, res) => {
  const { gameId } = req.body;
  if (games[gameId]) {
    res.redirect(`/game/${gameId}`);
  } else {
    res.status(404).send(`Game ID not found.`);
  }
});

app.get("/game/:id", (req, res) => {
  const { id } = req.params;
  const game = games[id];
  if (!game) {
    return res.status(404).send("Game not found");
  }
  res.sendFile(__dirname + "/public/game/index.html");
});

httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("joinGame", ({ gameId }) => {
    const game = games[gameId];
    if (!game) return;

    socket.gameId = gameId;

    if (!game.hasPlayer(socket.id)) {
      game.addPlayer(socket.id);
      socket.join(gameId);

      io.to(gameId).emit("gameState", {
        message: "Player Joined",
        players: game.players,
        state: game.state,
      });
      socket.emit("playerState", { message: "Joined Game", joined: true });
    }
  });

  socket.on("leaveGame", ({ gameId }) => {
    const game = games[gameId];
    if (!game) return;

    socket.gameId = gameId;

    if (game.hasPlayer(socket.id)) {
      game.removePlayer(socket.id);
      socket.leave(gameId);

      io.to(gameId).emit("gameState", {
        message: "Player Left",
        players: game.players,
        state: game.state,
      });
      socket.emit("playerState", { message: "Left game", joined: false });
    }
  });

  socket.on("disconnect", () => {
    const { gameId } = socket;

    if (gameId) {
      const game = games[gameId];
      if (!game) return;

      console.log(`User ${socket.id} disconnected from game ${gameId}`);
      game.removePlayer(socket.id);

      io.to(gameId).emit("gameState", {
        message: "Player Left",
        players: game.players,
        state: game.state,
      });
    }
  });
});
