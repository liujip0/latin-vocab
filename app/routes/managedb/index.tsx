import { Backdrop, Button, Checkbox } from "@liujip0/components";
import { useState } from "react";
import { data, redirect, useNavigation, useSubmit } from "react-router";
import { cloudflareContext, userContext } from "~/context/context.js";
import type {
  Adverb,
  Conjunction,
  Enclitic,
  Interjection,
  Phrase,
} from "~/types/words.js";
import type { Route } from "./+types/index";
import addAdjectives from "./addadjectives.js";
import addNouns from "./addnouns.js";
import addPrepositions from "./addprepositions.js";
import addPronouns from "./addpronouns.js";
import addVerbs from "./addverbs.js";
import addWords from "./addwords.js";
import styles from "./index.module.css";

const authMiddleware: Route.MiddlewareFunction = async ({ context }, next) => {
  if (context.get(userContext)?.admin) {
    await next();
  } else {
    return redirect("/");
  }
};
export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const input = {
    action: formData.get("action") as
      | "update-vocab"
      | "clear-vocab"
      | "clear-settings"
      | "clear-non-admin-users"
      | "clear-all-users",
    adjectives: formData.get("adjectives") === "true",
    adverbs: formData.get("adverbs") === "true",
    conjunctions: formData.get("conjunctions") === "true",
    enclitics: formData.get("enclitics") === "true",
    interjections: formData.get("interjections") === "true",
    nouns: formData.get("nouns") === "true",
    phrases: formData.get("phrases") === "true",
    prepositions: formData.get("prepositions") === "true",
    pronouns: formData.get("pronouns") === "true",
    verbs: formData.get("verbs") === "true",
  };

  switch (input.action) {
    case "update-vocab": {
      const res: Record<string, number | undefined> = {};

      if (input.adjectives) {
        res.adjectives = (await addAdjectives(request, context)).init?.status;
      }
      if (input.adverbs) {
        res.adverbs = (
          await addWords<Adverb>("adverbs", request, context)
        ).init?.status;
      }
      if (input.conjunctions) {
        res.conjunctions = (
          await addWords<Conjunction>("conjunctions", request, context)
        ).init?.status;
      }
      if (input.enclitics) {
        res.enclitics = (
          await addWords<Enclitic>("enclitics", request, context)
        ).init?.status;
      }
      if (input.interjections) {
        res.interjections = (
          await addWords<Interjection>("interjections", request, context)
        ).init?.status;
      }
      if (input.nouns) {
        res.nouns = (await addNouns(request, context)).init?.status;
      }
      if (input.phrases) {
        res.phrases = (
          await addWords<Phrase>("phrases", request, context)
        ).init?.status;
      }
      if (input.prepositions) {
        res.prepositions = (
          await addPrepositions(request, context)
        ).init?.status;
      }
      if (input.pronouns) {
        res.pronouns = (await addPronouns(request, context)).init?.status;
      }
      if (input.verbs) {
        res.verbs = (await addVerbs(request, context)).init?.status;
      }

      return data(
        {
          success: Object.keys(res).reduce(
            (acc, key) => acc && res[key] === 200,
            true
          ),
        },
        { status: 200 }
      );
    }
    case "clear-vocab": {
      const clear = await context
        .get(cloudflareContext)
        .env.DB.prepare(
          `DELETE FROM Adjectives;
          DELETE FROM Adverbs;
          DELETE FROM Conjunctions;
          DELETE FROM Enclitics;
          DELETE FROM Interjections;
          DELETE FROM Nouns;
          DELETE FROM Phrases;
          DELETE FROM Prepositions;
          DELETE FROM Pronouns;
          DELETE FROM Verbs;`
        )
        .run();

      return data(
        { success: clear.success },
        { status: clear.success ? 200 : 500 }
      );
    }
    case "clear-settings": {
      const clear = await context
        .get(cloudflareContext)
        .env.DB.prepare(`DELETE FROM Settings;`)
        .run();

      return data(
        { success: clear.success },
        { status: clear.success ? 200 : 500 }
      );
    }
    case "clear-non-admin-users": {
      const clear = await context
        .get(cloudflareContext)
        .env.DB.prepare(`DELETE FROM Users WHERE username != ?;`)
        .bind(context.get(cloudflareContext).env.ADMIN_USERNAME)
        .run();

      return data(
        { success: clear.success },
        { status: clear.success ? 200 : 500 }
      );
    }
    case "clear-all-users": {
      const clear = await context
        .get(cloudflareContext)
        .env.DB.prepare(`DELETE FROM Users;`)
        .run();

      return data(
        { success: clear.success },
        { status: clear.success ? 200 : 500 }
      );
    }
  }
}

export default function ManageDB({ actionData }: Route.ComponentProps) {
  const submit = useSubmit();
  const navigation = useNavigation();

  const [adjectives, setAdjectives] = useState(true);
  const [adverbs, setAdverbs] = useState(true);
  const [conjunctions, setConjunctions] = useState(true);
  const [enclitics, setEnclitics] = useState(true);
  const [interjections, setInterjections] = useState(true);
  const [nouns, setNouns] = useState(true);
  const [phrases, setPhrases] = useState(true);
  const [prepositions, setPrepositions] = useState(true);
  const [pronouns, setPronouns] = useState(true);
  const [verbs, setVerbs] = useState(true);

  return (
    <div className={styles.page}>
      <Backdrop open={navigation.state !== "idle"} />
      <div className={styles.partsOfSpeech}>
        <h1 className={styles.posTitle}>Parts of Speech</h1>
        <Checkbox
          labelClassName={styles.partOfSpeech}
          id="manage-adjectives"
          value={adjectives}
          onChange={setAdjectives}
          label="Adjectives"
        />
        <Checkbox
          labelClassName={styles.partOfSpeech}
          id="manage-adverbs"
          value={adverbs}
          onChange={setAdverbs}
          label="Adverbs"
        />
        <Checkbox
          labelClassName={styles.partOfSpeech}
          id="manage-conjunctions"
          value={conjunctions}
          onChange={setConjunctions}
          label="Conjunctions"
        />
        <Checkbox
          labelClassName={styles.partOfSpeech}
          id="manage-enclitics"
          value={enclitics}
          onChange={setEnclitics}
          label="Enclitics"
        />
        <Checkbox
          labelClassName={styles.partOfSpeech}
          id="manage-interjections"
          value={interjections}
          onChange={setInterjections}
          label="Interjections"
        />
        <Checkbox
          labelClassName={styles.partOfSpeech}
          id="manage-nouns"
          value={nouns}
          onChange={setNouns}
          label="Nouns"
        />
        <Checkbox
          labelClassName={styles.partOfSpeech}
          id="manage-phrases"
          value={phrases}
          onChange={setPhrases}
          label="Phrases"
        />
        <Checkbox
          labelClassName={styles.partOfSpeech}
          id="manage-prepositions"
          value={prepositions}
          onChange={setPrepositions}
          label="Prepositions"
        />
        <Checkbox
          labelClassName={styles.partOfSpeech}
          id="manage-pronouns"
          value={pronouns}
          onChange={setPronouns}
          label="Pronouns"
        />
        <Checkbox
          labelClassName={styles.partOfSpeech}
          id="manage-verbs"
          value={verbs}
          onChange={setVerbs}
          label="Verbs"
        />
      </div>

      <div className={styles.controls}>
        <Button
          className={styles.updateVocab}
          onClick={() => {
            submit(
              {
                action: "update-vocab",
                adjectives: adjectives.toString(),
                adverbs: adverbs.toString(),
                conjunctions: conjunctions.toString(),
                enclitics: enclitics.toString(),
                interjections: interjections.toString(),
                nouns: nouns.toString(),
                phrases: phrases.toString(),
                prepositions: prepositions.toString(),
                pronouns: pronouns.toString(),
                verbs: verbs.toString(),
              },
              { method: "post" }
            );
          }}>
          Update Vocab
        </Button>
        <Button
          onClick={() => {
            submit(
              {
                action: "clear-vocab",
              },
              { method: "post" }
            );
          }}>
          Clear Vocab
        </Button>
        <Button
          onClick={() => {
            submit(
              {
                action: "clear-settings",
              },
              { method: "post" }
            );
          }}>
          Clear Settings
        </Button>
        <Button
          onClick={() => {
            submit(
              {
                action: "clear-non-admin-users",
              },
              { method: "post" }
            );
          }}>
          Clear Non-Admin Users
        </Button>
        <Button
          className={styles.clearAllUsers}
          onClick={() => {
            submit(
              {
                action: "clear-all-users",
              },
              { method: "post" }
            );
          }}>
          Clear All Users
        </Button>
        <p className={styles.status}>
          Status:{" "}
          {navigation.state !== "idle" ? (
            <span>Working...</span>
          ) : (
            actionData &&
            (actionData.success ? (
              <span className={styles.success}>Success</span>
            ) : (
              <span className={styles.error}>Error</span>
            ))
          )}
        </p>
      </div>
    </div>
  );
}
