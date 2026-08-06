import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-charcoal text-cream shadow-md hover:bg-espresso hover:shadow-lg",
        secondary:
          "bg-blush-200 text-sage-800 hover:bg-blush-300",
        outline:
          "border-2 border-sage-600 text-charcoal bg-transparent hover:bg-sage-50",
        ghost:
          "text-charcoal hover:bg-sage-100/60",
        link: "text-charcoal underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isSpinnerLoading = Boolean(isLoading || loading);
    const Comp = asChild ? Slot : "button";

    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={disabled || isSpinnerLoading}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(
          "relative",
          isSpinnerLoading && "pointer-events-none opacity-80",
          buttonVariants({ variant, size, className })
        )}
        ref={ref}
        disabled={disabled || isSpinnerLoading}
        {...props}
      >
        {isSpinnerLoading ? (
          <>
            <span className="invisible flex items-center justify-center gap-2">{children}</span>
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-current shrink-0" />
            </span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
