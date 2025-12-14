import { Button, Input, Select } from "@liujip0/components";
import { useEffect, useRef, useState } from "react";
import { data, redirect, useNavigation, useSubmit } from "react-router";
import { cloudflareContext, userContext } from "~/context/context.js";
import { NounDeclension, NounGender, type Noun } from "~/types/nouns.js";
import type { Route } from "./+types/addnouns";

const authMiddleware: Route.MiddlewareFunction = async ({ context }, next) => {
  if (context.get(userContext)?.admin) {
    await next();
  } else {
    return redirect("/");
  }
};
export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function action({ request, context }: Route.ActionArgs) {
  if (!context.get(userContext)?.admin) {
    return redirect("/");
  }

  const formData = await request.formData();
  const input = {
    nom_sg: (formData.get("nom_sg") as string).trim(),
    gen_sg: (formData.get("gen_sg") as string).trim(),
    english_translation: (formData.get("english_translation") as string).trim(),
    declension: formData.get("declension") as string,
    gender: formData.get("gender") as string,
    chapter: parseInt(formData.get("chapter") as string),
  };

  const error: Record<string, string> = {};
  if (input.nom_sg === "") {
    error.nom_sg = "Nominative singular cannot be empty.";
  }

  if (input.gen_sg === "") {
    error.gen_sg = "Genitive singular cannot be empty.";
  }

  if (input.english_translation === "") {
    error.english_translation = "English translation cannot be empty.";
  }

  if (!NounDeclension.includes(input.declension as NounDeclension)) {
    error.declension = "Invalid declension.";
  }

  if (!NounGender.includes(input.gender as NounGender)) {
    error.gender = "Invalid gender.";
  }

  if (isNaN(input.chapter)) {
    error.chapter = "Chapter must be a number.";
  } else if (input.chapter < 1) {
    error.chapter = "Chapter must be at least 1.";
  }

  if (Object.keys(error).length > 0) {
    return data({ success: false as const, error }, { status: 400 });
  }

  const result = await context
    .get(cloudflareContext)
    .env.DB.prepare(
      `INSERT INTO Nouns
          (nom_sg,
          gen_sg,
          other_forms,
          english_translation,
          declension,
          gender,
          chapter)
        VALUES (?, ?, ?, ?, ?, ?, ?);`
    )
    .bind(
      input.nom_sg,
      input.gen_sg,
      null,
      input.english_translation,
      input.declension,
      input.gender,
      input.chapter
    )
    .run();

  if (!result.success) {
    return data(
      {
        success: false as const,
        error: {
          errorMessage: "Failed to add noun to database.",
        } as Record<string, string>,
      },
      { status: 500 }
    );
  } else {
    return data(
      {
        success: true as const,
        error: {} as Record<string, string>,
      },
      { status: 200 }
    );
  }
}

export default function AddNouns({ actionData }: Route.ComponentProps) {
  const submit = useSubmit();
  const navigation = useNavigation();

  const [nom_sg, setNom_sg] = useState("");
  const [gen_sg, setGen_sg] = useState("");
  const [english_translation, setEnglish_translation] = useState("");
  const [declension, setDeclension] = useState("1");
  const [gender, setGender] = useState("masculine");
  const [chapter, setChapter] = useState("");

  const autoFocusRef = useRef<HTMLInputElement>(null);

  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const submitKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (event.key === "Enter") {
      submitButtonRef.current?.click();
    }
  };

  useEffect(() => {
    if (actionData?.success) {
      setNom_sg("");
      setGen_sg("");
      setEnglish_translation("");
      setDeclension("1");
      setGender("masculine");
      setChapter("");
    }
    autoFocusRef.current?.focus();
  }, [actionData?.success]);

  return (
    <div>
      {navigation.state !== "idle" && <p>Submitting...</p>}
      <h1>Add Nouns</h1>
      <Input
        id="nom_sg"
        ref={autoFocusRef}
        value={nom_sg}
        onChange={setNom_sg}
        label="Nominative Singular"
        error={!!actionData?.error?.nom_sg}
        helperText={actionData?.error?.nom_sg}
        autoFocus
      />
      <Input
        id="gen_sg"
        value={gen_sg}
        onChange={setGen_sg}
        label="Genitive Singular"
        error={!!actionData?.error?.gen_sg}
        helperText={actionData?.error?.gen_sg}
      />
      <Input
        id="english_translation"
        value={english_translation}
        onChange={setEnglish_translation}
        label="English Translation"
        error={!!actionData?.error?.english_translation}
        helperText={actionData?.error?.english_translation}
      />
      <Select
        id="declension"
        value={declension}
        onChange={(value) => {
          setDeclension(value as NonNullable<Noun["declension"]>);
        }}
        label="Declension"
        error={!!actionData?.error?.declension}
        helperText={actionData?.error?.declension}>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="irregular">irregular</option>
      </Select>
      <Select
        id="gender"
        value={gender}
        onChange={(value) => {
          setGender(value as NonNullable<Noun["gender"]>);
        }}
        label="Gender"
        error={!!actionData?.error?.gender}
        helperText={actionData?.error?.gender}>
        <option value="masculine">masculine</option>
        <option value="feminine">feminine</option>
        <option value="neuter">neuter</option>
      </Select>
      <Input
        id="chapter"
        type="number"
        value={chapter}
        onChange={setChapter}
        label="Chapter"
        error={!!actionData?.error?.chapter}
        helperText={actionData?.error?.chapter}
        onKeyDown={submitKeyDown}
      />
      <Button
        ref={submitButtonRef}
        onClick={() => {
          submit(
            {
              nom_sg,
              gen_sg,
              english_translation,
              declension,
              gender,
              chapter,
            },
            { method: "post" }
          );
        }}>
        Submit
      </Button>
      {actionData?.error.errorMessage && <p>{actionData.error.errorMessage}</p>}
    </div>
  );
}
