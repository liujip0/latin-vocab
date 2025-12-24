import { Button } from "@liujip0/components";
import { Link } from "react-router";
import { userContext } from "~/context/context.js";
import commonStyles from "../common.module.css";
import type { Route } from "./+types/index";
import styles from "./index.module.css";

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
  return (
    <div className={styles.page}>
      {loaderData.user ? (
        <>
          <h1 className={styles.title}>Welcome to Latin Vocab!</h1>
          <p className={styles.text}>
            Currently logged in as: <strong>{loaderData.user.username}</strong>
          </p>
          <div className={styles.linkButtons}>
            <Link
              to="/practice"
              className={commonStyles.noUnderline + " " + styles.link}>
              <Button className={styles.linkButton}>Practice</Button>
            </Link>
            <Link
              to="/practice/settings"
              className={commonStyles.noUnderline + " " + styles.link}>
              <Button className={styles.linkButton}>Settings</Button>
            </Link>
            {loaderData.user.admin && (
              <Link
                to="/managedb"
                className={commonStyles.noUnderline + " " + styles.link}>
                <Button className={styles.linkButton}>Manage DB</Button>
              </Link>
            )}
          </div>
        </>
      ) : (
        <>
          <h1 className={styles.title}>Welcome to Latin Vocab!</h1>
          <p className={styles.text}>Please log in or create an account.</p>
          <div className={styles.signinButtons}>
            <Link
              to="/login"
              className={commonStyles.noUnderline}>
              <Button>Log In</Button>
            </Link>
            <Link
              to="/signup"
              className={commonStyles.noUnderline}>
              <Button>Sign Up</Button>
            </Link>
          </div>
          <p className={styles.text}>
            All code for this project is open-source on{" "}
            <a
              href="https://github.com/liujip0/latin-vocab"
              target="_blank">
              GitHub
            </a>
            .
          </p>
        </>
      )}
    </div>
  );
}
