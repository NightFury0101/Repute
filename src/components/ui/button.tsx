import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium tracking-wide transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-gold",
  {
    variants: {
      variant: {
        primary:
          "bg-ink text-warm-white hover:bg-ink-soft active:scale-[0.98] shadow-sm hover:shadow-md",
        secondary:
          "bg-transparent text-ink border border-ink/70 hover:bg-ink hover:text-warm-white active:scale-[0.98]",
        blush:
          "bg-blush text-ink hover:bg-blush-deep active:scale-[0.98]",
        ghost: "bg-transparent text-ink hover:bg-ink/5",
        link: "bg-transparent text-ink underline-offset-4 hover:underline p-0 rounded-none",
        destructive:
          "bg-red-700 text-white hover:bg-red-800 active:scale-[0.98]",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6",
        lg: "h-14 px-9 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
