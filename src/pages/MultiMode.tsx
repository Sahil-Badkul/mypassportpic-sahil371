import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import ImageUploadSlot from "@/components/ImageUploadSlot";
import PhotoSettingsPanel from "@/components/PhotoSettingsPanel";
import A4Preview from "@/components/A4Preview";
import type { PhotoSettings } from "@/lib/photoUtils";
import { generateA4Canvas, downloadAsPDF } from "@/lib/photoUtils";

const MAX_IMAGES = 6;

const defaultSettings = (imageSrc = ""): PhotoSettings => ({
  imageSrc,
  crop: { x: 0, y: 0, scale: 1 },
  cropWidthMm: 35,
  cropHeightMm: 45,
  name: "",
  date: "",
  showNameDate: false,
  showBorder: false,
});

type Step = "upload" | "adjust" | "layout" | "preview";

export default function MultiMode() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("upload");
  const [photos, setPhotos] = useState<(PhotoSettings | null)[]>(
    Array(MAX_IMAGES).fill(null),
  );
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [photosPerRow, setPhotosPerRow] = useState(5);
  const [downloading, setDownloading] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);
  const printImgRef = useRef<HTMLImageElement>(null);

  const uploadedPhotos = photos.filter(
    (p): p is PhotoSettings => p !== null && p.imageSrc !== "",
  );
  const numUploaded = uploadedPhotos.length;

  const handleImageSelect = useCallback((index: number, src: string) => {
    setPhotos((prev) => {
      const next = [...prev];
      next[index] = defaultSettings(src);
      return next;
    });
  }, []);

  const handleRemove = useCallback((index: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
  }, []);

  const handleSettingsChange = useCallback(
    (index: number, settings: PhotoSettings) => {
      setPhotos((prev) => {
        const next = [...prev];
        next[index] = settings;
        return next;
      });
    },
    [],
  );

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const canvas = await generateA4Canvas(uploadedPhotos, photosPerRow, 200);
      await downloadAsPDF(canvas, "passport-photos-multi.pdf");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = async () => {
    const canvas = await generateA4Canvas(uploadedPhotos, photosPerRow, 200);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

    if (printImgRef.current && printAreaRef.current) {
      const img = printImgRef.current;

      // Step 1: set image
      img.src = dataUrl;

      // Step 2: wait for image load (IMPORTANT)
      img.onload = () => {
        // show print area
        printAreaRef.current!.style.visibility = "visible";

        // Step 3: slight delay (browser render fix)
        setTimeout(() => {
          window.print();

          // Step 4: hide again after print
          setTimeout(() => {
            if (printAreaRef.current) {
              printAreaRef.current.style.visibility = "hidden";
            }
          }, 100);
        }, 100);
      };
    }
  };

  const steps: { id: Step; label: string }[] = [
    { id: "upload", label: "Upload" },
    { id: "adjust", label: "Adjust Each" },
    { id: "layout", label: "Layout" },
    { id: "preview", label: "Preview" },
  ];
  const stepIndex = steps.findIndex((s) => s.id === step);

  const photosWithUploads = photos
    .map((p, i) => ({ photo: p, index: i }))
    .filter(({ photo }) => photo !== null && photo.imageSrc !== "");

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        id="print-area"
        ref={printAreaRef}
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          width: "210mm",
          height: "297mm",
          background: "white",
          overflow: "hidden",
          visibility: "hidden",
        }}
      >
        <img
          ref={printImgRef}
          alt="print"
          style={{ width: "210mm", height: "297mm" }}
        />
      </div>

      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => setLocation("/")}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <h1 className="font-semibold text-gray-800">Multi Photo Mode</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  if (
                    i <= stepIndex ||
                    (s.id !== "upload" && numUploaded > 0)
                  ) {
                    setStep(s.id);
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  s.id === step
                    ? "bg-primary text-white"
                    : i < stepIndex
                      ? "bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                <span className="w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold bg-white/20">
                  {i + 1}
                </span>
                {s.label}
              </button>
              {i < steps.length - 1 && (
                <div className="w-6 h-px bg-gray-300 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {step === "upload" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Upload Photos</h2>
                <span className="text-sm text-gray-400">
                  {numUploaded} / {MAX_IMAGES} photos
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                Upload up to 6 photos. Each photo will fill one row of the A4
                sheet, repeated side by side.
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {Array.from({ length: MAX_IMAGES }, (_, i) => (
                  <ImageUploadSlot
                    key={i}
                    index={i}
                    imageSrc={photos[i]?.imageSrc || null}
                    onImageSelect={(src) => handleImageSelect(i, src)}
                    onRemove={() => handleRemove(i)}
                  />
                ))}
              </div>
            </div>

            {numUploaded > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setActivePhotoIndex(photosWithUploads[0].index);
                    setStep("adjust");
                  }}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  Continue to Adjust
                </button>
              </div>
            )}
          </div>
        )}

        {step === "adjust" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-800 mb-3">
                Adjust Each Photo
              </h2>
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                {photosWithUploads.map(({ photo, index }) => (
                  <button
                    key={index}
                    onClick={() => setActivePhotoIndex(index)}
                    className={`flex-shrink-0 relative w-12 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      activePhotoIndex === index
                        ? "border-primary"
                        : "border-gray-200"
                    }`}
                  >
                    <img
                      src={photo!.imageSrc}
                      alt={`Person ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5">
                      {index + 1}
                    </span>
                  </button>
                ))}
              </div>

              {photos[activePhotoIndex] && (
                <PhotoSettingsPanel
                  key={activePhotoIndex}
                  settings={photos[activePhotoIndex]!}
                  onChange={(s) => handleSettingsChange(activePhotoIndex, s)}
                  title={`Person ${activePhotoIndex + 1}`}
                />
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep("upload")}
                className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep("layout")}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                Continue to Layout
              </button>
            </div>
          </div>
        )}

        {step === "layout" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
              <h2 className="font-semibold text-gray-800">Layout Settings</h2>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Photos per row
                </label>
                <div className="flex gap-2">
                  {[3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setPhotosPerRow(n)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        photosPerRow === n
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-600 border-gray-300 hover:border-primary/40"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Layout Summary
                </p>
                {uploadedPhotos.map((p, rowIdx) => (
                  <div key={rowIdx} className="flex items-center gap-2">
                    <div className="w-8 h-10 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                      <img
                        src={p.imageSrc}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      Row {rowIdx + 1} → {photosPerRow} copies
                    </span>
                  </div>
                ))}
                <p className="text-xs text-gray-400 pt-1">
                  Total: {numUploaded} rows × {photosPerRow} ={" "}
                  {numUploaded * photosPerRow} photos on A4
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep("adjust")}
                className="px-5 py-2.5 border border-gray-300 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep("preview")}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                Preview & Download
              </button>
            </div>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-800 mb-4">A4 Preview</h2>
              {uploadedPhotos.length > 0 ? (
                <A4Preview
                  photos={uploadedPhotos}
                  photosPerRow={photosPerRow}
                />
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No photos uploaded.
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Print
              </button>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {downloading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                )}
                {downloading ? "Generating PDF..." : "Download PDF"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
