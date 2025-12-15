import { Button } from "@liujip0/components";
import Papa from "papaparse";
import { data, useSubmit } from "react-router";
import { cloudflareContext } from "~/context/context.js";
import type { Verb } from "~/types/verbs.js";
import type { Route } from "./+types/nouns.js";

export async function action({ request, context }: Route.ActionArgs) {
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
    Papa.parse<Verb>(text, {
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

export default function Verbs({ actionData }: Route.ComponentProps) {
  const submit = useSubmit();

  return (
    <div>
      <h1>Manage Verbs</h1>
      <Button
        onClick={() => {
          submit(null, { method: "post" });
        }}>
        Add Verbs from CSV
      </Button>
      {actionData ? (
        (actionData as Record<string, unknown>).success ? (
          <p>Success</p>
        ) : (
          <p>Error</p>
        )
      ) : (
        <></>
      )}
    </div>
  );
}
