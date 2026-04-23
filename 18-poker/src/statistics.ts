import { app } from "./server";
import { db } from "./db";

export function initStats() {
  app.get("/api/leaderboard", (_req, res) => {
    try {
      const query = /* sql */ `
        SELECT 
          u.id, 
          u.username,
          (COALESCE(winnings.total_won, 0) - COALESCE(investments.total_invested, 0)) AS net_profit
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
        ) AS investments ON u.id = investments.user_id
        ORDER BY net_profit DESC;
      `;

      const leaderboard = db.query(query).all();
      res.json(leaderboard);
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });
}
