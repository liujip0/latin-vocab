import { Button, Input } from "@liujip0/components";
import { useEffect, useRef, useState } from "react";
import type { Word } from "~/types/words.js";
import { genderUnabbrev } from "~/util/abbrev.js";
import { useKeyDown } from "~/util/usekeydown.js";
import { SimpleAnswer } from "../answer.js";

const MascOrFem = ["cīvis, cīvis"];

type NounGendersProps = {
  nextQuestion: () => void;

  word: Word;
};
export default function NounGenders({ nextQuestion, word }: NounGendersProps) {
  if (word.part_of_speech !== "noun") {
    nextQuestion();
    return null;
  }

  const latinWord = word.nom_sg + ", " + word.gen_sg;
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
      <div>Identify the gender of the noun</div>
      <div>{latinWord}</div>
      <div>{word.english_translation}</div>
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
          <SimpleAnswer
            answer={genderUnabbrev(answer)}
            correct={
              !MascOrFem.includes(latinWord)
                ? word.gender
                : genderUnabbrev(answer) === "masculine" ||
                  genderUnabbrev(answer) === "feminine"
                ? genderUnabbrev(answer)
                : "masculine/feminine"
            }
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
