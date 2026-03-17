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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("joinGame", ({ gameId }) => {
    socket.join(gameId);
    io.to(gameId).emit("gameState", { message: "Player Joined", players: [ socket.id ], });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

class Game {
  id: string;
  players: string[];
  state: "waiting" | "active";

  constructor(id: string) {
    this.id = id;
    this.players = [];
    this.state = "waiting";
  }

  addPlayer(id: string) {
    this.players.push(id);
  }

  removePlayer(id: string) {
    this.players = this.players.filter(p => p !== id);
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
