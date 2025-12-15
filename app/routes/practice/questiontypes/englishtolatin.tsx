import { Button, Input } from "@liujip0/components";
import { useEffect, useRef, useState } from "react";
import type { Noun } from "~/types/nouns.js";
import type { Verb } from "~/types/verbs.js";
import type { Word } from "~/types/words.js";
import removeMacrons from "~/util/removemacrons.js";
import { useKeyDown } from "~/util/usekeydown.js";
import Answer from "../answer.js";

type EnglishToLatinProps = {
  nextQuestion: () => void;

  word: Word;
  macrons: boolean;
};
export default function EnglishToLatin({
  nextQuestion,
  word,
  macrons,
}: EnglishToLatinProps) {
  const latinWord = {
    noun: `${(word as Noun).nom_sg}, ${(word as Noun).gen_sg}`,
    verb: `${(word as Verb).first_sg_pres_act_ind}, ${
      (word as Verb).pres_act_inf
    }, ${(word as Verb).first_sg_prf_act_ind}, ${(word as Verb).prf_pass_ptcp}`,
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
      <div>Translate into Latin</div>
      <div>{word.english_translation}</div>
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
            answer={macrons ? answer : removeMacrons(answer)}
            correct={macrons ? latinWord : removeMacrons(latinWord)}
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
