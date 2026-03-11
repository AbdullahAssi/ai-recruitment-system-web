import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hrEmailBase } from "@/lib/emailTemplates";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

const defaultTemplates = [
  {
    name: "Application Received",
    subject: "Thank you for your application - {{jobTitle}}",
    body: hrEmailBase(
      `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">Dear {{candidateName}},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        We have received your application for <strong>{{jobTitle}}</strong> at {{companyName}}.
        Our team will review it and get back to you within 5–7 business days.
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        If you have any questions, feel free to reply to this email.
      </p>
      <p style="margin:0;font-size:14px;color:#374151;">
        Best regards,<br>{{hrName}}<br>{{companyName}} Hiring Team
      </p>
      `,
      "📨",
      "Application Received",
    ),
    type: "APPLICATION_RECEIVED",
  },
  {
    name: "Application Under Review",
    subject: "Your application is under review - {{jobTitle}}",
    body: hrEmailBase(
      `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">Dear {{candidateName}},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        Thank you for your interest in <strong>{{jobTitle}}</strong> at {{companyName}}.
        Your application is currently under review by our hiring team.
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        We will contact you soon with the next steps.
      </p>
      <p style="margin:0;font-size:14px;color:#374151;">
        Best regards,<br>{{hrName}}<br>{{companyName}} Hiring Team
      </p>
      `,
      "🔎",
      "Application Under Review",
    ),
    type: "APPLICATION_UNDER_REVIEW",
  },
  {
    name: "Application Shortlisted",
    subject: "Congratulations! You've been shortlisted - {{jobTitle}}",
    body: hrEmailBase(
      `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">Dear {{candidateName}},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        Great news! You have been shortlisted for <strong>{{jobTitle}}</strong> at {{companyName}}.
        We were impressed with your profile and would like to proceed to the next steps.
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        Our team will reach out shortly to schedule your interview.
      </p>
      <p style="margin:0;font-size:14px;color:#374151;">
        Best regards,<br>{{hrName}}<br>{{companyName}} Hiring Team
      </p>
      `,
      "🎉",
      "You've Been Shortlisted",
    ),
    type: "APPLICATION_SHORTLISTED",
  },
  {
    name: "Application Rejected",
    subject: "Thank you for your interest - {{jobTitle}}",
    body: hrEmailBase(
      `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">Dear {{candidateName}},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        Thank you for your interest in <strong>{{jobTitle}}</strong> at {{companyName}}.
        After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs.
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        We appreciate the time you invested and encourage you to apply for future roles that match your skills.
      </p>
      <p style="margin:0;font-size:14px;color:#374151;">
        Best regards,<br>{{hrName}}<br>{{companyName}} Hiring Team
      </p>
      `,
      "🙏",
      "Application Update",
    ),
    type: "APPLICATION_REJECTED",
  },
  {
    name: "Interview Invitation",
    subject: "Interview Invitation - {{jobTitle}} at {{companyName}}",
    body: hrEmailBase(
      `
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">Dear {{candidateName}},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        We are pleased to invite you for an interview for the <strong>{{jobTitle}}</strong> position at {{companyName}}.
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        Please reply with your availability for the coming week so we can schedule a convenient time.
      </p>
      <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:14px 16px;margin:0 0 16px;">
        <p style="margin:0 0 10px;font-size:14px;color:#111827;font-weight:600;">The interview will cover:</p>
        <ul style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:1.6;">
          <li>Discussion about your experience and skills</li>
          <li>Overview of the role and responsibilities</li>
          <li>Company culture and team dynamics</li>
          <li>Q&A session</li>
        </ul>
      </div>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">We look forward to meeting you.</p>
      <p style="margin:0;font-size:14px;color:#374151;">
        Best regards,<br>{{hrName}}<br>{{companyName}} Hiring Team
      </p>
      `,
      "🗓",
      "Interview Invitation",
    ),
    type: "INTERVIEW_INVITE",
  },
];

// POST create default email templates
export async function POST(request: NextRequest) {
  try {
    const createdTemplates = [];
    const updatedTemplates = [];

    for (const template of defaultTemplates) {
      try {
        // Use upsert to create or update the template
        const upsertedTemplate = await prisma.emailTemplate.upsert({
          where: { name: template.name },
          update: {
            subject: template.subject,
            body: template.body.trim(),
            type: template.type as any,
            isActive: true,
          },
          create: {
            name: template.name,
            subject: template.subject,
            body: template.body.trim(),
            type: template.type as any,
          },
        });

        // Check if it was created or updated
        const existingTemplate = await prisma.emailTemplate.findUnique({
          where: { name: template.name },
          select: { createdAt: true },
        });

        if (
          existingTemplate &&
          new Date(upsertedTemplate.createdAt).getTime() ===
            new Date(upsertedTemplate.updatedAt).getTime()
        ) {
          createdTemplates.push(upsertedTemplate);
        } else {
          updatedTemplates.push(upsertedTemplate);
        }
      } catch (templateError) {
        console.error(
          `Error processing template ${template.name}:`,
          templateError,
        );
        // Continue with other templates even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      message: "Default email templates processed successfully",
      results: {
        created: createdTemplates.length,
        updated: updatedTemplates.length,
        total: defaultTemplates.length,
        createdTemplates: createdTemplates.map((t) => ({
          id: t.id,
          name: t.name,
        })),
        updatedTemplates: updatedTemplates.map((t) => ({
          id: t.id,
          name: t.name,
        })),
      },
    });
  } catch (error) {
    console.error("Error creating default email templates:", error);
    return NextResponse.json(
      {
        error: "Failed to create default email templates",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
