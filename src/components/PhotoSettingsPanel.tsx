import { useState, useEffect } from "react";
import ImageCropper from "./ImageCropper";
import type { PhotoSettings, CropState } from "@/lib/photoUtils";
import { renderPhotoToCanvas } from "@/lib/photoUtils";

interface Props {
  settings: PhotoSettings;
  onChange: (settings: PhotoSettings) => void;
  title?: string;
}

export default function PhotoSettingsPanel({
  settings,
  onChange,
  title,
}: Props) {
  const [activeTab, setActiveTab] = useState<"crop" | "text" | "options">(
    "crop",
  );

  const updateCrop = (crop: CropState) => onChange({ ...settings, crop });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    const generatePreview = async () => {
      if (!settings.imageSrc) return;

      const canvas = await renderPhotoToCanvas(
        settings,
        200, // width px (small preview)
        260, // height px
      );

      setPreviewUrl(canvas.toDataURL("image/jpeg", 0.9));
    };

    generatePreview();
  }, [settings]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {title && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <h3 className="font-medium text-gray-800 text-sm">{title}</h3>
        </div>
      )}

      <div className="flex border-b border-gray-200">
        {(["crop", "text", "options"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
              activeTab === tab
                ? "text-primary border-b-2 border-primary bg-blue-50/50"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "crop"
              ? "Crop"
              : tab === "text"
                ? "Name & Date"
                : "Options"}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === "crop" && (
          <div className="flex flex-col items-center gap-4">
            <ImageCropper
              imageSrc={settings.imageSrc}
              cropWidthMm={settings.cropWidthMm}
              cropHeightMm={settings.cropHeightMm}
              crop={settings.crop}
              onChange={updateCrop}
            />
            <div className="grid grid-cols-2 gap-3 w-full">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Width (mm)
                </label>
                <input
                  type="number"
                  value={settings.cropWidthMm}
                  min={20}
                  max={80}
                  onChange={(e) =>
                    onChange({
                      ...settings,
                      cropWidthMm: parseInt(e.target.value) || 35,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Height (mm)
                </label>
                <input
                  type="number"
                  value={settings.cropHeightMm}
                  min={20}
                  max={100}
                  onChange={(e) =>
                    onChange({
                      ...settings,
                      cropHeightMm: parseInt(e.target.value) || 45,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "text" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
            {/* Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Add Name & Date
                </p>
                <p className="text-xs text-slate-400">White strip at bottom</p>
              </div>

              <button
                onClick={() =>
                  onChange({
                    ...settings,
                    showNameDate: !settings.showNameDate,
                  })
                }
                className={`relative inline-flex h-6 w-11 rounded-full transition ${
                  settings.showNameDate ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 bg-white rounded-full shadow transform transition ${
                    settings.showNameDate ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Inputs */}
            {settings.showNameDate && (
              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                {/* Name */}
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) =>
                      onChange({
                        ...settings,
                        name: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g. JOHN DOE"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">
                    Date
                  </label>
                  <input
                    type="date"
                    value={settings.date}
                    onChange={(e) =>
                      onChange({ ...settings, date: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Will print as DD/MM/YYYY
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "options" && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700">Add Border</p>
                <p className="text-xs text-slate-400">
                  Black outline around each photo
                </p>
              </div>

              <button
                onClick={() =>
                  onChange({ ...settings, showBorder: !settings.showBorder })
                }
                className={`relative inline-flex h-6 w-11 rounded-full transition ${
                  settings.showBorder ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 bg-white rounded-full shadow transform transition ${
                    settings.showBorder ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {previewUrl && (
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-500 mb-2 font-medium">
              Live Preview:
            </p>

            <img
              src={previewUrl}
              alt="Final preview"
              className="rounded-lg shadow border border-slate-200"
              style={{
                height: 130,
                aspectRatio: `${settings.cropWidthMm}/${settings.cropHeightMm}`,
                objectFit: "cover",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
