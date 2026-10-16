import { lazy, Suspense, type ComponentType, type JSX } from "react";

/**
 * A panel kept out of the startup bundle. Its code starts downloading right
 * away, so it renders directly once loaded; Suspense only covers a tap that
 * comes before the download finishes, and then only that panel waits.
 */
export function lazyPanel<P extends object>(
  load: () => Promise<ComponentType<P>>,
): (props: P) => JSX.Element {
  let Loaded: ComponentType<P> | null = null;
  const loading = load().then((component) => {
    Loaded = component;
    return { default: component };
  });
  // A failed download retries on first open instead of breaking startup.
  loading.catch(() => {});
  const Panel = lazy(() =>
    Loaded
      ? Promise.resolve({ default: Loaded })
      : loading.catch(() =>
          load().then((component) => ({ default: component })),
        ),
  );
  return function LazyPanel(props: P) {
    if (Loaded) return <Loaded {...props} />;
    return (
      <Suspense fallback={null}>
        <Panel {...props} />
      </Suspense>
    );
  };
}
