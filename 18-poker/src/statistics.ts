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
          (COALESCE(winnings.total_won, 0) - COALESCE(spent_in_rounds.total_contributed, 0)) AS net_profit
        FROM users u
        LEFT JOIN (
          SELECT user_id, SUM(amount_won) AS total_won 
          FROM round_winner 
          GROUP BY user_id
        ) AS winnings ON u.id = winnings.user_id
        LEFT JOIN (
          SELECT user_id, SUM(contributed) AS total_contributed 
          FROM user_round 
          GROUP BY user_id
        ) AS spent_in_rounds ON u.id = spent_in_rounds.user_id
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
            u.id, 
            u.username,
            COALESCE(investments.total_buy_in, 0) AS total_invested,
            (COALESCE(investments.total_buy_in, 0) - COALESCE(spent_in_rounds.total_contributed, 0) + COALESCE(winnings.total_won, 0)) AS total_current_stack,
            (COALESCE(winnings.total_won, 0) - COALESCE(spent_in_rounds.total_contributed, 0)) AS net_profit
          FROM users u
          LEFT JOIN (
            SELECT user_id, SUM(amount_won) AS total_won 
            FROM round_winner 
            WHERE user_id = :user_id 
            GROUP BY user_id
          ) AS winnings ON u.id = winnings.user_id
          LEFT JOIN (
            SELECT user_id, SUM(contributed) AS total_contributed 
            FROM user_round 
            WHERE user_id = :user_id 
            GROUP BY user_id
          ) AS spent_in_rounds ON u.id = spent_in_rounds.user_id
          LEFT JOIN (
            SELECT user_id, SUM(amount) AS total_buy_in 
            FROM user_buy_in 
            WHERE user_id = :user_id 
            GROUP BY user_id
          ) AS investments ON u.id = investments.user_id
          WHERE u.id = :user_id;
        `,
        )
        .get({ ":user_id": id });

      // const games = db
      //   .query(
      //     `
      //     `,
      //   )
      //   .all({ $userId: id });

      res.json({
        summary,
        // games,
      });
    } catch (err) {
      console.error("Database error:", err);
    }
  });
}
