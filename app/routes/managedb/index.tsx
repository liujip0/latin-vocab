import { Button, Checkbox } from "@liujip0/components";
import { useState } from "react";
import { data, Link, redirect, useSubmit } from "react-router";
import { userContext } from "~/context/context.js";
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
    res.prepositions = (await addPrepositions(request, context)).init?.status;
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

export default function ManageDB({ actionData }: Route.ComponentProps) {
  const submit = useSubmit();

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
    <div>
      <Link to="/">Home</Link>
      <Checkbox
        id="manage-adjectives"
        value={adjectives}
        onChange={setAdjectives}
        label="Adjectives"
      />
      <Checkbox
        id="manage-adverbs"
        value={adverbs}
        onChange={setAdverbs}
        label="Adverbs"
      />
      <Checkbox
        id="manage-conjunctions"
        value={conjunctions}
        onChange={setConjunctions}
        label="Conjunctions"
      />
      <Checkbox
        id="manage-enclitics"
        value={enclitics}
        onChange={setEnclitics}
        label="Enclitics"
      />
      <Checkbox
        id="manage-interjections"
        value={interjections}
        onChange={setInterjections}
        label="Interjections"
      />
      <Checkbox
        id="manage-nouns"
        value={nouns}
        onChange={setNouns}
        label="Nouns"
      />
      <Checkbox
        id="manage-phrases"
        value={phrases}
        onChange={setPhrases}
        label="Phrases"
      />
      <Checkbox
        id="manage-prepositions"
        value={prepositions}
        onChange={setPrepositions}
        label="Prepositions"
      />
      <Checkbox
        id="manage-pronouns"
        value={pronouns}
        onChange={setPronouns}
        label="Pronouns"
      />
      <Checkbox
        id="manage-verbs"
        value={verbs}
        onChange={setVerbs}
        label="Verbs"
      />

      <Button
        onClick={() => {
          submit(
            {
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
        Update DB
      </Button>
      {actionData ? actionData.success ? <p>Success</p> : <p>Error</p> : <></>}
    </div>
  );
}
