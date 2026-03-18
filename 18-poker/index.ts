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
  const id = crypto.randomUUID().slice(0, 6);
  games[id] = new Game(id);
  res.redirect(`/game/${id}`);
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
