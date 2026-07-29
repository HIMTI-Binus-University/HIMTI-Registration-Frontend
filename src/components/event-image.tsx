import { ImageOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { getSafeHttpUrl } from "@/utils/http-url";

interface EventImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  imageClassName?: string;
}

export function EventImage({
  src,
  alt,
  className,
  imageClassName,
}: EventImageProps) {
  const safeSrc = getSafeHttpUrl(src);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = safeSrc === failedSrc;

  return (
    <div
      className={cn(
        "relative grid overflow-hidden bg-gradient-to-br from-brand-navy via-brand-blue to-sky-400",
        className,
      )}
    >
      {safeSrc && !failed ? (
        <img
          src={safeSrc}
          alt={alt}
          className={cn("size-full object-cover", imageClassName)}
          onError={() => setFailedSrc(safeSrc)}
        />
      ) : (
        <div
          role="img"
          aria-label={`${alt} image unavailable`}
          className="grid size-full place-items-center bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.22),transparent_38%)] text-white/85"
        >
          <ImageOff className="size-8" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
