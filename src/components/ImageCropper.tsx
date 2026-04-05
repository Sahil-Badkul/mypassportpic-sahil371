import { useRef, useState, useCallback, useEffect } from "react";
import type { CropState } from "@/lib/photoUtils";

interface Props {
  imageSrc: string;
  cropWidthMm: number;
  cropHeightMm: number;
  crop: CropState;
  onChange: (crop: CropState) => void;
}

const PREVIEW_SIZE = 280;

export default function ImageCropper({
  imageSrc,
  cropWidthMm,
  cropHeightMm,
  crop,
  onChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{
    mx: number;
    my: number;
    cx: number;
    cy: number;
  } | null>(null);

  const aspectRatio = cropWidthMm / cropHeightMm;
  const previewW = aspectRatio >= 1 ? PREVIEW_SIZE : PREVIEW_SIZE * aspectRatio;
  const previewH = aspectRatio >= 1 ? PREVIEW_SIZE / aspectRatio : PREVIEW_SIZE;

  const clamp = useCallback(
    (val: number, min: number, max: number) =>
      Math.min(max, Math.max(min, val)),
    [],
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setDragging(true);
      dragStart.current = {
        mx: e.clientX,
        my: e.clientY,
        cx: crop.x,
        cy: crop.y,
      };
    },
    [crop],
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging || !dragStart.current) return;
      const dx = (e.clientX - dragStart.current.mx) / previewW;
      const dy = (e.clientY - dragStart.current.my) / previewH;
      onChange({
        ...crop,
        x: clamp(dragStart.current.cx + dx, -0.5, 0.5),
        y: clamp(dragStart.current.cy + dy, -0.5, 0.5),
      });
    },
    [dragging, crop, onChange, previewW, previewH, clamp],
  );

  const onMouseUp = useCallback(() => {
    setDragging(false);
    dragStart.current = null;
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, onMouseMove, onMouseUp]);

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const t = e.touches[0];
      setDragging(true);
      dragStart.current = {
        mx: t.clientX,
        my: t.clientY,
        cx: crop.x,
        cy: crop.y,
      };
    },
    [crop],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!dragging || !dragStart.current) return;
      const t = e.touches[0];
      const dx = (t.clientX - dragStart.current.mx) / previewW;
      const dy = (t.clientY - dragStart.current.my) / previewH;
      onChange({
        ...crop,
        x: clamp(dragStart.current.cx + dx, -0.5, 0.5),
        y: clamp(dragStart.current.cy + dy, -0.5, 0.5),
      });
    },
    [dragging, crop, onChange, previewW, previewH, clamp],
  );

  const onTouchEnd = useCallback(() => {
    setDragging(false);
    dragStart.current = null;
  }, []);

  const [imgNaturalSize, setImgNaturalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);

  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImgNaturalSize({
      w: e.currentTarget.naturalWidth,
      h: e.currentTarget.naturalHeight,
    });
  };

  const baseScale = imgNaturalSize
    ? Math.max(previewW / imgNaturalSize.w, previewH / imgNaturalSize.h)
    : 1;

  // base size (fit to container)
  const baseW = imgNaturalSize ? imgNaturalSize.w * baseScale : previewW;
  const baseH = imgNaturalSize ? imgNaturalSize.h * baseScale : previewH;

  // position (center + drag)
  const imgLeft = (previewW - baseW) / 2 + crop.x * baseW;
  const imgTop = (previewH - baseH) / 2 + crop.y * baseH;

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        ref={containerRef}
        className="relative overflow-hidden border-2 border-dashed border-primary/50 rounded-lg cursor-move select-none bg-gray-100"
        style={{ width: previewW, height: previewH }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <img
          src={imageSrc}
          alt="Crop preview"
          onLoad={handleImgLoad}
          style={{
            position: "absolute",
            left: imgLeft,
            top: imgTop,
            width: baseW,
            height: baseH,
            transform: `scale(${crop.scale})`,
            transformOrigin: "center",
            pointerEvents: "none",
            userSelect: "none",
            draggable: false,
          }}
        />
        <div className="absolute inset-0 border-2 border-primary/60 pointer-events-none rounded-lg" />
        <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
          {cropWidthMm}×{cropHeightMm}mm
        </div>
      </div>

      <div className="w-full max-w-[280px]">
        <label className="text-xs text-gray-500 mb-1 block">Zoom</label>
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.01}
          value={crop.scale}
          onChange={(e) =>
            onChange({ ...crop, scale: parseFloat(e.target.value) })
          }
          className="w-full accent-primary"
        />
      </div>

      <p className="text-xs text-gray-400">
        Drag to reposition · Zoom to adjust
      </p>
    </div>
  );
}
