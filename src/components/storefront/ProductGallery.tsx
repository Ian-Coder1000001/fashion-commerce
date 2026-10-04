"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryImage {
  secureUrl: string;
}

export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[3/4] bg-surface border border-border overflow-hidden group">
        {active ? (
          <Image
            src={active.secureUrl}
            alt={productName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-xs text-fg-muted">Image coming soon</span>
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, index) => (
            <button
              key={img.secureUrl}
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-[3/4] bg-surface border ${
                index === activeIndex ? "border-fg" : "border-border"
              }`}
            >
              <Image
                src={img.secureUrl}
                alt=""
                fill
                className="object-cover"
                sizes="10vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}