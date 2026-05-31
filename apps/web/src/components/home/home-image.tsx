"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@fixpro/ui";

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
}: HomeImageProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {hasError && minimalFallback ? (
        <div
          className={cn(
            "absolute inset-0 bg-surface-tertiary text-text-muted",
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
            "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-tertiary text-center text-xs leading-5 text-text-muted",
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
          className={cn("object-cover", imageClassName)}
          onError={() => {
            setHasError(true);
          }}
        />
      )}
    </div>
  );
}
