"use client";

import { useState, useRef, useEffect, ChangeEvent, DragEvent } from "react";
import { Upload, Trash2, RefreshCw, Copy, Video as VideoIcon } from "lucide-react";
import toast from "react-hot-toast";

interface MediaUploaderProps {
  value?: string | File | null;
  onSelectFile?: (file: File) => void;
  onUpload?: (val: string | File, publicId?: string) => void;
  onRemove?: () => void;
  accept?: string; // "image/*", "video/*", or "image/*,video/*"
  preset?: string;
  label?: string;
  helperText?: string;
  aspectRatioClass?: string;
  className?: string;
  disabled?: boolean;
  labelPosition?: "top" | "bottom";
  progress?: number | null;
}

export function MediaUploader({
  value,
  onSelectFile,
  onUpload,
  onRemove,
  accept = "image/*",
  label,
  helperText,
  aspectRatioClass = "aspect-[3/2]",
  className = "",
  disabled = false,
  labelPosition = "top",
  progress,
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manage Preview & Memory Cleanup
  useEffect(() => {
    if (!value) {
      setPreviewUrl("");
      return;
    }

    if (typeof value === "string") {
      setPreviewUrl(value);
      return;
    }

    if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreviewUrl(objectUrl);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [value]);

  const isVideo = (urlOrFile: string | File) => {
    if (urlOrFile instanceof File) {
      return urlOrFile.type.startsWith("video/");
    }
    if (typeof urlOrFile === "string") {
      return (
        urlOrFile.match(/\.(mp4|webm|ogg|mov)$/i) ||
        urlOrFile.includes("/video/upload/") ||
        urlOrFile.startsWith("data:video")
      );
    }
    return false;
  };

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!previewUrl || previewUrl.startsWith("blob:")) {
      toast.error("File is not published yet.");
      return;
    }
    navigator.clipboard.writeText(previewUrl);
    toast.success("Media URL copied to clipboard!");
  };

  const handleFilePicked = (file: File) => {
    if (!file) return;
    if (onSelectFile) {
      onSelectFile(file);
    } else if (onUpload) {
      onUpload(file);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFilePicked(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFilePicked(file);
    }
  };

  const renderLabel = (text: string) => {
    const optionalRegex = /\s*\((optional)\)/i;
    if (optionalRegex.test(text)) {
      const mainText = text.replace(optionalRegex, "").trim();
      return (
        <label className="text-xs font-semibold uppercase tracking-wider text-charcoal/80">
          {mainText}{" "}
          <span className="text-[10px] font-normal lowercase tracking-normal text-charcoal/40 ml-0.5">
            (optional)
          </span>
        </label>
      );
    }
    return (
      <label className="text-xs font-semibold uppercase tracking-wider text-charcoal/80">
        {text}
      </label>
    );
  };

  const hasMedia = Boolean(value && previewUrl);

  return (
    <div className={`w-full flex flex-col space-y-1.5 ${className}`}>
      {label && labelPosition === "top" && (
        <div className="flex justify-between items-baseline">
          {renderLabel(label)}
          {helperText && (
            <span className="text-[10px] text-charcoal/50 font-medium">
              {helperText}
            </span>
          )}
        </div>
      )}

      {!label && helperText && (
        <div className="flex justify-end items-baseline">
          <span className="text-[10px] text-charcoal/50 font-medium">
            {helperText}
          </span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {hasMedia ? (
        /* Full Edge-to-Edge Preview State */
        <div className={`relative w-full ${aspectRatioClass} rounded-lg overflow-hidden border border-[#EBE3DB] bg-[#FAF8F5] group shadow-sm transition-all`}>
          {isVideo(value!) ? (
            <video
              src={previewUrl}
              controls={false}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={previewUrl}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
            />
          )}

          {/* Upload Progress Overlay */}
          {progress !== undefined && progress !== null && (
            <div className="absolute inset-0 z-20 bg-charcoal/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-white space-y-2">
              <span className="text-xs font-bold tracking-wider uppercase">Uploading... {progress}%</span>
              <div className="w-full max-w-[140px] bg-white/20 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#B8955F] h-full transition-all duration-200"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
            </div>
          )}

          {/* Hover Overlay with Actions: Change, Copy URL (if remote), Remove */}
          <div className="absolute inset-0 bg-charcoal/70 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2 p-2 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                fileInputRef.current?.click();
              }}
              className="bg-cream hover:bg-white text-charcoal text-xs font-semibold px-2.5 py-1.5 rounded shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              title="Change File"
            >
              <RefreshCw className="h-3.5 w-3.5 text-[#8C6D40]" />
              <span>Change</span>
            </button>

            {typeof value === "string" && !value.startsWith("blob:") && (
              <button
                type="button"
                onClick={handleCopyUrl}
                className="bg-cream hover:bg-white text-charcoal text-xs font-semibold px-2.5 py-1.5 rounded shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                title="Copy URL"
              >
                <Copy className="h-3.5 w-3.5 text-[#8C6D40]" />
                <span>Copy URL</span>
              </button>
            )}

            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onRemove();
                }}
                className="bg-red-500/90 hover:bg-red-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                title="Remove File"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Dropzone / Staged Upload State */
        <div
          onClick={() => {
            if (!disabled && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative w-full ${aspectRatioClass} min-h-[120px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-[#8C6D40] bg-[#8C6D40]/10 scale-[0.99]"
              : "border-[#EBE3DB] bg-[#FAF8F5] hover:border-[#8C6D40] hover:bg-[#F5F0EB]"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex flex-col items-center justify-center text-charcoal/60 space-y-1.5 p-2">
            <div className="p-2.5 rounded-full bg-cream border border-[#EBE3DB] shadow-xs text-[#8C6D40]">
              {accept.includes("video") ? (
                <VideoIcon className="h-4 w-4" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
            </div>
            <p className="text-xs font-semibold text-charcoal">
              Click to upload
            </p>
          </div>
        </div>
      )}

      {label && labelPosition === "bottom" && (
        <div className="flex justify-center items-center text-center pt-1">
          {renderLabel(label)}
        </div>
      )}
    </div>
  );
}
