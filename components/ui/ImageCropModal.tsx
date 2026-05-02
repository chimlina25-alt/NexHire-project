"use client";

import React from "react";
import Cropper from "react-easy-crop";
import { Upload, Trash2 } from "lucide-react";
import type { Area } from "@/lib/crop-image";
import { getCroppedImg } from "@/lib/crop-image";

type ImageCropModalProps = {
  open: boolean;
  imageSrc: string | null;
  title: string;
  onClose: () => void;
  onSave: (file: File, previewUrl: string) => void;
  onUploadAnother: () => void;
  onDelete: () => void;
  hasImage: boolean;
};

export default function ImageCropModal({
  open,
  imageSrc,
  title,
  onClose,
  onSave,
  onUploadAnother,
  onDelete,
  hasImage,
}: ImageCropModalProps) {
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [cropError, setCropError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setCropError(null);
  }, [open, imageSrc]);

  const onCropComplete = React.useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    try {
      setSaving(true);
      setCropError(null);
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, "profile.jpg");
      console.log("Cropped file:", croppedFile.name, croppedFile.size, croppedFile instanceof File);
      const previewUrl = URL.createObjectURL(croppedFile);
      onSave(croppedFile, previewUrl);
    } catch (error) {
      console.error("CROP SAVE ERROR:", error);
      setCropError(
        error instanceof Error ? error.message : "Failed to crop image"
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1a1a1a]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm font-medium text-gray-500 hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <div className="relative h-[360px] overflow-hidden rounded-2xl bg-[#0d2a23]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        {cropError && (
          <div className="mt-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
            {cropError}
          </div>
        )}

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-gray-700">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-[#00a37b]"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onUploadAnother}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <Upload size={16} />
            Upload Again
          </button>
          <button
            type="button"
            onClick={() => { onDelete(); onClose(); }}
            disabled={!hasImage}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-[#00a37b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#008f6c] disabled:opacity-60"
          >
            {saving ? "Saving..." : "Apply Crop"}
          </button>
        </div>
      </div>
    </div>
  );
}