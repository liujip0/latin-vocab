import {
  Checkbox,
  Input,
  Select,
  ToggleButton,
  ToggleButtonGroup,
} from "@liujip0/components";
import { useEffect, useState } from "react";
import { data, Link, redirect, useFetcher } from "react-router";
import {
  cloudflareContext,
  settingsContext,
  userContext,
} from "~/context/context.js";
import {
  MaxChapter,
  MinChapter,
  QuestionTypes,
  type AlphabetLetter,
} from "~/types/settings.js";
import type { Route } from "./+types/settings.js";
import makeSettings from "./makesettings.js";

const authMiddleware: Route.MiddlewareFunction = async ({ context }, next) => {
  if (context.get(userContext)) {
    await next();
  } else {
    return redirect("/");
  }
};
export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  if (!context.get(userContext)) {
    return redirect("/");
  }

  if (!context.get(settingsContext)) {
    await makeSettings(context.get(userContext)!.username, context);
  }
  return {
    settings: context.get(settingsContext),
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const input = {
    dark_mode: formData.get("dark_mode") === "true",
    macrons: formData.get("macrons") === "true",
    adjectives: formData.get("adjectives") === "true",
    adverbs: formData.get("adverbs") === "true",
    conjunctions: formData.get("conjunctions") === "true",
    interjections: formData.get("interjections") === "true",
    nouns: formData.get("nouns") === "true",
    phrases: formData.get("phrases") === "true",
    prepositions: formData.get("prepositions") === "true",
    pronouns: formData.get("pronouns") === "true",
    verbs: formData.get("verbs") === "true",
    min_chapter: parseInt(formData.get("min_chapter") as string),
    max_chapter: parseInt(formData.get("max_chapter") as string),
    min_alphabet: formData.get("min_alphabet") as AlphabetLetter,
    max_alphabet: formData.get("max_alphabet") as AlphabetLetter,
    latin_to_english: formData.get("latin_to_english") === "true",
    english_to_latin: formData.get("english_to_latin") === "true",
    noun_genders: formData.get("noun_genders") === "true",
  };

  let errors: Record<string, string> = {};
  if (isNaN(input.min_chapter) || input.min_chapter < MinChapter) {
    errors.min_chapter = `Minimum chapter must be a number greater than ${(
      MinChapter - 1
    ).toString()}.`;
  }
  if (isNaN(input.max_chapter) || input.max_chapter > MaxChapter) {
    errors.max_chapter = `Maximum chapter must be a number less than ${(
      MaxChapter + 1
    ).toString()}.`;
  }
  if (input.min_chapter > input.max_chapter) {
    errors.min_chapter =
      "Minimum chapter must be less than or equal to maximum chapter.";
    errors.max_chapter =
      "Maximum chapter must be greater than or equal to minimum chapter.";
  }
  if (Object.keys(errors).length > 0) {
    return data({ errors }, { status: 400 });
  }

  const updateSettings = await context
    .get(cloudflareContext)
    .env.DB.prepare(
      `UPDATE Settings
      SET
        dark_mode = ?,
        macrons = ?,
        adjectives = ?,
        adverbs = ?,
        conjunctions = ?,
        interjections = ?,
        nouns = ?,
        verbs = ?,
        phrases = ?,
        prepositions = ?,
        pronouns = ?,
        min_chapter = ?,
        max_chapter = ?,
        min_alphabet = ?,
        max_alphabet = ?,
        latin_to_english = ?,
        english_to_latin = ?,
        noun_genders = ?
      WHERE username = ?;`
    )
    .bind(
      input.dark_mode,
      input.macrons,
      input.adjectives,
      input.adverbs,
      input.conjunctions,
      input.interjections,
      input.nouns,
      input.phrases,
      input.prepositions,
      input.pronouns,
      input.verbs,
      input.min_chapter,
      input.max_chapter,
      input.min_alphabet,
      input.max_alphabet,
      input.latin_to_english,
      input.english_to_latin,
      input.noun_genders,
      context.get(userContext)!.username
    )
    .run();

  if (updateSettings.success) {
    return data({}, { status: 200 });
  } else {
    return data(
      { errorMessage: "Error: Failed to update settings." },
      { status: 500 }
    );
  }
}

export default function Settings({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher();

  const [minChapter, setMinChapter] = useState<string>(
    loaderData.settings?.min_chapter?.toString() || MinChapter.toString()
  );
  const [maxChapter, setMaxChapter] = useState<string>(
    loaderData.settings?.max_chapter?.toString() || MaxChapter.toString()
  );

  useEffect(() => {
    setMinChapter(
      loaderData.settings?.min_chapter?.toString() || MinChapter.toString()
    );
    setMaxChapter(
      loaderData.settings?.max_chapter?.toString() || MaxChapter.toString()
    );
  }, [loaderData.settings]);

  return loaderData.settings ? (
    <div>
      <div>
        <Link to="/practice">Practice</Link>
      </div>
      {fetcher.state !== "idle" && <div>Updating settings...</div>}
      <h1>Settings</h1>
      <div>
        <label>Parts of Speech</label>
        <Checkbox
          id="part-of-speech-adjective"
          value={loaderData.settings.adjectives}
          onChange={(value) => {
            fetcher.submit(
              {
                ...loaderData.settings,
                adjectives: value.toString(),
              },
              { method: "post" }
            );
          }}
          label="Adjectives"
        />
        <Checkbox
          id="part-of-speech-adverb"
          value={loaderData.settings.adverbs}
          onChange={(value) => {
            fetcher.submit(
              {
                ...loaderData.settings,
                adverbs: value.toString(),
              },
              { method: "post" }
            );
          }}
          label="Adverbs"
        />
        <Checkbox
          id="part-of-speech-conjunction"
          value={loaderData.settings.conjunctions}
          onChange={(value) => {
            fetcher.submit(
              {
                ...loaderData.settings,
                conjunctions: value.toString(),
              },
              { method: "post" }
            );
          }}
          label="Conjunctions"
        />
        <Checkbox
          id="part-of-speech-interjection"
          value={loaderData.settings.interjections}
          onChange={(value) => {
            fetcher.submit(
              {
                ...loaderData.settings,
                interjections: value.toString(),
              },
              { method: "post" }
            );
          }}
          label="Interjections"
        />
        <Checkbox
          id="part-of-speech-noun"
          value={loaderData.settings.nouns}
          onChange={(value) => {
            fetcher.submit(
              {
                ...loaderData.settings,
                nouns: value.toString(),
              },
              { method: "post" }
            );
          }}
          label="Nouns"
        />
        <Checkbox
          id="part-of-speech-phrase"
          value={loaderData.settings.phrases}
          onChange={(value) => {
            fetcher.submit(
              {
                ...loaderData.settings,
                phrases: value.toString(),
              },
              { method: "post" }
            );
          }}
          label="Phrases"
        />
        <Checkbox
          id="part-of-speech-preposition"
          value={loaderData.settings.prepositions}
          onChange={(value) => {
            fetcher.submit(
              {
                ...loaderData.settings,
                prepositions: value.toString(),
              },
              { method: "post" }
            );
          }}
          label="Prepositions"
        />
        <Checkbox
          id="part-of-speech-pronoun"
          value={loaderData.settings.pronouns}
          onChange={(value) => {
            fetcher.submit(
              {
                ...loaderData.settings,
                pronouns: value.toString(),
              },
              { method: "post" }
            );
          }}
          label="Pronouns"
        />
        <Checkbox
          id="part-of-speech-verb"
          value={loaderData.settings.verbs}
          onChange={(value) => {
            fetcher.submit(
              {
                ...loaderData.settings,
                verbs: value.toString(),
              },
              { method: "post" }
            );
          }}
          label="Verbs"
        />
      </div>
      <div>
        <label>Chapter</label>
        <Input
          id="min-chapter"
          type="number"
          value={minChapter}
          onChange={(value) => {
            setMinChapter(value);
            if (!isNaN(parseInt(value))) {
              fetcher.submit(
                { ...loaderData.settings, min_chapter: value },
                { method: "post" }
              );
            }
          }}
          label="Min"
          error={!!fetcher.data?.errors?.min_chapter}
          helperText={fetcher.data?.errors?.min_chapter}
        />
        <Input
          id="max-chapter"
          type="number"
          value={maxChapter}
          onChange={(value) => {
            setMaxChapter(value);
            if (!isNaN(parseInt(value))) {
              fetcher.submit(
                { ...loaderData.settings, max_chapter: value },
                { method: "post" }
              );
            }
          }}
          label="Max"
          error={!!fetcher.data?.errors?.max_chapter}
          helperText={fetcher.data?.errors?.max_chapter}
        />
      </div>
      <div>
        <label>Alphabet Range</label>
        <Select
          id="min-alphabet"
          value={loaderData.settings.min_alphabet}
          onChange={(value) => {
            fetcher.submit(
              {
                ...loaderData.settings,
                min_alphabet: value,
              },
              { method: "post" }
            );
          }}
          label="Min">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
            <option
              key={letter}
              value={letter}>
              {letter}
            </option>
          ))}
        </Select>
        <Select
          id="max-alphabet"
          value={loaderData.settings.max_alphabet}
          onChange={(value) => {
            fetcher.submit(
              {
                ...loaderData.settings,
                max_alphabet: value,
              },
              { method: "post" }
            );
          }}
          label="Max">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
            <option
              key={letter}
              value={letter}>
              {letter}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label>Question Types</label>
        {QuestionTypes.map((type) => (
          <Checkbox
            key={type}
            id={`question-type-${type}`}
            value={loaderData.settings![type]}
            onChange={(value) => {
              fetcher.submit(
                {
                  ...loaderData.settings,
                  [type]: value,
                },
                { method: "post" }
              );
            }}
            label={type}
          />
        ))}
      </div>
      <div>
        <label>Macrons</label>
        <ToggleButtonGroup
          value={loaderData.settings.macrons.toString()}
          onChange={(value) => {
            fetcher.submit(
              {
                ...loaderData.settings,
                macrons: value,
              },
              { method: "post" }
            );
          }}>
          <ToggleButton value="true">Enabled</ToggleButton>
          <ToggleButton value="false">Disabled</ToggleButton>
        </ToggleButtonGroup>
      </div>
    </div>
  ) : (
    <div>Loading...</div>
  );
}
