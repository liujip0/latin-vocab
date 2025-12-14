import { useEffect, useState } from "react";
import { data, Link, redirect } from "react-router";
import {
  cloudflareContext,
  settingsContext,
  userContext,
} from "~/context/context.js";
import { type Noun } from "~/types/nouns.js";
import { QuestionTypes } from "~/types/settings.js";
import type { Word } from "~/types/words.js";
import removeMacrons from "~/util/removemacrons.js";
import type { Route } from "./+types/index.js";
import EnglishToLatin from "./questiontypes/englishtolatin.js";
import LatinToEnglish from "./questiontypes/latintoenglish.js";
import NounGenders from "./questiontypes/noungenders.js";

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

  if (context.get(settingsContext)!.nouns) {
    const nouns = await context
      .get(cloudflareContext)
      .env.DB.prepare(
        `SELECT
          id,
          nom_sg,
          gen_sg,
          other_forms,
          english_translation,
          declension,
          gender,
          chapter
       FROM Nouns
       WHERE chapter BETWEEN ? AND ?
       ORDER BY RANDOM()
       LIMIT 40;`
      )
      .bind(
        context.get(settingsContext)!.min_chapter,
        context.get(settingsContext)!.max_chapter
      )
      .run<Noun>();

    if (!nouns.success) {
      return data(
        { success: false as const, errorMessage: "Failed to load nouns." },
        { status: 500 }
      );
    }

    const nounList = nouns.results.filter(
      (noun) =>
        removeMacrons(noun.nom_sg[0]).toUpperCase() >=
          context.get(settingsContext)!.min_alphabet &&
        removeMacrons(noun.nom_sg[0]).toUpperCase() <=
          context.get(settingsContext)!.max_alphabet
    );

    words.push(
      ...nounList.map((noun) => ({
        ...noun,
        part_of_speech: "noun" as const,
      }))
    );
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
  if (loaderData.success) {
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
      <div>
        <Link to="/">Home</Link>
        <Link to="/practice/settings">Settings</Link>

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
      </div>
    );
  } else {
    return <div>{loaderData.errorMessage}</div>;
  }
}
