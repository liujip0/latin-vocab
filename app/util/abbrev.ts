import type { AdjectiveDeclension } from "~/types/adjectives.js";
import type { NounGender } from "~/types/nouns.js";
import type { PrepositionObjectCase } from "~/types/prepositions.js";

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
      return "masculine";
    case "f.":
    case "f":
      return "feminine";
    case "n.":
    case "n":
      return "neuter";
    default:
      return abbrev;
  }
}

export function adjDeclensionUnabbrev(
  abbrev: string
): AdjectiveDeclension | string {
  switch (abbrev) {
    case "1st/2nd":
    case "1":
      return "1/2";
    case "3rd 1-ending":
    case "31":
      return "3-1ending";
    case "3rd 2-ending":
    case "32":
      return "3-2ending";
    case "3rd 3-ending":
    case "33":
      return "3-3ending";
    default:
      return abbrev;
  }
}

export function oopAbbrev(oop: PrepositionObjectCase): string {
  switch (oop) {
    case "accusative":
      return "ACC";
    case "ablative":
      return "ABL";
  }
}

export function oopUnabbrev(abbrev: string): PrepositionObjectCase | string {
  switch (abbrev) {
    case "ACC":
    case "acc":
    case "Acc":
      return "accusative";
    case "ABL":
    case "abl":
    case "Abl":
      return "ablative";
    default:
      return abbrev;
  }
}
