-- ==============================================================================
-- 0. Cleanup Previous Test Runs
-- ==============================================================================
PRAGMA foreign_keys = ON;

DELETE FROM round_winner WHERE round_id >= 3;
DELETE FROM user_round WHERE round_id >= 3;
DELETE FROM game_round WHERE id >= 3;
DELETE FROM user_buy_in WHERE game_id >= 2;
DELETE FROM user_game WHERE game_id >= 2;
DELETE FROM game WHERE id >= 2;

-- ==============================================================================
-- 1. Insert 5 Games (IDs 2 to 6)
-- Each game will have 4 rounds recorded.
-- ==============================================================================
INSERT INTO game (id, rounds, start_time, end_time) VALUES
(2, 4, 1776850000000, 1776850500000),
(3, 4, 1776851000000, 1776851500000),
(4, 4, 1776852000000, 1776852500000),
(5, 4, 1776853000000, 1776853500000),
(6, 4, 1776854000000, 1776854500000);

-- ==============================================================================
-- 2. Link Users to Games & Give Buy-ins
-- Olai (4), Jo (7), and Bob (1) play all 5 games. Buy-in is 50,000 to cover bets.
-- ==============================================================================
INSERT INTO user_game (user_id, game_id) VALUES
(4, 2), (7, 2), (1, 2),
(4, 3), (7, 3), (1, 3),
(4, 4), (7, 4), (1, 4),
(4, 5), (7, 5), (1, 5),
(4, 6), (7, 6), (1, 6);

INSERT INTO user_buy_in (user_id, game_id, buy_in_number, amount, timestamp, joined_round)
SELECT user_id, game_id, 1, 50000, 1776850000100, 0 
FROM user_game WHERE game_id >= 2;

-- ==============================================================================
-- 3. Game Rounds (4 rounds per game = 20 rounds total)
-- Pot sizes exactly equal the total contributed by all players in step 4.
-- ==============================================================================
WITH RECURSIVE
  game_ids(gid) AS (SELECT 2 UNION ALL SELECT gid + 1 FROM game_ids WHERE gid < 6),
  round_seq(seq, stg, pt, cards) AS (
    SELECT 1, 4, 2000, 'c2 d4 h6 s8 c10' UNION ALL
    SELECT 2, 4, 4500, 'hA cA d7 s2 c3' UNION ALL
    SELECT 3, 4, 10000, 'sK dQ cJ s10 h5' UNION ALL
    SELECT 4, 4, 40000, 'h9 h8 h7 h6 d2'
  )
INSERT INTO game_round (id, game_id, timestamp, community_cards, pot, game_stage)
SELECT 
  ((gid - 2) * 4) + seq + 2, 
  gid, 
  1776850000000 + (gid * 1000000) + (seq * 100000), 
  cards, 
  pt, 
  stg
FROM game_ids CROSS JOIN round_seq ORDER BY gid, seq;

-- ==============================================================================
-- 4. User Actions Per Round (Contributions)
-- Olai and Jo match each other's bets. Bob only plays slightly in round 2.
-- ==============================================================================
INSERT INTO user_round (round_id, user_id, cards, hand_type, final_action, contributed)
SELECT r.id, ug.user_id, 
  -- Assign hands
  CASE 
    WHEN ug.user_id = 4 THEN 'sA s2' 
    WHEN ug.user_id = 7 THEN 'h7 d2' 
    ELSE 'c2 d4' 
  END,
  -- Assign generic hand strengths
  CASE WHEN ug.user_id = 4 THEN '8' ELSE '0' END,
  -- Assign Actions
  CASE 
    WHEN ug.user_id = 4 THEN 'call' 
    WHEN ug.user_id = 7 THEN 'raise' 
    ELSE 'fold' 
  END,
  -- Assign Contributions precisely mapped to sequence
  CASE 
    WHEN (r.id - 3) % 4 = 0 THEN CASE WHEN ug.user_id IN (4, 7) THEN 1000 ELSE 0 END
    WHEN (r.id - 3) % 4 = 1 THEN CASE WHEN ug.user_id IN (4, 7) THEN 2000 ELSE 500 END
    WHEN (r.id - 3) % 4 = 2 THEN CASE WHEN ug.user_id IN (4, 7) THEN 5000 ELSE 0 END
    WHEN (r.id - 3) % 4 = 3 THEN CASE WHEN ug.user_id IN (4, 7) THEN 20000 ELSE 0 END
  END
FROM game_round r JOIN user_game ug ON r.game_id = ug.game_id;

-- ==============================================================================
-- 5. Assign Winners (Olai takes 100% of the pot every time)
-- ==============================================================================
INSERT INTO round_winner (round_id, user_id, amount_won)
SELECT id, 4, pot FROM game_round WHERE id >= 3;
