export type Pronoun = {
  id: number;
  latin_form: string;
  pn_type: PronounType;
  pn_gender: PronounGender;
  pn_person: PronounPerson;
  pn_number: PronounNumber;
  pn_case: PronounCase;
  chapter: number;
};

export const PronounType = [
  "personal",
  "demonstrative",
  "relative",
  "interrogative",
  "reflexive",
] as const;
export type PronounType = (typeof PronounType)[number];
export const PronounGender = [
  "masculine",
  "feminine",
  "neuter",
  "N/A",
] as const;
export type PronounGender = (typeof PronounGender)[number];
export const PronounPerson = ["1st", "2nd", "3rd", "N/A"] as const;
export type PronounPerson = (typeof PronounPerson)[number];
export const PronounNumber = ["singular", "plural"] as const;
export type PronounNumber = (typeof PronounNumber)[number];
export const PronounCase = [
  "nominative",
  "genitive",
  "dative",
  "accusative",
  "ablative",
] as const;
export type PronounCase = (typeof PronounCase)[number];
