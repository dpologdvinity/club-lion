import { useEffect } from "react";
import { roomMusicFor } from "../utils/roomMusic.ts";
import { setRoomMusicPlace } from "../utils/roomMusicPlayer.ts";

/** Keeps the room soundtrack in step with the current room. Renders nothing. */
export function RoomMusic({ place }: { place: string }) {
  useEffect(() => {
    setRoomMusicPlace(place);
    document.documentElement.dataset.roomMusic = roomMusicFor(place).id;
  }, [place]);
  return null;
}
