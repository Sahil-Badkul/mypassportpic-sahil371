export interface CropState {
  x: number;
  y: number;
  scale: number;
}

export interface PhotoSettings {
  imageSrc: string;
  crop: CropState;
  cropWidthMm: number;
  cropHeightMm: number;
  name: string;
  date: string;
  showNameDate: boolean;
  showBorder: boolean;
}

export function formatDateDDMMYYYY(dateStr: string): string {
  if (!dateStr) return "";

  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return dateStr;

  return `${day}-${month}-${year}`;
}

export const MM_TO_PX_SCREEN = 3.7795275591;
export const A4_WIDTH_MM = 210;
export const A4_HEIGHT_MM = 297;

export function mmToPx(mm: number, dpi = 96): number {
  return (mm / 25.4) * dpi;
}

export function renderPhotoToCanvas(
  settings: PhotoSettings,
  targetWidthPx: number,
  targetHeightPx: number,
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = targetWidthPx;
    canvas.height = targetHeightPx;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("No canvas context"));

    const img = new Image();
    img.onload = () => {
      const photoAreaHeight = settings.showNameDate
        ? targetHeightPx * 0.87
        : targetHeightPx;

      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;

      const baseScale = Math.max(
        targetWidthPx / naturalW,
        photoAreaHeight / naturalH,
      );
      const finalScale = baseScale * settings.crop.scale;

      const drawW = naturalW * finalScale;
      const drawH = naturalH * finalScale;

      const offsetX =
        (targetWidthPx - drawW) / 2 + settings.crop.x * targetWidthPx;

      const offsetY =
        (photoAreaHeight - drawH) / 2 + settings.crop.y * photoAreaHeight;

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, targetWidthPx, targetHeightPx);

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, targetWidthPx, photoAreaHeight);
      ctx.clip();
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.restore();

      if (settings.showNameDate && (settings.name || settings.date)) {
        const stripH = targetHeightPx - photoAreaHeight;
        ctx.fillStyle = "white";
        ctx.fillRect(0, photoAreaHeight, targetWidthPx, stripH);

        ctx.fillStyle = "#111";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const lines: string[] = [];
        if (settings.name) lines.push(settings.name);
        if (settings.date) {
          lines.push(formatDateDDMMYYYY(settings.date));
        }

        let fontSize = Math.floor(stripH * 0.35);
        const maxWidth = targetWidthPx * 0.9;

        ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
        let maxLineWidth = 0;
        for (const l of lines) {
          const w = ctx.measureText(l).width;
          if (w > maxLineWidth) maxLineWidth = w;
        }
        if (maxLineWidth > maxWidth) {
          fontSize = Math.floor(fontSize * (maxWidth / maxLineWidth));
        }
        ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;

        const lineH = fontSize * 1.3;
        const totalH = lineH * lines.length;
        const startY = photoAreaHeight + (stripH - totalH) / 2 + lineH / 2;
        lines.forEach((line, i) => {
          ctx.fillText(line, targetWidthPx / 2, startY + i * lineH);
        });
      }

      if (settings.showBorder) {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = Math.max(2, targetWidthPx * 0.025);
        ctx.strokeRect(0, 0, targetWidthPx, targetHeightPx);
      }

      resolve(canvas);
    };
    img.onerror = reject;
    img.src = settings.imageSrc;
  });
}

export async function generateA4Canvas(
  photos: PhotoSettings[],
  photosPerRow: number,
  dpi = 200,
  totalPhotos?: number,
): Promise<HTMLCanvasElement> {
  const a4W = Math.round(mmToPx(A4_WIDTH_MM, dpi));
  const a4H = Math.round(mmToPx(A4_HEIGHT_MM, dpi));

  const canvas = document.createElement("canvas");
  canvas.width = a4W;
  canvas.height = a4H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No canvas context");

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, a4W, a4H);

  const uniquePhotos = photos;
  const numRows = uniquePhotos.length;
  const maxPhotos = numRows * photosPerRow;
  const renderCount = totalPhotos ?? maxPhotos;

  const photoWidthMm = uniquePhotos[0]?.cropWidthMm || 35;
  const photoHeightMm = uniquePhotos[0]?.cropHeightMm || 45;

  const marginMm = 5;
  const gapXMm = 3; // horizontal gap (constant)
  const gapYMm = 3; // vertical gap (constant)

  const photoW = Math.round(mmToPx(photoWidthMm, dpi));
  const photoH = Math.round(mmToPx(photoHeightMm, dpi));
  const marginPx = Math.round(mmToPx(marginMm, dpi));
  const gapXPx = Math.round(mmToPx(Math.max(0, gapXMm), dpi));
  const gapYPx = Math.round(mmToPx(Math.max(0, gapYMm), dpi));

  for (let row = 0; row < numRows; row++) {
    const settings = uniquePhotos[row];
    const photoCanvas = await renderPhotoToCanvas(settings, photoW, photoH);
    const baseIndex = row * photosPerRow;
    const remaining = Math.max(0, renderCount - baseIndex);
    const countInRow = Math.min(photosPerRow, remaining);

    for (let col = 0; col < countInRow; col++) {
      const x = marginPx + col * (photoW + gapXPx);
      const y = marginPx + row * (photoH + gapYPx);
      ctx.drawImage(photoCanvas, x, y, photoW, photoH);
    }
  }

  return canvas;
}

export function canvasToDataURL(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/jpeg", 0.95);
}

export async function downloadAsPDF(
  canvas: HTMLCanvasElement,
  filename = "passport-photos.pdf",
) {
  const { jsPDF } = await import("jspdf");
  const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  pdf.addImage(dataUrl, "JPEG", 0, 0, 210, 297);
  pdf.save(filename);
}
