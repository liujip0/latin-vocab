import type { Adjective } from "./adjectives.js";
import type { Noun } from "./nouns.js";
import type { Preposition } from "./prepositions.js";
import type { Pronoun } from "./pronoun.js";
import type { Verb } from "./verbs.js";

export const PartsOfSpeech = [
  "adjective",
  "adverb",
  "conjunction",
  "enclitic",
  "interjection",
  "noun",
  "phrase",
  "preposition",
  "pronoun",
  "verb",
] as const;
export type PartOfSpeech = (typeof PartsOfSpeech)[number];

export type Word =
  | (Adjective & { part_of_speech: "adjective" })
  | (Adverb & { part_of_speech: "adverb" })
  | (Conjunction & { part_of_speech: "conjunction" })
  | (Enclitic & { part_of_speech: "enclitic" })
  | (Interjection & { part_of_speech: "interjection" })
  | (Noun & { part_of_speech: "noun" })
  | (Phrase & { part_of_speech: "phrase" })
  | (Preposition & { part_of_speech: "preposition" })
  | (Pronoun & { part_of_speech: "pronoun" })
  | (Verb & { part_of_speech: "verb" });

export type Adverb = {
  id: number;
  latin_form: string;
  english_translation: string;
  chapter: number;
};

export type Conjunction = {
  id: number;
  latin_form: string;
  english_translation: string;
  chapter: number;
};

export type Enclitic = {
  id: number;
  latin_form: string;
  english_translation: string;
  chapter: number;
};

export type Interjection = {
  id: number;
  latin_form: string;
  english_translation: string;
  chapter: number;
};

export type Phrase = {
  id: number;
  latin_form: string;
  english_translation: string;
  chapter: number;
};
