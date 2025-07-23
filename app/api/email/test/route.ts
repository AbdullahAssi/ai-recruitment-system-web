import { NextRequest, NextResponse } from "next/server";
import { testEmailConnection } from "@/lib/emailService";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

// GET test email configuration
export async function GET() {
  try {
    const result = await testEmailConnection();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message:
          "✅ SMTP connection successful! Email service is configured correctly.",
        config: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message:
            "❌ SMTP connection failed. Please check your configuration.",
          error: result.error,
          config: {
            host: process.env.SMTP_HOST || "Not set",
            port: process.env.SMTP_PORT || "Not set",
            user: process.env.SMTP_USER || "Not set",
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "❌ Email service test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
