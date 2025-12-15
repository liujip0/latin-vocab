import Papa from "papaparse";
import {
  data,
  UNSAFE_DataWithResponseInit,
  type RouterContextProvider,
} from "react-router";
import { cloudflareContext } from "~/context/context.js";

export default async function addWords<T>(
  partOfSpeech: "adverbs" | "conjunctions" | "interjections" | "phrases",
  request: Request,
  context: Readonly<RouterContextProvider>
): Promise<
  UNSAFE_DataWithResponseInit<{ success: boolean; errorMessage?: string }>
> {
  const url = new URL(`/vocablists/${partOfSpeech}.csv`, request.url);
  const csv = await fetch(url);
  if (!csv.ok) {
    return data(
      { success: false, errorMessage: "Failed to fetch CSV file." },
      { status: 500 }
    );
  }

  const tableName =
    partOfSpeech.charAt(0).toUpperCase() + partOfSpeech.slice(1);
  const text = await csv.text();
  return await new Promise((resolve) => {
    Papa.parse<Omit<T, "id">>(text, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const deleteWords = context
          .get(cloudflareContext)
          .env.DB.prepare(`DELETE FROM ${tableName};`);
        await deleteWords.run();

        const insertWords = context.get(cloudflareContext).env.DB.prepare(
          `INSERT INTO ${tableName}
          (latin_form,
            english_translation,
            chapter)
          VALUES (?, ?, ?);`
        );

        const boundQueries = results.data.map((word) =>
          insertWords.bind(
            (word as any).latin_form,
            (word as any).english_translation,
            (word as any).chapter
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
