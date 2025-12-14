import { Link, Outlet, redirect } from "react-router";
import { userContext } from "~/context/context.js";
import type { Route } from "./+types/index";

const authMiddleware: Route.MiddlewareFunction = async ({ context }, next) => {
  if (context.get(userContext)?.admin) {
    await next();
  } else {
    return redirect("/");
  }
};
export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export default function ManageDB() {
  return (
    <div>
      <Link to="/">Return to Home</Link>
      <Link to="./nouns">Nouns</Link>
      <Outlet />
    </div>
  );
}
