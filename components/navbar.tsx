"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/map", label: "Map" },
  { href: "/bangalore", label: "Cities" },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-track/60 bg-paper/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40 rounded-lg">
          <Logo />
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium text-stone transition-colors hover:bg-track/50 hover:text-ink",
                pathname === l.href && "text-ink"
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link href="/submit">
            <Button size="sm" className="ml-1">Add your club</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
