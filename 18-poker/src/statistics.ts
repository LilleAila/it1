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
          -- Use Buy-ins for the 'Spent' side to match the Summary query logic
          (COALESCE(winnings.total_won, 0) - COALESCE(buyins.total_invested, 0)) AS net_profit
        FROM users u
        LEFT JOIN (
          SELECT user_id, SUM(amount_won) AS total_won 
          FROM round_winner 
          GROUP BY user_id
        ) AS winnings ON u.id = winnings.user_id
        LEFT JOIN (
          SELECT user_id, SUM(amount) AS total_invested 
          FROM user_buy_in 
          GROUP BY user_id
        ) AS buyins ON u.id = buyins.user_id
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
              u.username,
              u.created_at,
              
              -- [Existing Participation Stats]
              (SELECT COUNT(*) FROM user_game WHERE user_id = :user_id) AS games_played,
              (SELECT COUNT(*) FROM user_round WHERE user_id = :user_id) AS total_rounds,
              
              -- [Existing Financial Stats]
              COALESCE(bi.total_invested, 0) AS total_invested,
              COALESCE(rw.total_won, 0) AS total_won,
              (COALESCE(rw.total_won, 0) - COALESCE(bi.total_invested, 0)) AS net_profit,
              COALESCE(rw.biggest_single_win, 0) AS biggest_win,

              -- 1. Average Contribution per Round
              -- (How much they put in the pot on average when they are dealt in)
              (SELECT AVG(contributed) FROM user_round WHERE user_id = :user_id) AS avg_contribution,

              -- 2. Fold Rate
              -- (Percentage of rounds where their final action was 'fold')
              CASE 
                  WHEN (SELECT COUNT(*) FROM user_round WHERE user_id = :user_id) > 0 
                  THEN (CAST((SELECT COUNT(*) FROM user_round WHERE user_id = :user_id AND final_action = 'fold') AS FLOAT) / 
                        (SELECT COUNT(*) FROM user_round WHERE user_id = :user_id)) * 100 
                  ELSE 0 
              END AS fold_percentage,

              -- 3. Showdown Win Rate
              -- (Wins / Rounds where they did NOT fold)
              CASE 
                  WHEN (SELECT COUNT(*) FROM user_round WHERE user_id = :user_id AND final_action != 'fold') > 0 
                  THEN (CAST(COALESCE(rw.win_count, 0) AS FLOAT) / 
                        (SELECT COUNT(*) FROM user_round WHERE user_id = :user_id AND final_action != 'fold')) * 100 
                  ELSE 0 
              END AS showdown_win_percentage,

              -- [Existing Performance Metrics]
              CASE 
                  WHEN COALESCE(bi.buy_in_count, 0) > 0 
                  THEN CAST(COALESCE(bi.total_invested, 0) AS FLOAT) / bi.buy_in_count 
                  ELSE 0 
              END AS avg_buy_in_amount,
              
              CASE 
                  WHEN (SELECT COUNT(*) FROM user_round WHERE user_id = :user_id) > 0 
                  THEN (CAST((SELECT COUNT(*) FROM user_round WHERE user_id = :user_id AND contributed > 0) AS FLOAT) / 
                        (SELECT COUNT(*) FROM user_round WHERE user_id = :user_id)) * 100 
                  ELSE 0 
              END AS vpip_percentage

          FROM users u
          LEFT JOIN (
              SELECT 
                  user_id, 
                  SUM(amount) AS total_invested,
                  COUNT(id) AS buy_in_count
              FROM user_buy_in
              WHERE user_id = :user_id
              GROUP BY user_id
          ) bi ON u.id = bi.user_id
          LEFT JOIN (
              SELECT 
                  user_id, 
                  SUM(amount_won) AS total_won,
                  MAX(amount_won) AS biggest_single_win,
                  COUNT(round_id) AS win_count
              FROM round_winner
              WHERE user_id = :user_id
              GROUP BY user_id
          ) rw ON u.id = rw.user_id
          WHERE u.id = :user_id;
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
              
              -- Calculate Duration (Returns seconds if ended, NULL if active)
              CASE 
                  WHEN g.end_time IS NOT NULL THEN (g.end_time - g.start_time) / 1000 
                  ELSE NULL 
              END AS duration_seconds,

              -- Round Statistics
              (SELECT COUNT(*) FROM game_round WHERE game_id = :game_id) AS total_rounds_played,
              
              -- Pot Dynamics
              (SELECT MAX(pot) FROM game_round WHERE game_id = :game_id) AS largest_pot_of_game,
              (SELECT AVG(pot) FROM game_round WHERE game_id = :game_id) AS average_pot_size,
              (SELECT SUM(pot) FROM game_round WHERE game_id = :game_id) AS total_amount_wagered,

              -- Buy-in Statistics (Economic Volume)
              (SELECT COUNT(*) FROM user_buy_in WHERE game_id = :game_id) AS total_buy_in_count,
              (SELECT SUM(amount) FROM user_buy_in WHERE game_id = :game_id) AS total_liquidity_in_game,
              
              -- Participation Metrics
              (SELECT COUNT(*) FROM user_game WHERE game_id = :game_id) AS total_unique_players

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
    u.id AS user_id,

    -- 1. Participation Stats
    COUNT(DISTINCT ur.round_id) AS total_rounds,

    -- 2. Financial Stats
    COALESCE(bi.total_invested, 0) AS total_invested,
    COALESCE(rw.total_won, 0) AS total_won,
    (COALESCE(rw.total_won, 0) - COALESCE(bi.total_invested, 0)) AS net_profit,
    COALESCE(rw.biggest_single_win, 0) AS biggest_win,

    -- 3. Style Metrics (Aggregated over all rounds in this game)
    AVG(ur.contributed) AS avg_contribution,

    -- Fold Rate: (Rounds where player folded / Total rounds played in this game)
    (CAST(SUM(CASE WHEN ur.final_action = 'fold' THEN 1 ELSE 0 END) AS FLOAT) / 
     COUNT(ur.id)) * 100 AS fold_percentage,

    -- Showdown Win Rate: (Wins / Rounds where player did not fold)
    CASE 
        WHEN SUM(CASE WHEN ur.final_action != 'fold' THEN 1 ELSE 0 END) > 0 
        THEN (CAST(COALESCE(rw.win_count, 0) AS FLOAT) / 
              SUM(CASE WHEN ur.final_action != 'fold' THEN 1 ELSE 0 END)) * 100 
        ELSE 0 
    END AS showdown_win_percentage,

    -- VPIP: (Rounds where contributed > 0 / Total rounds played in this game)
    (CAST(SUM(CASE WHEN ur.contributed > 0 THEN 1 ELSE 0 END) AS FLOAT) / 
     COUNT(ur.id)) * 100 AS vpip_percentage

FROM users u
-- Only include users who were actually in this specific game
JOIN user_game ug ON u.id = ug.user_id AND ug.game_id = :game_id
-- Join through game_round to get the specific session's rounds
JOIN game_round gr ON gr.game_id = :game_id
JOIN user_round ur ON (ur.user_id = u.id AND ur.round_id = gr.id)

-- Aggregate Buy-ins for this game
LEFT JOIN (
    SELECT 
        user_id, 
        SUM(amount) AS total_invested
    FROM user_buy_in
    WHERE game_id = :game_id
    GROUP BY user_id
) bi ON u.id = bi.user_id

-- Aggregate Wins for this game
LEFT JOIN (
    SELECT 
        rw.user_id, 
        SUM(rw.amount_won) AS total_won,
        MAX(rw.amount_won) AS biggest_single_win,
        COUNT(rw.round_id) AS win_count
    FROM round_winner rw
    JOIN game_round gr_inner ON rw.round_id = gr_inner.id
    WHERE gr_inner.game_id = :game_id
    GROUP BY rw.user_id
) rw ON u.id = rw.user_id

GROUP BY u.id
ORDER BY net_profit DESC;
          `,
        )
        .all({ ":game_id": id });

      const rounds = db
        .query(
          `
            SELECT 
                -- Calculate the Round Number based on its chronological order in this game
                DENSE_RANK() OVER (ORDER BY gr.timestamp ASC) AS round_number,
                u.username AS winner_name,
                u.id AS winner_id,
                rw.amount_won,
                ur.cards AS winning_hand,
                ur.hand_type AS winning_hand_rank,
                gr.community_cards,
                gr.pot AS total_pot,
                gr.timestamp
            FROM round_winner rw
            -- Join with game_round to filter by game_id and get the round's timing
            JOIN game_round gr ON rw.round_id = gr.id
            -- Join with users to get the winner's name
            JOIN users u ON rw.user_id = u.id
            -- Join with user_round to find exactly what cards this winner was holding
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
