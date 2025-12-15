-- Migration number: 0003 	 2025-12-15T08:44:42.314Z
CREATE TABLE IF NOT EXISTS Adjectives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  latin_form1 TEXT NOT NULL,
  latin_form2 TEXT NOT NULL,
  latin_form3 TEXT,
  english_translation TEXT NOT NULL,
  declension TEXT NOT NULL CHECK (
    declension IN (
      '1/2',
      '3-1ending',
      '3-2ending',
      '3-3ending',
      'irregular'
    )
  ),
  chapter INTEGER
);

CREATE TABLE IF NOT EXISTS Adverbs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  latin_form TEXT NOT NULL,
  english_translation TEXT NOT NULL,
  chapter INTEGER
);

CREATE TABLE IF NOT EXISTS Conjunctions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  latin_form TEXT NOT NULL,
  english_translation TEXT NOT NULL,
  chapter INTEGER
);

CREATE TABLE IF NOT EXISTS Interjections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  latin_form TEXT NOT NULL,
  english_translation TEXT NOT NULL,
  chapter INTEGER
);

CREATE TABLE IF NOT EXISTS Phrases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  latin_form TEXT NOT NULL,
  english_translation TEXT NOT NULL,
  chapter INTEGER
);

CREATE TABLE IF NOT EXISTS Prepositions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  latin_form TEXT NOT NULL,
  object_case TEXT NOT NULL CHECK (object_case IN ('accusative', 'ablative')),
  english_translation TEXT NOT NULL,
  chapter INTEGER
);

CREATE TABLE IF NOT EXISTS Pronouns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  latin_form TEXT NOT NULL,
  pn_type TEXT NOT NULL CHECK (
    pn_type IN (
      'personal',
      'demonstrative',
      'relative',
      'interrogative',
      'reflexive'
    )
  ),
  pn_gender TEXT NOT NULL CHECK (
    pn_gender IN ('masculine', 'feminine', 'neuter', 'N/A')
  ),
  pn_person TEXT NOT NULL CHECK (pn_person IN ('1st', '2nd', '3rd', 'N/A')),
  pn_number TEXT NOT NULL CHECK (pn_number IN ('singular', 'plural')),
  pn_case TEXT NOT NULL CHECK (
    pn_case IN (
      'nominative',
      'genitive',
      'dative',
      'accusative',
      'ablative'
    )
  ),
  chapter INTEGER
);

ALTER TABLE Settings
ADD COLUMN adjectives BOOLEAN DEFAULT TRUE;

ALTER TABLE Settings
ADD COLUMN adverbs BOOLEAN DEFAULT TRUE;

ALTER TABLE Settings
ADD COLUMN conjunctions BOOLEAN DEFAULT TRUE;

ALTER TABLE Settings
ADD COLUMN interjections BOOLEAN DEFAULT TRUE;

ALTER TABLE Settings
ADD COLUMN phrases BOOLEAN DEFAULT TRUE;

ALTER TABLE Settings
ADD COLUMN prepositions BOOLEAN DEFAULT TRUE;

ALTER TABLE Settings
ADD COLUMN pronouns BOOLEAN DEFAULT TRUE;