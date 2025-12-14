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
        nouns,
        min_chapter, max_chapter,
        min_alphabet, max_alphabet,
        latin_to_english, english_to_latin, noun_genders)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
    )
    .bind(
      username,
      false,
      true,
      true,
      1,
      18,
      "A" as AlphabetLetter,
      "Z" as AlphabetLetter,
      true,
      true,
      true
    )
    .run();
}
