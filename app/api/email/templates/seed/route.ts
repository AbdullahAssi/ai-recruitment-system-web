import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

const defaultTemplates = [
  {
    name: "Application Received",
    subject: "Thank you for your application - {{jobTitle}}",
    body: `
      <html>
        <body>
          <h2>Thank you for your application!</h2>
          <p>Dear {{candidateName}},</p>
          <p>We have received your application for the position of <strong>{{jobTitle}}</strong> at {{companyName}}.</p>
          <p>Our team will review your application and get back to you within 5-7 business days.</p>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <br>
          <p>Best regards,<br>{{companyName}} Hiring Team</p>
        </body>
      </html>
    `,
    type: "APPLICATION_RECEIVED"
  },
  {
    name: "Application Under Review",
    subject: "Your application is under review - {{jobTitle}}",
    body: `
      <html>
        <body>
          <h2>Application Status Update</h2>
          <p>Dear {{candidateName}},</p>
          <p>Thank you for your interest in the <strong>{{jobTitle}}</strong> position at {{companyName}}.</p>
          <p>We're pleased to inform you that your application is currently under review by our hiring team.</p>
          <p>We will contact you with the next steps in the process soon.</p>
          <br>
          <p>Best regards,<br>{{companyName}} Hiring Team</p>
        </body>
      </html>
    `,
    type: "APPLICATION_UNDER_REVIEW"
  },
  {
    name: "Application Shortlisted",
    subject: "Congratulations! You've been shortlisted - {{jobTitle}}",
    body: `
      <html>
        <body>
          <h2>Congratulations!</h2>
          <p>Dear {{candidateName}},</p>
          <p>We're excited to inform you that you have been shortlisted for the <strong>{{jobTitle}}</strong> position at {{companyName}}.</p>
          <p>We were impressed with your qualifications and experience.</p>
          <p>Our team will be in touch with you shortly to schedule the next round of interviews.</p>
          <p>Please keep an eye on your email and phone for further communication.</p>
          <br>
          <p>Best regards,<br>{{companyName}} Hiring Team</p>
        </body>
      </html>
    `,
    type: "APPLICATION_SHORTLISTED"
  },
  {
    name: "Application Rejected",
    subject: "Thank you for your interest - {{jobTitle}}",
    body: `
      <html>
        <body>
          <h2>Thank you for your application</h2>
          <p>Dear {{candidateName}},</p>
          <p>Thank you for your interest in the <strong>{{jobTitle}}</strong> position at {{companyName}}.</p>
          <p>After careful consideration, we have decided to move forward with other candidates whose experience more closely matches our current needs.</p>
          <p>We encourage you to apply for future positions that match your skills and experience.</p>
          <p>Thank you again for considering {{companyName}} as your potential employer.</p>
          <br>
          <p>Best regards,<br>{{companyName}} Hiring Team</p>
        </body>
      </html>
    `,
    type: "APPLICATION_REJECTED"
  },
  {
    name: "Interview Invitation",
    subject: "Interview Invitation - {{jobTitle}} at {{companyName}}",
    body: `
      <html>
        <body>
          <h2>Interview Invitation</h2>
          <p>Dear {{candidateName}},</p>
          <p>We are pleased to invite you for an interview for the <strong>{{jobTitle}}</strong> position at {{companyName}}.</p>
          <p>Based on your application and qualifications, we believe you would be a great fit for our team.</p>
          <p>Please reply to this email with your availability for the coming week, and we will schedule a convenient time for the interview.</p>
          <p>The interview will cover:</p>
          <ul>
            <li>Discussion about your experience and skills</li>
            <li>Overview of the role and responsibilities</li>
            <li>Company culture and team dynamics</li>
            <li>Q&A session</li>
          </ul>
          <p>We look forward to hearing from you.</p>
          <br>
          <p>Best regards,<br>{{companyName}} Hiring Team</p>
        </body>
      </html>
    `,
    type: "INTERVIEW_INVITE"
  }
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

        if (existingTemplate && new Date(upsertedTemplate.createdAt).getTime() === new Date(upsertedTemplate.updatedAt).getTime()) {
          createdTemplates.push(upsertedTemplate);
        } else {
          updatedTemplates.push(upsertedTemplate);
        }
      } catch (templateError) {
        console.error(`Error processing template ${template.name}:`, templateError);
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
        createdTemplates: createdTemplates.map(t => ({ id: t.id, name: t.name })),
        updatedTemplates: updatedTemplates.map(t => ({ id: t.id, name: t.name })),
      },
    });

  } catch (error) {
    console.error("Error creating default email templates:", error);
    return NextResponse.json(
      { error: "Failed to create default email templates", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
