import { cn } from "@/lib/utils";

export function Container({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12", className)}
      {...props}
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className
      )}
    >
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-gold-dark">
          {eyebrow}
        </span>
      )}
      <h2 className="font-serif text-3xl sm:text-4xl leading-tight text-ink">{title}</h2>
      {description && (
        <p className="text-ink-soft max-w-xl text-[15px] leading-relaxed">{description}</p>
      )}
    </div>
  );
}
