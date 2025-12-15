export type Preposition = {
  id: number;
  latin_form: string;
  object_case: PrepositionObjectCase;
  english_translation: string;
  chapter: number;
};

export const PrepositionObjectCase = ["accusative", "ablative"] as const;
export type PrepositionObjectCase = (typeof PrepositionObjectCase)[number];
