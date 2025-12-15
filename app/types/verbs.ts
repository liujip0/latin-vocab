export type Verb = {
  id: number;
  first_sg_pres_act_ind: string;
  pres_act_inf: string;
  first_sg_prf_act_ind: string;
  prf_pass_ptcp: string;
  other_forms?: string;
  english_translation: string;
  conjugation: VerbConjugation;
  chapter: number;
};

export const VerbConjugation = [
  "1",
  "2",
  "3",
  "3io",
  "4",
  "irregular",
] as const;
export type VerbConjugation = (typeof VerbConjugation)[number];
