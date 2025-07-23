import nodemailer from "nodemailer";

// Email service configuration
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Create transporter from environment variables
export function createEmailTransporter() {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || "",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  };

  if (!config.host || !config.auth.user || !config.auth.pass) {
    throw new Error(
      "SMTP configuration is incomplete. Please check your environment variables."
    );
  }

  return nodemailer.createTransport(config);
}

// Email sending function
export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail(
  options: SendEmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = createEmailTransporter();

    // Verify connection configuration
    await transporter.verify();

    const mailOptions = {
      from: options.from || `"${process.env.FROM_NAME || 'HR Team'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Email sending error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}

// Test email connection
export async function testEmailConnection(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const transporter = createEmailTransporter();
    await transporter.verify();
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Connection test failed",
    };
  }
}
