export type RoomPortal = {
  targetRoomId: string;
  targetSpawn: { x: number; y: number };
  triggerBounds: { x1: number; y1: number; x2: number; y2: number };
  label: string;
};

export type DepthLayer = {
  id: string;
  y: number;
  asset: string;
};

export type RoomManifest = {
  id: string;
  name: string;
  district: string;
  stageWidth: number;
  stageHeight: number;
  backgroundAsset: string;
  walkablePolygon: [number, number][];
  depthLayers: DepthLayer[];
  portals: RoomPortal[];
  interactives: {
    id: string;
    type:
      | "activity"
      | "ride"
      | "instrument"
      | "game_launch"
      | "secret_clickable"
      | "shop";
    position: { x: number; y: number };
    actionData: Record<string, unknown>;
  }[];
  ambientAudioPreset: string;
};
