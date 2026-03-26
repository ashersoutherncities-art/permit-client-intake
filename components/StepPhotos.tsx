"use client";

import { useState, useCallback } from "react";

export interface PhotoFile {
  id: string;
  file: File;
  preview: string;
  base64: string;
  mimeType: string;
  category: "existing" | "damage" | "reference";
  fileName: string;
}

interface Props {
  photos: PhotoFile[];
  onPhotosChange: (photos: PhotoFile[]) => void;
}

const CATEGORIES = [
  { value: "existing" as const, label: "Existing Condition", icon: "🏠", description: "Current state of the property" },
  { value: "damage" as const, label: "Damage / Issues", icon: "⚠️", description: "Specific damage or problems" },
  { value: "reference" as const, label: "Reference", icon: "📐", description: "Desired outcome / inspiration" },
];

const MAX_PHOTOS_PER_CATEGORY = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function StepPhotos({ photos, onPhotosChange }: Props) {
  const [activeCategory, setActiveCategory] = useState<"existing" | "damage" | "reference">("existing");
  const [dragOver, setDragOver] = useState(false);

  const categoryPhotos = photos.filter((p) => p.category === activeCategory);
  const categoryCount = categoryPhotos.length;

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const newPhotos: PhotoFile[] = [];

      for (const file of Array.from(files)) {
        if (!validTypes.includes(file.type)) continue;
        if (file.size > MAX_FILE_SIZE) continue;
        if (categoryCount + newPhotos.length >= MAX_PHOTOS_PER_CATEGORY) break;

        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // Strip data URL prefix for API
            resolve(result.split(",")[1]);
          };
          reader.readAsDataURL(file);
        });

        const preview = URL.createObjectURL(file);

        newPhotos.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          file,
          preview,
          base64,
          mimeType: file.type,
          category: activeCategory,
          fileName: file.name,
        });
      }

      if (newPhotos.length > 0) {
        onPhotosChange([...photos, ...newPhotos]);
      }
    },
    [photos, onPhotosChange, activeCategory, categoryCount]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const removePhoto = (id: string) => {
    const photo = photos.find((p) => p.id === id);
    if (photo) URL.revokeObjectURL(photo.preview);
    onPhotosChange(photos.filter((p) => p.id !== id));
  };

  const totalPhotos = photos.length;

  return (
    <div className="space-y-5">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">📸</span>
          <div>
            <h4 className="font-semibold text-blue-800 text-sm">Property Photo Upload</h4>
            <p className="text-xs text-blue-600 mt-1">
              Upload photos for AI analysis. Our system will analyze property condition, identify issues,
              and recommend scope adjustments with budget impact. Photos are stored securely in Google Drive.
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2">
        {CATEGORIES.map((cat) => {
          const count = photos.filter((p) => p.category === cat.value).length;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => setActiveCategory(cat.value)}
              className={`flex-1 p-3 rounded-lg border-2 text-left transition-all ${
                activeCategory === cat.value
                  ? "border-[#1B2A4A] bg-[#1B2A4A]/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{cat.icon}</span>
                <span className="font-medium text-sm">{cat.label}</span>
                {count > 0 && (
                  <span className="ml-auto bg-[#1B2A4A] text-white text-xs px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-7">{cat.description}</p>
            </button>
          );
        })}
      </div>

      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
          dragOver ? "border-[#C8A951] bg-[#C8A951]/5" : "border-gray-300 hover:border-gray-400"
        } ${categoryCount >= MAX_PHOTOS_PER_CATEGORY ? "opacity-50 pointer-events-none" : ""}`}
      >
        <svg className="w-10 h-10 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-sm text-gray-600 mb-2">
          Drag & drop photos here, or{" "}
          <label className="text-[#1B2A4A] font-semibold cursor-pointer hover:underline">
            browse
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              disabled={categoryCount >= MAX_PHOTOS_PER_CATEGORY}
            />
          </label>
        </p>
        <p className="text-xs text-gray-400">
          JPEG, PNG, GIF, WebP • Max 10MB each • {MAX_PHOTOS_PER_CATEGORY - categoryCount} of {MAX_PHOTOS_PER_CATEGORY} slots remaining
        </p>
      </div>

      {/* Photo Previews */}
      {categoryPhotos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {categoryPhotos.map((photo) => (
            <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-gray-200">
              <img
                src={photo.preview}
                alt={photo.fileName}
                className="w-full h-24 object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                <p className="text-white text-[10px] truncate">{photo.fileName}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total Count */}
      {totalPhotos > 0 && (
        <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
          <span className="text-sm text-gray-600">
            Total photos: <strong>{totalPhotos}</strong>
          </span>
          <span className="text-xs text-gray-400">
            {photos.filter((p) => p.category === "existing").length} existing •{" "}
            {photos.filter((p) => p.category === "damage").length} damage •{" "}
            {photos.filter((p) => p.category === "reference").length} reference
          </span>
        </div>
      )}
    </div>
  );
}
