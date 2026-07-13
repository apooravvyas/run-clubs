import type { Metadata } from "next";
import { getCities } from "@/lib/data";
import { SubmitForm } from "@/components/submit-form";

export const metadata: Metadata = {
  title: "Add your club",
  description: "Put your run club on the map in three minutes. No login, free forever, verified before it goes live.",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <div className="mx-auto mb-10 max-w-xl text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Put your club on the map
        </h1>
        <p className="mt-4 text-[15px] leading-relaxed text-stone">
          Three minutes. No login. We verify with the club before anything goes live —
          that&apos;s what keeps the badge worth having.
        </p>
      </div>
      <SubmitForm cities={getCities()} />
    </div>
  );
}
