/**
 * Pixel costumes: whole-body pieces worn over everything else (suits with a
 * face hole, sports kits, boats and props), redrawn after the Fantage costume
 * pack (inspo/fantage/avatar, local only) in scripts/pixel/costumes.mts.
 */
export type CostumeEntry = {
  id: string;
  label: string;
  /** Hoods and full suits cover the head, so the hair is not drawn. */
  hidesHair?: true;
};

export const COSTUMES: CostumeEntry[] = [
  { id: "teddy_bear", label: "Teddy Bear Suit", hidesHair: true },
  { id: "heart_suit", label: "Big Heart Suit", hidesHair: true },
  { id: "dolphin_suit", label: "Dolphin Suit", hidesHair: true },
  { id: "skater", label: "Skater Kit" },
  { id: "masquerade_noir", label: "Midnight Masquerade" },
  { id: "masquerade_violet", label: "Violet Masquerade" },
  { id: "ice_skater", label: "Ice Skater" },
  { id: "hockey_red", label: "Red Hockey Kit" },
  { id: "hockey_purple", label: "Purple Hockey Kit" },
  { id: "hockey_teal", label: "Teal Hockey Kit" },
  { id: "hockey_orange", label: "Orange Hockey Kit" },
  { id: "hula", label: "Hibiscus Hula Dress" },
  { id: "cheerleader", label: "Cheer Squad" },
  { id: "canoe_yellow", label: "Yellow Canoe" },
  { id: "canoe_purple", label: "Purple Fishing Canoe" },
  { id: "raft_blue", label: "Blue Fishing Raft" },
  { id: "duck_float", label: "Duck Float" },
  { id: "beach_bandana", label: "Beach Bandana" },
  { id: "turtle", label: "Turtle Dress" },
  { id: "torch_bearer", label: "Torch Bearer" },
  { id: "eagle_mascot", label: "Eagle Mascot", hidesHair: true },
  { id: "pajama_pink", label: "Pink Pajamas" },
  { id: "pajama_blue", label: "Blue Pajamas" },
  { id: "sleeping_bag", label: "Sleeping Bag", hidesHair: true },
  { id: "ufo", label: "Flying Saucer" },
  { id: "cave_mane", label: "Cave Mane", hidesHair: true },
  { id: "ballerina", label: "Ballerina" },
  { id: "rain_hood", label: "Rain Slicker", hidesHair: true },
  { id: "sailor_pink", label: "Pink Sailor Dress" },
];
