import Papa from "papaparse";
import {
  data,
  UNSAFE_DataWithResponseInit,
  type RouterContextProvider,
} from "react-router";
import { cloudflareContext } from "~/context/context.js";
import type { Adjective } from "~/types/adjectives.js";
import { adjDeclensionUnabbrev } from "~/util/abbrev.js";

export default async function addAdjectives(
  request: Request,
  context: Readonly<RouterContextProvider>
): Promise<
  UNSAFE_DataWithResponseInit<{ success: boolean; errorMessage?: string }>
> {
  const url = new URL("/vocablists/adjectives.csv", request.url);
  console.log(url.toString());
  const csv = await fetch(url, {
    method: "GET",
  });
  // if (!csv.ok) {
  //   console.error("Failed to fetch CSV file:", csv.statusText);
  //   return data(
  //     { success: false, errorMessage: "Failed to fetch CSV file." },
  //     { status: 500 }
  //   );
  // }

  const text = await csv.text();
  return await new Promise((resolve) => {
    Papa.parse<Omit<Adjective, "id">>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
      complete: async (results) => {
        const deleteNouns = context
          .get(cloudflareContext)
          .env.DB.prepare(`DELETE FROM Adjectives;`);
        await deleteNouns.run();

        const insertNouns = context.get(cloudflareContext).env.DB.prepare(
          `INSERT INTO Adjectives
          (latin_form1,
            latin_form2,
            latin_form3,
            english_translation,
            declension,
            chapter)
          VALUES (?, ?, ?, ?, ?, ?);`
        );

        const boundQueries = results.data.map((adjective) =>
          insertNouns.bind(
            adjective.latin_form1,
            adjective.latin_form2,
            adjective.latin_form3,
            adjective.english_translation,
            adjDeclensionUnabbrev(adjective.declension),
            adjective.chapter
          )
        );

        const queryResult = await context
          .get(cloudflareContext)
          .env.DB.batch(boundQueries);

        if (queryResult.every((res) => res.success)) {
          resolve(data({ success: true }, { status: 200 }));
        } else {
          console.error("Database insertion failed:", queryResult);
          resolve(
            data(
              { success: false, errorMessage: "Database insertion failed." },
              { status: 500 }
            )
          );
        }
      },
      error: (error: any) => {
        console.error("CSV parsing failed:", error);
        resolve(data({ success: false, error: error }, { status: 500 }));
      },
    });
  });
}
