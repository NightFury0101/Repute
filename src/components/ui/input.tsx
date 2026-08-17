import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-lg border border-line bg-warm-white px-4 text-sm text-ink placeholder:text-ink-mute transition-colors focus:outline-none focus:ring-2 focus:ring-rose-gold/40 focus:border-rose-gold disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex w-full rounded-lg border border-line bg-warm-white px-4 py-3 text-sm text-ink placeholder:text-ink-mute transition-colors focus:outline-none focus:ring-2 focus:ring-rose-gold/40 focus:border-rose-gold disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "text-xs font-medium uppercase tracking-wider text-ink-soft",
        className
      )}
      {...props}
    />
  );
});
Label.displayName = "Label";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "flex h-12 w-full appearance-none rounded-lg border border-line bg-warm-white bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%237c7266%22><path d=%22M5.25 7.5L10 12.25L14.75 7.5H5.25Z%22/></svg>')] bg-no-repeat bg-[right_1rem_center] px-4 pr-10 text-sm text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-rose-gold/40 focus:border-rose-gold disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";
