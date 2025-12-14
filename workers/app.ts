import { createRequestHandler, RouterContextProvider } from "react-router";
import checkToken from "~/auth/checktoken.js";
import {
  cloudflareContext,
  settingsContext,
  userContext,
} from "~/context/context.js";
import { getSessionCookie } from "~/context/cookies.server.js";
import getSettings from "~/routes/practice/getsettings.js";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request, env, ctx) {
    const context = new RouterContextProvider();

    context.set(cloudflareContext, { env, ctx });

    const cookieHeader = request.headers.get("Cookie");
    const token = (await getSessionCookie(context).parse(cookieHeader)) || "";
    const user = await checkToken(token, context);
    if (user.init?.status === 200 && user.data) {
      context.set(userContext, user.data);
    } else {
      context.set(userContext, null);
    }

    if (context.get(userContext)) {
      const settings = await getSettings(context);
      if (settings.init?.status === 200 && settings.data) {
        context.set(settingsContext, settings.data);
      } else {
        context.set(settingsContext, null);
      }
    }

    return requestHandler(request, context);
  },
} satisfies ExportedHandler<Env>;
