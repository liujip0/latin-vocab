import { Button, Input, Password } from "@liujip0/components";
import bcrypt from "bcryptjs";
import { useRef, useState } from "react";
import { data, Link, redirect, useFetcher } from "react-router";
import { cloudflareContext } from "~/context/context.js";
import type { User } from "~/types/users.js";
import type { Route } from "../+types/root.js";
import styles from "./login.module.css";
import makeSettings from "./practice/makesettings.js";

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const input = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };

  if (input.username.length < 3) {
    return data(
      { errorMessage: "Error: Username must be at least 3 characters long." },
      { status: 400 }
    );
  }
  if (input.password.length < 6) {
    return data(
      { errorMessage: "Error: Password must be at least 6 characters long." },
      { status: 400 }
    );
  }

  const user = await context
    .get(cloudflareContext)
    .env.DB.prepare("SELECT username FROM Users WHERE username = ?;")
    .bind(input.username)
    .run<User>();
  if (user.results.length > 0) {
    return data(
      { errorMessage: "Error: Username already exists." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const createUser = await context
    .get(cloudflareContext)
    .env.DB.prepare(
      "INSERT INTO Users (username, password_hash) VALUES (?, ?);"
    )
    .bind(input.username, passwordHash)
    .run();

  let createSettings;
  try {
    createSettings = await makeSettings(input.username, context);
  } catch (error: any) {
    return data({ error: error, errorMessage: error.message }, { status: 500 });
  }

  if (createUser.success && createSettings.success) {
    return redirect("/login");
  } else {
    return data(
      { errorMessage: "Error: Failed to create user or settings." },
      { status: 500 }
    );
  }
}

export default function Signup() {
  const fetcher = useFetcher();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const usernameInputRef = useRef<HTMLInputElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const submitKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (event.key === "Enter") {
      submitButtonRef.current?.click();
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Sign Up</h1>
      <Input
        className={styles.input}
        ref={usernameInputRef}
        id="signup-username"
        value={username}
        onChange={setUsername}
        label="Username"
        onKeyDown={submitKeyDown}
        autoFocus
      />
      <Password
        className={styles.input}
        id="signup-password"
        value={password}
        onChange={setPassword}
        label="Password"
        onKeyDown={submitKeyDown}
      />
      {fetcher.data?.errorMessage && (
        <p className={styles.errorMessage}>{fetcher.data.errorMessage}</p>
      )}
      <Button
        className={styles.button}
        ref={submitButtonRef}
        onClick={() => {
          fetcher.submit({ username, password }, { method: "post" });
          usernameInputRef.current?.focus();
        }}>
        Submit
      </Button>
      <p className={styles.text}>
        Already have an account? <Link to="/login">Log In</Link>.
      </p>
    </div>
  );
}
