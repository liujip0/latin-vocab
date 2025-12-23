import { Button } from "@liujip0/components";
import { Link, Outlet, useSubmit } from "react-router";
import { userContext } from "~/context/context.js";
import commonStyles from "../common.module.css";
import type { Route } from "./+types/topbar";
import styles from "./topbar.module.css";

export function loader({ context }: Route.LoaderArgs) {
  return {
    user: context.get(userContext),
  };
}

export default function TopBar({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const submit = useSubmit();

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <Link
          to="/"
          className={commonStyles.noUnderline}>
          <h1 className={styles.title}>Latin Vocab</h1>
        </Link>
        {loaderData.user ? (
          <div className={styles.topbarButtons}>
            <Link
              to="/logout"
              className={commonStyles.noUnderline}>
              <Button
                className={styles.topbarButton}
                onClick={() => {
                  submit(null);
                }}>
                Log Out
              </Button>
            </Link>
          </div>
        ) : (
          <div className={styles.topbarButtons}>
            <Link
              to="/login"
              className={commonStyles.noUnderline}>
              <Button className={styles.topbarButton}>Log In</Button>
            </Link>
            <Link
              to="/signup"
              className={commonStyles.noUnderline}>
              <Button className={styles.topbarButton}>Sign Up</Button>
            </Link>
          </div>
        )}
      </div>
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  );
}
