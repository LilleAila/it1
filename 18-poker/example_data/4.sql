-- Simulation: The Downfall of Jo Bjørnar (ID 7)
-- We assume users 1-6 already exist. 

---
-- STEP 1: THE BUY-INS
-- Jo Bjørnar starts with confidence but keeps topping up.
---
INSERT INTO user_buy_in (user_id, game_id, buy_in_number, amount, timestamp) VALUES 
(7, 30, 1, 1000, 1777400000000),
(7, 30, 2, 2000, 1777405000000),
(7, 31, 1, 2000, 1777410000000); 
-- Total Invested by ID 7: 5000

---
-- SESSION 3: The Bad Beat (Game ID 30)
---
INSERT INTO game (id, rounds, start_time, end_time) VALUES (30, 3, 1777400000000, 1777408000000);
INSERT INTO user_game (user_id, game_id) VALUES (1, 30), (7, 30);

-- Round 1: Jo Bjørnar loses a massive pot with a Flush vs Full House
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) 
VALUES (40, 30, 1777400100000, 'Ah Kh 2h 2s Jd', 2000, 4);

INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES 
(100, 7, 'Qh Th', 'Flush', 'bet', 1000), 
(101, 1, 'As Ad', 'Full House', 'bet', 1000);

INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (40, 1, 2000);

-- Round 2: Jo Bjørnar bluffs and folds after heavy investment
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) 
VALUES (41, 30, 1777400200000, '2c 7d 9h Jh 5s', 1500, 4);

INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES 
(102, 7, '3s 4s', 'High Card', 'fold', 750), 
(103, 1, 'Jc 2d', 'Two Pair', 'bet', 750);

INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (41, 1, 1500);

---
-- SESSION 4: Tilt Mode (Game ID 31)
---
INSERT INTO game (id, rounds, start_time, end_time) VALUES (31, 1, 1777410000000, 1777412000000);
INSERT INTO user_game (user_id, game_id) VALUES (2, 31), (7, 31);

-- Round 1: The "Cooler". Jo Bjørnar gets Quads but loses to a Straight Flush
-- This is statistically rare but perfect for a massive leaderboard drop.
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) 
VALUES (42, 31, 1777410100000, '9s Ts Js Jc Jh', 4000, 4);

INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES 
(104, 7, 'Js Jd', 'Four of a Kind', 'bet', 2000), 
(105, 2, 'Qs 8s', 'Straight Flush', 'bet', 2000);

INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (42, 2, 4000);

---
-- SUMMARY OF JO BJØRNAR (ID 7)
-- Total Won: 0
-- Total Invested: 5000 (3 Buy-ins)
-- Net Winnings: -5000
---

-- Update sequences to prevent primary key collisions
UPDATE sqlite_sequence SET seq = 31 WHERE name = 'game';
UPDATE sqlite_sequence SET seq = 42 WHERE name = 'game_round';
UPDATE sqlite_sequence SET seq = 105 WHERE name = 'user_round';
UPDATE sqlite_sequence SET seq = 3 WHERE name = 'user_buy_in';
