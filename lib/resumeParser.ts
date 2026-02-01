export interface ParsedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  summary?: string;
  skills: string[];
  experience_years: number;
  education_level?: string;
  work_experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies?: string[];
  }>;
  certifications: string[];
}

export async function parseResumeWithFastAPI(
  filePath: string,
  fileName: string,
): Promise<ParsedResumeData> {
  try {
    const fastApiUrl =
      process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000/api/v1";
    const fs = await import("fs/promises");
    const FormData = (await import("form-data")).default;

    // Read file
    const fileBuffer = await fs.readFile(filePath);

    // Create FormData for Node.js
    const formData = new FormData();
    formData.append("file", fileBuffer, {
      filename: fileName,
      contentType: fileName.endsWith(".pdf")
        ? "application/pdf"
        : "application/octet-stream",
    });

    console.log(`Calling FastAPI parser for ${fileName}...`);

    // Call FastAPI parsing endpoint
    const response = await fetch(`${fastApiUrl}/parsing/parse-resume`, {
      method: "POST",
      body: formData as any,
      headers: formData.getHeaders(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`FastAPI parsing failed: ${response.status} ${errorText}`);
      throw new Error(`FastAPI parsing failed: ${response.status}`);
    }

    const result = await response.json();
    console.log(
      `FastAPI parsing successful: ${result.name || "No name"}, ${result.skills?.length || 0} skills`,
    );

    // Return parsed data
    return {
      name: result.name || "",
      email: result.email || "",
      phone: result.phone || "",
      linkedin: result.linkedin || "",
      github: result.github || "",
      summary: result.summary || "",
      skills: Array.isArray(result.skills) ? result.skills : [],
      experience_years:
        typeof result.experience_years === "number"
          ? result.experience_years
          : 0,
      education_level: result.education_level || "",
      work_experience: Array.isArray(result.work_experience)
        ? result.work_experience
        : [],
      projects: Array.isArray(result.projects) ? result.projects : [],
      certifications: Array.isArray(result.certifications)
        ? result.certifications
        : [],
    };
  } catch (error) {
    console.error("Error parsing resume with FastAPI:", error);
    // Return default structure on error
    return {
      name: "",
      email: "",
      phone: "",
      linkedin: "",
      github: "",
      summary: "",
      skills: [],
      experience_years: 0,
      education_level: "",
      work_experience: [],
      projects: [],
      certifications: [],
    };
  }
}
