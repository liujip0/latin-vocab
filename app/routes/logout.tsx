import { useEffect } from "react";
import { data, useNavigate } from "react-router";
import { getSessionCookie } from "~/context/cookies.server.js";
import type { Route } from "./+types/logout.js";

export async function loader({ context }: Route.LoaderArgs) {
  return data(null, {
    headers: {
      "Set-Cookie": await getSessionCookie(context).serialize("", {
        maxAge: 0,
        expires: new Date(0),
      }),
    },
  });
}

export default function Logout({}: Route.ComponentProps) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/");
  }, []);

  return <div>Logging out...</div>;
}
