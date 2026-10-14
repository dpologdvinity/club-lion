import { useId, useState, type KeyboardEvent, type MouseEvent } from "react";
import {
  Check,
  Eraser,
  LayoutGrid,
  Palette,
  Star,
  Undo2,
  WandSparkles,
} from "lucide-react";
import {
  PALETTE,
  SPECIAL_FILLS,
  applyFill,
  surpriseFills,
  type ColoringBookSave,
  type Fill,
  type PageFills,
} from "../utils/coloringBook.ts";
import { COLORING_PAGES, type ColoringPage } from "../utils/coloringPages.ts";
import { playFill, playSparkle, playSwish } from "../utils/playfulSfx.ts";

type Tool = Fill | "eraser";

const fillLabel = (fill: Fill) =>
  [...PALETTE, ...SPECIAL_FILLS].find((item) => item.id === fill)?.label ?? "";

function prefersReducedMotion() {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function ColoringBook({
  book,
  onColor,
}: {
  book: ColoringBookSave | undefined;
  onColor: (pageId: string, fills: PageFills, finish: boolean) => void;
}) {
  const [page, setPage] = useState<ColoringPage | null>(null);
  const [fills, setFills] = useState<PageFills>({});
  const [history, setHistory] = useState<PageFills[]>([]);
  const [tool, setTool] = useState<Tool>("mango");
  const [celebrating, setCelebrating] = useState(false);

  const open = (next: ColoringPage) => {
    setPage(next);
    setFills(book?.pages[next.id] ?? {});
    setHistory([]);
    setCelebrating(false);
  };

  if (!page)
    return (
      <div className="cb-gallery" role="list" aria-label="Coloring pages">
        {COLORING_PAGES.map((item) => {
          const saved = book?.pages[item.id];
          const finished = book?.finished.includes(item.id) ?? false;
          return (
            <div key={item.id} role="listitem">
              <button
                type="button"
                className="cb-thumb"
                aria-label={`Color the ${item.name.toLowerCase()}${
                  finished ? ", finished" : saved ? ", started" : ""
                }`}
                onClick={() => open(item)}
              >
                <PageArt page={item} fills={saved ?? {}} />
                {finished && (
                  <span className="cb-badge" aria-hidden="true">
                    <Star size={20} fill="currentColor" />
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    );

  const finished = book?.finished.includes(page.id) ?? false;
  const change = (next: PageFills) => {
    setHistory((list) => [...list.slice(-39), fills]);
    setFills(next);
    onColor(page.id, next, false);
  };
  const paintRegion = (regionId: string) => {
    const fill = tool === "eraser" ? null : tool;
    if ((fills[regionId] ?? null) === fill) return;
    change(applyFill(fills, regionId, fill));
    if (fill === "rainbow" || fill === "sparkle") playSparkle(3);
    else if (fill)
      playFill(PALETTE.findIndex((color) => color.id === fill) % 8);
    else playSwish();
  };
  const undo = () => {
    const previous = history.at(-1);
    if (!previous) return;
    setHistory((list) => list.slice(0, -1));
    setFills(previous);
    onColor(page.id, previous, false);
    playSwish();
  };
  const surprise = () => {
    change(surpriseFills(page));
    playSparkle(6);
  };
  const finish = () => {
    onColor(page.id, fills, true);
    setCelebrating(true);
    playSparkle(8);
  };
  const empty = Object.keys(fills).length === 0;

  return (
    <div className="cb-page">
      <div className="cb-toolbar">
        <button
          type="button"
          className="cb-tool"
          aria-label="All pages"
          title="All pages"
          onClick={() => setPage(null)}
        >
          <LayoutGrid size={24} />
        </button>
        <button
          type="button"
          className="cb-tool"
          aria-label="Undo"
          title="Undo"
          disabled={!history.length}
          onClick={undo}
        >
          <Undo2 size={24} />
        </button>
        <button
          type="button"
          className="cb-tool"
          aria-label="Surprise me"
          title="Surprise me"
          onClick={surprise}
        >
          <WandSparkles size={24} />
        </button>
        <button
          type="button"
          className={`cb-done${finished ? " is-finished" : ""}`}
          aria-label="I'm done"
          title="Done"
          disabled={empty}
          onClick={finish}
        >
          <Check size={30} strokeWidth={3} />
          {finished && (
            <Star size={18} fill="currentColor" aria-hidden="true" />
          )}
        </button>
      </div>
      <div className="cb-canvas">
        <PageArt page={page} fills={fills} onRegion={paintRegion} />
        {empty && (
          <span className="cb-hint" aria-hidden="true">
            👆
          </span>
        )}
        {celebrating && (
          <div className="cb-celebrate">
            {Array.from({ length: 14 }, (_, index) => (
              <span key={index} className="cb-confetti" aria-hidden="true" />
            ))}
            <span className="cb-big-star" aria-hidden="true">
              <Star size={84} fill="currentColor" />
            </span>
            <p className="sr-only" role="status">
              Beautiful! The {page.name.toLowerCase()} is finished.
            </p>
            <div className="cb-celebrate-actions">
              <button
                type="button"
                className="cb-tool"
                aria-label="All pages"
                onClick={() => setPage(null)}
              >
                <LayoutGrid size={26} />
              </button>
              <button
                type="button"
                className="cb-tool is-primary"
                aria-label="Keep coloring"
                autoFocus
                onClick={() => setCelebrating(false)}
              >
                <Palette size={26} />
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="cb-palette" role="group" aria-label="Colors">
        {PALETTE.map((color) => (
          <button
            key={color.id}
            type="button"
            className="cb-swatch"
            style={{ background: color.hex }}
            aria-label={color.label}
            aria-pressed={tool === color.id}
            onClick={() => setTool(color.id)}
          />
        ))}
        {SPECIAL_FILLS.map((fill) => (
          <button
            key={fill.id}
            type="button"
            className={`cb-swatch cb-swatch-${fill.id}`}
            aria-label={fill.label}
            aria-pressed={tool === fill.id}
            onClick={() => setTool(fill.id)}
          />
        ))}
        <button
          type="button"
          className="cb-swatch cb-swatch-eraser"
          aria-label="Eraser"
          aria-pressed={tool === "eraser"}
          onClick={() => setTool("eraser")}
        >
          <Eraser size={26} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/** One page of line art; regions become buttons when `onRegion` is given. */
function PageArt({
  page,
  fills,
  onRegion,
}: {
  page: ColoringPage;
  fills: PageFills;
  onRegion?: (regionId: string) => void;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const paint = (fill: Fill | undefined) =>
    !fill
      ? "#ffffff"
      : fill === "rainbow" || fill === "sparkle"
        ? `url(#${uid}-${fill})`
        : (PALETTE.find((color) => color.id === fill)?.hex ?? "#ffffff");
  const activate = (
    regionId: string,
    event: MouseEvent<SVGPathElement> | KeyboardEvent<SVGPathElement>,
  ) => {
    onRegion?.(regionId);
    if (!prefersReducedMotion())
      event.currentTarget.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.05)" },
          { transform: "scale(1)" },
        ],
        { duration: 280, easing: "ease-out" },
      );
  };
  return (
    <svg
      className="cb-art"
      viewBox="0 0 400 300"
      {...(onRegion
        ? { role: "group", "aria-label": `${page.name} picture` }
        : { "aria-hidden": true })}
    >
      <defs>
        <linearGradient id={`${uid}-rainbow`} x1="0" y1="0" x2="1" y2="1">
          {[
            "#ff5f6d",
            "#ffa94d",
            "#ffe066",
            "#69db7c",
            "#4dabf7",
            "#b197fc",
          ].map((color, index) => (
            <stop key={color} offset={index / 5} stopColor={color} />
          ))}
        </linearGradient>
        <pattern
          id={`${uid}-sparkle`}
          width="22"
          height="22"
          patternUnits="userSpaceOnUse"
        >
          <rect width="22" height="22" fill="#ffd76a" />
          <path
            d="M6 2l1.4 3.6L11 7l-3.6 1.4L6 12l-1.4-3.6L1 7l3.6-1.4Z"
            fill="#ffffff"
          />
          <circle cx="16" cy="16" r="2" fill="#ff9fcf" />
          <circle cx="17" cy="5" r="1.2" fill="#ffffff" />
        </pattern>
      </defs>
      {page.regions.map((region) => {
        const fill = fills[region.id];
        return (
          <path
            key={region.id}
            className="cb-region"
            d={region.d}
            fill={paint(fill)}
            {...(onRegion && {
              role: "button",
              tabIndex: 0,
              "aria-label": fill
                ? `${region.label}, ${fillLabel(fill).toLowerCase()}`
                : region.label,
              onClick: (event: MouseEvent<SVGPathElement>) =>
                activate(region.id, event),
              onKeyDown: (event: KeyboardEvent<SVGPathElement>) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                activate(region.id, event);
              },
            })}
          />
        );
      })}
      <g className="cb-details">
        {page.details.map((detail, index) => (
          <path
            key={index}
            d={detail.d}
            className={`cb-detail-${detail.kind}`}
          />
        ))}
      </g>
    </svg>
  );
}
