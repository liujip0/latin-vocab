import type { NounGender } from "~/types/nouns.js";

export function genderAbbrev(gender: NounGender): string {
  switch (gender) {
    case "masculine":
      return "m.";
    case "feminine":
      return "f.";
    case "neuter":
      return "n.";
  }
}

export function genderUnabbrev(abbrev: string): NounGender | string {
  switch (abbrev) {
    case "m.":
    case "m":
    case "masculine":
      return "masculine";
    case "f.":
    case "f":
    case "feminine":
      return "feminine";
    case "n.":
    case "n":
    case "neuter":
      return "neuter";
    default:
      return abbrev;
  }
}
