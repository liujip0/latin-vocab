import { RouterContextProvider, data } from "react-router";
import { cloudflareContext, settingsContext } from "~/context/context.js";
import { MaxQueryRows } from "~/types/settings.js";
import removeMacrons from "~/util/removemacrons.js";

export default async function getWords<T>(
  partOfSpeech:
    | "adverbs"
    | "conjunctions"
    | "enclitics"
    | "interjections"
    | "phrases",
  context: Readonly<RouterContextProvider>
) {
  const tableName =
    partOfSpeech.charAt(0).toUpperCase() + partOfSpeech.slice(1);
  const words = await context
    .get(cloudflareContext)
    .env.DB.prepare(
      `SELECT
        id,
        latin_form,
        english_translation,
        chapter
       FROM ${tableName}
       WHERE chapter BETWEEN ? AND ?
       ORDER BY RANDOM()
       LIMIT ?;`
    )
    .bind(
      context.get(settingsContext)!.min_chapter,
      context.get(settingsContext)!.max_chapter,
      MaxQueryRows
    )
    .run<T>();

  if (!words.success) {
    return data(
      {
        success: false as const,
        errorMessage: `Failed to load ${partOfSpeech}.`,
      },
      { status: 500 }
    );
  }

  const wordList = words.results.filter(
    (word) =>
      removeMacrons((word as any).latin_form[0]).toUpperCase() >=
        context.get(settingsContext)!.min_alphabet &&
      removeMacrons((word as any).latin_form[0]).toUpperCase() <=
        context.get(settingsContext)!.max_alphabet
  );

  return data(
    {
      success: true as const,
      words: wordList.map((word) => ({
        ...word,
        part_of_speech: {
          adverbs: "adverb",
          conjunctions: "conjunction",
          enclitics: "enclitic",
          interjections: "interjection",
          phrases: "phrase",
        }[partOfSpeech] as
          | "adverb"
          | "conjunction"
          | "enclitic"
          | "interjection"
          | "phrase",
      })),
    },
    { status: 200 }
  );
}
