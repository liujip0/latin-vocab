import { RouterContextProvider, data } from "react-router";
import { cloudflareContext, settingsContext } from "~/context/context.js";
import type { Noun } from "~/types/nouns.js";
import { MaxQueryRows } from "~/types/settings.js";
import removeMacrons from "~/util/removemacrons.js";

export default async function getNouns(
  context: Readonly<RouterContextProvider>
) {
  const nouns = await context
    .get(cloudflareContext)
    .env.DB.prepare(
      `SELECT
        id,
        nom_sg,
        gen_sg,
        other_forms,
        english_translation,
        declension,
        gender,
        chapter
       FROM Nouns
       WHERE chapter BETWEEN ? AND ?
       ORDER BY RANDOM()
       LIMIT ?;`
    )
    .bind(
      context.get(settingsContext)!.min_chapter,
      context.get(settingsContext)!.max_chapter,
      MaxQueryRows
    )
    .run<Noun>();

  if (!nouns.success) {
    return data(
      { success: false as const, errorMessage: "Failed to load nouns." },
      { status: 500 }
    );
  }

  const nounList = nouns.results.filter(
    (noun) =>
      removeMacrons(noun.nom_sg[0]).toUpperCase() >=
        context.get(settingsContext)!.min_alphabet &&
      removeMacrons(noun.nom_sg[0]).toUpperCase() <=
        context.get(settingsContext)!.max_alphabet
  );

  return data(
    {
      success: true as const,
      words: nounList.map((noun) => ({
        ...noun,
        part_of_speech: "noun" as const,
      })),
    },
    { status: 200 }
  );
}
