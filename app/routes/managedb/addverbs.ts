import Papa from "papaparse";
import {
  data,
  UNSAFE_DataWithResponseInit,
  type RouterContextProvider,
} from "react-router";
import { cloudflareContext } from "~/context/context.js";
import type { Verb } from "~/types/verbs.js";

export default async function addVerbs(
  request: Request,
  context: Readonly<RouterContextProvider>
): Promise<
  UNSAFE_DataWithResponseInit<{ success: boolean; errorMessage?: string }>
> {
  const url = new URL("/vocablists/verbs.csv", request.url);
  const csv = await fetch(url);
  if (!csv.ok) {
    return data(
      { success: false, errorMessage: "Failed to fetch CSV file." },
      { status: 500 }
    );
  }

  const text = await csv.text();
  return await new Promise((resolve) => {
    Papa.parse<Omit<Verb, "id">>(text, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const deleteVerbs = context
          .get(cloudflareContext)
          .env.DB.prepare(`DELETE FROM Verbs;`);
        await deleteVerbs.run();

        const insertVerbs = context.get(cloudflareContext).env.DB.prepare(
          `INSERT INTO Verbs
          (first_sg_pres_act_ind,
            pres_act_inf,
            first_sg_prf_act_ind,
            prf_pass_ptcp,
            other_forms,
            english_translation,
            conjugation,
            chapter)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?);`
        );

        const boundQueries = results.data.map((verb) =>
          insertVerbs.bind(
            verb.first_sg_pres_act_ind,
            verb.pres_act_inf,
            verb.first_sg_prf_act_ind,
            verb.prf_pass_ptcp,
            verb.other_forms,
            verb.english_translation,
            verb.conjugation,
            verb.chapter
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
