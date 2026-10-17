/** The painted square, with its top 160 px of sky cropped to fit the 864-high stage. */
export function SavannaSquareScenery({ seconds }: { seconds: number }) {
  void seconds; // ambient motion is CSS-driven (sceneryMotion.css)
  return (
    <image
      href={`${import.meta.env.BASE_URL}assets/savanna.webp`}
      x={0}
      y={-160}
      width={1536}
      height={1024}
      preserveAspectRatio="none"
    />
  );
}
