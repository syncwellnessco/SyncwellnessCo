"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Upload, Trash2, RefreshCw, Copy, Loader2, Video as VideoIcon } from "lucide-react";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary-utils";
import toast from "react-hot-toast";

interface MediaUploaderProps {
  value?: string;
  onUpload: (url: string, publicId: string) => void;
  onRemove?: () => void;
  accept?: string; // "image/*", "video/*", or "image/*,video/*"
  preset?: string;
  label?: string;
  helperText?: string;
  aspectRatioClass?: string;
  className?: string;
  disabled?: boolean;
  labelPosition?: "top" | "bottom";
}

export function MediaUploader({
  value = "",
  onUpload,
  onRemove,
  accept = "image/*",
  preset,
  label,
  helperText,
  aspectRatioClass = "aspect-[3/2]",
  className = "",
  disabled = false,
  labelPosition = "top",
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideo = (url: string) => {
    return (
      url.match(/\.(mp4|webm|ogg|mov)$/i) ||
      url.includes("/video/upload/")
    );
  };

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!value) return;
    navigator.clipboard.writeText(value);
    toast.success("Media URL copied to clipboard!");
  };

  const uploadFile = async (file: File) => {
    if (!file) return;

    const isFileVideo = file.type.startsWith("video/") || accept.includes("video");
    const resourceType = isFileVideo ? "video" : "image";

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "daw1tscqr";
    const uploadPreset =
      preset ||
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      "syncwellness";

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const xhr = new XMLHttpRequest();
      xhr.open(
        "POST",
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`
      );

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          const rawUrl = data.secure_url || data.url;
          const publicId = data.public_id || "";
          const optimizedUrl = optimizeCloudinaryUrl(rawUrl);
          onUpload(optimizedUrl, publicId);
          toast.success("Uploaded successfully!");
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            toast.error(err.error?.message || "Upload failed");
          } catch {
            toast.error("Upload failed. Please try again.");
          }
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        toast.error("Network error during upload.");
      };

      xhr.send(formData);
    } catch (error) {
      setIsUploading(false);
      console.error("Upload error:", error);
      toast.error("Failed to upload file.");
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) setIsDragging(true);
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

    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
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
        disabled={disabled || isUploading}
      />

      {value ? (
        /* Full Edge-to-Edge Preview State */
        <div className={`relative w-full ${aspectRatioClass} rounded-lg overflow-hidden border border-[#EBE3DB] bg-[#FAF8F5] group shadow-sm transition-all`}>
          {isVideo(value) ? (
            <video
              src={value}
              controls={false}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={value}
              alt="Uploaded preview"
              className="w-full h-full object-cover"
            />
          )}

          {/* Hover Overlay with 3 Actions: Change, Copy URL, Remove */}
          <div className="absolute inset-0 bg-charcoal/70 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-2 p-2">
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

            <button
              type="button"
              onClick={handleCopyUrl}
              className="bg-cream hover:bg-white text-charcoal text-xs font-semibold px-2.5 py-1.5 rounded shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              title="Copy URL"
            >
              <Copy className="h-3.5 w-3.5 text-[#8C6D40]" />
              <span>Copy URL</span>
            </button>

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
        /* Dropzone / Upload State */
        <div
          onClick={() => {
            if (!isUploading && !disabled && fileInputRef.current) {
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
          {isUploading ? (
            <div className="flex flex-col items-center justify-center space-y-3 w-full max-w-[200px]">
              <Loader2 className="h-7 w-7 animate-spin text-[#8C6D40]" />
              <div className="w-full bg-[#EBE3DB] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#8C6D40] h-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-xs font-medium text-charcoal/70">
                Uploading... {uploadProgress}%
              </span>
            </div>
          ) : (
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
          )}
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
