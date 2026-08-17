import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider",
  {
    variants: {
      variant: {
        ink: "bg-ink text-warm-white",
        blush: "bg-blush text-ink",
        rose: "bg-rose-gold text-warm-white",
        outline: "border border-ink/30 text-ink",
        sale: "bg-red-700 text-white",
        success: "bg-emerald-700 text-white",
        warning: "bg-amber-600 text-white",
        muted: "bg-sand text-ink-soft",
      },
    },
    defaultVariants: { variant: "ink" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}
