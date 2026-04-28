-- Detailed user info
SELECT
  u.id AS user_id,
  u.username,
  u.created_at,

  (SELECT COUNT(*) FROM user_game WHERE user_id = u.id) AS games_played,
  COUNT(ur.id) AS total_rounds,

  (SELECT IFNULL(SUM(amount), 0) FROM user_buy_in WHERE user_id = u.id) AS total_invested,
  SUM(IFNULL(rw.amount_won, 0)) AS total_won,
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
WHERE u.id = 1
GROUP BY u.id;
