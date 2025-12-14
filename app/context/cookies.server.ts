import { createCookie, RouterContextProvider } from "react-router";
import { cloudflareContext } from "./context.js";

export function getSessionCookie(context: Readonly<RouterContextProvider>) {
  return createCookie("session", {
    sameSite: "lax",
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    secrets: [context.get(cloudflareContext).env.COOKIE_SECRET],
  });
}
