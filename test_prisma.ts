import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Testing prisma.job.findMany...");
    const jobs = await prisma.job.findMany({
      include: {
        applications: {
          include: {
            candidate: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { postedDate: "desc" },
    });
    console.log(
      "Successfully fetched jobs:",
      JSON.stringify(jobs, null, 2).substring(0, 200) + "...",
    );
  } catch (error) {
    console.error("Error fetching jobs:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
