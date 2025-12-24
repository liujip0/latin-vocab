import { Button } from "@liujip0/components";
import { useEffect, useState } from "react";
import { data, Link, redirect } from "react-router";
import { settingsContext, userContext } from "~/context/context.js";
import { QuestionTypes } from "~/types/settings.js";
import type {
  Adverb,
  Conjunction,
  Enclitic,
  Interjection,
  Phrase,
  Word,
} from "~/types/words.js";
import commonStyles from "../../common.module.css";
import type { Route } from "./+types/index.js";
import styles from "./index.module.css";
import EnglishToLatin from "./questiontypes/englishtolatin.js";
import LatinToEnglish from "./questiontypes/latintoenglish.js";
import NounGenders from "./questiontypes/noungenders.js";
import getAdjectives from "./wordlist/getadjectives.js";
import getNouns from "./wordlist/getnouns.js";
import getPrepositions from "./wordlist/getprepositions.js";
import getPronouns from "./wordlist/getpronouns.js";
import getVerbs from "./wordlist/getverbs.js";
import getWords from "./wordlist/getwords.js";

const authMiddleware: Route.MiddlewareFunction = async ({ context }, next) => {
  if (context.get(userContext)) {
    await next();
  } else {
    return redirect("/");
  }
};
export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  if (!context.get(settingsContext)) {
    return redirect("/practice/settings");
  }

  const words: Word[] = [];

  if (context.get(settingsContext)!.adjectives) {
    const adjectives = await getAdjectives(context);
    if (!adjectives.data.success) {
      return data(adjectives.data, { status: 500 });
    } else {
      words.push(...adjectives.data.words);
    }
  }

  if (context.get(settingsContext)!.adverbs) {
    const adverbs = await getWords<Adverb>("adverbs", context);
    if (!adverbs.data.success) {
      return data(adverbs.data, { status: 500 });
    } else {
      words.push(...adverbs.data.words);
    }
  }

  if (context.get(settingsContext)!.conjunctions) {
    const conjunctions = await getWords<Conjunction>("conjunctions", context);
    if (!conjunctions.data.success) {
      return data(conjunctions.data, { status: 500 });
    } else {
      words.push(...conjunctions.data.words);
    }
  }

  if (context.get(settingsContext)!.enclitics) {
    const enclitics = await getWords<Enclitic>("enclitics", context);
    if (!enclitics.data.success) {
      return data(enclitics.data, { status: 500 });
    } else {
      words.push(...enclitics.data.words);
    }
  }

  if (context.get(settingsContext)!.interjections) {
    const interjections = await getWords<Interjection>(
      "interjections",
      context
    );
    if (!interjections.data.success) {
      return data(interjections.data, { status: 500 });
    } else {
      words.push(...interjections.data.words);
    }
  }

  if (context.get(settingsContext)!.nouns) {
    const nouns = await getNouns(context);
    if (!nouns.data.success) {
      return data(nouns.data, { status: 500 });
    } else {
      words.push(...nouns.data.words);
    }
  }

  if (context.get(settingsContext)!.phrases) {
    const phrases = await getWords<Phrase>("phrases", context);
    if (!phrases.data.success) {
      return data(phrases.data, { status: 500 });
    } else {
      words.push(...phrases.data.words);
    }
  }

  if (context.get(settingsContext)!.prepositions) {
    const prepositions = await getPrepositions(context);
    if (!prepositions.data.success) {
      return data(prepositions.data, { status: 500 });
    } else {
      words.push(...prepositions.data.words);
    }
  }

  if (context.get(settingsContext)!.pronouns) {
    const pronouns = await getPronouns(context);
    if (!pronouns.data.success) {
      return data(pronouns.data, { status: 500 });
    } else {
      words.push(...pronouns.data.words);
    }
  }

  if (context.get(settingsContext)!.verbs) {
    const verbs = await getVerbs(context);
    if (!verbs.data.success) {
      return data(verbs.data, { status: 500 });
    } else {
      words.push(...verbs.data.words);
    }
  }

  return {
    success: true as const,
    words,
    macrons: context.get(settingsContext)!.macrons,
    questionTypes: QuestionTypes.filter(
      (questionType) => context.get(settingsContext)![questionType]
    ),
  };
}

export default function Practice({ loaderData }: Route.ComponentProps) {
  if (loaderData.success && loaderData.words.length > 0) {
    const [wordIndex, setWordIndex] = useState(0);

    const [questionType, setQuestionType] = useState<
      (typeof QuestionTypes)[number]
    >(loaderData.questionTypes[0]);

    useEffect(() => {
      setWordIndex(Math.floor(Math.random() * loaderData.words.length));
      setQuestionType(
        loaderData.questionTypes[
          Math.floor(Math.random() * loaderData.questionTypes.length)
        ]
      );
    }, [loaderData]);

    const nextQuestion = () => {
      setWordIndex((prevIndex) => (prevIndex + 1) % loaderData.words.length);
      setQuestionType(
        loaderData.questionTypes[
          Math.floor(Math.random() * loaderData.questionTypes.length)
        ]
      );
    };

    return (
      <div className={styles.page}>
        {
          {
            latin_to_english: (
              <LatinToEnglish
                nextQuestion={nextQuestion}
                word={loaderData.words[wordIndex]}
                macrons={loaderData.macrons}
              />
            ),

            english_to_latin: (
              <EnglishToLatin
                nextQuestion={nextQuestion}
                word={loaderData.words[wordIndex]}
                macrons={loaderData.macrons}
              />
            ),

            noun_genders: (
              <NounGenders
                nextQuestion={nextQuestion}
                word={loaderData.words[wordIndex]}
              />
            ),
          }[questionType]
        }
        <div className={styles.controls}>
          <Link
            className={commonStyles.noUnderline}
            to="/practice/settings">
            <Button className={styles.settings}>
              <span className="material-symbols-outlined">settings</span>
            </Button>
          </Link>
        </div>
      </div>
    );
  } else {
    if (!loaderData.success) {
      return <div>{loaderData.errorMessage}</div>;
    } else if (loaderData.words.length === 0) {
      return (
        <div>
          <div>No words available for practice.</div>
          <Link to="/practice/settings">Go to Settings</Link>
        </div>
      );
    }
  }
}
