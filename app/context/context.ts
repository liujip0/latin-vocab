import { createContext } from "react-router";
import type { Setting } from "~/types/settings.js";

type CloudflareContext = {
  env: Env;
  ctx: ExecutionContext;
};
export const cloudflareContext = createContext<CloudflareContext>();

type UserContext = {
  username: string;
  admin: boolean;
};
export const userContext = createContext<UserContext | null>(null);

export const settingsContext = createContext<Setting | null>(null);
