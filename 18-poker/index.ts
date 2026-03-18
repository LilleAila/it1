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

enum Suit {
  Hearts = "Hearts",
  Diamonds = "Diamonds",
  Clubs = "Clubs",
  Spades = "Spades",
}
const suits = Object.values(Suit);

type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | "J" | "Q" | "K" | "A";
const ranks: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"];

class Card {
  constructor(
    public readonly rank: Rank,
    public readonly suit: Suit,
  ) {}
}

class Player {
  public hand: [Card, Card] | null;
  public isAdmin: boolean = false;

  constructor(
    public readonly id: string,
    public readonly username: string,
    public stack: number,
  ) {
    this.hand = null;
  }

  setHand(a: Card, b: Card) {
    this.hand = [a, b];
  }
}

class Game {
  public readonly id: string;
  public players: Player[];
  public state: "waiting" | "active" = "waiting";
  public communityCards: Card[];
  public deck: Card[];
  public pot: number = 0;
  public dealer: number = 0;
  public admin: string;

  public tableSize: number = 9;

  constructor(id: string) {
    this.id = id;
    this.players = [];
    this.communityCards = [];
    this.deck = [];
    this.admin = "";
    this.initDeck();
  }

  getPublicState() {
    return {
      state: this.state,
      communityCards: this.communityCards,
      pot: this.pot,
      dealer: this.dealer,
      admin: this.admin,
      players: this.players,
    };
  }

  initDeck() {
    let deck = [];
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push(new Card(rank, suit));
      }
    }
    this.deck = deck;
  }

  shuffleDeck() {
    // Fisher-Yates Shuffle
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j]!, this.deck[i]!];
    }
  }

  hasPlayer(id: string): boolean {
    return this.players.some((p) => p.id == id);
  }

  addPlayer(player: Player) {
    if (!this.hasPlayer(player.id)) {
      this.players.push(player);
    }

    if (this.players.length == 1) {
      player.isAdmin = true;
      this.admin = player.id;
    }
  }

  removePlayer(id: string): Player | undefined {
    this.players = this.players.filter((p) => p.id !== id);
    if (this.players.every((p) => !p.isAdmin)) {
      const player = this.players[0];
      if (!player) return;
      player.isAdmin = true;
      this.admin = player.id;
      return player;
    }
  }

  drawCard() {
    if (this.deck.length < 1) throw new Error("No cards left in deck!");
    return this.deck.pop()!;
  }

  dealCard() {
    this.communityCards.push(this.drawCard());
  }

  dealHoleCards() {
    if (this.players.length < 2) throw new Error("Needs at least 2 players!");
    let hands: Card[][] = Array.from({ length: this.players.length }, () => []);
    let firstIndex = (this.dealer + 1) % this.players.length;
    for (let r = 0; r < 2; r++) {
      for (let i = 0; i < this.players.length; i++) {
        const index = (firstIndex + i) % this.players.length;
        hands[index]!.push(this.drawCard());
      }
    }
    for (let i = 0; i < hands.length; i++) {
      const [a, b] = hands[i]!;
      this.players[i]!.setHand(a!, b!);
    }
  }
}

class PokerServer {
  private games: Map<string, Game> = new Map();
  private tickRate = 1000; // Tick every second
  private interval: NodeJS.Timeout | null = null;

  constructor() {}

  start() {
    if (this.interval) return;
    this.interval = setInterval(() => this.update(), this.tickRate);
    console.log("Game server loop started.");
  }

  stop() {
    if (!this.interval) return;
    clearInterval(this.interval);
    this.interval = null;
    console.log("Game server loop stopped.");
  }

  private update() {
    for (const [gameId, game] of this.games) {
    }
  }

  createGame(): string {
    const gameId = crypto.randomUUID().slice(0, 6);
    this.games.set(gameId, new Game(gameId));
    console.log(`Created game ${gameId}`);
    return gameId;
  }

  getGame(id: string): Game | undefined {
    const game = this.games.get(id);
    return game;
  }
}

const pokerServer = new PokerServer();

app.post("/new-game", (_req, res) => {
  const gameId = pokerServer.createGame();
  res.redirect(`/game/${gameId}`);
});

app.post("/join-game", (req, res) => {
  const { gameId } = req.body;
  if (pokerServer.getGame(gameId)) {
    res.redirect(`/game/${gameId}`);
  } else {
    res.status(404).send(`Game ID not found.`);
  }
});

app.get("/game/:id", (req, res) => {
  const { id } = req.params;
  const game = pokerServer.getGame(id);
  if (!game) {
    return res.status(404).send("Game not found");
  }
  res.sendFile(__dirname + "/public/game/index.html");
});

// Websockets / socket.io
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("joinGame", ({ gameId, stack }) => {
    const game = pokerServer.getGame(gameId);
    if (!game) return;

    socket.data.gameId = gameId;

    if (!game.hasPlayer(socket.id)) {
      const player = new Player(socket.id, socket.id, stack);
      game.addPlayer(player);
      socket.join(gameId);

      io.to(gameId).emit("gameState", {
        message: "Player Joined",
        state: game.getPublicState(),
      });

      socket.emit("playerState", {
        message: "Joined Game",
        joined: true,
        admin: player.isAdmin,
      });
    }
  });

  socket.on("leaveGame", ({ gameId }) => {
    const game = pokerServer.getGame(gameId);
    if (!game) return;

    socket.data.gameId = gameId;

    if (game.hasPlayer(socket.id)) {
      const newAdmin = game.removePlayer(socket.id);
      socket.leave(gameId);

      io.to(gameId).emit("gameState", {
        message: "Player Left",
        state: game.getPublicState(),
      });

      socket.emit("playerState", {
        message: "Left game",
        joined: false,
        admin: false,
      });

      if (newAdmin) {
        io.to(newAdmin.id).emit("playerState", {
          message: "Assigned as admin",
          joined: true,
          admin: true,
        });
      }
    }
  });

  socket.on("disconnect", () => {
    const { gameId } = socket.data;

    if (gameId) {
      const game = pokerServer.getGame(gameId);
      if (!game) return;

      console.log(`User ${socket.id} disconnected from game ${gameId}`);
      const newAdmin = game.removePlayer(socket.id);

      io.to(gameId).emit("gameState", {
        message: "Player Left",
        state: game.getPublicState(),
      });

      if (newAdmin) {
        io.to(newAdmin.id).emit("playerState", {
          message: "Assigned as admin",
          joined: true,
          admin: true,
        });
      }
    }
  });
});

function init() {
  httpServer.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
  pokerServer.start();
}

init();
