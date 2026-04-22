ALTER TABLE user_buy_in
ADD COLUMN joined_round INTEGER DEFAULT 0;

ALTER TABLE game_round
ADD COLUMN end_time INTEGER;
