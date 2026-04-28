-- Leaderboard
SELECT
  u.id,
  u.username,
  SUM(IFNULL(rw.amount_won, 0) - ur.contributed) AS net_profit
FROM users u
JOIN user_round ur ON u.id = ur.user_id
LEFT JOIN round_winner rw ON ur.round_id = rw.round_id AND ur.user_id = rw.user_id
GROUP BY u.id
ORDER BY net_profit DESC;
