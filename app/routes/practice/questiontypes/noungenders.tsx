import { Button, Input } from "@liujip0/components";
import { useEffect, useRef, useState } from "react";
import type { Word } from "~/types/words.js";
import { genderUnabbrev } from "~/util/abbrev.js";
import { useKeyDown } from "~/util/usekeydown.js";
import { SimpleAnswer } from "../answer.js";
import styles from "./questions.module.css";

const MascOrFem = [
  "cīvis, cīvis",
  "parēns, parentis",
  "diēs, diēī",
  "adulēscēns, adulēscentis",
];

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
    <div className={styles.questionContainer}>
      <div className={styles.questionType}>Identify the gender of the noun</div>
      <div className={styles.questionWord}>{latinWord}</div>
      <div className={styles.questionEnglishTranslation}>
        {word.english_translation}
      </div>
      {asking ? (
        <>
          <Input
            className={styles.input}
            id="latin-to-english-input"
            value={answer}
            onChange={setAnswer}
            onKeyDown={submitKeyDown}
            autoFocus
          />
          <Button
            className={styles.submitButton}
            ref={submitButtonRef}
            onClick={() => {
              setAsking(false);
            }}>
            Submit
          </Button>
        </>
      ) : (
        <>
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
            className={styles.continueButton}
            ref={continueButtonRef}
            onClick={() => {
              setAsking(true);
              setAnswer("");
              nextQuestion();
            }}>
            Continue
          </Button>
        </>
      )}
    </div>
  );
}
