import { useEffect, useRef } from "react";
import type { PhotoSettings } from "@/lib/photoUtils";
import { generateA4Canvas } from "@/lib/photoUtils";

interface Props {
  photos: PhotoSettings[];
  photosPerRow: number;
  totalPhotos?: number;
}

export default function PrintArea({ photos, photosPerRow, totalPhotos }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    generateA4Canvas(photos, photosPerRow, 200, totalPhotos).then((canvas) => {
      if (imgRef.current) {
        imgRef.current.src = canvas.toDataURL("image/jpeg", 0.95);
      }
    });
  }, [photos, photosPerRow, totalPhotos]);

  return (
    <div
      id="print-area"
      style={{
        position: "absolute",
        top: "-9999px",
        left: "-9999px",
        width: "210mm",
        height: "297mm",
        overflow: "hidden",
        background: "white",
      }}
    >
      <img ref={imgRef} alt="print" style={{ width: "210mm", height: "297mm" }} />
    </div>
  );
}
