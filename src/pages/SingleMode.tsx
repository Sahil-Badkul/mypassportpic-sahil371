import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import PhotoSettingsPanel from "@/components/PhotoSettingsPanel";
import A4Preview from "@/components/A4Preview";
import type { PhotoSettings } from "@/lib/photoUtils";
import { generateA4Canvas, downloadAsPDF } from "@/lib/photoUtils";

const defaultSettings = (): PhotoSettings => ({
  imageSrc: "",
  crop: { x: 0, y: 0, scale: 1 },
  cropWidthMm: 35,
  cropHeightMm: 45,
  name: "",
  date: "",
  showNameDate: false,
  showBorder: false,
});

type Step = "upload" | "adjust" | "layout" | "preview";

const getPhotosPerRow = (total: number) => {
  if (total <= 5) return total;
  if (total <= 10) return 5;
  if (total <= 20) return 5;
  return 5; // fixed for passport layout
};

export default function SingleMode() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<Step>("upload");
  const [settings, setSettings] = useState<PhotoSettings>(defaultSettings());
  const [totalPhotos, setTotalPhotos] = useState(5); // default 5
  const [downloading, setDownloading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const printAreaRef = useRef<HTMLDivElement>(null);
  const printImgRef = useRef<HTMLImageElement>(null);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSettings((s) => ({ ...s, imageSrc: e.target!.result as string }));
        setStep("adjust");
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  };

  const photosPerRow = getPhotosPerRow(totalPhotos);
  const numRows = Math.ceil(totalPhotos / photosPerRow);

  const buildPhotoArray = (): PhotoSettings[] => {
    const arr: PhotoSettings[] = [];
    for (let i = 0; i < numRows; i++) {
      arr.push({ ...settings });
    }
    return arr;
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const canvas = await generateA4Canvas(
        buildPhotoArray(),
        photosPerRow,
        200,
        totalPhotos,
      );
      await downloadAsPDF(canvas);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = async () => {
    const canvas = await generateA4Canvas(
      buildPhotoArray(),
      photosPerRow,
      200,
      totalPhotos,
    );
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
    { id: "adjust", label: "Adjust" },
    { id: "layout", label: "Layout" },
    { id: "preview", label: "Preview" },
  ];

  const stepIndex = steps.findIndex((s) => s.id === step);

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
          <h1 className="font-semibold text-gray-800">Single Photo Mode</h1>
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
                    (s.id !== "upload" && settings.imageSrc)
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
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
            <div
              className="border-2 border-dashed border-gray-300 rounded-2xl p-16 text-center bg-white hover:border-primary/50 hover:bg-blue-50/30 cursor-pointer transition-colors"
              onClick={() => inputRef.current?.click()}
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drop your photo here
              </p>
              <p className="text-sm text-gray-400 mb-4">or click to browse</p>
              <p className="text-xs text-gray-300">Supports JPG, PNG, WEBP</p>
            </div>
          </div>
        )}

        {step === "adjust" && settings.imageSrc && (
          <div className="space-y-6">
            <PhotoSettingsPanel settings={settings} onChange={setSettings} />
            <div className="flex justify-end">
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
                  Number of Photos
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={totalPhotos}
                  onChange={(e) => {
                    let val = parseInt(e.target.value) || 1;
                    if (val > 30) val = 30;
                    if (val < 1) val = 1;
                    setTotalPhotos(val);
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Enter between 1 to 30 photos
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                <strong>{numRows} rows</strong> ×{" "}
                <strong>{photosPerRow} per row</strong> ={" "}
                <strong>{totalPhotos}</strong> photos on A4
              </div>
            </div>

            <div className="flex justify-end">
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
              <A4Preview
                photos={buildPhotoArray()}
                photosPerRow={photosPerRow}
                totalPhotos={totalPhotos}
              />
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
