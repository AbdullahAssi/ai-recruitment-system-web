import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

// GET all email templates
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user with company info
    const session = await auth(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const isActive = searchParams.get("isActive");

    const whereClause: any = {};

    if (type) {
      whereClause.type = type;
    }

    if (isActive !== null) {
      whereClause.isActive = isActive === "true";
    }

    let templates = await prisma.emailTemplate.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filter templates by company for HR users
    if (session.user.role === "HR" && session.user.hrProfile?.companyId) {
      // Get company name for this HR user
      const company = await prisma.company.findUnique({
        where: { id: session.user.hrProfile.companyId },
        select: { name: true },
      });

      if (company) {
        // Filter templates that include the company name or are generic (no company suffix)
        templates = templates.filter((template) => {
          // Check if template name includes company name
          const includesCompanyName = template.name.includes(company.name);
          // Check if template is generic (doesn't have " - " pattern indicating company-specific)
          const isGeneric = !template.name.includes(" - ");
          return includesCompanyName || isGeneric;
        });
      }
    }

    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error("Error fetching email templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch email templates" },
      { status: 500 },
    );
  }
}

// POST create new email template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, subject, body: emailBody, type } = body;

    if (!name || !subject || !emailBody || !type) {
      return NextResponse.json(
        { error: "Missing required fields: name, subject, body, type" },
        { status: 400 },
      );
    }

    // Check if template with same name exists
    const existingTemplate = await prisma.emailTemplate.findUnique({
      where: { name },
    });

    if (existingTemplate) {
      return NextResponse.json(
        { error: "Template with this name already exists" },
        { status: 409 },
      );
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name,
        subject,
        body: emailBody,
        type,
      },
    });

    return NextResponse.json({
      success: true,
      template,
      message: "Email template created successfully",
    });
  } catch (error) {
    console.error("Error creating email template:", error);
    return NextResponse.json(
      { error: "Failed to create email template" },
      { status: 500 },
    );
  }
}
