import {
  Backdrop,
  Button,
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
  Book1MaxChapter,
  Book2MaxChapter,
  MinChapter,
  QuestionTypes,
  type AlphabetLetter,
} from "~/types/settings.js";
import commonStyles from "../../common.module.css";
import type { Route } from "./+types/settings.js";
import makeSettings from "./makesettings.js";
import styles from "./settings.module.css";

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
    enclitics: formData.get("enclitics") === "true",
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
  if (isNaN(input.min_chapter)) {
    errors.min_chapter = "Minimum chapter must be a number.";
  }
  if (isNaN(input.max_chapter)) {
    errors.max_chapter = "Maximum chapter must be a number.";
  }
  if (input.min_chapter < MinChapter) {
    errors.min_chapter = `Minimum chapter must be greater than ${(
      MinChapter - 1
    ).toString()}.`;
  }
  if (input.max_chapter < MinChapter) {
    errors.max_chapter = `Maximum chapter must be greater than ${(
      MinChapter - 1
    ).toString()}.`;
  }
  if (input.min_chapter > Book2MaxChapter + Book1MaxChapter) {
    if (input.min_chapter <= Book1MaxChapter) {
      errors.min_chapter = `Minimum chapter must be less than ${
        Book1MaxChapter + 1
      } for Book 1.`;
    } else {
      errors.min_chapter = `Minimum chapter must be less than ${(
        Book2MaxChapter + 1
      ).toString()} for Book 2.`;
    }
  }
  if (input.max_chapter > Book2MaxChapter + Book1MaxChapter) {
    if (input.max_chapter <= Book1MaxChapter) {
      errors.max_chapter = `Maximum chapter must be less than ${
        Book1MaxChapter + 1
      } for Book 1.`;
    } else {
      errors.max_chapter = `Maximum chapter must be less than ${(
        Book2MaxChapter + 1
      ).toString()} for Book 2.`;
    }
  }
  if (input.min_chapter > input.max_chapter) {
    errors.min_chapter =
      "Minimum chapter must be less than or equal to maximum chapter.";
    errors.max_chapter =
      "Maximum chapter must be greater than or equal to minimum chapter.";
  }
  if (Object.keys(errors).length > 0) {
    return data(
      { errors, errorMessage: "Error: Invalid input." },
      { status: 400 }
    );
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
        enclitics = ?,
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
      input.enclitics,
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
  const [minChapterBook, setMinChapterBook] = useState<1 | 2>(1);
  const [maxChapter, setMaxChapter] = useState<string>(
    loaderData.settings?.max_chapter?.toString() || Book2MaxChapter.toString()
  );
  const [maxChapterBook, setMaxChapterBook] = useState<1 | 2>(2);

  useEffect(() => {
    if (
      loaderData.settings?.min_chapter &&
      loaderData.settings.min_chapter <= Book1MaxChapter
    ) {
      setMinChapter(loaderData.settings.min_chapter.toString());
      setMinChapterBook(1);
    } else if (
      loaderData.settings?.min_chapter &&
      loaderData.settings.min_chapter > Book1MaxChapter
    ) {
      setMinChapter(
        (loaderData.settings.min_chapter - Book1MaxChapter).toString()
      );
      setMinChapterBook(2);
    } else {
      setMinChapter(MinChapter.toString());
      setMinChapterBook(1);
    }

    if (
      loaderData.settings?.max_chapter &&
      loaderData.settings.max_chapter <= Book1MaxChapter
    ) {
      setMaxChapter(loaderData.settings.max_chapter.toString());
      setMaxChapterBook(1);
    } else if (
      loaderData.settings?.max_chapter &&
      loaderData.settings.max_chapter > Book1MaxChapter
    ) {
      setMaxChapter(
        (loaderData.settings.max_chapter - Book1MaxChapter).toString()
      );
      setMaxChapterBook(2);
    } else {
      setMaxChapter(Book2MaxChapter.toString());
      setMaxChapterBook(2);
    }
  }, [loaderData.settings]);

  return loaderData.settings ? (
    <div className={styles.page}>
      <Backdrop open={fetcher.state !== "idle"} />
      <div className={styles.statusContainer}>
        <h1 className={styles.title}>Practice Settings</h1>

        <p className={styles.status}>
          Status:{" "}
          {fetcher.state !== "idle" ? (
            <span>Updating settings...</span>
          ) : (
            fetcher.data &&
            (fetcher.data.errorMessage ? (
              <span className={styles.error}>{fetcher.data.errorMessage}</span>
            ) : (
              <span className={styles.success}>Success</span>
            ))
          )}
        </p>

        <Link
          to="/practice"
          className={commonStyles.noUnderline}>
          <Button className={styles.returnToPractice}>
            Return to Practice
          </Button>
        </Link>
      </div>

      <div className={styles.content}>
        <div className={styles.halfContainer}>
          <div className={styles.partsOfSpeech}>
            <div className={styles.labelGroup}>
              <label className={styles.largeLabel}>Parts of Speech</label>
              <Button
                className={styles.allNoneButton}
                onClick={() => {
                  fetcher.submit(
                    {
                      ...loaderData.settings,
                      adjectives: "true",
                      adverbs: "true",
                      conjunctions: "true",
                      enclitics: "true",
                      interjections: "true",
                      nouns: "true",
                      phrases: "true",
                      prepositions: "true",
                      pronouns: "true",
                      verbs: "true",
                    },
                    { method: "post" }
                  );
                }}>
                All
              </Button>
              <Button
                className={styles.allNoneButton}
                onClick={() => {
                  fetcher.submit(
                    {
                      ...loaderData.settings,
                      adjectives: "false",
                      adverbs: "false",
                      conjunctions: "false",
                      enclitics: "false",
                      interjections: "false",
                      nouns: "false",
                      phrases: "false",
                      prepositions: "false",
                      pronouns: "false",
                      verbs: "false",
                    },
                    { method: "post" }
                  );
                }}>
                None
              </Button>
            </div>
            <Checkbox
              labelClassName={styles.smallLabel}
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
              labelClassName={styles.smallLabel}
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
              labelClassName={styles.smallLabel}
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
              labelClassName={styles.smallLabel}
              id="part-of-speech-enclitic"
              value={loaderData.settings.enclitics}
              onChange={(value) => {
                fetcher.submit(
                  {
                    ...loaderData.settings,
                    enclitics: value.toString(),
                  },
                  { method: "post" }
                );
              }}
              label="Enclitics"
            />
            <Checkbox
              labelClassName={styles.smallLabel}
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
              labelClassName={styles.smallLabel}
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
              labelClassName={styles.smallLabel}
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
              labelClassName={styles.smallLabel}
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
              labelClassName={styles.smallLabel}
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
              labelClassName={styles.smallLabel}
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
        </div>

        <div className={styles.halfContainer}>
          <div>
            <label className={styles.largeLabel}>Chapter</label>
            <div className={styles.inputGroup}>
              <div className={styles.chapterGroup}>
                <Input
                  className={styles.input}
                  id="min-chapter"
                  type="number"
                  value={minChapter === "0" ? "" : minChapter}
                  onChange={(value) => {
                    setMinChapter(value === "" ? "0" : value);
                    if (!isNaN(parseInt(value === "" ? "0" : value))) {
                      fetcher.submit(
                        {
                          ...loaderData.settings,
                          min_chapter:
                            value === ""
                              ? 0
                              : parseInt(value) +
                                (minChapterBook === 1 ? 0 : Book1MaxChapter),
                        },
                        { method: "post" }
                      );
                    }
                  }}
                  label="Min"
                  labelClassName={styles.smallLabel}
                  error={!!fetcher.data?.errors?.min_chapter}
                  helperText={fetcher.data?.errors?.min_chapter}
                />
                <ToggleButtonGroup
                  value={minChapterBook.toString()}
                  onChange={(value) => {
                    setMinChapterBook(parseInt(value) as 1 | 2);
                    if (
                      !isNaN(parseInt(minChapter === "" ? "0" : minChapter))
                    ) {
                      fetcher.submit(
                        {
                          ...loaderData.settings,
                          min_chapter:
                            minChapter === ""
                              ? 0
                              : parseInt(minChapter) +
                                (value === "1" ? 0 : Book1MaxChapter),
                        },
                        { method: "post" }
                      );
                    }
                  }}>
                  <ToggleButton
                    value="1"
                    className={styles.chapterBookSelect}>
                    Book 1
                  </ToggleButton>
                  <ToggleButton
                    value="2"
                    className={styles.chapterBookSelect}>
                    Book 2
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
              <div className={styles.chapterGroup}>
                <Input
                  className={styles.input}
                  id="max-chapter"
                  type="number"
                  value={maxChapter === "0" ? "" : maxChapter}
                  onChange={(value) => {
                    setMaxChapter(value === "" ? "0" : value);
                    if (!isNaN(parseInt(value === "" ? "0" : value))) {
                      fetcher.submit(
                        {
                          ...loaderData.settings,
                          max_chapter:
                            value === ""
                              ? 0
                              : parseInt(value) +
                                (maxChapterBook === 1 ? 0 : Book1MaxChapter),
                        },
                        { method: "post" }
                      );
                    }
                  }}
                  label="Max"
                  labelClassName={styles.smallLabel}
                  error={!!fetcher.data?.errors?.max_chapter}
                  helperText={fetcher.data?.errors?.max_chapter}
                />
                <ToggleButtonGroup
                  value={maxChapterBook.toString()}
                  onChange={(value) => {
                    setMaxChapterBook(parseInt(maxChapter) as 1 | 2);
                    if (
                      !isNaN(parseInt(maxChapter === "" ? "0" : maxChapter))
                    ) {
                      fetcher.submit(
                        {
                          ...loaderData.settings,
                          max_chapter:
                            maxChapter === ""
                              ? 0
                              : parseInt(maxChapter) +
                                (value === "1" ? 0 : Book1MaxChapter),
                        },
                        { method: "post" }
                      );
                    }
                  }}>
                  <ToggleButton
                    value="1"
                    className={styles.chapterBookSelect}>
                    Book 1
                  </ToggleButton>
                  <ToggleButton
                    value="2"
                    className={styles.chapterBookSelect}>
                    Book 2
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
            </div>
          </div>
          <div>
            <label className={styles.largeLabel}>Alphabet Range</label>
            <div className={styles.inputGroup}>
              <Select
                className={styles.input}
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
                label="Min"
                labelClassName={styles.smallLabel}>
                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                  <option
                    key={letter}
                    value={letter}>
                    {letter}
                  </option>
                ))}
              </Select>
              <Select
                className={styles.input}
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
                label="Max"
                labelClassName={styles.smallLabel}>
                {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
                  <option
                    key={letter}
                    value={letter}>
                    {letter}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <div className={styles.labelGroup}>
              <label className={styles.largeLabel}>Question Types</label>
              <Button
                className={styles.allNoneButton}
                onClick={() => {
                  fetcher.submit(
                    {
                      ...loaderData.settings,
                      latin_to_english: "true",
                      english_to_latin: "true",
                      noun_genders: "true",
                    },
                    { method: "post" }
                  );
                }}>
                All
              </Button>
              <Button
                className={styles.allNoneButton}
                onClick={() => {
                  fetcher.submit(
                    {
                      ...loaderData.settings,
                      latin_to_english: "false",
                      english_to_latin: "false",
                      noun_genders: "false",
                    },
                    { method: "post" }
                  );
                }}>
                None
              </Button>
            </div>
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
                labelClassName={styles.smallLabel}
              />
            ))}
          </div>
          <div>
            <label className={styles.largeLabel}>Macrons</label>
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
              <ToggleButton
                value="true"
                className={styles.toggleButton}>
                Enabled
              </ToggleButton>
              <ToggleButton
                value="false"
                className={styles.toggleButton}>
                Disabled
              </ToggleButton>
            </ToggleButtonGroup>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div>Loading User Settings...</div>
  );
}
