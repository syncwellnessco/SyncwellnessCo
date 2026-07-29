import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-[#EBE3DB] bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-charcoal placeholder:text-charcoal/40 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8C6D40] focus-visible:border-[#8C6D40] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
