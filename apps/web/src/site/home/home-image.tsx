"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@esigenta/ui";

type HomeImageProps = {
  alt?: string;
  className?: string;
  decorative?: boolean;
  fallbackClassName?: string;
  fallbackLabel: string;
  imageClassName?: string;
  minimalFallback?: boolean;
  priority?: boolean;
  sizes: string;
  src: string;
  unoptimized?: boolean;
};

export function HomeImage({
  alt = "",
  className,
  decorative = false,
  fallbackClassName,
  fallbackLabel,
  imageClassName,
  minimalFallback = false,
  priority = false,
  sizes,
  src,
  unoptimized = false,
}: HomeImageProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {hasError && minimalFallback ? (
        <div
          className={cn(
            "absolute inset-0 bg-cantiere-linen text-cantiere-ink-secondary",
            fallbackClassName,
          )}
        >
          <span className="absolute bottom-4 right-4 max-w-48 text-right text-xs leading-4">
            {fallbackLabel}
          </span>
        </div>
      ) : hasError ? (
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-cantiere-linen text-center text-xs leading-5 text-cantiere-ink-secondary",
            fallbackClassName,
          )}
        >
          <ImageIcon className="size-6" aria-hidden="true" strokeWidth={1.5} />
          <span>{fallbackLabel}</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={decorative ? "" : alt}
          aria-hidden={decorative ? true : undefined}
          fill
          priority={priority}
          sizes={sizes}
          unoptimized={unoptimized}
          className={cn("object-cover", imageClassName)}
          onError={() => {
            setHasError(true);
          }}
        />
      )}
    </div>
  );
}
