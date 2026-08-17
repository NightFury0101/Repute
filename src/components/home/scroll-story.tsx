"use client";

/**
 * Pinned three-chapter scroll cinema hero ("Editorial Liquid Cartography").
 * A single serum bottle travels through three atmospheric scenes as the
 * visitor scrolls; position/scale/rotation are driven by scroll progress
 * rather than independent looping, so motion always reads as narrative,
 * not decoration. Respects prefers-reduced-motion via CSS (see globals.css)
 * plus useReducedMotion here to freeze the product transform.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";

const ASSETS = {
  product: "/scroll-story/product-cutout.png",
  firstLight: "/scroll-story/firstlight.jpg",
  hydration: "/scroll-story/hydration.jpg",
  nightRitual: "/scroll-story/night-ritual.jpg",
  symbol: "/scroll-story/symbol.png",
};

type ChapterCopyProps = {
  number: string;
  label: string;
  title: React.ReactNode;
  body: string;
  align: "left" | "right";
  onDark?: boolean;
  progress: MotionValue<number>;
  window: [number, number, number, number];
  action: string;
  actionHref: string;
  initialVisible?: boolean;
};

function ChapterCopy({
  number,
  label,
  title,
  body,
  align,
  onDark,
  progress,
  window,
  action,
  actionHref,
  initialVisible = false,
}: ChapterCopyProps) {
  const opacity = useTransform(progress, window, initialVisible ? [1, 1, 1, 0] : [0, 1, 1, 0]);
  const y = useTransform(progress, window, [38, 0, 0, -38]);

  return (
    <motion.article
      className={`story-copy story-copy--${align}${onDark ? " story-copy--on-dark" : ""}`}
      style={{ opacity, y }}
      aria-live="polite"
    >
      <p className="story-eyebrow">
        <span>{number}</span>
        {label}
      </p>
      <h1>{title}</h1>
      <p className="story-body">{body}</p>
      <Link className="story-link" href={actionHref}>
        {action} <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.7} />
      </Link>
    </motion.article>
  );
}

export function ScrollStory() {
  const stageRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const update = () => setHeaderHeight(header.getBoundingClientRect().height);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 118,
    damping: 27,
    restDelta: 0.001,
  });

  const productX = useTransform(progress, [0, 0.27, 0.55, 0.8, 1], ["15vw", "14vw", "-16vw", "12vw", "11vw"]);
  const productY = useTransform(progress, [0, 0.27, 0.55, 0.8, 1], ["14vh", "5vh", "-5vh", "2vh", "10vh"]);
  const productScale = useTransform(progress, [0, 0.3, 0.63, 1], [0.78, 1.04, 0.9, 1.05]);
  const productRotate = useTransform(progress, [0, 0.31, 0.66, 1], [-10, 2, -8, 5]);
  const backgroundY = useTransform(progress, [0, 1], ["0%", "-6%"]);
  const firstOpacity = useTransform(progress, [0, 0.22, 0.33], [1, 1, 0]);
  const hydrationOpacity = useTransform(progress, [0.22, 0.38, 0.58, 0.7], [0, 1, 1, 0]);
  const nightOpacity = useTransform(progress, [0.58, 0.77, 1], [0, 1, 1]);
  const chapterOneActive = useTransform(progress, [0, 0.28, 0.35], [1, 1, 0.25]);
  const chapterTwoActive = useTransform(progress, [0.25, 0.42, 0.63, 0.72], [0.25, 1, 1, 0.25]);
  const chapterThreeActive = useTransform(progress, [0.62, 0.8, 1], [0.25, 1, 1]);

  const productMotion = reduceMotion
    ? { x: "10vw", y: "7vh", scale: 0.92, rotate: -3 }
    : { x: productX, y: productY, scale: productScale, rotate: productRotate };

  return (
    <section
      className="scroll-story"
      style={{ "--story-header-h": `${headerHeight}px` } as React.CSSProperties}
    >
      <section className="story-stage" ref={stageRef} aria-label="Repute serum ritual">
        <div className="story-sticky">
          <div className="story-backgrounds" aria-hidden="true">
            <motion.div className="story-background story-background--first" style={{ opacity: firstOpacity, y: backgroundY }}>
              <Image src={ASSETS.firstLight} alt="" fill priority sizes="100vw" />
            </motion.div>
            <motion.div className="story-background" style={{ opacity: hydrationOpacity, y: backgroundY }}>
              <Image src={ASSETS.hydration} alt="" fill sizes="100vw" />
            </motion.div>
            <motion.div className="story-background" style={{ opacity: nightOpacity, y: backgroundY }}>
              <Image src={ASSETS.nightRitual} alt="" fill sizes="100vw" />
            </motion.div>
          </div>
          <div className="story-grain" aria-hidden="true" />

          <motion.div className="story-mark" style={{ opacity: firstOpacity }}>
            <Image src={ASSETS.symbol} alt="" width={32} height={32} />
            <div>
              <span>Repute</span>
              <small>Ritual, considered</small>
            </div>
          </motion.div>

          <div className="story-rail" aria-label="Story progress">
            <span>Scroll to unfold</span>
            <div className="story-rail-stems" aria-hidden="true">
              <motion.i style={{ opacity: chapterOneActive }} />
              <motion.i style={{ opacity: chapterTwoActive }} />
              <motion.i style={{ opacity: chapterThreeActive }} />
            </div>
            <span className="story-rail-count">01 — 03</span>
          </div>

          <motion.div className="story-index story-index-one" style={{ opacity: firstOpacity }} aria-hidden="true">
            01
          </motion.div>
          <motion.div className="story-index story-index-two" style={{ opacity: hydrationOpacity }} aria-hidden="true">
            02
          </motion.div>
          <motion.div className="story-index story-index-three" style={{ opacity: nightOpacity }} aria-hidden="true">
            03
          </motion.div>

          <ChapterCopy
            number="01"
            label="First light"
            title={
              <>
                Let the light
                <br />
                <em>find your skin.</em>
              </>
            }
            body="A dawn-weight serum that turns the first step of your routine into a quiet, luminous reset."
            align="left"
            progress={progress}
            window={[0, 0.001, 0.24, 0.34]}
            action="Discover the Ritual"
            actionHref="/shop"
            initialVisible
          />
          <ChapterCopy
            number="02"
            label="Cellular hydration"
            title={
              <>
                Water, held
                <br />
                <em>closer.</em>
              </>
            }
            body="Cushioning, multi-weight hydration softens the surface while skin feels calm, replenished, and awake."
            align="right"
            progress={progress}
            window={[0.24, 0.38, 0.58, 0.71]}
            action="Explore the Formula"
            actionHref="/shop?filter=bestsellers"
          />
          <ChapterCopy
            number="03"
            label="Night ritual"
            title={
              <>
                Turn down the day.
                <br />
                <em>Keep the glow.</em>
              </>
            }
            body="Silk-soft botanicals and restorative lipids settle into an unhurried evening ritual — made to be returned to."
            align="left"
            onDark
            progress={progress}
            window={[0.6, 0.76, 1, 1.05]}
            action="Begin Your Reset"
            actionHref="/shop?filter=new"
          />

          <motion.figure className="story-product" style={productMotion}>
            <div className="story-product-halo" aria-hidden="true" />
            <Image src={ASSETS.product} alt="Repute luminous serum bottle" width={400} height={600} priority />
            <figcaption className="story-caption">Daily luminous serum — 30 ml</figcaption>
          </motion.figure>

          <motion.div className="story-cue" style={{ opacity: firstOpacity }} aria-hidden="true">
            <span>Follow the ritual</span>
            <ArrowDown size={18} strokeWidth={1.4} />
          </motion.div>
        </div>
      </section>
    </section>
  );
}
