"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { HomepageSettings } from "@/lib/data/settings";

export function Hero({ settings }: { settings: HomepageSettings }) {
  const productWrapRef = useRef<HTMLDivElement>(null);

  function handlePointerMove(e: React.PointerEvent<HTMLElement>) {
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - bounds.left) / bounds.width - 0.5;
    const y = (e.clientY - bounds.top) / bounds.height - 0.5;
    productWrapRef.current?.style.setProperty("--mouse-x", `${x * 18}px`);
    productWrapRef.current?.style.setProperty("--mouse-y", `${y * 18}px`);
  }

  function handlePointerLeave() {
    productWrapRef.current?.style.setProperty("--mouse-x", "0px");
    productWrapRef.current?.style.setProperty("--mouse-y", "0px");
  }

  const [titleLine1, titleLine2] = settings.heroTitle.split("\n");

  return (
    <section
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="hero-shell relative grid grid-cols-1 items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:min-h-[680px] lg:grid-cols-2 lg:px-[clamp(24px,8vw,120px)] lg:py-0"
    >
      <div className="hero-orb hero-orb-one" />
      <div className="hero-orb hero-orb-two" />
      <div className="hero-grain" />

      <div className="relative z-[3] mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
        <span className="animate-fade-up inline-block text-xs font-semibold uppercase tracking-[0.25em] text-rose-gold-dark mb-6">
          New Formula · Daily Ritual
        </span>
        <h1
          className="animate-fade-up font-serif text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.96] tracking-tight text-ink"
          style={{ animationDelay: "90ms" }}
        >
          {titleLine1}
          {titleLine2 && (
            <>
              <br />
              <em className="italic text-rose-gold-dark">{titleLine2}</em>
            </>
          )}
        </h1>
        <p
          className="animate-fade-up mx-auto mt-6 max-w-md text-base leading-relaxed text-ink-soft sm:text-lg lg:mx-0"
          style={{ animationDelay: "180ms" }}
        >
          {settings.heroSubtitle}
        </p>
        <div
          className="animate-fade-up mt-9 flex flex-wrap items-center justify-center gap-5 lg:justify-start"
          style={{ animationDelay: "280ms" }}
        >
          <Button asChild size="lg" className="hover:-translate-y-0.5 hover:bg-rose-gold-dark">
            <Link href={settings.heroCtaLink}>{settings.heroCtaLabel}</Link>
          </Button>
          {settings.heroCtaLabel2 && (
            <Link
              href={settings.heroCtaLink2}
              className="text-sm text-ink-soft underline underline-offset-4 transition-colors hover:text-ink"
            >
              {settings.heroCtaLabel2}
            </Link>
          )}
        </div>
      </div>

      <div
        ref={productWrapRef}
        aria-hidden="true"
        className="hero-product-wrap relative z-[2] grid min-h-[320px] place-items-center sm:min-h-[420px] lg:min-h-[500px]"
      >
        <div className="hero-product-glow absolute h-64 w-64 rounded-full bg-warm-white/60 blur-[50px] sm:h-80 sm:w-80 lg:h-[22rem] lg:w-[22rem]" />
        <div className="hero-product-float relative aspect-[900/1100] w-[65%] max-w-[430px] sm:w-[55%] lg:w-[72%]">
          <Image
            src={settings.heroImage}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 60vw, 30vw"
            className="object-contain drop-shadow-[25px_30px_22px_rgba(84,52,45,0.22)]"
          />
        </div>
      </div>
    </section>
  );
}
