import { useEffect, useRef, useState } from "react";
import type { PhotoSettings } from "@/lib/photoUtils";
import { generateA4Canvas } from "@/lib/photoUtils";

interface Props {
  photos: PhotoSettings[];
  photosPerRow: number;
  totalPhotos?: number;
}

export default function A4Preview({ photos, photosPerRow, totalPhotos }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(() => {
      setLoading(true);

      generateA4Canvas(photos, photosPerRow, 150, totalPhotos)
        .then((canvas) => {
          if (!cancelled) {
            setPreviewUrl(canvas.toDataURL("image/jpeg", 0.9));
            setLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) setLoading(false);
        });
    }, 200); // delay

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [photos, photosPerRow]);
  return (
    <div ref={containerRef} className="w-full">
      <div
        className="relative bg-white shadow-lg mx-auto border border-gray-300"
        style={{ aspectRatio: "210/297", width: "100%" }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
        {previewUrl && !loading && (
          <img
            src={previewUrl}
            alt="A4 Preview"
            className="w-full h-full object-contain"
          />
        )}
      </div>
    </div>
  );
}
