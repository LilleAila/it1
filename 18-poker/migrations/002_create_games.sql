CREATE TABLE game (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rounds INTEGER NOT NULL DEFAULT 0,
  start_time INTEGER NOT NULL,
  end_time INTEGER
);

CREATE TABLE user_game (
  user_id INTEGER NOT NULL,
  game_id INTEGER NOT NULL,
  PRIMARY KEY (user_id, game_id),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES game (id) ON DELETE CASCADE
);

CREATE TABLE user_buy_in (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  game_id INTEGER NOT NULL,
  buy_in_number INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  timestamp INTEGER,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (game_id) REFERENCES game (id) ON DELETE CASCADE
);

CREATE TABLE game_round (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  timestamp INTEGER NOT NULL,
  community_cards TEXT,
  pot INTEGER DEFAULT 0,
  hand_type TEXT,
  FOREIGN KEY (game_id) REFERENCES game (id) ON DELETE CASCADE
);

CREATE TABLE user_round (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  round_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  cards TEXT,
  hand_type TEXT,
  final_action TEXT,
  contributed INTEGER DEFAULT 0,
  FOREIGN KEY (round_id) REFERENCES game_round (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE round_winner (
  round_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  amount_won INTEGER NOT NULL,
  PRIMARY KEY (round_id, user_id),
  FOREIGN KEY (round_id) REFERENCES game_round (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
