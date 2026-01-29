import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/company - Get all companies or filter by query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { industry: { contains: search, mode: "insensitive" } },
      ];
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              jobs: true,
              hrProfiles: true,
            },
          },
        },
      }),
      prisma.company.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      companies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch companies" },
      { status: 500 },
    );
  }
}

// POST /api/company - Create a new company
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      logo,
      website,
      industry,
      size,
      location,
      foundedYear,
      email,
      phone,
      linkedin,
      twitter,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: "Company name is required" },
        { status: 400 },
      );
    }

    // Create company
    const company = await prisma.company.create({
      data: {
        name,
        description,
        logo,
        website,
        industry,
        size,
        location,
        foundedYear: foundedYear ? parseInt(foundedYear) : null,
        email,
        phone,
        linkedin,
        twitter,
        isVerified: false,
      },
    });

    return NextResponse.json({
      success: true,
      company,
      message: "Company created successfully",
    });
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create company" },
      { status: 500 },
    );
  }
}
