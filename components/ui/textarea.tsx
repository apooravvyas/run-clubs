import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[110px] w-full rounded-xl border border-track bg-white px-4 py-3 text-[15px] text-ink placeholder:text-stone-light transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/30 focus-visible:border-signal/50",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
export { Textarea };
