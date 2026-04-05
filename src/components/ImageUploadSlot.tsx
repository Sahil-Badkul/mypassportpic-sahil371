import { useRef, useCallback } from "react";

interface Props {
  index: number;
  imageSrc: string | null;
  onImageSelect: (src: string) => void;
  onRemove: () => void;
}

export default function ImageUploadSlot({ index, imageSrc, onImageSelect, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageSelect(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }, [handleFile]);

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
      {imageSrc ? (
        <div className="relative group">
          <div
            className="w-full aspect-[35/45] rounded-xl overflow-hidden border-2 border-primary/30 bg-gray-100 cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            <img src={imageSrc} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
          </div>
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600 text-xs"
          >
            ×
          </button>
          <div className="mt-1 text-center text-xs text-gray-500">Person {index + 1}</div>
        </div>
      ) : (
        <div
          className="w-full aspect-[35/45] rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-blue-50/30 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs text-gray-400">Add photo</span>
          <span className="text-[10px] text-gray-300 mt-0.5">Person {index + 1}</span>
        </div>
      )}
    </div>
  );
}
