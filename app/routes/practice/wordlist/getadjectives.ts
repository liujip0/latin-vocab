import { RouterContextProvider, data } from "react-router";
import { cloudflareContext, settingsContext } from "~/context/context.js";
import type { Adjective } from "~/types/adjectives.js";
import { MaxQueryRows } from "~/types/settings.js";
import removeMacrons from "~/util/removemacrons.js";

export default async function getAdjectives(
  context: Readonly<RouterContextProvider>
) {
  const adjectives = await context
    .get(cloudflareContext)
    .env.DB.prepare(
      `SELECT
        id,
        latin_form1,
        latin_form2,
        latin_form3,
        english_translation,
        declension,
        chapter
       FROM Adjectives
       WHERE chapter BETWEEN ? AND ?
       ORDER BY RANDOM()
       LIMIT ?;`
    )
    .bind(
      context.get(settingsContext)!.min_chapter,
      context.get(settingsContext)!.max_chapter,
      MaxQueryRows
    )
    .run<Adjective>();

  if (!adjectives.success) {
    return data(
      { success: false as const, errorMessage: "Failed to load adjectives." },
      { status: 500 }
    );
  }

  const adjectiveList = adjectives.results.filter(
    (adjective) =>
      removeMacrons(adjective.latin_form1[0]).toUpperCase() >=
        context.get(settingsContext)!.min_alphabet &&
      removeMacrons(adjective.latin_form1[0]).toUpperCase() <=
        context.get(settingsContext)!.max_alphabet
  );

  return data(
    {
      success: true as const,
      words: adjectiveList.map((adjective) => ({
        ...adjective,
        part_of_speech: "adjective" as const,
      })),
    },
    { status: 200 }
  );
}
