import { useEffect, useState } from "react";

// Matches the compact header and drawer breakpoint in styles.css.
export const COMPACT_LAYOUT = "(max-width: 1279px)";

export function useCompactLayout(): boolean {
  const [compact, setCompact] = useState(
    () => window.matchMedia(COMPACT_LAYOUT).matches,
  );
  useEffect(() => {
    const query = window.matchMedia(COMPACT_LAYOUT);
    const update = () => setCompact(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return compact;
}
