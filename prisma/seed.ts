import {
  PrismaClient,
  UserRole,
  ApplicationStatus,
  SkillLevel,
  EmailType,
  EmailStatus,
} from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("🗑️  Cleaning up existing data...");
  await prisma.emailHistory.deleteMany();
  await prisma.cvScore.deleteMany();
  await prisma.application.deleteMany();
  await prisma.candidateSkill.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.resume.deleteMany();
  await prisma.emailTemplate.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.job.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.hRProfile.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users (10 records: 5 candidates, 3 HR, 2 admin)
  console.log("👥 Seeding Users...");
  const hashedPassword = await bcrypt.hash("password123", 10);

  const users = await Promise.all([
    // Candidates
    prisma.user.create({
      data: {
        email: "john.doe@example.com",
        password: hashedPassword,
        role: UserRole.CANDIDATE,
        name: "John Doe",
        phone: "+1234567890",
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "jane.smith@example.com",
        password: hashedPassword,
        role: UserRole.CANDIDATE,
        name: "Jane Smith",
        phone: "+1234567891",
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "mike.johnson@example.com",
        password: hashedPassword,
        role: UserRole.CANDIDATE,
        name: "Mike Johnson",
        phone: "+1234567892",
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "sarah.williams@example.com",
        password: hashedPassword,
        role: UserRole.CANDIDATE,
        name: "Sarah Williams",
        phone: "+1234567893",
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "david.brown@example.com",
        password: hashedPassword,
        role: UserRole.CANDIDATE,
        name: "David Brown",
        phone: "+1234567894",
        isVerified: false,
      },
    }),
    // HR Users
    prisma.user.create({
      data: {
        email: "hr.manager@company.com",
        password: hashedPassword,
        role: UserRole.HR,
        name: "HR Manager",
        phone: "+1234567895",
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "talent.recruiter@company.com",
        password: hashedPassword,
        role: UserRole.HR,
        name: "Talent Recruiter",
        phone: "+1234567896",
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "hiring.lead@company.com",
        password: hashedPassword,
        role: UserRole.HR,
        name: "Hiring Lead",
        phone: "+1234567897",
        isVerified: true,
      },
    }),
    // Admin Users
    prisma.user.create({
      data: {
        email: "admin@company.com",
        password: hashedPassword,
        role: UserRole.ADMIN,
        name: "System Admin",
        phone: "+1234567898",
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "superadmin@company.com",
        password: hashedPassword,
        role: UserRole.ADMIN,
        name: "Super Admin",
        phone: "+1234567899",
        isVerified: true,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // 2. Create HR Profiles (3 records)
  console.log("👔 Seeding HR Profiles...");
  const hrProfiles = await Promise.all([
    prisma.hRProfile.create({
      data: {
        userId: users[5].id,
        department: "Human Resources",
        position: "HR Manager",
        permissions: {
          canManageJobs: true,
          canReviewApplications: true,
          canSendEmails: true,
        },
      },
    }),
    prisma.hRProfile.create({
      data: {
        userId: users[6].id,
        department: "Talent Acquisition",
        position: "Senior Recruiter",
        permissions: {
          canManageJobs: true,
          canReviewApplications: true,
          canSendEmails: true,
        },
      },
    }),
    prisma.hRProfile.create({
      data: {
        userId: users[7].id,
        department: "Engineering",
        position: "Technical Hiring Lead",
        permissions: {
          canManageJobs: false,
          canReviewApplications: true,
          canSendEmails: true,
        },
      },
    }),
  ]);
  console.log(`✅ Created ${hrProfiles.length} HR profiles`);

  // 3. Create Candidates (8 records - 5 with users, 3 without)
  console.log("🧑 Seeding Candidates...");
  const candidates = await Promise.all([
    // Candidates with user accounts
    prisma.candidate.create({
      data: {
        userId: users[0].id,
        name: "John Doe",
        email: "john.doe@example.com",
        experience: 5,
        phone: "+1234567890",
        location: "New York, NY",
        bio: "Experienced Full Stack Developer with expertise in React and Node.js",
        linkedinUrl: "https://linkedin.com/in/johndoe",
        githubUrl: "https://github.com/johndoe",
      },
    }),
    prisma.candidate.create({
      data: {
        userId: users[1].id,
        name: "Jane Smith",
        email: "jane.smith@example.com",
        experience: 3,
        phone: "+1234567891",
        location: "San Francisco, CA",
        bio: "Frontend Developer passionate about UI/UX",
        linkedinUrl: "https://linkedin.com/in/janesmith",
      },
    }),
    prisma.candidate.create({
      data: {
        userId: users[2].id,
        name: "Mike Johnson",
        email: "mike.johnson@example.com",
        experience: 7,
        phone: "+1234567892",
        location: "Austin, TX",
        bio: "Backend Engineer specializing in scalable systems",
        githubUrl: "https://github.com/mikejohnson",
      },
    }),
    prisma.candidate.create({
      data: {
        userId: users[3].id,
        name: "Sarah Williams",
        email: "sarah.williams@example.com",
        experience: 4,
        phone: "+1234567893",
        location: "Seattle, WA",
        bio: "DevOps Engineer with cloud expertise",
        linkedinUrl: "https://linkedin.com/in/sarahwilliams",
      },
    }),
    prisma.candidate.create({
      data: {
        userId: users[4].id,
        name: "David Brown",
        email: "david.brown@example.com",
        experience: 2,
        phone: "+1234567894",
        location: "Boston, MA",
        bio: "Junior Developer eager to learn and grow",
      },
    }),
    // Candidates without user accounts (legacy data)
    prisma.candidate.create({
      data: {
        name: "Emily Davis",
        email: "emily.davis@example.com",
        experience: 6,
        phone: "+1234567900",
        location: "Chicago, IL",
        bio: "Senior Software Engineer",
      },
    }),
    prisma.candidate.create({
      data: {
        name: "Robert Taylor",
        email: "robert.taylor@example.com",
        experience: 8,
        phone: "+1234567901",
        location: "Los Angeles, CA",
      },
    }),
    prisma.candidate.create({
      data: {
        name: "Lisa Anderson",
        email: "lisa.anderson@example.com",
        experience: 1,
        location: "Miami, FL",
      },
    }),
  ]);
  console.log(`✅ Created ${candidates.length} candidates`);

  // 4. Create Skills (10 records)
  console.log("🎯 Seeding Skills...");
  const skills = await Promise.all([
    prisma.skill.create({
      data: { skillName: "JavaScript", category: "Programming Language" },
    }),
    prisma.skill.create({
      data: { skillName: "TypeScript", category: "Programming Language" },
    }),
    prisma.skill.create({
      data: { skillName: "React", category: "Framework" },
    }),
    prisma.skill.create({
      data: { skillName: "Node.js", category: "Runtime" },
    }),
    prisma.skill.create({
      data: { skillName: "Python", category: "Programming Language" },
    }),
    prisma.skill.create({
      data: { skillName: "PostgreSQL", category: "Database" },
    }),
    prisma.skill.create({ data: { skillName: "Docker", category: "DevOps" } }),
    prisma.skill.create({
      data: { skillName: "AWS", category: "Cloud Platform" },
    }),
    prisma.skill.create({
      data: { skillName: "Git", category: "Version Control" },
    }),
    prisma.skill.create({
      data: { skillName: "REST API", category: "Architecture" },
    }),
  ]);
  console.log(`✅ Created ${skills.length} skills`);

  // 5. Create Candidate Skills (10 records)
  console.log("🔗 Seeding Candidate Skills...");
  const candidateSkills = await Promise.all([
    prisma.candidateSkill.create({
      data: {
        candidateId: candidates[0].id,
        skillId: skills[0].id,
        level: SkillLevel.EXPERT,
      },
    }),
    prisma.candidateSkill.create({
      data: {
        candidateId: candidates[0].id,
        skillId: skills[2].id,
        level: SkillLevel.ADVANCED,
      },
    }),
    prisma.candidateSkill.create({
      data: {
        candidateId: candidates[0].id,
        skillId: skills[3].id,
        level: SkillLevel.ADVANCED,
      },
    }),
    prisma.candidateSkill.create({
      data: {
        candidateId: candidates[1].id,
        skillId: skills[0].id,
        level: SkillLevel.ADVANCED,
      },
    }),
    prisma.candidateSkill.create({
      data: {
        candidateId: candidates[1].id,
        skillId: skills[2].id,
        level: SkillLevel.EXPERT,
      },
    }),
    prisma.candidateSkill.create({
      data: {
        candidateId: candidates[2].id,
        skillId: skills[3].id,
        level: SkillLevel.EXPERT,
      },
    }),
    prisma.candidateSkill.create({
      data: {
        candidateId: candidates[2].id,
        skillId: skills[4].id,
        level: SkillLevel.ADVANCED,
      },
    }),
    prisma.candidateSkill.create({
      data: {
        candidateId: candidates[3].id,
        skillId: skills[6].id,
        level: SkillLevel.ADVANCED,
      },
    }),
    prisma.candidateSkill.create({
      data: {
        candidateId: candidates[3].id,
        skillId: skills[7].id,
        level: SkillLevel.INTERMEDIATE,
      },
    }),
    prisma.candidateSkill.create({
      data: {
        candidateId: candidates[4].id,
        skillId: skills[0].id,
        level: SkillLevel.INTERMEDIATE,
      },
    }),
  ]);
  console.log(`✅ Created ${candidateSkills.length} candidate skills`);

  // 6. Create Jobs (7 records)
  console.log("💼 Seeding Jobs...");
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: "Senior Full Stack Developer",
        description:
          "Looking for an experienced full stack developer to join our team.",
        location: "Remote",
        company: "Tech Corp",
        requirements: "React, Node.js, PostgreSQL, 5+ years experience",
        isActive: true,
      },
    }),
    prisma.job.create({
      data: {
        title: "Frontend Engineer",
        description: "Build beautiful and responsive user interfaces.",
        location: "San Francisco, CA",
        company: "Design Co",
        requirements: "React, TypeScript, CSS, 3+ years experience",
        isActive: true,
      },
    }),
    prisma.job.create({
      data: {
        title: "Backend Developer",
        description: "Develop scalable backend services and APIs.",
        location: "New York, NY",
        company: "Data Systems Inc",
        requirements: "Node.js, Python, PostgreSQL, REST API",
        isActive: true,
      },
    }),
    prisma.job.create({
      data: {
        title: "DevOps Engineer",
        description: "Manage infrastructure and CI/CD pipelines.",
        location: "Austin, TX",
        company: "Cloud Solutions",
        requirements: "Docker, Kubernetes, AWS, Terraform",
        isActive: true,
      },
    }),
    prisma.job.create({
      data: {
        title: "Junior Developer",
        description: "Entry-level position for recent graduates.",
        location: "Boston, MA",
        company: "StartUp Hub",
        requirements: "JavaScript, React, willingness to learn",
        isActive: true,
      },
    }),
    prisma.job.create({
      data: {
        title: "AI Engineer",
        description: "Work on cutting-edge AI and machine learning projects.",
        location: "Seattle, WA",
        company: "AI Innovations",
        requirements: "Python, TensorFlow, PyTorch, ML experience",
        isActive: true,
      },
    }),
    prisma.job.create({
      data: {
        title: "Full Stack Developer (Archived)",
        description: "This position has been filled.",
        location: "Chicago, IL",
        company: "Legacy Corp",
        requirements: "Various technologies",
        isActive: false,
      },
    }),
  ]);
  console.log(`✅ Created ${jobs.length} jobs`);

  // 7. Create Job Skills (10 records)
  console.log("📋 Seeding Job Skills...");
  const jobSkills = await Promise.all([
    prisma.jobSkill.create({
      data: { jobId: jobs[0].id, skillName: "React", required: true },
    }),
    prisma.jobSkill.create({
      data: { jobId: jobs[0].id, skillName: "Node.js", required: true },
    }),
    prisma.jobSkill.create({
      data: { jobId: jobs[0].id, skillName: "PostgreSQL", required: false },
    }),
    prisma.jobSkill.create({
      data: { jobId: jobs[1].id, skillName: "React", required: true },
    }),
    prisma.jobSkill.create({
      data: { jobId: jobs[1].id, skillName: "TypeScript", required: true },
    }),
    prisma.jobSkill.create({
      data: { jobId: jobs[2].id, skillName: "Node.js", required: true },
    }),
    prisma.jobSkill.create({
      data: { jobId: jobs[2].id, skillName: "Python", required: false },
    }),
    prisma.jobSkill.create({
      data: { jobId: jobs[3].id, skillName: "Docker", required: true },
    }),
    prisma.jobSkill.create({
      data: { jobId: jobs[3].id, skillName: "AWS", required: true },
    }),
    prisma.jobSkill.create({
      data: { jobId: jobs[4].id, skillName: "JavaScript", required: true },
    }),
  ]);
  console.log(`✅ Created ${jobSkills.length} job skills`);

  // 8. Create Resumes (8 records)
  console.log("📄 Seeding Resumes...");
  const resumes = await Promise.all([
    prisma.resume.create({
      data: {
        candidateId: candidates[0].id,
        filePath: "/uploads/resumes/john_doe_resume.pdf",
        fileName: "john_doe_resume.pdf",
        extractedText:
          "John Doe - Full Stack Developer with 5 years experience...",
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
        experience_years: 5,
        education_level: "Bachelor in Computer Science",
        summary: "Experienced developer with strong problem-solving skills",
        skills_json: JSON.stringify([
          "JavaScript",
          "React",
          "Node.js",
          "PostgreSQL",
        ]),
      },
    }),
    prisma.resume.create({
      data: {
        candidateId: candidates[1].id,
        filePath: "/uploads/resumes/jane_smith_resume.pdf",
        fileName: "jane_smith_resume.pdf",
        extractedText: "Jane Smith - Frontend Developer...",
        name: "Jane Smith",
        email: "jane.smith@example.com",
        experience_years: 3,
        skills_json: JSON.stringify(["React", "TypeScript", "CSS", "HTML"]),
      },
    }),
    prisma.resume.create({
      data: {
        candidateId: candidates[2].id,
        filePath: "/uploads/resumes/mike_johnson_resume.pdf",
        fileName: "mike_johnson_resume.pdf",
        extractedText: "Mike Johnson - Backend Engineer...",
        name: "Mike Johnson",
        email: "mike.johnson@example.com",
        experience_years: 7,
        skills_json: JSON.stringify([
          "Node.js",
          "Python",
          "PostgreSQL",
          "MongoDB",
        ]),
      },
    }),
    prisma.resume.create({
      data: {
        candidateId: candidates[3].id,
        filePath: "/uploads/resumes/sarah_williams_resume.pdf",
        fileName: "sarah_williams_resume.pdf",
        extractedText: "Sarah Williams - DevOps Engineer...",
        name: "Sarah Williams",
        email: "sarah.williams@example.com",
        experience_years: 4,
        skills_json: JSON.stringify([
          "Docker",
          "AWS",
          "Kubernetes",
          "Terraform",
        ]),
      },
    }),
    prisma.resume.create({
      data: {
        candidateId: candidates[4].id,
        filePath: "/uploads/resumes/david_brown_resume.pdf",
        fileName: "david_brown_resume.pdf",
        extractedText: "David Brown - Junior Developer...",
        name: "David Brown",
        email: "david.brown@example.com",
        experience_years: 2,
        skills_json: JSON.stringify(["JavaScript", "React", "Git"]),
      },
    }),
    prisma.resume.create({
      data: {
        candidateId: candidates[5].id,
        filePath: "/uploads/resumes/emily_davis_resume.pdf",
        fileName: "emily_davis_resume.pdf",
        extractedText: "Emily Davis - Senior Software Engineer...",
        experience_years: 6,
        skills_json: JSON.stringify(["Java", "Spring", "MySQL", "AWS"]),
      },
    }),
    prisma.resume.create({
      data: {
        candidateId: candidates[6].id,
        filePath: "/uploads/resumes/robert_taylor_resume.pdf",
        fileName: "robert_taylor_resume.pdf",
        extractedText: "Robert Taylor - Tech Lead...",
        experience_years: 8,
        skills_json: JSON.stringify([
          "JavaScript",
          "React",
          "Node.js",
          "Leadership",
        ]),
      },
    }),
    prisma.resume.create({
      data: {
        candidateId: candidates[7].id,
        filePath: "/uploads/resumes/lisa_anderson_resume.pdf",
        fileName: "lisa_anderson_resume.pdf",
        extractedText: "Lisa Anderson - Entry Level Developer...",
        experience_years: 1,
        skills_json: JSON.stringify(["HTML", "CSS", "JavaScript"]),
      },
    }),
  ]);
  console.log(`✅ Created ${resumes.length} resumes`);

  // 9. Create Email Templates (8 records)
  console.log("✉️ Seeding Email Templates...");
  const emailTemplates = await Promise.all([
    prisma.emailTemplate.create({
      data: {
        name: "Application Received",
        subject: "Application Received - {{jobTitle}}",
        body: "Dear {{candidateName}}, Thank you for applying to {{jobTitle}}. We have received your application.",
        type: EmailType.APPLICATION_RECEIVED,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: "Interview Invitation",
        subject: "Interview Invitation - {{jobTitle}}",
        body: "Dear {{candidateName}}, We would like to invite you for an interview for {{jobTitle}}.",
        type: EmailType.INTERVIEW_INVITE,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: "Application Under Review",
        subject: "Application Status - {{jobTitle}}",
        body: "Dear {{candidateName}}, Your application for {{jobTitle}} is currently under review.",
        type: EmailType.APPLICATION_UNDER_REVIEW,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: "Application Shortlisted",
        subject: "Congratulations! You have been shortlisted",
        body: "Dear {{candidateName}}, Congratulations! You have been shortlisted for {{jobTitle}}.",
        type: EmailType.APPLICATION_SHORTLISTED,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: "Application Rejected",
        subject: "Application Update - {{jobTitle}}",
        body: "Dear {{candidateName}}, Thank you for your interest. Unfortunately, we have decided to move forward with other candidates.",
        type: EmailType.APPLICATION_REJECTED,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: "Job Offer",
        subject: "Job Offer - {{jobTitle}}",
        body: "Dear {{candidateName}}, We are pleased to offer you the position of {{jobTitle}}!",
        type: EmailType.JOB_OFFER,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: "Follow Up",
        subject: "Following Up - {{jobTitle}}",
        body: "Dear {{candidateName}}, We wanted to follow up on your application for {{jobTitle}}.",
        type: EmailType.FOLLOW_UP,
      },
    }),
    prisma.emailTemplate.create({
      data: {
        name: "Custom Template",
        subject: "Custom Message",
        body: "This is a custom email template.",
        type: EmailType.CUSTOM,
        isActive: false,
      },
    }),
  ]);
  console.log(`✅ Created ${emailTemplates.length} email templates`);

  // 10. Create Applications (10 records)
  console.log("📝 Seeding Applications...");
  const applications = await Promise.all([
    prisma.application.create({
      data: {
        candidateId: candidates[0].id,
        jobId: jobs[0].id,
        score: 85,
        status: ApplicationStatus.SHORTLISTED,
      },
    }),
    prisma.application.create({
      data: {
        candidateId: candidates[1].id,
        jobId: jobs[1].id,
        score: 90,
        status: ApplicationStatus.REVIEWED,
      },
    }),
    prisma.application.create({
      data: {
        candidateId: candidates[2].id,
        jobId: jobs[2].id,
        score: 88,
        status: ApplicationStatus.SHORTLISTED,
      },
    }),
    prisma.application.create({
      data: {
        candidateId: candidates[3].id,
        jobId: jobs[3].id,
        score: 75,
        status: ApplicationStatus.REVIEWED,
      },
    }),
    prisma.application.create({
      data: {
        candidateId: candidates[4].id,
        jobId: jobs[4].id,
        score: 60,
        status: ApplicationStatus.PENDING,
      },
    }),
    prisma.application.create({
      data: {
        candidateId: candidates[0].id,
        jobId: jobs[1].id,
        score: 82,
        status: ApplicationStatus.REVIEWED,
      },
    }),
    prisma.application.create({
      data: {
        candidateId: candidates[1].id,
        jobId: jobs[0].id,
        score: 78,
        status: ApplicationStatus.PENDING,
      },
    }),
    prisma.application.create({
      data: {
        candidateId: candidates[5].id,
        jobId: jobs[2].id,
        score: 70,
        status: ApplicationStatus.REJECTED,
      },
    }),
    prisma.application.create({
      data: {
        candidateId: candidates[6].id,
        jobId: jobs[0].id,
        score: 92,
        status: ApplicationStatus.SHORTLISTED,
      },
    }),
    prisma.application.create({
      data: {
        candidateId: candidates[7].id,
        jobId: jobs[4].id,
        score: 55,
        status: ApplicationStatus.PENDING,
      },
    }),
  ]);
  console.log(`✅ Created ${applications.length} applications`);

  // 11. Create CV Scores (8 records)
  console.log("📊 Seeding CV Scores...");
  const cvScores = await Promise.all([
    prisma.cvScore.create({
      data: {
        resumeId: resumes[0].id,
        jobId: jobs[0].id,
        applicationId: applications[0].id,
        score: 85,
        explanation:
          "Strong match for full stack position. Excellent React and Node.js skills.",
        skillsMatch: {
          matched: ["React", "Node.js", "PostgreSQL"],
          missing: [],
          score: 90,
        },
        requirements: {
          experienceMatch: true,
          educationMatch: true,
        },
      },
    }),
    prisma.cvScore.create({
      data: {
        resumeId: resumes[1].id,
        jobId: jobs[1].id,
        applicationId: applications[1].id,
        score: 90,
        explanation:
          "Perfect fit for frontend role. Expert level React and TypeScript.",
        skillsMatch: {
          matched: ["React", "TypeScript", "CSS"],
          missing: [],
          score: 95,
        },
      },
    }),
    prisma.cvScore.create({
      data: {
        resumeId: resumes[2].id,
        jobId: jobs[2].id,
        applicationId: applications[2].id,
        score: 88,
        explanation: "Excellent backend experience with Node.js and Python.",
        skillsMatch: {
          matched: ["Node.js", "Python", "PostgreSQL"],
          missing: [],
          score: 92,
        },
      },
    }),
    prisma.cvScore.create({
      data: {
        resumeId: resumes[3].id,
        jobId: jobs[3].id,
        applicationId: applications[3].id,
        score: 75,
        explanation:
          "Good DevOps skills. Could benefit from more Kubernetes experience.",
        skillsMatch: {
          matched: ["Docker", "AWS"],
          missing: ["Kubernetes"],
          score: 75,
        },
      },
    }),
    prisma.cvScore.create({
      data: {
        resumeId: resumes[4].id,
        jobId: jobs[4].id,
        applicationId: applications[4].id,
        score: 60,
        explanation: "Entry-level candidate with basic skills. Good potential.",
        skillsMatch: {
          matched: ["JavaScript", "React"],
          missing: [],
          score: 65,
        },
      },
    }),
    prisma.cvScore.create({
      data: {
        resumeId: resumes[0].id,
        jobId: jobs[1].id,
        applicationId: applications[5].id,
        score: 82,
        explanation: "Strong frontend skills, good match for the position.",
        skillsMatch: {
          matched: ["React", "TypeScript"],
          missing: [],
          score: 85,
        },
      },
    }),
    prisma.cvScore.create({
      data: {
        resumeId: resumes[1].id,
        jobId: jobs[0].id,
        applicationId: applications[6].id,
        score: 78,
        explanation:
          "Good frontend developer, backend skills could be stronger.",
        skillsMatch: {
          matched: ["React"],
          missing: ["Node.js"],
          score: 70,
        },
      },
    }),
    prisma.cvScore.create({
      data: {
        resumeId: resumes[5].id,
        jobId: jobs[2].id,
        applicationId: applications[7].id,
        score: 70,
        explanation: "Different tech stack but transferable skills.",
        skillsMatch: {
          matched: [],
          missing: ["Node.js", "Python"],
          score: 60,
        },
      },
    }),
  ]);
  console.log(`✅ Created ${cvScores.length} CV scores`);

  // 12. Create Email History (10 records)
  console.log("📨 Seeding Email History...");
  const emailHistory = await Promise.all([
    prisma.emailHistory.create({
      data: {
        candidateId: candidates[0].id,
        jobId: jobs[0].id,
        templateId: emailTemplates[0].id,
        subject: "Application Received - Senior Full Stack Developer",
        body: "Dear John Doe, Thank you for applying to Senior Full Stack Developer.",
        recipient: "john.doe@example.com",
        status: EmailStatus.SENT,
        sentAt: new Date(),
      },
    }),
    prisma.emailHistory.create({
      data: {
        candidateId: candidates[0].id,
        jobId: jobs[0].id,
        templateId: emailTemplates[3].id,
        subject: "Congratulations! You have been shortlisted",
        body: "Dear John Doe, Congratulations! You have been shortlisted.",
        recipient: "john.doe@example.com",
        status: EmailStatus.SENT,
        sentAt: new Date(),
      },
    }),
    prisma.emailHistory.create({
      data: {
        candidateId: candidates[1].id,
        jobId: jobs[1].id,
        templateId: emailTemplates[0].id,
        subject: "Application Received - Frontend Engineer",
        body: "Dear Jane Smith, Thank you for applying.",
        recipient: "jane.smith@example.com",
        status: EmailStatus.SENT,
        sentAt: new Date(),
      },
    }),
    prisma.emailHistory.create({
      data: {
        candidateId: candidates[1].id,
        jobId: jobs[1].id,
        templateId: emailTemplates[1].id,
        subject: "Interview Invitation - Frontend Engineer",
        body: "Dear Jane Smith, We would like to invite you for an interview.",
        recipient: "jane.smith@example.com",
        status: EmailStatus.SENT,
        sentAt: new Date(),
      },
    }),
    prisma.emailHistory.create({
      data: {
        candidateId: candidates[2].id,
        jobId: jobs[2].id,
        templateId: emailTemplates[0].id,
        subject: "Application Received - Backend Developer",
        body: "Dear Mike Johnson, Thank you for your application.",
        recipient: "mike.johnson@example.com",
        status: EmailStatus.SENT,
        sentAt: new Date(),
      },
    }),
    prisma.emailHistory.create({
      data: {
        candidateId: candidates[3].id,
        jobId: jobs[3].id,
        templateId: emailTemplates[0].id,
        subject: "Application Received - DevOps Engineer",
        body: "Dear Sarah Williams, Thank you for applying.",
        recipient: "sarah.williams@example.com",
        status: EmailStatus.SENT,
        sentAt: new Date(),
      },
    }),
    prisma.emailHistory.create({
      data: {
        candidateId: candidates[4].id,
        jobId: jobs[4].id,
        templateId: emailTemplates[0].id,
        subject: "Application Received - Junior Developer",
        body: "Dear David Brown, Thank you for your interest.",
        recipient: "david.brown@example.com",
        status: EmailStatus.PENDING,
      },
    }),
    prisma.emailHistory.create({
      data: {
        candidateId: candidates[5].id,
        jobId: jobs[2].id,
        templateId: emailTemplates[4].id,
        subject: "Application Update - Backend Developer",
        body: "Dear Emily Davis, Thank you for your interest.",
        recipient: "emily.davis@example.com",
        status: EmailStatus.SENT,
        sentAt: new Date(),
      },
    }),
    prisma.emailHistory.create({
      data: {
        candidateId: candidates[6].id,
        jobId: jobs[0].id,
        templateId: emailTemplates[0].id,
        subject: "Application Received - Senior Full Stack Developer",
        body: "Dear Robert Taylor, Thank you for applying.",
        recipient: "robert.taylor@example.com",
        status: EmailStatus.SENT,
        sentAt: new Date(),
      },
    }),
    prisma.emailHistory.create({
      data: {
        candidateId: candidates[7].id,
        jobId: jobs[4].id,
        templateId: emailTemplates[0].id,
        subject: "Application Received - Junior Developer",
        body: "Dear Lisa Anderson, Thank you for your application.",
        recipient: "lisa.anderson@example.com",
        status: EmailStatus.FAILED,
        errorMessage: "Invalid email address",
      },
    }),
  ]);
  console.log(`✅ Created ${emailHistory.length} email history records`);

  console.log("\n🎉 Database seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - ${users.length} Users`);
  console.log(`   - ${hrProfiles.length} HR Profiles`);
  console.log(`   - ${candidates.length} Candidates`);
  console.log(`   - ${skills.length} Skills`);
  console.log(`   - ${candidateSkills.length} Candidate Skills`);
  console.log(`   - ${jobs.length} Jobs`);
  console.log(`   - ${jobSkills.length} Job Skills`);
  console.log(`   - ${resumes.length} Resumes`);
  console.log(`   - ${emailTemplates.length} Email Templates`);
  console.log(`   - ${applications.length} Applications`);
  console.log(`   - ${cvScores.length} CV Scores`);
  console.log(`   - ${emailHistory.length} Email History Records`);
  console.log("\n🔑 Test Login Credentials:");
  console.log("   Candidate: john.doe@example.com / password123");
  console.log("   HR: hr.manager@company.com / password123");
  console.log("   Admin: admin@company.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
