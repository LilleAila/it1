import crypto from "crypto";
import { Game } from "./game";

export class PokerServer {
  private games: Map<string, Game> = new Map();

  constructor() {}

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
