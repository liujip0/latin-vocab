import type { Noun } from "./nouns.js";
import type { Verb } from "./verbs.js";

export const PartsOfSpeech = ["noun"] as const;
export type PartOfSpeech = (typeof PartsOfSpeech)[number];

export type Word =
  | (Noun & { part_of_speech: "noun" })
  | (Verb & { part_of_speech: "verb" });
