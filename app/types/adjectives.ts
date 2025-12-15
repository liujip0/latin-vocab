export type Adjective = {
  id: number;
  latin_form1: string;
  latin_form2: string;
  latin_form3: string;
  english_translation: string;
  declension: AdjectiveDeclension;
  chapter: number;
};

export const AdjectiveDeclension = [
  "1/2",
  "3-1ending",
  "3-2ending",
  "3-3ending",
  "irregular",
] as const;
export type AdjectiveDeclension = (typeof AdjectiveDeclension)[number];
