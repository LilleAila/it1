-- Data generated with google gemini: https://gemini.google.com/share/ef8382c5a81d

-- Poker Database Simulation: 10 Games
-- Hand Types: 0: HighCard, 1: OnePair, 2: TwoPair, 3: ThreeOfAKind, 4: Straight, 5: Flush...

-- GAME 1: Heads-up (User 1 vs User 2)
INSERT INTO game (id, rounds, start_time, end_time) VALUES (8, 1, 1777100000000, 1777100100000);
INSERT INTO user_game (user_id, game_id) VALUES (1, 8), (2, 8);
INSERT INTO user_buy_in (user_id, game_id, buy_in_number, amount, timestamp, joined_round) VALUES (1, 8, 1, 1000, 1777100001000, 1), (2, 8, 1, 1000, 1777100002000, 1);
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (10, 8, 1777100050000, '2d 7h Ts Kd Ac', 400, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (19, 1, 'As 3c', 1, 'bet', 200), (20, 2, 'Jh Qh', 0, 'fold', 200);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (10, 1, 400);

-- GAME 2: Three players, Olai (User 4) wins with a Flush
INSERT INTO game (id, rounds, start_time, end_time) VALUES (9, 1, 1777110000000, 1777110100000);
INSERT INTO user_game (user_id, game_id) VALUES (4, 9), (5, 9), (6, 9);
INSERT INTO user_buy_in (user_id, game_id, buy_in_number, amount, timestamp, joined_round) VALUES (4, 9, 1, 500, 1777110001000, 1), (5, 9, 1, 500, 1777110002000, 1), (6, 9, 1, 500, 1777110003000, 1);
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (11, 9, 1777110050000, 'Ah 8h 2h 5c Jh', 900, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (21, 4, 'Kh Qh', 5, 'bet', 300), (22, 5, 'As 8s', 2, 'bet', 300), (23, 6, '2s 2c', 3, 'bet', 300);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (11, 4, 900);

-- GAME 3: Jo Bjørnar (User 7) gets a Straight
INSERT INTO game (id, rounds, start_time, end_time) VALUES (10, 1, 1777120000000, 1777120100000);
INSERT INTO user_game (user_id, game_id) VALUES (7, 10), (3, 10);
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (12, 10, 1777120050000, '4h 5d 6s Tc Jd', 600, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (24, 7, '2c 3s', 4, 'bet', 300), (25, 3, 'Jh Js', 3, 'bet', 300);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (12, 7, 600);

-- GAME 4: Full House vs Flush (User 2 wins)
INSERT INTO game (id, rounds, start_time, end_time) VALUES (11, 1, 1777130000000, 1777130100000);
INSERT INTO user_game (user_id, game_id) VALUES (2, 11), (1, 11);
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (13, 11, 1777130050000, '9c 9h 2d 2c Ad', 1200, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (26, 2, '9s Ah', 6, 'bet', 600), (27, 1, '2h 5h', 6, 'bet', 600);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (13, 2, 1200);

-- GAME 5: Didriksn (User 6) wins with Two Pair
INSERT INTO game (id, rounds, start_time, end_time) VALUES (12, 1, 1777140000000, 1777140100000);
INSERT INTO user_game (user_id, game_id) VALUES (6, 12), (5, 12);
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (14, 12, 1777140050000, 'Kc 3h 8d 4s 2h', 300, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (28, 6, 'Ks 3s', 2, 'bet', 150), (29, 5, 'Ac 8c', 1, 'bet', 150);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (14, 6, 300);

-- GAME 6: High Card win (User 3)
INSERT INTO game (id, rounds, start_time, end_time) VALUES (13, 1, 1777150000000, 1777150100000);
INSERT INTO user_game (user_id, game_id) VALUES (3, 13), (4, 13);
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (15, 13, 1777150050000, '2s 4h 6d 8c Jt', 200, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (30, 3, 'As Qh', 0, 'bet', 100), (31, 4, 'Kh Qd', 0, 'bet', 100);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (15, 3, 200);

-- GAME 7: Quads! (User 5)
INSERT INTO game (id, rounds, start_time, end_time) VALUES (14, 1, 1777160000000, 1777160100000);
INSERT INTO user_game (user_id, game_id) VALUES (5, 14), (1, 14);
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (16, 14, 1777160050000, 'Qc Qh Qs 4d 7h', 2000, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (32, 5, 'Qd Ad', 7, 'bet', 1000), (33, 1, 'As Ks', 3, 'bet', 1000);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (16, 5, 2000);

-- GAME 8: Split Pot (User 2 and User 7)
INSERT INTO game (id, rounds, start_time, end_time) VALUES (15, 1, 1777170000000, 1777170100000);
INSERT INTO user_game (user_id, game_id) VALUES (2, 15), (7, 15);
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (17, 15, 1777170050000, 'Ah Kh Qh Jh Th', 1000, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (34, 2, '2c 2d', 9, 'bet', 500), (35, 7, '3c 3d', 9, 'bet', 500);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (17, 2, 500), (17, 7, 500);

-- GAME 9: Straight Flush (User 4)
INSERT INTO game (id, rounds, start_time, end_time) VALUES (16, 1, 1777180000000, 1777180100000);
INSERT INTO user_game (user_id, game_id) VALUES (4, 16), (6, 16);
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (18, 16, 1777180050000, '4s 5s 6s 2d Ac', 1500, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (36, 4, '2s 3s', 8, 'bet', 750), (37, 6, 'Ah Ad', 3, 'bet', 750);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (18, 4, 1500);

-- GAME 10: Three of a Kind (User 1)
INSERT INTO game (id, rounds, start_time, end_time) VALUES (17, 1, 1777190000000, 1777190100000);
INSERT INTO user_game (user_id, game_id) VALUES (1, 17), (2, 17), (3, 17);
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (19, 17, 1777190050000, '8h 8s 2c 4d Jc', 600, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (38, 1, '8c Qd', 3, 'bet', 200), (39, 2, 'Ah Kc', 0, 'bet', 200), (40, 3, '4h 4s', 2, 'bet', 200);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (19, 1, 600);

-- Update sequences to reflect new totals
UPDATE sqlite_sequence SET seq = 17 WHERE name = 'game';
UPDATE sqlite_sequence SET seq = 19 WHERE name = 'game_round';
UPDATE sqlite_sequence SET seq = 40 WHERE name = 'user_round';
UPDATE sqlite_sequence SET seq = 15 WHERE name = 'user_buy_in';
