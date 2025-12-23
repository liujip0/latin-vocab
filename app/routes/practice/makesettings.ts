import type { RouterContextProvider } from "react-router";
import { cloudflareContext } from "~/context/context.js";
import { DefaultSettings } from "~/types/settings.js";

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
        adjectives,
        adverbs,
        conjunctions,
        enclitics,
        interjections,
        nouns,
        phrases,
        prepositions,
        pronouns,
        verbs,
        min_chapter, max_chapter,
        min_alphabet, max_alphabet,
        latin_to_english, english_to_latin, noun_genders)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
    )
    .bind(
      username,
      DefaultSettings.dark_mode,
      DefaultSettings.macrons,
      DefaultSettings.adjectives,
      DefaultSettings.adverbs,
      DefaultSettings.conjunctions,
      DefaultSettings.enclitics,
      DefaultSettings.interjections,
      DefaultSettings.nouns,
      DefaultSettings.phrases,
      DefaultSettings.prepositions,
      DefaultSettings.pronouns,
      DefaultSettings.verbs,
      DefaultSettings.min_chapter,
      DefaultSettings.max_chapter,
      DefaultSettings.min_alphabet,
      DefaultSettings.max_alphabet,
      DefaultSettings.latin_to_english,
      DefaultSettings.english_to_latin,
      DefaultSettings.noun_genders
    )
    .run();
}
