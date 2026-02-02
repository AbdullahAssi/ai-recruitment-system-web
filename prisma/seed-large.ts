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

// Configuration for data generation
const CONFIG = {
  COMPANIES: 10,
  HR_PER_COMPANY: 3,
  CANDIDATES: 200,
  JOBS_PER_COMPANY: 15,
  APPLICATIONS_PER_JOB: 10,
  EMAIL_TEMPLATES: 5,
};

// Sample data pools
const FIRST_NAMES = [
  "James",
  "Mary",
  "John",
  "Patricia",
  "Robert",
  "Jennifer",
  "Michael",
  "Linda",
  "William",
  "Elizabeth",
  "David",
  "Barbara",
  "Richard",
  "Susan",
  "Joseph",
  "Jessica",
  "Thomas",
  "Sarah",
  "Charles",
  "Karen",
  "Christopher",
  "Nancy",
  "Daniel",
  "Lisa",
  "Matthew",
  "Betty",
  "Anthony",
  "Margaret",
  "Mark",
  "Sandra",
  "Donald",
  "Ashley",
  "Steven",
  "Kimberly",
  "Paul",
  "Emily",
  "Andrew",
  "Donna",
  "Joshua",
  "Michelle",
  "Kenneth",
  "Carol",
  "Kevin",
  "Amanda",
  "Brian",
  "Dorothy",
  "George",
  "Melissa",
  "Edward",
  "Deborah",
  "Ronald",
  "Stephanie",
  "Timothy",
  "Rebecca",
  "Jason",
  "Sharon",
  "Jeffrey",
  "Laura",
  "Ryan",
  "Cynthia",
  "Jacob",
  "Kathleen",
  "Gary",
  "Amy",
];

const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
  "Green",
  "Adams",
  "Nelson",
  "Baker",
  "Hall",
  "Rivera",
  "Campbell",
  "Mitchell",
  "Carter",
  "Roberts",
  "Gomez",
  "Phillips",
  "Evans",
  "Turner",
  "Diaz",
  "Parker",
];

const COMPANY_NAMES = [
  "TechCorp Solutions",
  "Digital Innovations Inc",
  "CloudFirst Systems",
  "DataDrive Technologies",
  "NextGen Software",
  "AgileWorks Ltd",
  "CodeCraft Industries",
  "ByteForge Corp",
  "SynergyTech Group",
  "InnovateSphere LLC",
  "FutureStack Systems",
  "PrimeCode Solutions",
  "VelocityTech Inc",
  "ApexSoft Corporation",
  "ZenithData Systems",
  "NexusCloud Technologies",
  "QuantumLeap Software",
  "CyberCore Solutions",
  "SmartBridge Tech",
  "VisionaryCode Inc",
];

const COMPANY_INDUSTRIES = [
  "Technology",
  "Software Development",
  "Cloud Computing",
  "Data Analytics",
  "Artificial Intelligence",
  "Cybersecurity",
  "Fintech",
  "E-commerce",
  "Healthcare Technology",
  "EdTech",
  "SaaS",
  "Enterprise Software",
];

const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5000+",
];

const JOB_TITLES = [
  "Senior Frontend Developer",
  "Backend Engineer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Product Manager",
  "UX/UI Designer",
  "QA Engineer",
  "Software Architect",
  "Cloud Solutions Architect",
  "Security Engineer",
  "Database Administrator",
  "Mobile App Developer",
  "Site Reliability Engineer",
  "Technical Lead",
  "Business Analyst",
  "Project Manager",
  "Scrum Master",
  "Data Engineer",
  "AI Research Scientist",
  "Systems Administrator",
  "Network Engineer",
  "Frontend Team Lead",
  "Backend Team Lead",
  "Engineering Manager",
];

const SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "Go",
  "AWS",
  "Azure",
  "Docker",
  "Kubernetes",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "GraphQL",
  "REST API",
  "Git",
  "CI/CD",
  "Agile",
  "Scrum",
  "Machine Learning",
  "TensorFlow",
  "PyTorch",
  "Data Analysis",
  "SQL",
  "NoSQL",
  "Microservices",
  "System Design",
  "Linux",
  "Bash",
  "Jenkins",
  "Terraform",
  "Next.js",
  "Vue.js",
  "Angular",
  "Express.js",
  "Django",
  "Flask",
  "Spring Boot",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "SASS",
  "Webpack",
  "Vite",
  "Jest",
  "Cypress",
  "Leadership",
  "Communication",
  "Problem Solving",
  "Team Collaboration",
];

const LOCATIONS = [
  "New York, NY",
  "San Francisco, CA",
  "Austin, TX",
  "Seattle, WA",
  "Boston, MA",
  "Chicago, IL",
  "Los Angeles, CA",
  "Denver, CO",
  "Portland, OR",
  "Atlanta, GA",
  "Miami, FL",
  "Washington, DC",
  "San Diego, CA",
  "Phoenix, AZ",
  "Dallas, TX",
  "Remote",
];

const EXPERIENCE_LEVELS = [
  "Entry Level",
  "Mid Level",
  "Senior Level",
  "Lead",
  "Principal",
];

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

function generateEmail(
  firstName: string,
  lastName: string,
  domain?: string,
  suffix?: string,
): string {
  const baseDomain =
    domain ||
    randomItem(["gmail.com", "yahoo.com", "outlook.com", "example.com"]);
  const emailSuffix = suffix ? `.${suffix}` : "";
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${emailSuffix}@${baseDomain}`;
}

function generatePhone(): string {
  return `+1${randomInt(200, 999)}${randomInt(100, 999)}${randomInt(1000, 9999)}`;
}

function generateJobDescription(title: string, skills: string[]): string {
  return `We are seeking a talented ${title} to join our growing team. 

Key Responsibilities:
- Design and develop scalable applications
- Collaborate with cross-functional teams
- Write clean, maintainable code
- Participate in code reviews
- Mentor junior team members

Required Skills:
${skills
  .slice(0, 5)
  .map((s) => `- ${s}`)
  .join("\n")}

Benefits:
- Competitive salary
- Health insurance
- 401(k) matching
- Flexible work hours
- Remote work options
- Professional development budget`;
}

async function main() {
  console.log("🌱 Starting large-scale database seeding...");
  console.log(`📊 Configuration:
  - Companies: ${CONFIG.COMPANIES}
  - HR Users per Company: ${CONFIG.HR_PER_COMPANY}
  - Candidates: ${CONFIG.CANDIDATES}
  - Jobs per Company: ${CONFIG.JOBS_PER_COMPANY}
  - Applications per Job: ${CONFIG.APPLICATIONS_PER_JOB}
  - Email Templates: ${CONFIG.EMAIL_TEMPLATES}
  `);

  const startTime = Date.now();

  // Clear existing data
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
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Cleanup complete");

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Skills
  console.log("\n🎯 Creating skills...");
  const skillRecords = await Promise.all(
    SKILLS.map((name) =>
      prisma.skill.create({
        data: {
          skillName: name,
          category:
            name.includes("JS") ||
            name.includes("React") ||
            name.includes("Vue") ||
            name.includes("Angular")
              ? "Frontend"
              : name.includes("Node") ||
                  name.includes("Python") ||
                  name.includes("Java") ||
                  name.includes("Go")
                ? "Backend"
                : name.includes("AWS") ||
                    name.includes("Azure") ||
                    name.includes("Docker") ||
                    name.includes("Kubernetes")
                  ? "DevOps"
                  : name.includes("SQL") ||
                      name.includes("MongoDB") ||
                      name.includes("Redis")
                    ? "Database"
                    : "Soft Skills",
        },
      }),
    ),
  );
  console.log(`✅ Created ${skillRecords.length} skills`);

  // 2. Create Companies
  console.log("\n🏢 Creating companies...");
  const companies = [];
  for (let i = 0; i < CONFIG.COMPANIES; i++) {
    const company = await prisma.company.create({
      data: {
        name: COMPANY_NAMES[i] || `Company ${i + 1}`,
        industry: randomItem(COMPANY_INDUSTRIES),
        size: randomItem(COMPANY_SIZES),
        location: randomItem(LOCATIONS),
        website: `https://www.company${i + 1}.com`,
        description: `Leading ${randomItem(COMPANY_INDUSTRIES)} company focused on innovation and excellence.`,
        isVerified: Math.random() > 0.3,
      },
    });
    companies.push(company);
  }
  console.log(`✅ Created ${companies.length} companies`);

  // 3. Create HR Users and Profiles
  console.log("\n👔 Creating HR users...");
  const hrUsers = [];
  for (const company of companies) {
    for (let i = 0; i < CONFIG.HR_PER_COMPANY; i++) {
      const firstName = randomItem(FIRST_NAMES);
      const lastName = randomItem(LAST_NAMES);
      const companyDomain = company.website?.replace("https://www.", "") || "example.com";

      const user = await prisma.user.create({
        data: {
          email: generateEmail(firstName, lastName, companyDomain),
          password: hashedPassword,
          role: UserRole.HR,
          name: `${firstName} ${lastName}`,
          phone: generatePhone(),
          isVerified: true,
        },
      });

      await prisma.hRProfile.create({
        data: {
          userId: user.id,
          companyId: company.id,
          position: i === 0 ? "HR Manager" : "Talent Recruiter",
          department: "Human Resources",
        },
      });

      hrUsers.push(user);
    }
  }
  console.log(`✅ Created ${hrUsers.length} HR users with profiles`);

  // 4. Create Candidates
  console.log("\n👨‍💼 Creating candidates...");
  const candidates = [];
  for (let i = 0; i < CONFIG.CANDIDATES; i++) {
    const firstName = randomItem(FIRST_NAMES);
    const lastName = randomItem(LAST_NAMES);
    const experienceYears = randomInt(0, 15);

    const user = await prisma.user.create({
      data: {
        email: generateEmail(firstName, lastName, undefined, i.toString()),
        password: hashedPassword,
        role: UserRole.CANDIDATE,
        name: `${firstName} ${lastName}`,
        phone: generatePhone(),
        isVerified: Math.random() > 0.2,
      },
    });

    const candidate = await prisma.candidate.create({
      data: {
        userId: user.id,
        name: `${firstName} ${lastName}`,
        email: user.email,
        experience: experienceYears,
        phone: user.phone,
        location: randomItem(LOCATIONS),
        bio: `Experienced ${randomItem(JOB_TITLES)} with ${experienceYears} years in the industry. Passionate about technology and continuous learning.`,
        linkedinUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
      },
    });

    // Add Skills to Candidate
    const candidateSkills = randomItems(skillRecords, randomInt(5, 12));
    await Promise.all(
      candidateSkills.map((skill) =>
        prisma.candidateSkill.create({
          data: {
            candidateId: candidate.id,
            skillId: skill.id,
            level: randomItem(Object.values(SkillLevel)),
          },
        }),
      ),
    );

    // Create Resume
    await prisma.resume.create({
      data: {
        candidateId: candidate.id,
        fileName: `${firstName}_${lastName}_Resume.pdf`,
        filePath: `/uploads/resumes/${firstName}_${lastName}_Resume.pdf`,
        filename: `${firstName}_${lastName}_Resume.pdf`,
        name: `${firstName} ${lastName}`,
        email: user.email,
        phone: user.phone,
        experience_years: experienceYears,
        summary: `Experienced professional with ${experienceYears} years in technology`,
        skills_json: JSON.stringify(candidateSkills.map((s) => s.skillName)),
      },
    });

    candidates.push(candidate);

    if ((i + 1) % 50 === 0) {
      console.log(
        `  📊 Progress: ${i + 1}/${CONFIG.CANDIDATES} candidates created`,
      );
    }
  }
  console.log(
    `✅ Created ${candidates.length} candidates with resumes and skills`,
  );

  // 5. Create Jobs
  console.log("\n💼 Creating jobs...");
  const jobs = [];
  for (const company of companies) {
    const companyHR = hrUsers.filter((hr) =>
      hr.email.includes(company.website?.replace("https://www.", "") || "example.com"),
    );
    const hrUser = randomItem(companyHR);

    for (let i = 0; i < CONFIG.JOBS_PER_COMPANY; i++) {
      const jobTitle = randomItem(JOB_TITLES);
      const jobSkills = randomItems(skillRecords, randomInt(5, 10));
      const isActive = Math.random() > 0.2; // 80% active jobs

      const job = await prisma.job.create({
        data: {
          title: jobTitle,
          description: generateJobDescription(
            jobTitle,
            jobSkills.map((s) => s.skillName),
          ),
          requirements: `${randomInt(3, 10)}+ years of experience\n${randomItem(EXPERIENCE_LEVELS)} position`,
          location: randomItem(LOCATIONS),
          companyId: company.id,
          company: company.name, // For backward compatibility
          responsibilities: `Manage ${jobTitle} responsibilities and deliverables`,
          isActive,
          postedDate: new Date(
            Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000,
          ), // Last 90 days
        },
      });

      // Add Skills to Job
      await Promise.all(
        jobSkills.map((skill, index) =>
          prisma.jobSkill.create({
            data: {
              jobId: job.id,
              skillName: skill.skillName,
              required: index < 3, // First 3 skills are required
            },
          }),
        ),
      );

      jobs.push(job);
    }
  }
  console.log(`✅ Created ${jobs.length} jobs with required skills`);

  // 6. Create Applications
  console.log("\n📝 Creating applications...");
  let totalApplications = 0;
  for (const job of jobs) {
    const numApplications = randomInt(5, CONFIG.APPLICATIONS_PER_JOB);
    const applicants = randomItems(candidates, numApplications);

    for (const candidate of applicants) {
      const status = randomItem(Object.values(ApplicationStatus));
      const appliedAt = new Date(
        job.postedDate.getTime() + randomInt(0, 30) * 24 * 60 * 60 * 1000,
      );

      const application = await prisma.application.create({
        data: {
          jobId: job.id,
          candidateId: candidate.id,
          resumeId: candidate.primaryResumeId,
          status,
          appliedAt,
          quizRequired: Math.random() > 0.3, // 70% require quiz
          quizCompleted: status === "QUIZ_COMPLETED",
        },
      });

      // Add CV Score (60% of applications have scores)
      if (Math.random() > 0.4 && candidate.primaryResumeId) {
        await prisma.cvScore.create({
          data: {
            applicationId: application.id,
            resumeId: candidate.primaryResumeId,
            jobId: job.id,
            score: randomInt(50, 100),
            explanation: `AI Analysis: Strong match for ${job.title} position. Relevant skills and experience align well with job requirements.`,
            skillsMatch: {
              matching: randomInt(5, 10),
              total: randomInt(10, 15),
              details: ["React", "Node.js", "TypeScript"],
            },
            requirements: {
              met: randomInt(3, 5),
              total: 5,
              details: ["3+ years experience", "Bachelor's degree"],
            },
          },
        });
      }

      totalApplications++;
    }

    if (totalApplications % 500 === 0) {
      console.log(`  📊 Progress: ${totalApplications} applications created`);
    }
  }
  console.log(`✅ Created ${totalApplications} applications with scores`);

  // 7. Create Email Templates
  console.log("\n📧 Creating email templates...");
  const templates = [
    {
      name: "Application Received",
      type: EmailType.APPLICATION_RECEIVED,
      subject: "Your Application Has Been Received",
      body: "Dear {{candidateName}},\n\nThank you for applying to {{jobTitle}} at {{companyName}}. We have received your application and will review it shortly.\n\nBest regards,\n{{hrName}}",
    },
    {
      name: "Interview Invitation",
      type: EmailType.INTERVIEW_INVITE,
      subject: "Interview Invitation - {{jobTitle}}",
      body: "Dear {{candidateName}},\n\nWe are pleased to invite you for an interview for the {{jobTitle}} position.\n\nPlease let us know your availability.\n\nBest regards,\n{{hrName}}",
    },
    {
      name: "Application Rejected",
      type: EmailType.APPLICATION_REJECTED,
      subject: "Application Status Update",
      body: "Dear {{candidateName}},\n\nThank you for your interest in {{jobTitle}}. After careful consideration, we have decided to move forward with other candidates.\n\nBest regards,\n{{hrName}}",
    },
    {
      name: "Offer Letter",
      type: EmailType.JOB_OFFER,
      subject: "Job Offer - {{jobTitle}}",
      body: "Dear {{candidateName}},\n\nCongratulations! We are pleased to extend an offer for the {{jobTitle}} position at {{companyName}}.\n\nBest regards,\n{{hrName}}",
    },
    {
      name: "Custom Notification",
      type: EmailType.CUSTOM,
      subject: "Update from {{companyName}}",
      body: "Dear {{candidateName}},\n\n{{customMessage}}\n\nBest regards,\n{{hrName}}",
    },
  ];

  for (const company of companies) {
    const companyHR = hrUsers.filter((hr) =>
      hr.email.includes(company.website?.replace("https://www.", "") || "example.com"),
    );
    const hrUser = randomItem(companyHR);

    for (const template of templates) {
      await prisma.emailTemplate.create({
        data: {
          name: `${template.name} - ${company.name}`,
          type: template.type,
          subject: template.subject,
          body: template.body,
        },
      });
    }
  }
  console.log(
    `✅ Created ${CONFIG.COMPANIES * templates.length} email templates`,
  );

  // 8. Create Email History
  console.log("\n📨 Creating email history...");
  const applications = await prisma.application.findMany({
    take: 500, // Create history for first 500 applications
    include: {
      job: true,
      candidate: { include: { user: true } },
    },
  });

  let emailCount = 0;
  for (const app of applications) {
    if (Math.random() > 0.3 && app.candidate.user) {
      // 70% of applications have email history
      await prisma.emailHistory.create({
        data: {
          candidateId: app.candidateId,
          jobId: app.jobId,
          recipient: app.candidate.user.email,
          subject: `Application Update - ${app.job.title}`,
          body: "Your application has been reviewed.",
          status: randomItem(Object.values(EmailStatus)),
          sentAt: new Date(
            app.appliedAt.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000,
          ),
        },
      });
      emailCount++;
    }
  }
  console.log(`✅ Created ${emailCount} email history records`);

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log("\n🎉 Seeding completed successfully!");
  console.log(`⏱️  Total time: ${duration}s`);
  console.log("\n📊 Final Statistics:");
  console.log(`  - Companies: ${CONFIG.COMPANIES}`);
  console.log(`  - HR Users: ${hrUsers.length}`);
  console.log(`  - Candidates: ${candidates.length}`);
  console.log(`  - Jobs: ${jobs.length}`);
  console.log(`  - Applications: ${totalApplications}`);
  console.log(`  - Skills: ${skillRecords.length}`);
  console.log(`  - Email Templates: ${CONFIG.COMPANIES * templates.length}`);
  console.log(`  - Email History: ${emailCount}`);
  console.log("\n🔐 Test Credentials:");
  console.log("  Email: Any generated email (e.g., john.doe@gmail.com)");
  console.log("  Password: password123");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
