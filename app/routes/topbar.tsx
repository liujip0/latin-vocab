import { Button } from "@liujip0/components";
import { Link, Outlet } from "react-router";
import { userContext } from "~/context/context.js";
import type { Route } from "./+types/topbar";
import styles from "./topbar.module.css";

export function loader({ context }: Route.LoaderArgs) {
  return {
    user: context.get(userContext),
  };
}

export default function TopBar({ loaderData }: Route.ComponentProps) {
  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <Link
          to="/"
          className={styles.noLinkUnderline}>
          <h1 className={styles.title}>Latin Vocab</h1>
        </Link>
        {loaderData.user ? (
          <div></div>
        ) : (
          <div className={styles.topbarButtons}>
            <Link
              to="/login"
              className={styles.noLinkUnderline}>
              <Button className={styles.topbarButton}>Log In</Button>
            </Link>
            <Link
              to="/signup"
              className={styles.noLinkUnderline}>
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
