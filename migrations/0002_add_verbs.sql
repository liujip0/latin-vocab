-- Migration number: 0002 	 2025-12-14T19:59:31.592Z
CREATE TABLE IF NOT EXISTS Verbs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_sg_pres_act_ind TEXT NOT NULL,
  pres_act_inf TEXT NOT NULL,
  first_sg_prf_act_ind TEXT NOT NULL,
  prf_pass_ptcp TEXT NOT NULL,
  other_forms TEXT,
  english_translation TEXT NOT NULL,
  conjugation TEXT NOT NULL CHECK (
    conjugation IN ('1', '2', '3', '3io', '4', 'irregular')
  ),
  chapter INTEGER
);

ALTER TABLE Settings
ADD COLUMN verbs BOOLEAN DEFAULT TRUE;