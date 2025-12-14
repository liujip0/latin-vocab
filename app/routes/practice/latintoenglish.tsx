import { Button, Input } from "@liujip0/components";
import { useEffect, useRef, useState } from "react";
import type { Word } from "~/types/words.js";
import { genderAbbrev } from "~/util/abbrev.js";
import removeMacrons from "~/util/removemacrons.js";
import { useKeyDown } from "~/util/usekeydown.js";
import Answer from "./answer.js";

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
  const latinWord = {
    noun: word.nom_sg + ", " + word.gen_sg + ", " + genderAbbrev(word.gender),
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
