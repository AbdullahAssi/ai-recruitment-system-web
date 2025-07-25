import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/emailService";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

// Helper function to get default email template for status
async function getDefaultTemplateForStatus(status: string) {
  const templateTypeMap: Record<string, any> = {
    PENDING: "APPLICATION_RECEIVED",
    REVIEWED: "APPLICATION_UNDER_REVIEW",
    SHORTLISTED: "APPLICATION_SHORTLISTED",
    REJECTED: "APPLICATION_REJECTED",
  };

  const templateType = templateTypeMap[status];
  if (!templateType) return null;

  return await prisma.emailTemplate.findFirst({
    where: {
      type: templateType as any,
      isActive: true,
    },
  });
}

// Helper function to process template variables
function processEmailTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let processed = template;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    processed = processed.replace(regex, value || "");
  });

  return processed;
}

// POST trigger automated email workflow
export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const {
      applicationId,
      newStatus,
      skipEmail = false,
      customTemplateId,
    } = requestBody;

    if (!applicationId || !newStatus) {
      return NextResponse.json(
        { error: "applicationId and newStatus are required" },
        { status: 400 }
      );
    }

    // Get application with candidate and job details
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: true,
        job: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Update application status
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: newStatus },
    });

    // Skip email if requested
    if (skipEmail) {
      return NextResponse.json({
        success: true,
        message: "Application status updated without sending email",
        application: {
          id: application.id,
          status: newStatus,
        },
      });
    }

    // Get email template
    let emailTemplate = null;

    if (customTemplateId) {
      emailTemplate = await prisma.emailTemplate.findUnique({
        where: { id: customTemplateId },
      });
    } else {
      emailTemplate = await getDefaultTemplateForStatus(newStatus);
    }

    if (!emailTemplate) {
      return NextResponse.json({
        success: true,
        message:
          "Application status updated, but no email template found for this status",
        application: {
          id: application.id,
          status: newStatus,
        },
      });
    }

    // Prepare template variables
    const variables = {
      candidateName: application.candidate.name,
      candidateEmail: application.candidate.email,
      jobTitle: application.job.title,
      jobLocation: application.job.location || "",
      companyName: "Your Company", // Make this configurable
      applicationStatus: newStatus.toLowerCase().replace("_", " "),
    };

    // Process template
    const processedSubject = processEmailTemplate(
      emailTemplate.subject,
      variables
    );
    const processedBody = processEmailTemplate(emailTemplate.body, variables);

    // Create email history record
    const emailRecord = await prisma.emailHistory.create({
      data: {
        candidateId: application.candidate.id,
        jobId: application.job.id,
        templateId: emailTemplate.id,
        subject: processedSubject,
        body: processedBody,
        recipient: application.candidate.email,
        status: "PENDING",
      },
    });

    // ✅ ACTUAL EMAIL SENDING WITH SMTP
    console.log(`📧 [WORKFLOW] Sending email to: ${application.candidate.email}`);
    console.log(`📧 [WORKFLOW] Status change: ${application.status} → ${newStatus}`);
    
    try {
      // Send actual email using SMTP
      const emailResult = await sendEmail({
        to: application.candidate.email,
        subject: processedSubject,
        html: processedBody,
      });

      if (emailResult.success) {
        // Update email status to sent
        await prisma.emailHistory.update({
          where: { id: emailRecord.id },
          data: {
            status: "SENT",
            sentAt: new Date(),
          },
        });

        console.log(`✅ Workflow email sent successfully to ${application.candidate.email}`);

        return NextResponse.json({
          success: true,
          message: "✅ SMTP EMAIL SERVICE: Application status updated and email sent successfully",
          simulationMode: false,
          application: {
            id: application.id,
            status: newStatus,
          },
          email: {
            id: emailRecord.id,
            subject: processedSubject,
            recipient: application.candidate.email,
            status: "sent",
            messageId: emailResult.messageId,
          },
        });
      } else {
        throw new Error(emailResult.error || "Email sending failed");
      }
    } catch (emailError) {
      console.error(`❌ Failed to send workflow email to ${application.candidate.email}:`, emailError);

      // Update email status to failed
      await prisma.emailHistory.update({
        where: { id: emailRecord.id },
        data: {
          status: "FAILED",
          errorMessage: emailError instanceof Error ? emailError.message : "Unknown email error",
        },
      });

      return NextResponse.json({
        success: false,
        message: "Application status updated but email sending failed",
        simulationMode: false,
        application: {
          id: application.id,
          status: newStatus,
        },
        email: {
          id: emailRecord.id,
          subject: processedSubject,
          recipient: application.candidate.email,
          status: "failed",
          error: emailError instanceof Error ? emailError.message : "Unknown email error",
        },
      });
    }
  } catch (error) {
    console.error("Error in automated email workflow:", error);
    return NextResponse.json(
      { error: "Failed to process automated email workflow" },
      { status: 500 }
    );
  }
}
