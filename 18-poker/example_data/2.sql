-- Poker Database Simulation: Games 11-20
-- Hand Types: 0: HighCard, 1: OnePair, 2: TwoPair, 3: ThreeOfAKind, 4: Straight, 5: Flush, 6: FullHouse...

-- GAME 11: Ildenh (User 5) vs Olai (User 4) - Battle of the Blinds
INSERT INTO game (id, rounds, start_time, end_time) VALUES (18, 1, 1777200000000, 1777200100000);
INSERT INTO user_game (user_id, game_id) VALUES (5, 18), (4, 18);
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (20, 18, 1777200050000, 'Ah Kc 4d 9s 3h', 400, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (41, 5, 'Ad 5d', 1, 'bet', 200), (42, 4, 'Kh Qd', 1, 'bet', 200);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (20, 5, 400);

-- GAME 12: Big Multi-way Pot - Didriksn (User 6) wins with a Straight
INSERT INTO game (id, rounds, start_time, end_time) VALUES (19, 1, 1777210000000, 1777210100000);
INSERT INTO user_game (user_id, game_id) VALUES (6, 19), (7, 19), (1, 19), (2, 19);
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (21, 19, 1777210050000, '7h 8c 9d Tc 2s', 2000, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (43, 6, 'Jh Qd', 4, 'bet', 500), (44, 7, '6s 5d', 4, 'bet', 500), (45, 1, 'Th Ts', 3, 'bet', 500), (46, 2, 'Ad Kd', 0, 'fold', 500);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (21, 6, 2000);

-- GAME 13: User 3 hits a Flush on the River
INSERT INTO game (id, rounds, start_time, end_time) VALUES (20, 1, 1777220000000, 1777220100000);
INSERT INTO user_game (user_id, game_id) VALUES (3, 20), (5, 20);
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (22, 20, 1777220050000, '2c 7c Jc 9s Ac', 1200, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (47, 3, 'Kc Qc', 5, 'bet', 600), (48, 5, 'As Ad', 3, 'bet', 600);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (22, 3, 1200);

-- GAME 14: Jo Bjørnar (User 7) Slowplays Full House
INSERT INTO game (id, rounds, start_time, end_time) VALUES (21, 1, 1777230000000, 1777230100000);
INSERT INTO user_game (user_id, game_id) VALUES (7, 21), (6, 21);
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (23, 21, 1777230050000, 'Ks Kd 4h 4s 4c', 800, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (49, 7, 'Kh 2d', 6, 'bet', 400), (50, 6, 'As Qc', 3, 'bet', 400);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (23, 7, 800);

-- GAME 15: Pure Bluff - User 2 folds to User 1
INSERT INTO game (id, rounds, start_time, end_time) VALUES (22, 1, 1777240000000, 1777240100000);
INSERT INTO user_game (user_id, game_id) VALUES (1, 22), (2, 22);
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (24, 22, 1777240050000, '3d 6h 9s Kh 2c', 500, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (51, 1, '7s 8s', 0, 'bet', 350), (52, 2, '5c 5d', 1, 'fold', 150);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (24, 1, 500);

-- GAME 16: Set over Set - User 4 (Olai) vs User 3
INSERT INTO game (id, rounds, start_time, end_time) VALUES (23, 1, 1777250000000, 1777250100000);
INSERT INTO user_game (user_id, game_id) VALUES (4, 23), (3, 23);
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (25, 23, 1777250050000, 'Js 2d 7h Tc Ad', 3000, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (53, 4, 'Jc Jh', 3, 'bet', 1500), (54, 3, '2s 2c', 3, 'bet', 1500);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (25, 4, 3000);

-- GAME 17: User 5 wins with Two Pair
INSERT INTO game (id, rounds, start_time, end_time) VALUES (24, 1, 1777260000000, 1777260100000);
INSERT INTO user_game (user_id, game_id) VALUES (5, 24), (1, 24);
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (26, 24, 1777260050000, 'Ts 4c 2h 8d Ah', 700, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (55, 5, 'Tc 4d', 2, 'bet', 350), (56, 1, 'As 5h', 1, 'bet', 350);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (26, 5, 700);

-- GAME 18: Four of a Kind - Didriksn (User 6) destroys User 7
INSERT INTO game (id, rounds, start_time, end_time) VALUES (25, 1, 1777270000000, 1777270100000);
INSERT INTO user_game (user_id, game_id) VALUES (6, 25), (7, 25);
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (27, 25, 1777270050000, '9h 9s 9c 2d 5h', 2400, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (57, 6, '9d Ad', 7, 'bet', 1200), (58, 7, 'Kh Kc', 6, 'bet', 1200);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (27, 6, 2400);

-- GAME 19: High Card Ace wins a small pot
INSERT INTO game (id, rounds, start_time, end_time) VALUES (26, 1, 1777280000000, 1777280100000);
INSERT INTO user_game (user_id, game_id) VALUES (2, 26), (4, 26);
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (28, 26, 1777280050000, '2h 5d 7s 9c Jh', 300, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (59, 2, 'Ac 3c', 0, 'bet', 150), (60, 4, 'Ts 8s', 0, 'bet', 150);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (28, 2, 300);

-- GAME 20: Broadway Straight - User 1 vs User 3
INSERT INTO game (id, rounds, start_time, end_time) VALUES (27, 1, 1777290000000, 1777290100000);
INSERT INTO user_game (user_id, game_id) VALUES (1, 27), (3, 27);
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (29, 27, 1777290050000, 'Tc Jd Qh 4s Ah', 1800, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (61, 1, 'Kd Kc', 4, 'bet', 900), (62, 3, 'As Qd', 2, 'bet', 900);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (29, 1, 1800);

-- Finalize sequence counts
UPDATE sqlite_sequence SET seq = 27 WHERE name = 'game';
UPDATE sqlite_sequence SET seq = 29 WHERE name = 'game_round';
UPDATE sqlite_sequence SET seq = 62 WHERE name = 'user_round';
UPDATE sqlite_sequence SET seq = 35 WHERE name = 'user_buy_in';
