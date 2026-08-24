"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { ImageSkeleton } from "@/components/ui/loaders";
import { cn } from "@/lib/utils";

type FadeInImageProps = ImageProps & {
  skeletonClassName?: string;
  showSkeleton?: boolean;
};

export default function FadeInImage({
  className,
  skeletonClassName,
  showSkeleton = true,
  onLoad,
  alt,
  src,
  ...props
}: FadeInImageProps) {
  const [loadedImage, setLoadedImage] = useState<ImageProps["src"] | null>(null);
  const loaded = loadedImage === src;

  return (
    <>
      {showSkeleton && !loaded && (
        <ImageSkeleton
          className={cn("absolute inset-0 z-0 h-full w-full rounded-none", skeletonClassName)}
        />
      )}
      <Image
        {...props}
        src={src}
        alt={alt}
        onLoad={(event) => {
          setLoadedImage(src);
          onLoad?.(event);
        }}
        className={cn(
          "relative z-0 transition-opacity duration-700 ease-out",
          className,
          !loaded && "opacity-0"
        )}
      />
    </>
  );
}
