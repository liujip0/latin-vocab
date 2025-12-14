import { diffChars } from "diff";
import styles from "./answer.module.css";

type AnswerProps = {
  answer: string;
  correct: string;
};
export default function Answer({ answer, correct }: AnswerProps) {
  const diff = diffChars(answer, correct);

  return (
    <div className={styles.diffContainer + " " + styles.diffText}>
      {diff.map((change, index) =>
        change.value.split("").map((char, charIndex) => (
          <div
            key={index + " " + charIndex}
            className={styles.diffChar}>
            <div
              className={
                change.removed ? styles.diffRemoved : styles.diffOther
              }>
              {!change.added ? char : "_"}
            </div>
            <div className={change.added ? styles.diffAdded : styles.diffOther}>
              {!change.removed ? char : "_"}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
