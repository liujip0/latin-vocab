export type Setting = {
  username: string;
  dark_mode: boolean;
  macrons: boolean;
  adjectives: boolean;
  adverbs: boolean;
  conjunctions: boolean;
  enclitics: boolean;
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
export const Book1MaxChapter = 21;
export const Book2MaxChapter = 2;
export const MaxQueryRows = 50;

export const DefaultSettings: Setting = {
  username: "",
  dark_mode: false,
  macrons: true,
  adjectives: true,
  adverbs: true,
  conjunctions: true,
  enclitics: true,
  interjections: true,
  nouns: true,
  phrases: true,
  prepositions: true,
  pronouns: true,
  verbs: true,
  min_chapter: MinChapter,
  max_chapter: Book2MaxChapter,
  min_alphabet: "A",
  max_alphabet: "Z",
  latin_to_english: true,
  english_to_latin: true,
  noun_genders: true,
};

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
