import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUsers() {
  console.log("\n🔍 Checking created users...\n");

  // Get first 5 HR users
  console.log("📋 HR Users (first 5):");
  const hrUsers = await prisma.user.findMany({
    where: { role: "HR" },
    take: 5,
    select: {
      email: true,
      name: true,
      role: true,
    },
  });

  hrUsers.forEach((user) => {
    console.log(`  ✅ ${user.email} (${user.name})`);
  });

  // Get first 5 candidates
  console.log("\n👤 Candidate Users (first 5):");
  const candidates = await prisma.user.findMany({
    where: { role: "CANDIDATE" },
    take: 5,
    select: {
      email: true,
      name: true,
      role: true,
    },
  });

  candidates.forEach((user) => {
    console.log(`  ✅ ${user.email} (${user.name})`);
  });

  // Get total counts
  const hrCount = await prisma.user.count({ where: { role: "HR" } });
  const candidateCount = await prisma.user.count({
    where: { role: "CANDIDATE" },
  });

  console.log("\n📊 Total Counts:");
  console.log(`  - HR Users: ${hrCount}`);
  console.log(`  - Candidates: ${candidateCount}`);
  console.log(`  - Total Users: ${hrCount + candidateCount}`);

  console.log("\n🔐 All users have password: password123\n");

  await prisma.$disconnect();
}

checkUsers().catch(console.error);
