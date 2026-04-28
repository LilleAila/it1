SELECT
  u.username,
  ur.user_id,

  SUM(ur.contributed) AS total_contributed,
  SUM(IFNULL(rw.amount_won, 0)) AS total_won,
  SUM(IFNULL(rw.amount_won, 0) - ur.contributed) AS net_profit,

  AVG(ur.contributed) AS avg_contribution,
  (CAST(SUM(CASE WHEN ur.final_action = 'fold' THEN 1 ELSE 0 END) AS FLOAT) / COUNT(ur.id)) * 100 AS fold_percentage,
  (CAST(SUM(CASE WHEN ur.contributed > 0 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(ur.id)) * 100 AS vpip_percentage,

  (SELECT SUM(amount) FROM user_buy_in WHERE user_id == ur.user_id AND game_id = 4) AS total_invested
FROM user_round ur
JOIN users u ON u.id = ur.user_id
JOIN game_round gr ON ur.round_id = gr.id
LEFT JOIN round_winner rw ON rw.round_id = ur.round_id AND rw.user_id = ur.user_id
WHERE gr.game_id = 4
GROUP BY ur.user_id;
