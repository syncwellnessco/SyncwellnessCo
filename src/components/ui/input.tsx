import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border border-[#EBE3DB] bg-[#FAF8F5] px-3.5 py-2 text-sm text-charcoal placeholder:text-charcoal/40 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8C6D40] focus-visible:border-[#8C6D40] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
