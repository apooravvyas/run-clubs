import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-5 text-center">
      <LogoMark className="h-12 w-12 opacity-30 grayscale" />
      <h1 className="mt-6 font-display text-4xl font-extrabold text-ink">Off the route.</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-stone">
        This page doesn&apos;t exist — but 40+ run clubs do. Let&apos;s get you back on the map.
      </p>
      <Link href="/map" className="mt-8">
        <Button>Open the map</Button>
      </Link>
    </div>
  );
}
