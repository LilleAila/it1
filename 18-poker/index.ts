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

app.use("/cardmeister", express.static("node_modules/playingcardts"));

enum Suit {
  Clubs = 0,
  Diamonds,
  Hearts,
  Spades,
}
const suits = Object.values(Suit).filter((x) => typeof x == "number");

const ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

enum HandType {
  HighCard = 0,
  OnePair,
  TwoPair,
  ThreeOfAKind,
  Straight,
  Flush,
  FullHouse,
  FourOfAKind,
  StraightFlush,
  RoyalFlush,
}

class Card {
  constructor(
    public readonly rank: number,
    public readonly suit: Suit,
  ) {}
}

class EvaluatedHand {
  public type: HandType;
  public ranks: number[];
  public cards: Card[];
  public info: number[];

  constructor(cards: Card[]) {
    const sortedRanks = cards.map((c) => c.rank).toSorted((a, b) => b - a);
    this.cards = cards.toSorted((a, b) => b.rank - a.rank);

    let rankCounts = new Array(16).fill(0);
    let suitCounts = new Array(4).fill(0);

    for (const c of this.cards) {
      rankCounts[c.rank] += 1;
      suitCounts[c.suit] += 1;
    }

    const uniqueRanks = [...new Set(sortedRanks)];
    const fiveHighStraight =
      JSON.stringify(sortedRanks) == JSON.stringify([14, 5, 4, 3, 2]);
    const straight =
      (uniqueRanks.length == 5 && uniqueRanks[0]! - uniqueRanks[4]! == 4) ||
      fiveHighStraight;
    const flush = suitCounts.some((x) => x == 5);

    let pairs = 0;
    let threeOfAKind = false;
    let fourOfAKind = false;

    for (let i = 14; i >= 2; i--) {
      const count = rankCounts[i];
      if (count >= 4) fourOfAKind = true;
      else if (count >= 3) threeOfAKind = true;
      else pairs += Math.floor(count / 2);
    }

    if (flush && straight) {
      if (sortedRanks[0] == 14) {
        this.type = HandType.RoyalFlush;
        this.info = [];
      } else {
        this.type = HandType.StraightFlush;
        this.info = [sortedRanks[0]!];
      }
    } else if (fourOfAKind) {
      this.type = HandType.FourOfAKind;
      this.info = [sortedRanks[1]!];
    } else if (threeOfAKind && pairs >= 1) {
      this.type = HandType.FullHouse;
      this.info = [sortedRanks[0]!, sortedRanks[4]!];
    } else if (flush) {
      this.type = HandType.Flush;
      this.info = [];
    } else if (straight) {
      this.type = HandType.Straight;
      this.info = [sortedRanks[0]!];
    } else if (threeOfAKind) {
      this.type = HandType.ThreeOfAKind;
      this.info = [sortedRanks[2]!];
    } else if (pairs >= 2) {
      this.type = HandType.TwoPair;
      this.info = [sortedRanks[1]!, sortedRanks[3]!];
    } else if (pairs >= 1) {
      this.type = HandType.OnePair;
      const [i, _] = rankCounts.entries().find(([_, v]) => v >= 2)!;
      this.info = [i];
    } else {
      this.type = HandType.HighCard;
      this.info = [sortedRanks[0]!];
    }

    if (fiveHighStraight) {
      this.ranks = [5, 4, 3, 2, 1];
    } else {
      this.ranks = sortedRanks.toSorted((a, b) => {
        if (rankCounts[a] != rankCounts[b])
          return rankCounts[b] - rankCounts[a];
        return b - a;
      });
    }
  }

  compare(b: EvaluatedHand): number {
    if (this.type != b.type) return this.type - b.type;
    for (let i = 0; i < this.ranks.length; i++) {
      if (this.ranks[i] != b.ranks[i]) return this.ranks[i]! - b.ranks[i]!;
    }
    return 0;
  }
}

interface HandResult {
  bestHand: EvaluatedHand;
  indices: number[];
}

function bestHand(holeCards: Card[], communityCards: Card[]): HandResult {
  const allCards = [...holeCards, ...communityCards];
  const n = allCards.length;
  let bestResult: HandResult | null = null;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        for (let l = k + 1; l < n; l++) {
          for (let m = l + 1; m < n; m++) {
            const indices = [i, j, k, l, m];
            const cards = indices.map((x) => allCards[x]!);
            const evaluated = new EvaluatedHand(cards);
            if (!bestResult || evaluated.compare(bestResult.bestHand) > 0) {
              bestResult = {
                bestHand: evaluated,
                indices,
              };
            }
          }
        }
      }
    }
  }

  return bestResult!;
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

interface GameOptions {
  tableSize: number;
  smallBlind: number;
  bigBlind: number;
  turnTime: number;
}

enum GameStage {
  PreFlop = 0,
  Flop,
  Turn,
  River,
  Showdown,
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
  public options: GameOptions;
  public stage: GameStage = GameStage.PreFlop;

  public requestedSeats: Record<string, Player>;

  constructor(id: string) {
    this.id = id;
    this.players = [];
    this.communityCards = [];
    this.deck = [];
    this.admin = "";
    this.options = {
      tableSize: 9,
      smallBlind: 0,
      bigBlind: 0,
      turnTime: 30,
    };
    this.requestedSeats = {};
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
      options: this.options,
    };
  }

  getOptions() {
    return this.options;
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

  nPlayers(): number {
    return this.players.length;
  }

  hasPlayer(id: string): boolean {
    return this.players.some((p) => p.id == id);
  }

  addPlayer(player: Player) {
    if (!this.hasPlayer(player.id)) {
      this.players.push(player);
    }

    if (this.nPlayers() == 1) {
      player.isAdmin = true;
      this.admin = player.id;
    }
  }

  removePlayer(id: string): Player | undefined {
    this.players = this.players.filter((p) => p.id != id);
    if (this.players.every((p) => !p.isAdmin)) {
      const player = this.players[0];
      if (!player) return;
      player.isAdmin = true;
      this.admin = player.id;
      return player;
    }
  }

  getPlayer(id: string): Player | undefined {
    return this.players.filter((p) => p.id == id)[0];
  }

  requestJoin(player: Player): boolean {
    if (player.id in this.requestedSeats) return false;
    this.requestedSeats[player.id] = player;
    return true;
  }

  approveJoin(playerId: string) {
    this.addPlayer(this.requestedSeats[playerId]!);
    delete this.requestedSeats[playerId];
  }

  declineJoin(playerId: string) {
    delete this.requestedSeats[playerId];
  }

  drawCard() {
    if (this.deck.length < 1) throw new Error("No cards left in deck!");
    return this.deck.pop()!;
  }

  dealCard() {
    this.communityCards.push(this.drawCard());
  }

  dealHoleCards() {
    const nPlayers = this.nPlayers();
    if (nPlayers < 2) throw new Error("Needs at least 2 players!");
    let hands: Card[][] = Array.from({ length: nPlayers }, () => []);
    let firstIndex = (this.dealer + 1) % nPlayers;
    for (let r = 0; r < 2; r++) {
      for (let i = 0; i < nPlayers; i++) {
        const index = (firstIndex + i) % nPlayers;
        hands[index]!.push(this.drawCard());
      }
    }
    for (let i = 0; i < hands.length; i++) {
      const [a, b] = hands[i]!;
      this.players[i]!.setHand(a!, b!);
    }
  }

  evaluateHands() {
    for (const p of this.players) {
      const h = bestHand(p.hand!, this.communityCards);
      io.to(p.id).emit("evaluatedHand", {
        message: "Evaluated Hand",
        result: h,
      });
    }
  }

  advance() {
    switch (this.stage) {
      case GameStage.PreFlop:
        this.communityCards = [];
        this.initDeck();
        this.shuffleDeck();
        this.dealHoleCards();
        for (const p of this.players) {
          io.to(p.id).emit("newHand", { message: "Dealt Hand", hand: p.hand });
        }
        io.to(this.id).emit("communityCards", {
          message: "New Round",
          cards: this.communityCards,
        });
        // blinds, betting round
        this.stage = GameStage.Flop;
        break;
      case GameStage.Flop:
        this.dealCard();
        this.dealCard();
        this.dealCard();
        io.to(this.id).emit("communityCards", {
          message: "Dealt Flop",
          cards: this.communityCards,
        });
        this.evaluateHands();
        // betting round
        this.stage = GameStage.Turn;
        break;
      case GameStage.Turn:
        this.dealCard();
        io.to(this.id).emit("communityCards", {
          message: "Dealt Turn",
          cards: this.communityCards,
        });
        this.evaluateHands();
        // betting round
        this.stage = GameStage.River;
        break;
      case GameStage.River:
        this.dealCard();
        io.to(this.id).emit("communityCards", {
          message: "Dealt River",
          cards: this.communityCards,
        });
        this.evaluateHands();
        // final betting round, finish round etc
        this.stage = GameStage.PreFlop;
        break;
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
      // console.log(`Updating poker game ${gameId}`);
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

  socket.on("advanceGame", ({ gameId }) => {
    const game = pokerServer.getGame(gameId);
    if (!game) return;

    const username = socket.id;
    if (username != game.admin) return;

    game.advance();
  });

  socket.on("updateOptions", ({ gameId, options }) => {
    const game = pokerServer.getGame(gameId);
    if (!game) return;

    const username = socket.id;
    if (username != game.admin) return;

    game.options = options as GameOptions;

    io.to(gameId).emit("gameOptions", {
      message: "Options Changed",
      options: game.getOptions(),
    });
  });

  socket.on("joinRequest", ({ gameId, stack }) => {
    const game = pokerServer.getGame(gameId);
    if (!game) return;

    socket.join(gameId);
    socket.data.gameId = gameId;

    if (!game.hasPlayer(socket.id)) {
      const player = new Player(socket.id, socket.id, stack);
      if (game.nPlayers() < 1) {
        game.addPlayer(player);

        socket.emit("playerState", {
          message: "Joined Game",
          joined: true,
          admin: true,
          player,
        });

        socket.emit("gameOptions", {
          message: "Options Changed",
          options: game.getOptions(),
        });

        io.to(gameId).emit("gameState", {
          message: "Player Joined",
          state: game.getPublicState(),
        });
      } else {
        if (game.requestJoin(player)) {
          io.to(game.admin).emit("joinRequest", {
            message: "Player requested a seat",
            player,
          });
        }
      }
    }
  });

  socket.on("joinResponse", ({ gameId, playerId, approved }) => {
    const game = pokerServer.getGame(gameId);
    if (!game) return;

    if (approved) {
      game.approveJoin(playerId);

      io.to(playerId).emit("playerState", {
        message: "Joined Game",
        joined: true,
        admin: false,
        player: game.getPlayer(playerId),
      });

      io.to(playerId).emit("gameOptions", {
        message: "Options Changed",
        options: game.getOptions(),
      });

      io.to(gameId).emit("gameState", {
        message: "Player Joined",
        state: game.getPublicState(),
      });
    } else {
      game.declineJoin(playerId);

      io.to(playerId).emit("playerState", {
        message: "Seat Declined",
        joined: false,
        admin: false,
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
        player: {},
      });

      if (newAdmin) {
        io.to(newAdmin.id).emit("playerState", {
          message: "Assigned as admin",
          joined: true,
          admin: true,
          player: newAdmin,
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
          player: game.getPlayer(socket.id),
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

// A not included
// const holeCards = [new Card(2, Suit.Clubs), new Card(14, Suit.Clubs)];
// const communityCards = [
//   new Card(9, Suit.Clubs),
//   new Card(3, Suit.Clubs),
//   new Card(8, Suit.Clubs),
//   new Card(11, Suit.Clubs),
//   new Card(3, Suit.Diamonds),
// ];
// A, 2, 3, 4, K Straight?
// const holeCards = [new Card(8, Suit.Hearts), new Card(3, Suit.Clubs)];
// const communityCards = [
//   new Card(4, Suit.Clubs),
//   new Card(14, Suit.Clubs),
//   new Card(2, Suit.Diamonds),
//   new Card(9, Suit.Spades),
//   new Card(13, Suit.Hearts),
// ];
// const best = bestHand(holeCards, communityCards);
// console.log(best);
