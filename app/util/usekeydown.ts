import { useEffect } from "react";

export function useKeyDown(onKeyDown: (event: KeyboardEvent) => void) {
  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}
