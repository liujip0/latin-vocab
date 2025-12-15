import { data, type RouterContextProvider } from "react-router";
import { cloudflareContext, settingsContext } from "~/context/context.js";
import { MaxQueryRows } from "~/types/settings.js";
import type { Verb } from "~/types/verbs.js";
import removeMacrons from "~/util/removemacrons.js";

export default async function getVerbs(
  context: Readonly<RouterContextProvider>
) {
  const verbs = await context
    .get(cloudflareContext)
    .env.DB.prepare(
      `SELECT
        id,
        first_sg_pres_act_ind,
        pres_act_inf,
        first_sg_prf_act_ind,
        prf_pass_ptcp,
        other_forms,
        english_translation,
        conjugation,
        chapter
       FROM Verbs
       WHERE chapter BETWEEN ? AND ?
       ORDER BY RANDOM()
       LIMIT ?;`
    )
    .bind(
      context.get(settingsContext)!.min_chapter,
      context.get(settingsContext)!.max_chapter,
      MaxQueryRows
    )
    .run<Verb>();

  if (!verbs.success) {
    return data(
      { success: false as const, errorMessage: "Failed to load verbs." },
      { status: 500 }
    );
  }

  const verbList = verbs.results.filter(
    (verb) =>
      removeMacrons(verb.first_sg_pres_act_ind[0]).toUpperCase() >=
        context.get(settingsContext)!.min_alphabet &&
      removeMacrons(verb.first_sg_pres_act_ind[0]).toUpperCase() <=
        context.get(settingsContext)!.max_alphabet
  );

  return data(
    {
      success: true as const,
      words: verbList.map((verb) => ({
        ...verb,
        part_of_speech: "verb" as const,
      })),
    },
    { status: 200 }
  );
}
