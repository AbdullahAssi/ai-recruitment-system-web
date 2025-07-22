import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import { promises as fs } from 'fs';

export async function extractTextFromFile(filePath: string, fileName: string): Promise<string> {
  try {
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    const buffer = await fs.readFile(filePath);

    switch (fileExtension) {
      case 'pdf':
        const pdfData = await pdfParse(buffer);
        return pdfData.text;
      
      case 'doc':
      case 'docx':
        const docData = await mammoth.extractRawText({ buffer });
        return docData.value;
      
      case 'txt':
        return buffer.toString('utf-8');
      
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error('Failed to extract text from file');
  }
}

export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\.\,\-]/g, '')
    .trim()
    .toLowerCase();
}