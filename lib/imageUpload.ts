/**
 * Image upload utility for profile pictures and company logos.
 *
 * Storage layout (inside container, mounted as a Docker volume):
 *   public/uploads/avatars/{userId}.webp        — 256×256 px, ~20 KB avg
 *   public/uploads/company-logos/{companyId}.webp — 400×400 px, ~35 KB avg
 *
 * Served statically by Next.js as:
 *   /uploads/avatars/{userId}.webp
 *   /uploads/company-logos/{companyId}.webp
 *
 * Scale note: 256×256 WebP @ ~20 KB × 10 000 users ≈ 200 MB total.
 * A single mounted Docker volume is perfectly adequate.
 */

import sharp from "sharp";
import { promises as fs } from "fs";
import path from "path";

export const AVATAR_SIZE = 256; // px — displayed at 96 px (2.67× retina)
export const COMPANY_LOGO_SIZE = 400; // px — displayed at 64–128 px
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB source file limit
export const ALLOWED_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/** Ensure a directory exists, creating it recursively if needed. */
async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

export interface ProcessedImage {
  /** Absolute path on disk where the file was written. */
  diskPath: string;
  /** URL path that Next.js will serve, e.g. /uploads/avatars/abc.webp */
  publicUrl: string;
  /** Final dimensions after processing. */
  width: number;
  height: number;
  /** Compressed size in bytes. */
  sizeBytes: number;
}

/**
 * Process and save a user avatar.
 * Input is resized to 256×256, converted to WebP quality 85.
 */
export async function saveAvatar(
  fileBuffer: ArrayBuffer,
  userId: string,
): Promise<ProcessedImage> {
  const dir = path.join(process.cwd(), "public", "uploads", "avatars");
  await ensureDir(dir);

  const filename = `${userId}.webp`;
  const diskPath = path.join(dir, filename);

  const processed = await sharp(Buffer.from(fileBuffer))
    .resize(AVATAR_SIZE, AVATAR_SIZE, {
      fit: "cover", // crop to square (like object-cover)
      position: "center",
    })
    .webp({ quality: 85 })
    .toBuffer();

  await fs.writeFile(diskPath, new Uint8Array(processed));

  return {
    diskPath,
    publicUrl: `/uploads/avatars/${filename}`,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    sizeBytes: processed.length,
  };
}

/**
 * Process and save a company logo.
 * Input is resized to 400×400 (padded to square to avoid distortion),
 * converted to WebP quality 85.
 */
export async function saveCompanyLogo(
  fileBuffer: ArrayBuffer,
  companyId: string,
): Promise<ProcessedImage> {
  const dir = path.join(process.cwd(), "public", "uploads", "company-logos");
  await ensureDir(dir);

  const filename = `${companyId}.webp`;
  const diskPath = path.join(dir, filename);

  const processed = await sharp(Buffer.from(fileBuffer))
    .resize(COMPANY_LOGO_SIZE, COMPANY_LOGO_SIZE, {
      fit: "contain", // pad to square (logos shouldn't be cropped)
      background: { r: 255, g: 255, b: 255, alpha: 0 }, // transparent pad
    })
    .webp({ quality: 85 })
    .toBuffer();

  await fs.writeFile(diskPath, new Uint8Array(processed));

  return {
    diskPath,
    publicUrl: `/uploads/company-logos/${filename}`,
    width: COMPANY_LOGO_SIZE,
    height: COMPANY_LOGO_SIZE,
    sizeBytes: processed.length,
  };
}

/** Delete a stored image by its public URL (best-effort, no throw). */
export async function deleteImage(publicUrl: string): Promise<void> {
  try {
    const diskPath = path.join(process.cwd(), "public", publicUrl);
    await fs.unlink(diskPath);
  } catch {
    // File may not exist — ignore
  }
}
