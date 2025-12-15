import { RouterContextProvider, data } from "react-router";
import { cloudflareContext, settingsContext } from "~/context/context.js";
import type { Pronoun } from "~/types/pronoun.js";
import { MaxQueryRows } from "~/types/settings.js";
import removeMacrons from "~/util/removemacrons.js";

export default async function getPronouns(
  context: Readonly<RouterContextProvider>
) {
  const pronouns = await context
    .get(cloudflareContext)
    .env.DB.prepare(
      `SELECT
        id,
        latin_form,
        pn_type,
        pn_gender,
        pn_person,
        pn_number,
        pn_case,
        chapter
       FROM Pronouns
       WHERE chapter BETWEEN ? AND ?
       ORDER BY RANDOM()
       LIMIT ?;`
    )
    .bind(
      context.get(settingsContext)!.min_chapter,
      context.get(settingsContext)!.max_chapter,
      MaxQueryRows
    )
    .run<Pronoun>();

  if (!pronouns.success) {
    return data(
      { success: false as const, errorMessage: "Failed to load pronouns." },
      { status: 500 }
    );
  }

  const pronounList = pronouns.results.filter(
    (pronoun) =>
      removeMacrons(pronoun.latin_form[0]).toUpperCase() >=
        context.get(settingsContext)!.min_alphabet &&
      removeMacrons(pronoun.latin_form[0]).toUpperCase() <=
        context.get(settingsContext)!.max_alphabet
  );

  return data(
    {
      success: true as const,
      words: pronounList.map((adjective) => ({
        ...adjective,
        part_of_speech: "pronoun" as const,
      })),
    },
    { status: 200 }
  );
}
