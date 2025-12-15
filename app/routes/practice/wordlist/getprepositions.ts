import { RouterContextProvider, data } from "react-router";
import { cloudflareContext, settingsContext } from "~/context/context.js";
import type { Preposition } from "~/types/prepositions.js";
import { MaxQueryRows } from "~/types/settings.js";
import removeMacrons from "~/util/removemacrons.js";

export default async function getPrepositions(
  context: Readonly<RouterContextProvider>
) {
  const prepositions = await context
    .get(cloudflareContext)
    .env.DB.prepare(
      `SELECT
        id,
        latin_form,
        object_case,
        english_translation,
        chapter
       FROM Prepositions
       WHERE chapter BETWEEN ? AND ?
       ORDER BY RANDOM()
       LIMIT ?;`
    )
    .bind(
      context.get(settingsContext)!.min_chapter,
      context.get(settingsContext)!.max_chapter,
      MaxQueryRows
    )
    .run<Preposition>();

  if (!prepositions.success) {
    return data(
      { success: false as const, errorMessage: "Failed to load prepositions." },
      { status: 500 }
    );
  }

  const prepositionList = prepositions.results.filter(
    (preposition) =>
      removeMacrons(preposition.latin_form[0]).toUpperCase() >=
        context.get(settingsContext)!.min_alphabet &&
      removeMacrons(preposition.latin_form[0]).toUpperCase() <=
        context.get(settingsContext)!.max_alphabet
  );

  return data(
    {
      success: true as const,
      words: prepositionList.map((preposition) => ({
        ...preposition,
        part_of_speech: "preposition" as const,
      })),
    },
    { status: 200 }
  );
}
