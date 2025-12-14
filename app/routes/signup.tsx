import { Button, Input, Password } from "@liujip0/components";
import bcrypt from "bcryptjs";
import { useRef, useState } from "react";
import { data, Link, redirect, useFetcher } from "react-router";
import { cloudflareContext } from "~/context/context.js";
import type { User } from "~/types/users.js";
import type { Route } from "../+types/root.js";
import makeSettings from "./practice/makesettings.js";

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const input = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };

  const user = await context
    .get(cloudflareContext)
    .env.DB.prepare("SELECT username FROM Users WHERE username = ?")
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
    .env.DB.prepare("INSERT INTO Users (username, password_hash) VALUES (?, ?)")
    .bind(input.username, passwordHash)
    .run();

  const createSettings = await makeSettings(input.username, context);

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

  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const submitKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (event.key === "Enter") {
      submitButtonRef.current?.click();
    }
  };

  return (
    <div>
      <Link to="/">Home</Link>
      <Link to="/login">Log In</Link>
      <h1>Sign Up</h1>
      <Input
        id="signup-username"
        value={username}
        onChange={setUsername}
        label="Username"
        onKeyDown={submitKeyDown}
        autoFocus
      />
      <Password
        id="signup-password"
        value={password}
        onChange={setPassword}
        label="Password"
        onKeyDown={submitKeyDown}
      />
      <Button
        ref={submitButtonRef}
        onClick={() => {
          fetcher.submit({ username, password }, { method: "post" });
        }}>
        Submit
      </Button>
      {fetcher.data?.errorMessage && <p>{fetcher.data.errorMessage}</p>}
    </div>
  );
}
