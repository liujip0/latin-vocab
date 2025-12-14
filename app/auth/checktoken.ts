import jwt from "jsonwebtoken";
import { data, RouterContextProvider } from "react-router";
import { cloudflareContext } from "~/context/context.js";
import type { User } from "~/types/users.js";

export default async function checkToken(
  token: string,
  context: Readonly<RouterContextProvider>
) {
  if (!token) {
    return data(null, { status: 401 });
  }

  try {
    const validToken = jwt.verify(
      token,
      context.get(cloudflareContext).env.JWT_SECRET
    ) as jwt.JwtPayload;
    if (!("username" in validToken)) {
      return data(null, { status: 401 });
    }

    const user = await context
      .get(cloudflareContext)
      .env.DB.prepare("SELECT username FROM Users WHERE username = ?")
      .bind(validToken.username)
      .run<User>();

    if (!user.success) {
      return data(null, { status: 500 });
    }

    return data(
      {
        username: user.results[0].username,
        admin:
          user.results[0].username ===
          context.get(cloudflareContext).env.ADMIN_USERNAME,
      },
      { status: 200 }
    );
  } catch (e) {
    return data(null, { status: 401 });
  }
}
