/** Fantage-style titles shown above your name, earned by collecting stamps. */
export const TITLES = [
  { min: 0, title: "Newbie" },
  { min: 5, title: "Explorer" },
  { min: 15, title: "Superstar" },
  { min: 30, title: "Legend" },
] as const;

export function titleFor(stamps: number): string {
  let title: string = TITLES[0].title;
  for (const rank of TITLES) if (stamps >= rank.min) title = rank.title;
  return title;
}
