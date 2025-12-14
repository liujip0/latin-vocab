import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),

  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),

  route("managedb", "routes/managedb/index.tsx", [
    route("nouns", "routes/managedb/nouns.tsx"),
  ]),

  ...prefix("practice", [
    index("routes/practice/index.tsx"),
    route("settings", "routes/practice/settings.tsx"),
  ]),
] satisfies RouteConfig;
