import type { RouterContextProvider } from "react-router";
import { cloudflareContext } from "~/context/context.js";
import type { AlphabetLetter } from "~/types/settings.js";

export default async function makeSettings(
  username: string,
  context: Readonly<RouterContextProvider>
) {
  return await context
    .get(cloudflareContext)
    .env.DB.prepare(
      `INSERT INTO Settings
      (username,
        dark_mode,
        macrons,
        nouns, verbs,
        min_chapter, max_chapter,
        min_alphabet, max_alphabet,
        latin_to_english, english_to_latin, noun_genders)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
    )
    .bind(
      username, // username
      false, // dark_mode
      true, // macrons
      true, // nouns
      true, // verbs
      1, // min_chapter
      18, // max_chapter
      "A" as AlphabetLetter, // min_alphabet
      "Z" as AlphabetLetter, // max_alphabet
      true, // latin_to_english
      true, // english_to_latin
      true // noun_genders
    )
    .run();
}
