import { diffChars } from "diff";
import styles from "./answer.module.css";

type AnswerProps = {
  answer: string;
  correct: string;
};
export default function Answer({ answer, correct }: AnswerProps) {
  const diff = diffChars(
    answer.replaceAll(" ", "_"),
    correct.replaceAll(" ", "_")
  );

  return (
    <div className={styles.diffContainer + " " + styles.diffText}>
      {diff.map((change, index) =>
        change.value.split("").map((char, charIndex) => (
          <div
            key={index + " " + charIndex}
            className={styles.diffChar}>
            <div
              className={
                (change.removed
                  ? styles.diffRemoved
                  : change.added
                  ? styles.diffOther
                  : styles.diffCorrect) +
                " " +
                ((char === "_" || change.added) && styles.diffSpace)
              }>
              {!change.added ? char : "_"}
            </div>
            <div
              className={
                (change.added
                  ? styles.diffAdded
                  : change.removed
                  ? styles.diffOther
                  : styles.diffCorrect) +
                " " +
                ((char === "_" || change.removed) && styles.diffSpace)
              }>
              {!change.removed ? char : "_"}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export function SimpleAnswer({ answer, correct }: AnswerProps) {
  const chars: string[] = [];
  for (let i = 0; i < Math.max(answer.length, correct.length); i++) {
    const answerChar = answer[i] || "_";
    const correctChar = correct[i] || "_";
    chars.push(answerChar + correctChar);
  }

  const answerCorrect = answer === correct;

  return (
    <div className={styles.diffContainer + " " + styles.diffText}>
      {chars.map((char, charIndex) => (
        <div
          key={charIndex}
          className={styles.diffChar}>
          <div
            className={
              (!answerCorrect ? styles.diffOther : styles.diffCorrect) +
              " " +
              (char[0] === "_" && styles.diffSpace)
            }>
            {char[0]}
          </div>
          <div
            className={
              (!answerCorrect ? styles.diffRemoved : styles.diffCorrect) +
              " " +
              (char[1] === "_" && styles.diffSpace)
            }>
            {char[1]}
          </div>
        </div>
      ))}
    </div>
  );
}
