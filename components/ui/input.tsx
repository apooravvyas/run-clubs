import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-xl border border-track bg-white px-4 text-[15px] text-ink placeholder:text-stone-light transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/30 focus-visible:border-signal/50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
export { Input };
