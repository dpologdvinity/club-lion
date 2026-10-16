import {
  Component,
  lazy,
  Suspense,
  useState,
  type ComponentType,
  type JSX,
  type ReactNode,
} from "react";

type BoundaryProps = { children: ReactNode };
type BoundaryState = { failed: boolean };

// A panel whose code could not download shows a retry button, never a blank app.
class PanelLoadBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="panel-load-error" role="alert">
        <p>Oops, this didn’t load.</p>
        <button
          type="button"
          className="button button-primary"
          // Browsers remember a failed module import, so retrying means a fresh page; the save lives in localStorage.
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    );
  }
}

/**
 * A panel kept out of the startup bundle. Its code starts downloading right
 * away, so it renders directly once loaded; Suspense only covers a tap that
 * comes before the download finishes, and then only that panel waits.
 */
export function lazyPanel<P extends object>(
  load: () => Promise<ComponentType<P>>,
): (props: P) => JSX.Element {
  let Loaded: ComponentType<P> | null = null;
  const remember = (component: ComponentType<P>) => {
    Loaded = component;
    return { default: component };
  };
  const loading = load().then(remember);
  // A failed prefetch retries when the panel opens instead of breaking startup.
  loading.catch(() => {});
  const Pending = lazy(() => loading.catch(() => load().then(remember)));
  return function LazyPanel(props: P) {
    // Fixed per mount: switching from Suspense to the loaded component would remount the panel and lose its state.
    const [Ready] = useState(() => Loaded);
    if (Ready) return <Ready {...props} />;
    return (
      <PanelLoadBoundary>
        <Suspense fallback={null}>
          <Pending {...props} />
        </Suspense>
      </PanelLoadBoundary>
    );
  };
}
