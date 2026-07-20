import Image from "next/image";
import { avatarStyle, initials } from "@/lib/avatars";
import { getAssets } from "@/lib/enrichment";

/**
 * Club identity mark: real hosted logo when available; otherwise a branded,
 * textured avatar circle (club-approximate colors + initials). Never a plain
 * monogram, never a hotlinked Instagram URL.
 */
export function ClubAvatar({
  slug,
  name,
  size = 96,
  className = "",
}: {
  slug: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const assets = getAssets(slug);
  if (assets.logo) {
    return (
      <Image
        src={assets.logo}
        alt={`${name} logo`}
        width={size}
        height={size}
        className={`rounded-full border border-black/10 object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  const s = avatarStyle(slug);
  return (
    <div
      className={`flex items-center justify-center rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(120% 120% at 28% 22%, ${s.bg}F2 0%, ${s.bg} 55%, #00000033 130%)`,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), 0 6px 18px rgba(0,0,0,0.18)",
        border: "1px solid rgba(0,0,0,0.12)",
      }}
      aria-label={`${name} avatar`}
    >
      <span
        className="font-display font-semibold"
        style={{ color: s.fg, fontSize: size * 0.34, letterSpacing: "-0.01em" }}
      >
        {initials(name)}
      </span>
    </div>
  );
}
