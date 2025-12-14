import { diffChars } from "diff";

type AnswerProps = {
  answer: string;
  correct: string;
};
export default function Answer({ answer, correct }: AnswerProps) {
  const diff = diffChars(answer, correct);

  return (
    <div style={{ display: "flex" }}>
      {diff.map((change, index) => (
        <div key={index}>
          <div>{!change.added ? change.value : "_"}</div>
          <div>{!change.removed ? change.value : "_"}</div>
        </div>
      ))}
    </div>
  );
}
