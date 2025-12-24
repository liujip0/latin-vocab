import Papa from "papaparse";
import {
  data,
  UNSAFE_DataWithResponseInit,
  type RouterContextProvider,
} from "react-router";
import { cloudflareContext } from "~/context/context.js";
import adverbs from "../../vocablists/adverbs.csv?raw";
import conjunctions from "../../vocablists/conjunctions.csv?raw";
import enclitics from "../../vocablists/enclitics.csv?raw";
import interjections from "../../vocablists/interjections.csv?raw";
import phrases from "../../vocablists/phrases.csv?raw";

export default async function addWords<T>(
  partOfSpeech:
    | "adverbs"
    | "conjunctions"
    | "enclitics"
    | "interjections"
    | "phrases",
  context: Readonly<RouterContextProvider>
): Promise<
  UNSAFE_DataWithResponseInit<{ success: boolean; errorMessage?: string }>
> {
  const text = {
    adverbs,
    conjunctions,
    enclitics,
    interjections,
    phrases,
  }[partOfSpeech];

  const tableName =
    partOfSpeech.charAt(0).toUpperCase() + partOfSpeech.slice(1);

  return await new Promise((resolve) => {
    Papa.parse<Omit<T, "id">>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim(),
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
