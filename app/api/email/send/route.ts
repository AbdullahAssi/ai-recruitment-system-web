import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/emailService";
import { auth } from "@/lib/auth";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

// Helper function to replace template variables
function processEmailTemplate(
  template: string,
  variables: Record<string, string>,
): string {
  let processed = template;

  // Replace common variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    processed = processed.replace(regex, value || "");
  });

  return processed;
}

// POST send email to candidates
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authResult = await auth(request);
    if (!authResult?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const hrUser = authResult.user;

    const requestBody = await request.json();
    const { candidateIds, templateId, customSubject, customBody, jobId } =
      requestBody;

    if (
      !candidateIds ||
      !Array.isArray(candidateIds) ||
      candidateIds.length === 0
    ) {
      return NextResponse.json(
        { error: "candidateIds array is required" },
        { status: 400 },
      );
    }

    if (!templateId && (!customSubject || !customBody)) {
      return NextResponse.json(
        {
          error:
            "Either templateId or both customSubject and customBody are required",
        },
        { status: 400 },
      );
    }

    let emailTemplate = null;
    let subject = customSubject;
    let emailBody = customBody;

    // Get template if templateId is provided
    if (templateId) {
      emailTemplate = await prisma.emailTemplate.findUnique({
        where: { id: templateId },
      });

      if (!emailTemplate) {
        return NextResponse.json(
          { error: "Email template not found" },
          { status: 404 },
        );
      }

      subject = emailTemplate.subject;
      emailBody = emailTemplate.body;
    }

    // Get candidates
    const candidates = await prisma.candidate.findMany({
      where: {
        id: {
          in: candidateIds,
        },
      },
      include: {
        applications: jobId
          ? {
              where: { jobId },
              include: {
                job: true,
              },
            }
          : {
              include: {
                job: true,
              },
            },
      },
    });

    if (candidates.length === 0) {
      return NextResponse.json(
        { error: "No valid candidates found" },
        { status: 404 },
      );
    }

    // Get job details if jobId is provided
    let job = null;
    if (jobId) {
      job = await prisma.job.findUnique({
        where: { id: jobId },
        include: {
          companyInfo: true, // Include company information
        },
      });
    }

    const emailRecords = [];
    const failedEmails = [];

    // Process each candidate
    for (const candidate of candidates) {
      try {
        // Prepare template variables
        const variables = {
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          jobTitle: job?.title || "",
          jobLocation: job?.location || "",
          companyName: job?.companyInfo?.name || job?.company || "Your Company",
          hrName: hrUser.name || "Hiring Team",
        };

        // Process template
        const processedSubject = processEmailTemplate(subject, variables);
        const processedBody = processEmailTemplate(emailBody, variables);

        // Create email history record
        const emailRecord = await prisma.emailHistory.create({
          data: {
            candidateId: candidate.id,
            jobId: jobId || null,
            templateId: emailTemplate?.id || null,
            subject: processedSubject,
            body: processedBody,
            recipient: candidate.email,
            status: "PENDING",
          },
        });

        //  ACTUAL EMAIL SENDING WITH SMTP
        console.log(`Sending email to: ${candidate.email}`);
        console.log(` Subject: ${processedSubject}`);

        try {
          // Send actual email using SMTP
          const emailResult = await sendEmail({
            to: candidate.email,
            subject: processedSubject,
            html: processedBody,
          });

          if (emailResult.success) {
            // Update status to sent
            await prisma.emailHistory.update({
              where: { id: emailRecord.id },
              data: {
                status: "SENT",
                sentAt: new Date(),
              },
            });

            emailRecords.push({
              candidateId: candidate.id,
              candidateName: candidate.name,
              email: candidate.email,
              status: "sent",
              messageId: emailResult.messageId,
            });

            console.log(`Email sent successfully to ${candidate.email}`);
          } else {
            throw new Error(emailResult.error || "Email sending failed");
          }
        } catch (emailError) {
          console.error(
            ` Failed to send email to ${candidate.email}:`,
            emailError,
          );

          // Update status to failed
          await prisma.emailHistory.update({
            where: { id: emailRecord.id },
            data: {
              status: "FAILED",
              errorMessage:
                emailError instanceof Error
                  ? emailError.message
                  : "Unknown email error",
            },
          });

          failedEmails.push({
            candidateId: candidate.id,
            candidateName: candidate.name,
            email: candidate.email,
            error:
              emailError instanceof Error
                ? emailError.message
                : "Unknown email error",
          });
        }
      } catch (error) {
        console.error(
          ` Unexpected error processing ${candidate.email}:`,
          error,
        );

        failedEmails.push({
          candidateId: candidate.id,
          candidateName: candidate.name,
          email: candidate.email,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: ` SMTP EMAIL SERVICE: Processed ${candidates.length} candidates. Sent: ${emailRecords.length}, Failed: ${failedEmails.length}`,
      simulationMode: false,
      results: {
        sent: emailRecords,
        failed: failedEmails,
        totalProcessed: candidates.length,
        successCount: emailRecords.length,
        failureCount: failedEmails.length,
      },
    });
  } catch (error) {
    console.error("Error sending emails:", error);
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 },
    );
  }
}
