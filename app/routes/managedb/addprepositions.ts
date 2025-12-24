import Papa from "papaparse";
import {
  data,
  UNSAFE_DataWithResponseInit,
  type RouterContextProvider,
} from "react-router";
import { cloudflareContext } from "~/context/context.js";
import type { Preposition } from "~/types/prepositions.js";
import { oopUnabbrev } from "~/util/abbrev.js";
import text from "../../vocablists/prepositions.csv?raw";

export default async function addPrepositions(
  context: Readonly<RouterContextProvider>
): Promise<
  UNSAFE_DataWithResponseInit<{ success: boolean; errorMessage?: string }>
> {
  return await new Promise((resolve) => {
    Papa.parse<Omit<Preposition, "id">>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
      complete: async (results) => {
        const deleteVerbs = context
          .get(cloudflareContext)
          .env.DB.prepare(`DELETE FROM Prepositions;`);
        await deleteVerbs.run();

        const insertVerbs = context.get(cloudflareContext).env.DB.prepare(
          `INSERT INTO Prepositions
          (latin_form,
            object_case,
            english_translation,
            chapter)
          VALUES (?, ?, ?, ?);`
        );

        const boundQueries = results.data.map((preposition) =>
          insertVerbs.bind(
            preposition.latin_form,
            oopUnabbrev(preposition.object_case),
            preposition.english_translation,
            preposition.chapter
          )
        );

        const queryResult = await context
          .get(cloudflareContext)
          .env.DB.batch(boundQueries);

        if (queryResult.every((res) => res.success)) {
          resolve(data({ success: true }, { status: 200 }));
        } else {
          resolve(
            data(
              { success: false, errorMessage: "Database insertion failed." },
              { status: 500 }
            )
          );
        }
      },
      error: (error: any) => {
        resolve(data({ success: false, error: error }, { status: 500 }));
      },
    });
  });
}
