import { BadgeCheck } from "lucide-react";

export function VerifiedBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 text-emerald-600" title="Verified by the club">
      <BadgeCheck className="h-4 w-4" strokeWidth={2.2} />
      {!compact && <span className="text-xs font-medium">Verified</span>}
    </span>
  );
}
