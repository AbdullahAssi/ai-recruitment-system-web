import { useState } from "react";
import type { ParsedDocument } from "@/lib/types/fastapi.types";

export function useParsing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractPDF = async (
    file: File,
    useOcrFallback = true,
  ): Promise<ParsedDocument | null> => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("use_ocr_fallback", String(useOcrFallback));

      const response = await fetch("/api/fastapi/parsing/extract-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to extract PDF");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to extract PDF";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const extractText = async (file: File): Promise<ParsedDocument | null> => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/fastapi/parsing/extract-text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to extract text");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to extract text";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getMethods = async (): Promise<string[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/fastapi/parsing/methods");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get parsing methods");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to get parsing methods";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    extractPDF,
    extractText,
    getMethods,
  };
}
