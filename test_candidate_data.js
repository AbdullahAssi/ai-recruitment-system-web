// Quick test to check what data is in the database
const testCandidateData = async () => {
  try {
    // Get the first candidate
    const candidatesResponse = await fetch(
      "http://localhost:3000/api/candidates"
    );
    const candidatesData = await candidatesResponse.json();

    if (candidatesData.success && candidatesData.candidates.length > 0) {
      const firstCandidate = candidatesData.candidates[0];
      console.log("First candidate:", firstCandidate.name);

      // Get detailed profile
      const profileResponse = await fetch(
        `http://localhost:3002/api/candidates/${firstCandidate.id}`
      );
      const profileData = await profileResponse.json();

      if (profileData.success) {
        const candidate = profileData.candidate;
        console.log("=== CANDIDATE PROFILE DATA ===");
        console.log("Name:", candidate.name);
        console.log("Email:", candidate.email);
        console.log("Resumes count:", candidate.resumes.length);

        if (candidate.resumes.length > 0) {
          const resume = candidate.resumes[0];
          console.log("\n=== LATEST RESUME DATA ===");
          console.log("Resume name:", resume.name);
          console.log("Resume email:", resume.email);
          console.log("Skills JSON:", resume.skills_json);
          console.log("Experience JSON:", resume.experience_json);
          console.log("Projects JSON:", resume.projects_json);
          console.log("Certifications JSON:", resume.certifications_json);
          console.log("Summary:", resume.summary);
          console.log("Education level:", resume.education_level);
          console.log("Phone:", resume.phone);
          console.log("LinkedIn:", resume.linkedin);
          console.log("GitHub:", resume.github);
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

testCandidateData();
