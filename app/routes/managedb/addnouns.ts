import Papa from "papaparse";
import {
  data,
  UNSAFE_DataWithResponseInit,
  type RouterContextProvider,
} from "react-router";
import { cloudflareContext } from "~/context/context.js";
import type { Noun } from "~/types/nouns.js";
import { genderUnabbrev } from "~/util/abbrev.js";

export default async function addNouns(
  request: Request,
  context: Readonly<RouterContextProvider>
): Promise<
  UNSAFE_DataWithResponseInit<{ success: boolean; errorMessage?: string }>
> {
  const url = new URL("/vocablists/nouns.csv", request.url);
  const csv = await fetch(url);
  if (!csv.ok) {
    return data(
      { success: false, errorMessage: "Failed to fetch CSV file." },
      { status: 500 }
    );
  }

  const text = await csv.text();
  return await new Promise((resolve) => {
    Papa.parse<Omit<Noun, "id">>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
      complete: async (results) => {
        const deleteNouns = context
          .get(cloudflareContext)
          .env.DB.prepare(`DELETE FROM Nouns;`);
        await deleteNouns.run();

        const insertNouns = context.get(cloudflareContext).env.DB.prepare(
          `INSERT INTO Nouns
          (nom_sg,
            gen_sg,
            other_forms,
            english_translation,
            declension,
            gender,
            chapter)
          VALUES (?, ?, ?, ?, ?, ?, ?);`
        );

        const boundQueries = results.data.map((noun) =>
          insertNouns.bind(
            noun.nom_sg,
            noun.gen_sg,
            noun.other_forms,
            noun.english_translation,
            noun.declension,
            genderUnabbrev(noun.gender),
            noun.chapter
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
