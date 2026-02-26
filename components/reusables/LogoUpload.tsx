"use client";

/**
 * LogoUpload
 *
 * Click-to-upload company logo widget.
 * Server stores it as 400×400 WebP in public/uploads/company-logos/{companyId}.webp
 *
 * Recommended display sizes:
 *   - Company page banner:  64×64 px
 *   - Company detail page: 128×128 px
 *   Stored at 400×400 (3–6× retina for typical card usage)
 */

import { useRef, useState } from "react";
import { Camera, Loader2, Building2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LogoUploadProps {
  companyId: string;
  currentLogoUrl?: string | null;
  companyName?: string;
  onUploadSuccess: (newUrl: string) => void;
  onDeleteSuccess?: () => void;
  /** Wrapper size class. Defaults to "w-20 h-20" */
  sizeClass?: string;
}

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

export function LogoUpload({
  companyId,
  currentLogoUrl,
  companyName,
  onUploadSuccess,
  onDeleteSuccess,
  sizeClass = "w-20 h-20",
}: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const displayUrl = preview ?? currentLogoUrl ?? null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED.includes(file.type)) {
      toast({
        title: "Invalid file",
        description: "Please upload a JPEG, PNG, WebP, or GIF image.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > MAX_BYTES) {
      toast({
        title: "File too large",
        description: "Maximum size is 5 MB.",
        variant: "destructive",
      });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("logo", file);
      fd.append("companyId", companyId);

      const res = await fetch("/api/upload/company-logo", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        setPreview(null);
        toast({
          title: "Upload failed",
          description: data.error || "Could not upload logo.",
          variant: "destructive",
        });
        return;
      }

      onUploadSuccess(`${data.logoUrl}?v=${Date.now()}`);
      setPreview(null);
      toast({
        title: "Logo updated",
        description: `Stored as ${data.dimensions.stored} WebP — displayed at ${data.dimensions.recommended_display}.`,
      });
    } catch {
      setPreview(null);
      toast({
        title: "Error",
        description: "Failed to upload. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/upload/company-logo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
        credentials: "include",
      });
      if (res.ok) {
        onDeleteSuccess?.();
        toast({ title: "Logo removed" });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to remove logo.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative group inline-block">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Upload company logo"
      />

      {/* Logo container */}
      <div
        className={`${sizeClass} rounded-xl border-4 border-card bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden cursor-pointer shadow-sm`}
        onClick={() => !uploading && !deleting && inputRef.current?.click()}
        title="Click to upload company logo"
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={companyName ?? "Company logo"}
            className="w-full h-full object-contain"
          />
        ) : (
          <Building2 className="w-8 h-8 text-primary" />
        )}
      </div>

      {/* Hover overlay */}
      <button
        type="button"
        aria-label="Change company logo"
        disabled={uploading || deleting}
        onClick={() => inputRef.current?.click()}
        className="absolute inset-0 rounded-xl flex items-center justify-center bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : (
          <Camera className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Delete button */}
      {displayUrl && !uploading && onDeleteSuccess && (
        <button
          type="button"
          aria-label="Remove company logo"
          disabled={deleting}
          onClick={handleDelete}
          className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
        >
          {deleting ? (
            <Loader2 className="w-3 h-3 text-white animate-spin" />
          ) : (
            <Trash2 className="w-3 h-3 text-white" />
          )}
        </button>
      )}

      {/* Size hint */}
      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        400×400 px · WebP · max 5 MB
      </div>
    </div>
  );
}
