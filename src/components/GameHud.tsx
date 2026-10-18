import type { ReactNode } from "react";
import {
  CircleUserRound,
  Compass,
  Crown,
  Gamepad2,
  House,
  IdCard,
  Music,
  Server,
  Settings,
  Shirt,
  ShoppingBag,
  Stamp,
  Store,
  Trophy,
  Users,
  Home,
  Scissors,
} from "lucide-react";

/** The App panels the HUD opens. */
export type HudPanel =
  | "stamps"
  | "catalog"
  | "jukebox"
  | "shop"
  | "salon"
  | "card"
  | "leaderboard"
  | "rooftop"
  | "closet"
  | "friends"
  | "servers"
  | "account";

type HudButton = {
  label: string;
  icon: ReactNode;
  selected: boolean;
  onClick: () => void;
};

/**
 * Fantage-style game HUD over the framed world: labelled newspaper-style
 * icons top left, round shortcuts top right and chunky blue squares along
 * the bottom either side of the chat bar. Every button keeps the name the old
 * header nav had, so shortcuts and tests find the same targets.
 */
export function GameHud({
  panel,
  place,
  sidebarOpen,
  settingsOpen,
  settings,
  onPanel,
  onWorld,
  onGames,
  onDen,
  onToggleSidebar,
  onToggleSettings,
}: {
  panel: string | null;
  place: string;
  sidebarOpen: boolean;
  settingsOpen: boolean;
  /** Lighting, sound and help controls shown in the Settings popover. */
  settings: ReactNode;
  onPanel: (panel: HudPanel) => void;
  onWorld: () => void;
  onGames: () => void;
  onDen: () => void;
  onToggleSidebar: () => void;
  onToggleSettings: () => void;
}) {
  const open = (id: HudPanel, label: string, icon: ReactNode): HudButton => ({
    label,
    icon,
    selected: panel === id,
    onClick: () => onPanel(id),
  });
  const news: HudButton[] = [
    {
      label: "Games",
      icon: <Gamepad2 />,
      selected: panel === "games",
      onClick: onGames,
    },
    open("stamps", "Stamp Book", <Stamp />),
    open("catalog", "Le Shop", <ShoppingBag />),
    open("jukebox", "Jukebox", <Music />),
  ];
  const corner: HudButton[] = [
    {
      label: "My den",
      icon: <House />,
      selected: place === "den" && !panel,
      onClick: onDen,
    },
    open("shop", "Shop", <Store />),
    open("salon", "Salon", <Scissors />),
    open("card", "ID Card", <IdCard />),
    open("leaderboard", "Leaderboard", <Trophy />),
    open("rooftop", "VIP Lounge", <Crown />),
  ];
  const left: HudButton[] = [
    {
      label: "World",
      icon: <Home />,
      selected: place !== "den" && !panel,
      onClick: onWorld,
    },
    open("closet", "Closet", <Shirt />),
  ];
  const right: HudButton[] = [
    open("friends", "Friends", <Users />),
    open("servers", "Servers", <Server />),
    open("account", "Account", <CircleUserRound />),
  ];
  const square = (b: HudButton, className: string) => (
    <button
      type="button"
      key={b.label}
      className={`${className}${b.selected ? " selected" : ""}`}
      aria-label={b.label}
      title={b.label}
      onClick={b.onClick}
    >
      {b.icon}
    </button>
  );

  return (
    <>
      <nav className="hud-news" aria-label="Main navigation">
        {news.map((b) => (
          <button
            type="button"
            key={b.label}
            className={`hud-news-button${b.selected ? " selected" : ""}`}
            onClick={b.onClick}
          >
            <span className="hud-news-icon" aria-hidden="true">
              {b.icon}
            </span>
            <span className="hud-news-label">{b.label}</span>
          </button>
        ))}
      </nav>
      <nav className="hud-corner" aria-label="Shortcuts">
        {corner.map((b) => square(b, "hud-round"))}
        <button
          type="button"
          className={`hud-round sidebar-toggle${sidebarOpen ? " selected" : ""}`}
          aria-label={
            sidebarOpen ? "Hide adventures sidebar" : "Show adventures sidebar"
          }
          aria-expanded={sidebarOpen}
          onClick={onToggleSidebar}
        >
          <Compass />
        </button>
      </nav>
      <div className="hud-bar hud-bar-left">
        {left.map((b) => square(b, "hud-square"))}
      </div>
      <div className="hud-bar hud-bar-right header-actions">
        {right.map((b) => square(b, "hud-square"))}
        <button
          type="button"
          className={`hud-square header-settings-toggle${settingsOpen ? " selected" : ""}`}
          aria-label="Settings"
          aria-expanded={settingsOpen}
          aria-controls="header-settings"
          onClick={onToggleSettings}
        >
          <Settings />
        </button>
        <div
          id="header-settings"
          className={`header-settings hud-settings${settingsOpen ? " is-open" : ""}`}
        >
          {settings}
        </div>
      </div>
    </>
  );
}
