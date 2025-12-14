import { Button, Input, Password } from "@liujip0/components";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { useRef, useState } from "react";
import { data, Link, redirect, useFetcher } from "react-router";
import { cloudflareContext } from "~/context/context.js";
import { getSessionCookie } from "~/context/cookies.server.js";
import type { User } from "~/types/users.js";
import type { Route } from "./+types/login.js";
import makeSettings from "./practice/makesettings.js";

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const input = {
    username: formData.get("username") as string,
    password: formData.get("password") as string,
  };

  const user = await context
    .get(cloudflareContext)
    .env.DB.prepare(
      "SELECT username, password_hash FROM Users WHERE username = ?;"
    )
    .bind(input.username)
    .run<User>();

  if (!user.success) {
    return data(
      { success: false as const, errorMessage: "Error: Failed to fetch user." },
      { status: 500 }
    );
  }

  if (user.results.length === 0) {
    if (input.username !== context.get(cloudflareContext).env.ADMIN_USERNAME) {
      return data(
        {
          success: false as const,
          errorMessage: "Error: Invalid username or password.",
        },
        { status: 401 }
      );
    } else {
      const passwordHash = await bcrypt.hash(
        context.get(cloudflareContext).env.ADMIN_PASSWORD,
        10
      );
      const validPassword = await bcrypt.compare(input.password, passwordHash);

      if (!validPassword) {
        return data(
          {
            success: false as const,
            errorMessage: "Error: Invalid username or password.",
          },
          { status: 401 }
        );
      }

      const createAdmin = await context
        .get(cloudflareContext)
        .env.DB.prepare(
          "INSERT INTO Users (username, password_hash) VALUES (?, ?)"
        )
        .bind(context.get(cloudflareContext).env.ADMIN_USERNAME, passwordHash)
        .run();
      const createSettings = await makeSettings(input.username, context);

      if (!createAdmin.success || !createSettings.success) {
        return data(
          {
            success: false as const,
            errorMessage: "Error: Failed to create account.",
          },
          { status: 500 }
        );
      }

      const token = jwt.sign(
        {
          username: context.get(cloudflareContext).env.ADMIN_USERNAME,
        },
        context.get(cloudflareContext).env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      return redirect("/", {
        headers: {
          "Set-Cookie": await getSessionCookie(context).serialize(token),
        },
      });
    }
  }

  const passwordHash = user.results[0].password_hash;
  const validPassword = await bcrypt.compare(input.password, passwordHash);

  if (!validPassword) {
    return data(
      {
        success: false as const,
        errorMessage: "Error: Invalid username or password.",
      },
      { status: 401 }
    );
  }

  const token = jwt.sign(
    {
      username: user.results[0].username,
    },
    context.get(cloudflareContext).env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  return redirect("/", {
    headers: {
      "Set-Cookie": await getSessionCookie(context).serialize(token),
    },
  });
}

export default function Login({}: Route.ComponentProps) {
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
      <Link to="/signup">Sign Up</Link>
      <h1>Log In</h1>
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
          fetcher.submit(
            {
              username,
              password,
            },
            { method: "post" }
          );
        }}>
        Submit
      </Button>
      {fetcher.data && !fetcher.data.success && (
        <p>{fetcher.data.errorMessage}</p>
      )}
    </div>
  );
}
