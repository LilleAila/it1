ALTER TABLE game_round
DROP COLUMN hand_type;

ALTER TABLE game_round
ADD COLUMN game_stage INTEGER NOT NULL;
