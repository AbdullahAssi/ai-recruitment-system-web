import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/company/[id] - Get company details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const companyId = params.id;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        jobs: {
          where: { isActive: true },
          orderBy: { postedDate: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            location: true,
            postedDate: true,
            _count: {
              select: { applications: true },
            },
          },
        },
        hrProfiles: {
          select: {
            id: true,
            department: true,
            position: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            jobs: true,
            hrProfiles: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      company,
    });
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch company" },
      { status: 500 },
    );
  }
}

// PATCH /api/company/[id] - Update company details
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const companyId = params.id;
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

    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        name,
        description,
        logo,
        website,
        industry,
        size,
        location,
        foundedYear: foundedYear ? parseInt(foundedYear) : undefined,
        email,
        phone,
        linkedin,
        twitter,
      },
    });

    return NextResponse.json({
      success: true,
      company,
      message: "Company updated successfully",
    });
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update company" },
      { status: 500 },
    );
  }
}

// DELETE /api/company/[id] - Delete company
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const companyId = params.id;

    await prisma.company.delete({
      where: { id: companyId },
    });

    return NextResponse.json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete company" },
      { status: 500 },
    );
  }
}
