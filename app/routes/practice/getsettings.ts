import { data, type RouterContextProvider } from "react-router";
import { cloudflareContext, userContext } from "~/context/context.js";
import type { Setting } from "~/types/settings.js";

export default async function getSettings(
  context: Readonly<RouterContextProvider>
) {
  if (!context.get(userContext)) {
    return data(null, { status: 401 });
  }

  const settings = await context
    .get(cloudflareContext)
    .env.DB.prepare(
      `SELECT
        username,
        dark_mode, macrons,
        adjectives,
        adverbs,
        conjunctions,
        interjections,
        nouns,
        phrases,
        prepositions,
        pronouns,
        verbs,
        min_chapter, max_chapter,
        min_alphabet, max_alphabet,
        latin_to_english, english_to_latin, noun_genders
      FROM Settings
      WHERE username = ?
      LIMIT 1;`
    )
    .bind(context.get(userContext)!.username)
    .run<Setting>();

  return data(
    {
      username: settings.results[0].username,
      dark_mode: !!settings.results[0].dark_mode,
      macrons: !!settings.results[0].macrons,
      adjectives: !!settings.results[0].adjectives,
      adverbs: !!settings.results[0].adverbs,
      conjunctions: !!settings.results[0].conjunctions,
      interjections: !!settings.results[0].interjections,
      nouns: !!settings.results[0].nouns,
      phrases: !!settings.results[0].phrases,
      prepositions: !!settings.results[0].prepositions,
      pronouns: !!settings.results[0].pronouns,
      verbs: !!settings.results[0].verbs,
      min_chapter: settings.results[0].min_chapter,
      max_chapter: settings.results[0].max_chapter,
      min_alphabet: settings.results[0].min_alphabet,
      max_alphabet: settings.results[0].max_alphabet,
      latin_to_english: !!settings.results[0].latin_to_english,
      english_to_latin: !!settings.results[0].english_to_latin,
      noun_genders: !!settings.results[0].noun_genders,
    },
    { status: 200 }
  );
}
