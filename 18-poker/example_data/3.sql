-- Poker Database Simulation: Multi-round Sessions
-- Hand Types: 0: HighCard, 1: OnePair, 2: TwoPair, 3: ThreeOfAKind, 4: Straight, 5: Flush, 6: FullHouse...

-- SESSION 1: The "Grind" (Game ID 28) - 5 Rounds with User 1, 2, and 4
INSERT INTO game (id, rounds, start_time, end_time) VALUES (28, 5, 1777300000000, 1777305000000);
INSERT INTO user_game (user_id, game_id) VALUES (1, 28), (2, 28), (4, 28);

-- Round 1: User 4 wins with Two Pair
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (30, 28, 1777300100000, 'Ah 4c 9d 2s Js', 300, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (63, 1, 'Kc Qc', 0, 'bet', 100), (64, 2, '4s 5s', 1, 'bet', 100), (65, 4, 'As 9c', 2, 'bet', 100);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (30, 4, 300);

-- Round 2: User 1 wins with a Straight
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (31, 28, 1777300200000, '5h 6c 7d Kh 2s', 600, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (66, 1, '8s 9s', 4, 'bet', 200), (67, 2, 'Kd Ad', 1, 'bet', 200), (68, 4, '6s 6d', 3, 'fold', 200);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (31, 1, 600);

-- Round 3: User 2 wins with a Flush
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (32, 28, 1777300300000, '2h 8h Th 4c As', 450, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (69, 1, 'Ac Kd', 1, 'bet', 150), (70, 2, 'Jh Qh', 5, 'bet', 150), (71, 4, '9s 9c', 1, 'bet', 150);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (32, 2, 450);

-- Round 4: User 1 wins - Everyone folds on Flop
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (33, 28, 1777300400000, 'As Ad Ah', 150, 1);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (72, 1, 'Ks Kd', 6, 'bet', 100), (73, 2, '2c 7d', 3, 'fold', 25), (74, 4, '3h 8s', 3, 'fold', 25);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (33, 1, 150);

-- Round 5: User 4 wins with Full House
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (34, 28, 1777300500000, 'Tc Ts 2d 2c 2s', 900, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (75, 1, 'As Js', 2, 'bet', 300), (76, 2, 'Qh Qd', 6, 'bet', 300), (77, 4, 'Th Kd', 6, 'bet', 300);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (34, 4, 900);


-- SESSION 2: High Stakes All-Ins (Game ID 29) - 4 Rounds with User 5, 6, and 7
INSERT INTO game (id, rounds, start_time, end_time) VALUES (29, 4, 1777310000000, 1777314000000);
INSERT INTO user_game (user_id, game_id) VALUES (5, 29), (6, 29), (7, 29);

-- Round 1: User 6 wins with Quads
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (35, 29, 1777310100000, '7h 7s 7c 2d Kc', 3000, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (78, 5, 'As 7d', 7, 'bet', 1000), (79, 6, 'Kd Kh', 6, 'bet', 1000), (80, 7, 'Ad Qd', 3, 'bet', 1000);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (35, 5, 3000); -- User 5 actually had the 4th 7

-- Round 2: Split Pot on a Straight Board
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (36, 29, 1777310200000, '3c 4d 5h 6s 7c', 1500, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (81, 5, 'Jh Jd', 4, 'bet', 500), (82, 6, '2s 2c', 4, 'bet', 500), (83, 7, 'As Ks', 4, 'bet', 500);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (36, 5, 500), (36, 6, 500), (36, 7, 500);

-- Round 3: User 7 wins with a Pair of Jacks
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (37, 29, 1777310300000, 'Jc 5d 2h 8s 4c', 600, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (84, 5, 'Ts 9s', 0, 'bet', 200), (85, 6, 'Ah Qd', 0, 'bet', 200), (86, 7, 'Jh 3h', 1, 'bet', 200);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (37, 7, 600);

-- Round 4: User 6 wins with Three of a Kind
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage) VALUES (38, 29, 1777310400000, 'Qh Qc 2d 5s 9h', 1200, 4);
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed) VALUES (87, 5, 'As Ks', 1, 'bet', 400), (88, 6, 'Qs 7s', 3, 'bet', 400), (89, 7, '9d 9c', 2, 'bet', 400);
INSERT INTO round_winner (round_id, user_id, amount_won) VALUES (38, 6, 1200);

-- Update sequences
UPDATE sqlite_sequence SET seq = 29 WHERE name = 'game';
UPDATE sqlite_sequence SET seq = 38 WHERE name = 'game_round';
UPDATE sqlite_sequence SET seq = 89 WHERE name = 'user_round';
