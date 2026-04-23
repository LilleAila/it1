import crypto from "crypto";
import path from "path";
import { Game } from "./game";
import { Player } from "./game";
import type { GameOptions } from "./game";
import { app, io } from "./server";
import { authenticate } from "./auth";

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

export function initPokerServer() {
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

  app.get("/game/:id", authenticate, (req, res) => {
    const { id } = req.params;
    if (!id || typeof id != "string")
      return res.status(404).json({ error: "Invalid ID" });
    const game = pokerServer.getGame(id);
    if (!game) {
      return res.status(404).send("Game not found");
    }
    res.sendFile(path.join(__dirname, "..", "/public/game/index.html"));
  });

  // Websockets / socket.io
  io.on("connection", (socket) => {
    console.log("User connected:", socket.data.user.id);

    socket.on("advanceGame", ({ gameId }) => {
      const game = pokerServer.getGame(gameId);
      if (!game) return;

      if (socket.data.user.id != game.admin) return;

      game.advance();
    });

    socket.on("endGame", ({ gameId }) => {
      const game = pokerServer.getGame(gameId);
      if (!game) return;

      if (socket.data.user.id != game.admin) return;

      game.endGame();
    });

    socket.on("updateOptions", ({ gameId, options }) => {
      const game = pokerServer.getGame(gameId);
      if (!game) return;

      if (socket.data.user.id != game.admin) return;

      game.options = options as GameOptions;

      io.to(`game-${gameId}`).emit("gameOptions", {
        message: "Options Changed",
        options: game.getOptions(),
      });
    });

    socket.on("joinRequest", ({ gameId, stack }) => {
      const game = pokerServer.getGame(gameId);
      if (!game) return;

      const player = new Player(
        socket.data.user.id,
        socket.data.user.username,
        stack,
      );

      if (!game.hasPlayer(socket.data.user.id)) {
        if (game.nPlayers() < 1) {
          game.addPlayer(player);

          game.requestJoin(player);
          game.approveJoin(player.id);

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

          io.to(`game-${gameId}`).emit("playerJoined", {
            message: "Player Joined",
            player: player,
          });
        } else {
          if (game.requestJoin(player)) {
            io.to(`player-${game.admin}`).emit("joinRequest", {
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

      if (socket.data.user.id != game.admin) return;

      if (approved) {
        const player = game.approveJoin(playerId);

        io.to(`player-${player.id}`).emit("playerState", {
          message: "Joined Game",
          joined: true,
          admin: false,
          player: player,
        });

        io.to(`player-${player.id}`).emit("gameOptions", {
          message: "Options Changed",
          options: game.getOptions(),
        });

        io.to(`game-${gameId}`).emit("playerJoined", {
          message: "Player Joined",
          player: player,
        });
      } else {
        game.declineJoin(playerId);

        io.to(`player-${playerId}`).emit("playerState", {
          message: "Seat Declined",
          joined: false,
          admin: false,
        });
      }
    });

    socket.on("leaveGame", ({ gameId }) => {
      const game = pokerServer.getGame(gameId);
      if (!game) return;

      const playerId = socket.data.user.id;

      if (game.hasPlayer(playerId)) {
        const newAdmin = game.removePlayer(playerId);

        io.to(`game-${gameId}`).emit("playerLeft", {
          message: "Player Left",
          playerId,
        });

        socket.emit("playerState", {
          message: "Left game",
          joined: false,
          admin: false,
          player: {},
        });

        if (newAdmin) {
          io.to(`player-${newAdmin.id}`).emit("playerState", {
            message: "Assigned as admin",
            joined: true,
            admin: true,
            player: newAdmin,
          });
        }
      }
    });

    socket.on("betResponse", (r) => {
      const { gameId } = socket.data;
      if (!gameId) return;
      const game = pokerServer.getGame(gameId);
      if (!game) return;

      try {
        game.receiveResponse(r);
      } catch (err) {
        return; // Just ignore invalid bets
      }
    });

    socket.on("disconnect", () => {
      const { gameId } = socket.data;

      if (gameId) {
        const game = pokerServer.getGame(gameId);
        if (!game) return;

        const playerId = socket.data.user.id;

        console.log(`User ${playerId} disconnected from game ${gameId}`);
        const newAdmin = game.removePlayer(playerId);

        io.to(`game-${gameId}`).emit("playerLeft", {
          message: "Player Left",
          playerId,
        });

        if (newAdmin) {
          io.to(`player-${newAdmin.id}`).emit("playerState", {
            message: "Assigned as admin",
            joined: true,
            admin: true,
            player: newAdmin,
          });
        }
      }
    });
  });

  app.post("/api/games/:gameId/join", authenticate, (req, res) => {
    const { gameId } = req.params;
    const { socketId } = req.body;

    if (!gameId || typeof gameId != "string")
      return res.status(404).json({ error: "Invalid game id" });

    const game = pokerServer.getGame(gameId);
    if (!game) return res.status(404).json({ error: "Game not found" });

    const socket = io.sockets.sockets.get(socketId);
    if (!socket) return res.status(404).json({ error: "Socket not found" });

    const httpUser = (req as any).user;
    if (socket.data.user.id !== httpUser.id) {
      return res.status(403).json({ error: "Identity mismatch" });
    }

    socket.data.gameId = gameId;
    socket.join(`game-${gameId}`);
    socket.join(`player-${socket.data.user.id}`);

    return res.status(200).json({
      success: true,
      gameState: game.getPublicState(),
      user: socket.data.user,
    });
  });
}
