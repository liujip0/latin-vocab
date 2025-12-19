import { userContext } from "~/context/context.js";
import type { Route } from "./+types/index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return {
    user: context.get(userContext),
  };
}

export default function Index({ loaderData }: Route.ComponentProps) {
  return <div>{loaderData.user ? <></> : <></>}</div>;
}
