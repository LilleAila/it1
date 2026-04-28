import path from "path";
import { app } from "./server";
import { db } from "./db";

export function initStats() {
  app.get("/api/leaderboard", (_req, res) => {
    try {
      const query = `
        SELECT
          u.id,
          u.username,
          SUM(IFNULL(rw.amount_won, 0) - ur.contributed) AS net_profit
        FROM users u
        JOIN user_round ur ON u.id = ur.user_id
        LEFT JOIN round_winner rw ON ur.round_id = rw.round_id AND ur.user_id = rw.user_id
        GROUP BY u.id
        ORDER BY net_profit DESC;
      `;

      const leaderboard = db.query(query).all();
      res.json(leaderboard);
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.get("/user/:id", (req, res) => {
    const { id } = req.params;
    if (!id || typeof id != "string")
      return res.status(404).json({ error: "Invalid ID" });
    res.sendFile(path.join(__dirname, "..", "/public/user/index.html"));
  });

  app.get("/api/user/:id", (req, res) => {
    const { id } = req.params;
    if (!id || typeof id != "string")
      return res.status(404).json({ error: "Invalid ID" });

    try {
      const summary = db
        .query(
          `
            SELECT
              u.id AS user_id,
              u.username,
              u.created_at,

              (SELECT COUNT(*) FROM user_game WHERE user_id = u.id) AS games_played,
              COUNT(ur.id) AS total_rounds,

              (SELECT IFNULL(SUM(amount), 0) FROM user_buy_in WHERE user_id = u.id) AS total_invested,
              SUM(IFNULL(rw.amount_won, 0) - ur.contributed) AS net_profit,
              MAX(IFNULL(rw.amount_won, 0) - ur.contributed) AS biggest_win,

              AVG(ur.contributed) AS avg_contribution,
              (SELECT IFNULL(AVG(amount), 0) FROM user_buy_in WHERE user_id = u.id) AS avg_buy_in_amount,

              (CAST(SUM(CASE WHEN ur.final_action = 'fold' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(ur.id)) * 100 AS fold_percentage,
              (CAST(SUM(CASE WHEN rw.amount_won > 0 THEN 1 ELSE 0 END) AS FLOAT) / 
                 NULLIF(SUM(CASE WHEN ur.final_action != 'fold' THEN 1 ELSE 0 END), 0)) * 100 AS showdown_win_percentage,
              (CAST(SUM(CASE WHEN ur.contributed > 0 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(ur.id)) * 100 AS vpip_percentage
            FROM users u
            JOIN user_round ur ON u.id = ur.user_id
            LEFT JOIN round_winner rw ON ur.round_id = rw.round_id AND ur.user_id = rw.user_id
            WHERE u.id = :user_id
            GROUP BY u.id;
        `,
        )
        .get({ ":user_id": id });

      const games = db
        .query(
          `
            SELECT
              g.id,
              g.start_time,
              (SELECT COUNT(*) FROM game_round gr WHERE gr.game_id = g.id) AS rounds,
              GROUP_CONCAT(u.username, ', ') AS participants
            FROM game g
            INNER JOIN user_game ug ON g.id = ug.game_id
            INNER JOIN users u ON ug.user_id = u.id
            WHERE g.id IN (SELECT game_id FROM user_game WHERE user_id = :user_id)
            GROUP BY g.id
            ORDER BY g.start_time DESC
          `,
        )
        .all({ ":user_id": id });

      res.json({
        summary,
        games,
      });
    } catch (err) {
      console.error("Database error:", err);
    }
  });

  app.get("/games/:id", (req, res) => {
    const { id } = req.params;
    if (!id || typeof id != "string")
      return res.status(404).json({ error: "Invalid ID" });
    res.sendFile(path.join(__dirname, "..", "/public/games/index.html"));
  });

  app.get("/api/game/:id", (req, res) => {
    const { id } = req.params;
    if (!id || typeof id != "string")
      return res.status(404).json({ error: "Invalid ID" });

    try {
      const summary = db
        .query(
          `
          SELECT 
              g.id AS game_id,
              g.start_time,
              g.end_time,
              
              (SELECT COUNT(*) FROM game_round WHERE game_id = :game_id) AS total_rounds_played,
              (SELECT COUNT(*) FROM user_buy_in WHERE game_id = :game_id) AS total_buy_in_count,
              (SELECT COUNT(*) FROM user_game WHERE game_id = :game_id) AS total_unique_players,
              
              (SELECT MAX(pot) FROM game_round WHERE game_id = :game_id) AS largest_pot_of_game,
              (SELECT AVG(pot) FROM game_round WHERE game_id = :game_id) AS average_pot_size,
              (SELECT SUM(pot) FROM game_round WHERE game_id = :game_id) AS total_amount_wagered,
              (SELECT SUM(amount) FROM user_buy_in WHERE game_id = :game_id) AS total_liquidity_in_game
          FROM game g
          WHERE g.id = :game_id;
        `,
        )
        .get({ ":game_id": id });

      const users = db
        .query(
          `
            SELECT
              u.username,
              ur.user_id,

              SUM(ur.contributed) AS total_contributed,
              SUM(IFNULL(rw.amount_won, 0)) AS total_won,
              SUM(IFNULL(rw.amount_won, 0) - ur.contributed) AS net_profit,

              AVG(ur.contributed) AS avg_contribution,
              (CAST(SUM(CASE WHEN ur.final_action = 'fold' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(ur.id)) * 100 AS fold_percentage,
              (CAST(SUM(CASE WHEN ur.contributed > 0 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(ur.id)) * 100 AS vpip_percentage,

              (SELECT SUM(amount) FROM user_buy_in WHERE user_id == ur.user_id AND game_id = :game_id) AS total_invested
            FROM user_round ur
            JOIN users u ON u.id = ur.user_id
            JOIN game_round gr ON ur.round_id = gr.id
            LEFT JOIN round_winner rw ON rw.round_id = ur.round_id AND rw.user_id = ur.user_id
            WHERE gr.game_id = :game_id
            GROUP BY ur.user_id
            ORDER BY net_profit DESC;
          `,
        )
        .all({ ":game_id": id });

      const rounds = db
        .query(
          `
            SELECT 
                DENSE_RANK() OVER (ORDER BY gr.timestamp ASC) AS round_number,
                u.username AS winner_name,
                u.id AS winner_id,
                rw.amount_won,
                (rw.amount_won - ur.contributed) AS profit,
                ur.cards AS winning_hand,
                ur.hand_type AS winning_hand_rank,
                gr.community_cards,
                gr.pot AS total_pot,
                gr.timestamp
            FROM round_winner rw
            JOIN game_round gr ON rw.round_id = gr.id
            JOIN users u ON rw.user_id = u.id
            JOIN user_round ur ON (rw.round_id = ur.round_id AND rw.user_id = ur.user_id)
            WHERE gr.game_id = :game_id
            ORDER BY gr.timestamp ASC, rw.amount_won DESC;
          `,
        )
        .all({ ":game_id": id });

      res.json({
        summary,
        users,
        rounds,
      });
    } catch (err) {
      console.error("Database error:", err);
    }
  });
}
