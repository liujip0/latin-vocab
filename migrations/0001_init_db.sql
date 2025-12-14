-- Migration number: 0001 	 2025-12-10T13:00:47.261Z
CREATE TABLE IF NOT EXISTS Users (
  username TEXT PRIMARY KEY NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Settings (
  username TEXT PRIMARY KEY NOT NULL,
  dark_mode BOOLEAN DEFAULT FALSE,
  macrons BOOLEAN DEFAULT TRUE,
  nouns BOOLEAN DEFAULT TRUE,
  min_chapter INTEGER,
  max_chapter INTEGER,
  min_alphabet TEXT,
  max_alphabet TEXT,
  latin_to_english BOOLEAN DEFAULT TRUE,
  english_to_latin BOOLEAN DEFAULT TRUE,
  noun_genders BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (username) REFERENCES Users (username) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Nouns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom_sg TEXT NOT NULL,
  gen_sg TEXT NOT NULL,
  other_forms TEXT,
  english_translation TEXT NOT NULL,
  declension TEXT NOT NULL CHECK (
    declension IN ('1', '2', '3', '4', '5', 'irregular')
  ),
  gender TEXT NOT NULl CHECK (gender IN ('masculine', 'feminine', 'neuter')),
  chapter INTEGER
);