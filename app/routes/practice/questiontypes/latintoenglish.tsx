import { Button, Input } from "@liujip0/components";
import { useEffect, useRef, useState } from "react";
import type { Adjective } from "~/types/adjectives.js";
import type { Noun } from "~/types/nouns.js";
import type { Preposition } from "~/types/prepositions.js";
import type { Verb } from "~/types/verbs.js";
import type {
  Adverb,
  Conjunction,
  Interjection,
  Phrase,
  Word,
} from "~/types/words.js";
import { genderAbbrev, oopAbbrev } from "~/util/abbrev.js";
import removeMacrons from "~/util/removemacrons.js";
import { useKeyDown } from "~/util/usekeydown.js";
import Answer from "../answer.js";

type LatinToEnglishProps = {
  nextQuestion: () => void;

  word: Word;
  macrons: boolean;
};
export default function LatinToEnglish({
  nextQuestion,
  word,
  macrons,
}: LatinToEnglishProps) {
  if (word.part_of_speech === "pronoun") {
    nextQuestion();
    return null;
  }

  const latinWord = {
    adjective: [
      (word as Adjective).latin_form1,
      (word as Adjective).latin_form2,
      (word as Adjective).latin_form3,
    ].join(", "),
    adverb: (word as Adverb).latin_form,
    conjunction: (word as Conjunction).latin_form,
    interjection: (word as Interjection).latin_form,
    noun: [
      (word as Noun).nom_sg,
      (word as Noun).gen_sg,
      genderAbbrev((word as Noun).gender),
    ].join(", "),
    phrase: (word as Phrase).latin_form,
    preposition:
      (word as Preposition).latin_form +
      " + " +
      oopAbbrev((word as Preposition).object_case),
    verb: [
      (word as Verb).first_sg_pres_act_ind,
      (word as Verb).pres_act_inf,
      (word as Verb).first_sg_prf_act_ind,
      (word as Verb).prf_pass_ptcp,
    ].join(", "),
  }[word.part_of_speech];

  const [asking, setAsking] = useState(true);
  const askingRef = useRef(asking);
  useEffect(() => {
    askingRef.current = asking;
  }, [asking]);
  const [answer, setAnswer] = useState("");

  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const submitKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    event.stopPropagation();
    if (event.key === "Enter") {
      submitButtonRef.current?.click();
    }
  };

  const continueButtonRef = useRef<HTMLButtonElement>(null);
  useKeyDown((event) => {
    if (event.key === "Enter" && !askingRef.current) {
      continueButtonRef.current?.click();
    }
  });

  return (
    <div>
      <div>Translate into English</div>
      <div>{macrons ? latinWord : removeMacrons(latinWord)}</div>
      <div>{word.part_of_speech}</div>
      {asking ? (
        <>
          <Input
            id="latin-to-english-input"
            value={answer}
            onChange={setAnswer}
            onKeyDown={submitKeyDown}
            autoFocus
          />
          <Button
            ref={submitButtonRef}
            onClick={() => {
              setAsking(false);
            }}>
            Submit
          </Button>
        </>
      ) : (
        <div>
          <Answer
            answer={answer}
            correct={word.english_translation}
          />
          <Button
            ref={continueButtonRef}
            onClick={() => {
              setAsking(true);
              setAnswer("");
              nextQuestion();
            }}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
