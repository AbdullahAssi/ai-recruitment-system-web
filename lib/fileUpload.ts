import { NextRequest } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function parseFormData(req: NextRequest): Promise<{
  fields: { [key: string]: string | string[] };
  files: { [key: string]: File | File[] };
}> {
  // Create uploads directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), 'uploads');
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }

  const formData = await req.formData();
  const fields: { [key: string]: string | string[] } = {};
  const files: { [key: string]: File | File[] } = {};

  formData.forEach((value, key) => {
    if (value instanceof File) {
      files[key] = value;
    } else {
      fields[key] = value;
    }
  });

  return { fields, files };
}

export function validateFileType(fileName: string): boolean {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
  const fileExtension = path.extname(fileName).toLowerCase();
  return allowedExtensions.includes(fileExtension);
}