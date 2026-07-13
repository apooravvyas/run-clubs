import { LogoMark } from "@/components/logo";

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-track bg-white/50 px-8 py-16 text-center">
      <LogoMark className="h-9 w-9 opacity-40 grayscale" />
      <h3 className="mt-4 font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-stone">{hint}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
