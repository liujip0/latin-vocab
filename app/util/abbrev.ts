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
