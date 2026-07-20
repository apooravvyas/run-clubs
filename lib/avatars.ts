/**
 * Branded avatar palettes — interim identity until real hosted logos exist.
 * Colors approximate each club's observed Instagram profile mark (dominant color),
 * so cards read as distinct communities. Replaced automatically when
 * club-assets.json gains a real `logo` path.
 */
export interface AvatarStyle { bg: string; fg: string; accent?: string }

const PALETTES: Record<string, AvatarStyle> = {
  "indiranagar-run-club": { bg: "#151514", fg: "#F97316" },   // black / orange runner mark
  "stride-run-club":      { bg: "#4C2A85", fg: "#F5C518" },   // purple / yellow script
  "daud-bangalore":       { bg: "#101010", fg: "#FAFAF7" },   // black / white devanagari
  "the-bhag-club":        { bg: "#0B0B0B", fg: "#EDEDE8" },   // black / white horse
  "bel-bullets":          { bg: "#23231F", fg: "#D8D4CB" },
  "bengaluru-runners":    { bg: "#B3261E", fg: "#FFF6EC" },   // red runner mark
  "hsr-run-club":         { bg: "#9A1B1B", fg: "#F5EFE6" },   // red/black badge
  "5am-social":           { bg: "#59B44A", fg: "#0E2A0B" },   // green mark
  "delhi-run-collective": { bg: "#111113", fg: "#EFEDE6" },
  "bombay-running":       { bg: "#123B6D", fg: "#EAF1F8" },   // navy seal
  "overlydaa":            { bg: "#3D2A56", fg: "#EFE7F6" },
  "mumbai-road-runners":  { bg: "#14324A", fg: "#E8EFF4" },
  "pudhechala-run-club":  { bg: "#284B32", fg: "#EAF4EC" },
  "wepersist":            { bg: "#171717", fg: "#F2C230" },   // black / yellow arrow
  "alpha-run-club":       { bg: "#5E1414", fg: "#F3E7DC" },   // maroon crest
  "gati-crew":            { bg: "#0F0F0F", fg: "#F0EEE8" },   // black / white गति
  "hyderabad-runners-society": { bg: "#A32020", fg: "#FDF6EE" }, // red/white badge
  "hydrn":                { bg: "#E9E7E1", fg: "#232320" },   // light minimal wordmark
  "logout-runners":       { bg: "#F0EEE8", fg: "#141412" },   // white / black LOG OUT
  "chennai-runners":      { bg: "#8C271E", fg: "#F7EFDF" },   // red/yellow seal
};

const FALLBACK: AvatarStyle = { bg: "#1C1C1B", fg: "#F5F3EE" };

export function avatarStyle(slug: string): AvatarStyle {
  return PALETTES[slug] ?? FALLBACK;
}

/** Initials: up to 2 significant characters ("Indiranagar Run Club" -> "IR"). */
export function initials(name: string): string {
  const stop = new Set(["run", "club", "the", "and", "of"]);
  const words = name.split(/\s+/).filter((w) => !stop.has(w.toLowerCase()));
  const src = words.length ? words : name.split(/\s+/);
  return src.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}
