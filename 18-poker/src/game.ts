import { suits, ranks, bestHand, rankNames, suitNames, Card } from "./cards";
import { db } from "./db";
import { io } from "./server";

export class Player {
  public hand: [Card, Card] | null;
  public isAdmin: boolean = false;
  totalCommited: number = 0;

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

export interface GameOptions {
  tableSize: number;
  smallBlind: number;
  bigBlind: number;
  turnTime: number;
}

export enum GameStage {
  PreFlop = 0,
  Flop,
  Turn,
  River,
  Showdown,
}

export interface Bet {
  player: string;
  type: "none" | "bet" | "fold"; // Grouping check, call and raise into the same type
  value: number;
  allIn: boolean;
}

export class Game {
  public readonly id: string;
  public dbId: number = -1;
  public players: Player[];
  public state: "waiting" | "active" = "waiting";
  public communityCards: Card[];
  public deck: Card[];
  public pot: number = 0;
  public dealer: number = 0;
  public admin: string;
  public options: GameOptions;
  public stage: GameStage = GameStage.PreFlop;
  public roundId: number = 0;
  public roundDbId: number = -1;

  public bettingPlayer: number = 0;
  public currentBet: number = 0;
  public bets: Bet[] = [];
  public stageFinished: boolean = true;

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

    this.dbId = (
      db
        .prepare(`INSERT INTO game (start_time) VALUES (?) RETURNING id`)
        .get(Date.now()) as { id: number }
    ).id;
  }

  getPublicState() {
    return {
      state: this.state,
      communityCards: this.communityCards,
      pot: this.pot,
      dealer: this.dealer,
      admin: this.admin,
      players: this.players.map((p) => {
        return {
          ...p,
          hand: null,
        };
      }),
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

    return player;
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

  approveJoin(playerId: string): Player {
    const player = this.addPlayer(this.requestedSeats[playerId]!);
    delete this.requestedSeats[playerId];

    const dbOperations = db.transaction(() => {
      db.prepare(
        `
        INSERT OR IGNORE INTO user_game (user_id, game_id)
        VALUES (?, ?)
      `,
      ).run(player.id, this.dbId);

      db.prepare(
        `
        INSERT INTO user_buy_in (user_id, game_id, buy_in_number, amount, timestamp, joined_round)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      ).run(player.id, this.dbId, 1, player.stack, Date.now(), this.roundId);
    });

    try {
      dbOperations();
      return player;
    } catch (err) {
      console.error("Failed to approve join in database: ", err);
      throw new Error("Database error: Could not process buy-in");
    }
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
      io.to(`player-${p.id}`).emit("evaluatedHand", {
        message: "Evaluated Hand",
        result: h,
      });
    }
  }

  nextBet() {
    const n = this.players.length;
    let next = this.bettingPlayer;

    for (let i = 0; i < n; i++) {
      next = (this.bettingPlayer + 1) % n;
      const bet = this.bets[next]!;
      if (bet.type != "fold" && !bet.allIn) {
        this.bettingPlayer = next;
        return;
      }
    }

    throw new Error("No eligible players left to bet");
  }

  emitBets() {
    io.to(`game-${this.id}`).emit("betsUpdated", {
      pot: this.pot,
      bet: this.currentBet,
      bets: this.bets,
      players: this.players,
      bettingPlayer: this.players[this.bettingPlayer]!.id,
    });
  }

  bet(value: number, blind: boolean = false) {
    const stack = this.players[this.bettingPlayer]!.stack;
    const bet = Math.min(value, stack);
    const prevBet = this.bets[this.bettingPlayer]!.value;
    const diff = bet - prevBet;

    this.bets[this.bettingPlayer] = {
      // Whether to count as an action or not.
      // used to determine when the round is over
      player: this.players[this.bettingPlayer]!.id,
      type: blind ? "none" : "bet",
      value: bet,
      allIn: stack <= value,
    };

    const player = this.players[this.bettingPlayer]!;
    this.currentBet = Math.max(this.currentBet, bet);
    player.stack -= diff;
    this.pot += diff;
    this.emitBets();
  }

  blinds() {
    this.bet(this.options.smallBlind, true);
    this.nextBet();
    this.bet(this.options.bigBlind, true);
    this.nextBet();
  }

  betting() {
    if (this.stage == GameStage.PreFlop) {
      this.bets = Array.from({ length: this.players.length }, (_, i) => {
        return {
          player: this.players[i]!.id,
          type: "none",
          value: 0,
          allIn: false,
        };
      });
    } else {
      for (let i = 0; i < this.bets.length; i++) {
        const prevBet = this.bets[i]!;
        this.bets[i]!.type = prevBet.type == "fold" ? "fold" : "none";
        this.bets[i]!.value = 0;
      }
    }
    this.currentBet = 0;
    this.bettingPlayer = this.dealer;
    this.nextBet();
    this.emitBets();
  }

  advertiseBet() {
    const bettingPlayer = this.players[this.bettingPlayer];
    if (!bettingPlayer) throw new Error("Betting player not found");
    io.to(`player-${bettingPlayer.id}`).emit("bet", {
      bet: true,
      currentBet: this.currentBet,
    });
  }

  endBet() {
    const bettingPlayer = this.players[this.bettingPlayer];
    if (!bettingPlayer) throw new Error("Betting player not found");
    io.to(`player-${bettingPlayer.id}`).emit("bet", {
      bet: false,
    });
    if (
      this.bets.every(
        ({ type, value, allIn }) =>
          type == "fold" ||
          (type == "bet" && value == this.currentBet) ||
          allIn,
      )
    ) {
      this.finishRound();
      return;
    }
    this.nextBet();
    this.advertiseBet();
  }

  receiveResponse({
    action,
    bet,
  }: {
    action: string;
    bet: number | undefined;
  }) {
    const bettingPlayer = this.players[this.bettingPlayer];
    if (!bettingPlayer) throw new Error("Betting player not found");

    const prevBet = this.bets[this.bettingPlayer]!;

    switch (action) {
      case "fold":
        this.bets[this.bettingPlayer]!.type = "fold";
        this.endBet();
        break;
      case "check":
        if (prevBet.value < this.currentBet)
          throw new Error("Bet is too low, cannot check.");
        this.bet(this.currentBet);
        this.endBet();
        break;
      case "call":
        this.bet(this.currentBet);
        this.endBet();
        break;
      case "raise":
        if (!bet) throw new Error("Invalid bet");
        if (bet <= this.currentBet) throw new Error("Raise too low");
        // Shouldn't actually be necessary because the == currentBet check above
        // for (let i = 0; i < this.bets.length; i++) {
        //   this.bets[i]!.type = "none"; // Give everyone else another turn
        // }
        this.bet(bet);
        this.endBet();
        break;
    }
    this.emitBets();
  }

  finishRound() {
    let playersLeft = 0;
    for (const b of this.bets) {
      if (b.type != "fold" && !b.allIn) {
        playersLeft++;
      }
    }

    for (let i = 0; i < this.bets.length; i++) {
      const player = this.players[i]!;
      const bet = this.bets[i]!;
      player.totalCommited += bet.value;
    }

    if (playersLeft >= 2 && this.stage <= GameStage.River) {
      this.stageFinished = true;
      this.advance();
      return;
    }

    const bestHands = this.players.map((p) =>
      bestHand(p.hand!, this.communityCards),
    );

    const activePlayers = this.players
      .map((player, i) => ({
        playerIdx: i,
        player,
        bet: this.bets[i]!,
        handResult: bestHands[i]!,
        remainingToClaim: player.totalCommited,
      }))
      .filter((p) => p.bet.type != "fold");

    // Sort by hand strength descending
    activePlayers.sort((a, b) =>
      b.handResult.bestHand.compare(a.handResult.bestHand),
    );

    const remainingInPot = this.players.map((p) => p.totalCommited);
    const totalPayouts: Record<string, number> = {};

    let i = 0;
    while (i < activePlayers.length) {
      let j = i;
      while (
        j < activePlayers.length &&
        activePlayers[i]!.handResult.bestHand.compare(
          activePlayers[j]!.handResult.bestHand,
        ) == 0
      ) {
        j++;
      }

      let currentWinners = activePlayers.slice(i, j);

      while (currentWinners.length > 0) {
        // Sort by bet ascending
        currentWinners.sort((a, b) => a.remainingToClaim - b.remainingToClaim);

        const smallestWinnerClaim = currentWinners[0]!.remainingToClaim;
        if (smallestWinnerClaim <= 0) {
          currentWinners.shift();
          continue;
        }

        let potSlice = 0;
        for (let k = 0; k < remainingInPot.length; k++) {
          const take = Math.min(remainingInPot[k]!, smallestWinnerClaim);
          potSlice += take;
          remainingInPot[k]! -= take;
        }

        const share = Math.floor(potSlice / currentWinners.length);
        let remainder = potSlice % currentWinners.length;

        for (const winner of currentWinners) {
          const extra = remainder > 0 ? 1 : 0;
          totalPayouts[winner.player.id] =
            (totalPayouts[winner.player.id] || 0) + share + extra;
          remainder--;
          winner.remainingToClaim -= smallestWinnerClaim;
        }

        currentWinners = currentWinners.filter((w) => w.remainingToClaim > 0);
      }

      i = j;
    }

    const winners = activePlayers
      .filter((p) => totalPayouts[p.player.id]! > 0)
      .map((p) => ({
        playerIdx: p.playerIdx,
        player: p.player.id,
        handResult: p.handResult,
        bet: p.bet,
        won: totalPayouts[p.player.id] || 0,
      }));

    const dbOperations = db.transaction(() => {
      const communityCards = this.communityCards
        .map((c) => rankNames[c.rank]! + suitNames[c.suit]!)
        .join(" ");

      const roundDbId = (
        db
          .prepare(
            `
        INSERT INTO game_round (game_id, timestamp, community_cards, pot, game_stage)
        VALUES (?, ?, ?, ?, ?)
        RETURNING id
      `,
          )
          .get(this.dbId, Date.now(), communityCards, this.pot, this.stage) as {
          id: string;
        }
      ).id;

      for (const [i, p] of this.players.entries()) {
        const cards = p
          .hand!.map((c) => rankNames[c.rank]! + suitNames[c.suit]!)
          .join(" ");

        db.prepare(
          `
            INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed)
            VALUES (?, ?, ?, ?, ?, ?)
          `,
        ).run(
          roundDbId,
          p.id,
          cards,
          bestHands[i]!.bestHand.type,
          this.bets[i]!.type,
          p.totalCommited,
        );
      }

      for (const w of winners) {
        db.prepare(
          `
          INSERT INTO round_winner (round_id, user_id, amount_won)
          VALUES (?, ?, ?)
        `,
        ).run(roundDbId, w.player, w.won);
      }
    });

    try {
      dbOperations();

      for (const winner of winners) {
        this.players[winner.playerIdx]!.stack += winner.won;
      }
    } catch (err) {
      console.error("Failed to end round: ", err);
      throw new Error("Database error: Could not end round");
    }

    io.to(`game-${this.id}`).emit("roundFinished", {
      roundId: this.roundId,
      winners,
    });

    this.stage = GameStage.PreFlop;
    this.stageFinished = true;
    this.emitBets();
    // this.advance(); // Admin manually starts next round
  }

  advance() {
    if (!this.stageFinished) return;
    this.stageFinished = false;
    switch (this.stage) {
      case GameStage.PreFlop:
        this.roundId++;
        this.pot = 0;
        this.currentBet = 0;
        this.players.forEach((p) => (p.totalCommited = 0));
        this.communityCards = [];
        this.initDeck();
        this.shuffleDeck();
        this.dealHoleCards();

        for (const p of this.players) {
          io.to(`player-${p.id}`).emit("newHand", {
            message: "Dealt Hand",
            hand: p.hand,
          });
        }
        io.to(`game-${this.id}`).emit("communityCards", {
          message: "New Round",
          cards: this.communityCards,
        });
        // blinds, betting round
        this.betting();
        this.blinds();
        this.advertiseBet();
        this.stage = GameStage.Flop;
        break;
      case GameStage.Flop:
        this.drawCard(); // Burn card
        this.dealCard(); // Deal flop
        this.dealCard();
        this.dealCard();
        io.to(`game-${this.id}`).emit("communityCards", {
          message: "Dealt Flop",
          cards: this.communityCards,
        });
        this.evaluateHands();
        // betting round
        this.betting();
        this.advertiseBet();
        this.stage = GameStage.Turn;
        break;
      case GameStage.Turn:
        this.drawCard(); // Burn card
        this.dealCard(); // Deal turn
        io.to(`game-${this.id}`).emit("communityCards", {
          message: "Dealt Turn",
          cards: this.communityCards,
        });
        this.evaluateHands();
        this.betting();
        this.advertiseBet();
        // betting round
        this.stage = GameStage.River;
        break;
      case GameStage.River:
        this.drawCard(); // Burn card
        this.dealCard(); // Deal river
        io.to(`game-${this.id}`).emit("communityCards", {
          message: "Dealt River",
          cards: this.communityCards,
        });
        this.evaluateHands();
        this.betting();
        this.advertiseBet();
        // final betting round, finish round etc
        this.dealer =
          (this.dealer - 1 + this.players.length) % this.players.length;
        this.stage = GameStage.Showdown;
        break;
    }
  }

  endGame() {
    if (this.stage != GameStage.PreFlop) return;
    db.prepare(`UPDATE game SET end_time = ? WHERE id = ?`).run(
      Date.now(),
      this.dbId,
    );
  }
}
