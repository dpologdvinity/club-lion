import { Gamepad2, Shirt } from "lucide-react";
import { Avatar } from "./Avatar";
import { fantageGame, type FantageGameId } from "../games/fantage.ts";
import { OUTFITS } from "./avatar/pixelOutfits.ts";
import { PLACES, type AvatarLook } from "../game.ts";
import { newsForDay } from "../utils/news.ts";
import { dayKey } from "../utils/squareFun.ts";

/** The Daily Roar: today's pin hint, a featured game and an outfit of the day. */
export function NewsPanel({
  look,
  onPlay,
  onWear,
}: {
  look: AvatarLook;
  onPlay: (game: FantageGameId) => void;
  onWear: (dressId: string) => void;
}) {
  const news = newsForDay(dayKey(new Date()));
  const game = fantageGame(news.gameId);
  const pinRoom = PLACES.find((place) => place.id === news.pin.room)?.name;
  const room = PLACES.find((place) => place.id === game.room)?.name;
  return (
    <div className="news-paper">
      <p className="news-masthead" aria-hidden="true">
        📰 THE DAILY ROAR
      </p>
      <article className="news-story">
        <span className="news-art" aria-hidden="true">
          {news.pin.emoji}
        </span>
        <div>
          <h3>Pin of the Day</h3>
          <p>
            A {news.pin.label} pin is hiding in {pinRoom}. Can you find it?
          </p>
        </div>
      </article>
      <article className="news-story">
        <span className="news-art" aria-hidden="true">
          {game.icon}
        </span>
        <div>
          <h3>Game of the Day: {game.name}</h3>
          <p>
            {game.description} Find the machine in {room}.
          </p>
          <button
            type="button"
            className="button button-primary"
            onClick={() => onPlay(game.id)}
          >
            <Gamepad2 size={17} aria-hidden="true" /> Play {game.name}
          </button>
        </div>
      </article>
      <article className="news-story">
        <span className="news-art news-doll" aria-hidden="true">
          <Avatar
            look={{ ...look, dressId: news.dressId, costumeId: undefined }}
            size={90}
          />
        </span>
        <div>
          <h3>Outfit of the Day: {OUTFITS[news.dressId]?.label}</h3>
          <p>Everyone is wearing it today, and it's free for you!</p>
          <button
            type="button"
            className="button button-primary"
            onClick={() => onWear(news.dressId)}
          >
            <Shirt size={17} aria-hidden="true" /> Wear it
          </button>
        </div>
      </article>
    </div>
  );
}
