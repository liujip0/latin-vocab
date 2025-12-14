import z from "zod";

export type Setting = {
  username: string;
  dark_mode: boolean;
  macrons: boolean;
  nouns: boolean;
  min_chapter: number;
  max_chapter: number;
  min_alphabet: AlphabetLetter;
  max_alphabet: AlphabetLetter;
  latin_to_english: boolean;
  english_to_latin: boolean;
  noun_genders: boolean;
};

export const QuestionTypes = [
  "latin_to_english",
  "english_to_latin",
  "noun_genders",
] as const;
export const AlphabetLetter = z.union([
  z.literal("A"),
  z.literal("B"),
  z.literal("C"),
  z.literal("D"),
  z.literal("E"),
  z.literal("F"),
  z.literal("G"),
  z.literal("H"),
  z.literal("I"),
  z.literal("J"),
  z.literal("K"),
  z.literal("L"),
  z.literal("M"),
  z.literal("N"),
  z.literal("O"),
  z.literal("P"),
  z.literal("Q"),
  z.literal("R"),
  z.literal("S"),
  z.literal("T"),
  z.literal("U"),
  z.literal("V"),
  z.literal("W"),
  z.literal("X"),
  z.literal("Y"),
  z.literal("Z"),
]);
export type AlphabetLetter = z.infer<typeof AlphabetLetter>;
