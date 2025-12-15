export type Setting = {
  username: string;
  dark_mode: boolean;
  macrons: boolean;
  adjectives: boolean;
  adverbs: boolean;
  conjunctions: boolean;
  interjections: boolean;
  nouns: boolean;
  phrases: boolean;
  prepositions: boolean;
  pronouns: boolean;
  verbs: boolean;
  min_chapter: number;
  max_chapter: number;
  min_alphabet: AlphabetLetter;
  max_alphabet: AlphabetLetter;
  latin_to_english: boolean;
  english_to_latin: boolean;
  noun_genders: boolean;
};

export const MinChapter = 1;
export const MaxChapter = 20;
export const MaxQueryRows = 50;

export const QuestionTypes = [
  "latin_to_english",
  "english_to_latin",
  "noun_genders",
] as const;

export const AlphabetLetter = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
] as const;
export type AlphabetLetter = (typeof AlphabetLetter)[number];
