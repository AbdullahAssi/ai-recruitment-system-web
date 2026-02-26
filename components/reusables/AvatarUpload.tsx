"use client";

/**
 * AvatarUpload
 *
 * A click-to-upload avatar widget.
 * Accepts JPG / PNG / WebP / GIF up to 5 MB.
 * The server crops & converts to 256×256 WebP and stores it in
 * public/uploads/avatars/{userId}.webp (served statically).
 *
 * Recommended display size: 96×96 px  (stored at 256×256 — 2.67× retina)
 */

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarUploadProps {
  /** Current avatar URL (null/undefined = show initials) */
  currentUrl?: string | null;
  /** Initials to show when no avatar is set */
  initials: string;
  /** Called after a successful upload with the new URL */
  onUploadSuccess: (newUrl: string) => void;
  /** Called after a successful delete */
  onDeleteSuccess?: () => void;
  /** Display size class, e.g. "w-24 h-24". Defaults to "w-24 h-24" */
  sizeClass?: string;
}

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

export function AvatarUpload({
  currentUrl,
  initials,
  onUploadSuccess,
  onDeleteSuccess,
  sizeClass = "w-24 h-24",
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const displayUrl = preview ?? currentUrl ?? null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validations
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

    // Optimistic preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("avatar", file);

      const res = await fetch("/api/upload/avatar", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        setPreview(null);
        toast({
          title: "Upload failed",
          description: data.error || "Could not upload avatar.",
          variant: "destructive",
        });
        return;
      }

      // Add a cache-buster so the browser reloads the new WebP
      onUploadSuccess(`${data.avatarUrl}?v=${Date.now()}`);
      setPreview(null);
      toast({
        title: "Avatar updated",
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
      const res = await fetch("/api/upload/avatar", {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        onDeleteSuccess?.();
        toast({ title: "Avatar removed" });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to remove avatar.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="relative group inline-block">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Upload profile picture"
      />

      <Avatar
        className={`${sizeClass} border-4 border-white dark:border-gray-900 shadow-xl cursor-pointer`}
        onClick={() => !uploading && !deleting && inputRef.current?.click()}
      >
        {displayUrl ? (
          <AvatarImage src={displayUrl} alt="Profile picture" />
        ) : null}
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-2xl font-bold">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Hover overlay: camera icon */}
      <button
        type="button"
        aria-label="Change profile picture"
        disabled={uploading || deleting}
        onClick={() => inputRef.current?.click()}
        className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
      >
        {uploading ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : (
          <Camera className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Delete button (only when avatar exists) */}
      {displayUrl && !uploading && onDeleteSuccess && (
        <button
          type="button"
          aria-label="Remove profile picture"
          disabled={deleting}
          onClick={handleDelete}
          className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
        >
          {deleting ? (
            <Loader2 className="w-3 h-3 text-white animate-spin" />
          ) : (
            <Trash2 className="w-3 h-3 text-white" />
          )}
        </button>
      )}

      {/* Size hint tooltip */}
      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        256×256 px · WebP · max 5 MB
      </div>
    </div>
  );
}
