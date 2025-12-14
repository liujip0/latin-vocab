import type { Noun } from "./nouns.js";

export const PartsOfSpeech = ["noun"] as const;
export type PartOfSpeech = (typeof PartsOfSpeech)[number];

export type Word = Noun & { part_of_speech: "noun" };
