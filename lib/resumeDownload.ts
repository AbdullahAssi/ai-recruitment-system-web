/**
 * Resume Download Utilities
 *
 * Centralized utilities for handling resume downloads across the application.
 * This module provides consistent download functionality with proper error handling
 * and user feedback through toast notifications.
 */

interface ToastFunction {
  (options: {
    title: string;
    description: string;
    variant?: "default" | "destructive";
  }): void;
}

/**
 * Downloads a resume file from the server
 * @param resumeId - The ID of the resume to download
 * @param fileName - The name of the file to save as
 * @param toast - Toast function for user notifications
 * @returns Promise that resolves when download is complete
 */
export const downloadResume = async (
  resumeId: string,
  fileName: string,
  toast: ToastFunction
): Promise<void> => {
  try {
    const response = await fetch(`/api/resumes/${resumeId}/download`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = fileName;
    a.style.display = "none";

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up the object URL to prevent memory leaks
    window.URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: `Downloading ${fileName}`,
    });
  } catch (error) {
    console.error("Error downloading resume:", error);
    toast({
      title: "Download Failed",
      description: "Could not download the resume",
      variant: "destructive",
    });
    throw error; // Re-throw for caller to handle if needed
  }
};

/**
 * Creates a download handler function with toast pre-bound
 * @param toast - Toast function for notifications
 * @returns Download handler function
 */
export const createDownloadHandler = (toast: ToastFunction) => {
  return (resumeId: string, fileName: string) =>
    downloadResume(resumeId, fileName, toast);
};

/**
 * Downloads multiple resumes as a zip file (future enhancement)
 * @param resumeIds - Array of resume IDs to download
 * @param zipFileName - Name for the zip file
 * @param toast - Toast function for notifications
 */
export const downloadMultipleResumes = async (
  resumeIds: string[],
  zipFileName: string,
  toast: ToastFunction
): Promise<void> => {
  // TODO: Implement bulk download functionality
  toast({
    title: "Feature Coming Soon",
    description: "Bulk resume download will be available soon",
  });
};
