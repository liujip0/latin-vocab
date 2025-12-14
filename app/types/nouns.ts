export type Noun = {
  id: number;
  nom_sg: string;
  gen_sg: string;
  other_forms?: string;
  english_translation: string;
  declension: NounDeclension;
  gender: NounGender;
  chapter: number;
};

export const NounDeclension = ["1", "2", "3", "4", "5", "irregular"] as const;
export type NounDeclension = (typeof NounDeclension)[number];
export const NounGender = ["masculine", "feminine", "neuter"] as const;
export type NounGender = (typeof NounGender)[number];
