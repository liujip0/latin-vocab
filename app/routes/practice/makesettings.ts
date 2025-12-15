import type { RouterContextProvider } from "react-router";
import { cloudflareContext } from "~/context/context.js";
import {
  MaxChapter,
  MinChapter,
  type AlphabetLetter,
  type Setting,
} from "~/types/settings.js";

export default async function makeSettings(
  username: string,
  context: Readonly<RouterContextProvider>
) {
  const defaultSettings: Setting = {
    username: username,
    dark_mode: false,
    macrons: true,
    adjectives: true,
    adverbs: true,
    conjunctions: true,
    interjections: true,
    nouns: true,
    phrases: true,
    prepositions: true,
    pronouns: true,
    verbs: true,
    min_chapter: MinChapter,
    max_chapter: MaxChapter,
    min_alphabet: "A",
    max_alphabet: "Z",
    latin_to_english: true,
    english_to_latin: true,
    noun_genders: true,
  };

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
        interjections,
        nouns,
        phrases,
        prepositions,
        pronouns,
        verbs,
        min_chapter, max_chapter,
        min_alphabet, max_alphabet,
        latin_to_english, english_to_latin, noun_genders)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
    )
    .bind(
      username, // username
      false, // dark_mode
      true, // macrons
      true, // adjectives
      true, // adverbs
      true, // conjunctions
      true, // interjections
      true, // nouns
      true, // phrases
      true, // prepositions
      true, // pronouns
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
