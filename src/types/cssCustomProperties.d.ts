import "react";

// Lets inline styles set CSS custom properties (e.g. "--sm-dur") without casts.
declare module "react" {
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined;
  }
}
