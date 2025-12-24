import Papa from "papaparse";
import {
  data,
  UNSAFE_DataWithResponseInit,
  type RouterContextProvider,
} from "react-router";
import { cloudflareContext } from "~/context/context.js";
import type { Pronoun } from "~/types/pronoun.js";
import text from "../../vocablists/pronouns.csv?raw";

export default async function addPronouns(
  context: Readonly<RouterContextProvider>
): Promise<
  UNSAFE_DataWithResponseInit<{ success: boolean; errorMessage?: string }>
> {
  return await new Promise((resolve) => {
    Papa.parse<Omit<Pronoun, "id">>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
      complete: async (results) => {
        const deleteNouns = context
          .get(cloudflareContext)
          .env.DB.prepare(`DELETE FROM Pronouns;`);
        await deleteNouns.run();

        const insertNouns = context.get(cloudflareContext).env.DB.prepare(
          `INSERT INTO Pronouns
          (latin_form,
            pn_type,
            pn_gender,
            pn_person,
            pn_number,
            pn_case,
            chapter)
          VALUES (?, ?, ?, ?, ?, ?, ?);`
        );

        const boundQueries = results.data.map((pronoun) =>
          insertNouns.bind(
            pronoun.latin_form,
            pronoun.pn_type,
            pronoun.pn_gender,
            pronoun.pn_person,
            pronoun.pn_number,
            pronoun.pn_case,
            pronoun.chapter
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
