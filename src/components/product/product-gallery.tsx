"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: { url: string; alt: string | null }[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [zooming, setZooming] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const pics = images.length ? images : [{ url: "/generated/og-image.jpg", alt: name }];

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-4">
      <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible no-scrollbar">
        {pics.map((img, i) => (
          <button
            key={img.url + i}
            onClick={() => setActive(i)}
            className={cn(
              "relative h-16 w-14 sm:h-20 sm:w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors cursor-pointer",
              active === i ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"
            )}
          >
            <Image src={img.url} alt={img.alt ?? name} fill className="object-cover" sizes="80px" />
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        onMouseEnter={() => setZooming(true)}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={handleMouseMove}
        className="relative flex-1 aspect-[4/5] overflow-hidden rounded-2xl bg-cream cursor-zoom-in group"
      >
        <Image
          src={pics[active].url}
          alt={pics[active].alt ?? name}
          fill
          priority
          sizes="(max-width: 640px) 100vw, 45vw"
          className={cn("object-cover transition-transform duration-200 ease-out", zooming && "scale-[1.9]")}
          style={zooming ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : undefined}
        />
        <div className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-warm-white/90 backdrop-blur flex items-center justify-center text-ink opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <ZoomIn size={16} />
        </div>
      </div>
    </div>
  );
}
